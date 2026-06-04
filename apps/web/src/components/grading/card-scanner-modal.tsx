'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { evaluateQuality, DEFAULT_THRESHOLDS, type QualityResult } from '@/lib/camera/quality'
import { toGrayscale, type RgbaFrame } from '@/lib/camera/metrics'

const PROC_WIDTH = 320
const PASS_FRAMES_REQUIRED = 4  // consecutive local-pass frames before firing Haiku
const HAIKU_COOLDOWN_MS = 2500  // min gap between Haiku calls

interface Props {
  side: 'front' | 'back'
  onCapture: (file: File) => void
  onClose: () => void
}

type Status =
  | { kind: 'starting' }
  | { kind: 'coaching'; message: string }
  | { kind: 'checking' }
  | { kind: 'captured' }
  | { kind: 'error'; message: string }

export function CardScannerModal({ side, onCapture, onClose }: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const procCanvas  = useRef<HTMLCanvasElement>(null)  // downscaled, for quality checks
  const captureCanvas = useRef<HTMLCanvasElement>(null) // full-res, for final capture
  const prevGrayRef = useRef<Uint8ClampedArray | null>(null)
  const rafRef      = useRef<number | null>(null)
  const streamRef   = useRef<MediaStream | null>(null)
  const passCountRef    = useRef(0)
  const lastHaikuRef    = useRef(0)
  const checkingRef     = useRef(false) // prevents concurrent Haiku calls

  const [status, setStatus]       = useState<Status>({ kind: 'starting' })
  const [torchOn, setTorchOn]     = useState(false)
  const [torchAvail, setTorchAvail] = useState(false)
  const [flash, setFlash]         = useState(false)

  // ── Torch helpers ───────────────────────────────────────────────────────────
  const setTorch = useCallback(async (on: boolean) => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    try {
      await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] })
      setTorchOn(on)
    } catch { /* iOS doesn't support torch — ignore */ }
  }, [])

  // ── Capture full-res frame ────────────────────────────────────────────────
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current
    const canvas = captureCanvas.current
    if (!video || !canvas || video.videoWidth === 0) return null
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [])

  const captureToFile = useCallback((dataUrl: string): File => {
    const arr = dataUrl.split(','), mime = 'image/jpeg'
    const bstr = atob(arr[1])
    const u8 = new Uint8Array(bstr.length)
    for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i)
    return new File([u8], `card-${side}-${Date.now()}.jpg`, { type: mime })
  }, [side])

  // ── Shared Haiku check (accepts a pre-captured dataUrl) ───────────────────
  // source='auto'   → local quality gates already passed; timeout may accept
  // source='manual' → user tapped button; timeout must NOT accept (no local gate)
  const doHaikuCheck = useCallback(async (dataUrl: string, source: 'auto' | 'manual') => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)
    try {
      const res = await fetch('/api/grading/quality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      const { cardVisible } = await res.json() as { cardVisible: boolean }
      if (cardVisible) {
        setFlash(true)
        setStatus({ kind: 'captured' })
        setTimeout(() => { setFlash(false); onCapture(captureToFile(dataUrl)) }, 350)
      } else {
        passCountRef.current = 0
        setStatus({ kind: 'coaching', message: 'Card not recognized — make sure the full card fills the frame' })
      }
    } catch (e) {
      clearTimeout(timeoutId)
      if (e instanceof Error && e.name === 'AbortError') {
        if (source === 'auto') {
          // Auto-capture timed out — local gates passed so accept the frame
          setFlash(true)
          setStatus({ kind: 'captured' })
          setTimeout(() => { setFlash(false); onCapture(captureToFile(dataUrl)) }, 350)
        } else {
          // Manual capture timed out — require Haiku confirmation; don't accept
          passCountRef.current = 0
          setStatus({ kind: 'coaching', message: 'Check timed out — please try again' })
        }
      } else {
        passCountRef.current = 0
        setStatus({ kind: 'coaching', message: 'Check failed — hold steady and try again' })
      }
    } finally {
      checkingRef.current = false
      prevGrayRef.current = null
    }
  }, [captureToFile, onCapture])

  // ── Manual capture — runs same Haiku gate as auto-capture ─────────────────
  const handleManualCapture = useCallback(async () => {
    if (checkingRef.current) return
    const dataUrl = captureFrame()
    if (!dataUrl) return
    checkingRef.current = true
    lastHaikuRef.current = Date.now()
    setStatus({ kind: 'checking' })
    await doHaikuCheck(dataUrl, 'manual')
  }, [captureFrame, doHaikuCheck])

  // ── Auto-capture Haiku gate (guards cooldown + pass count) ────────────────
  const runHaikuCheck = useCallback(async () => {
    if (checkingRef.current) return
    const now = Date.now()
    if (now - lastHaikuRef.current < HAIKU_COOLDOWN_MS) return
    checkingRef.current = true
    lastHaikuRef.current = now
    setStatus({ kind: 'checking' })
    const dataUrl = captureFrame()
    if (!dataUrl) { checkingRef.current = false; return }
    await doHaikuCheck(dataUrl, 'auto')
  }, [captureFrame, doHaikuCheck])

  // ── Camera + quality loop ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream

        const video = videoRef.current!
        video.srcObject = stream
        await video.play()

        // Auto-enable torch
        const track = stream.getVideoTracks()[0]
        const caps = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean }
        if (caps.torch) {
          setTorchAvail(true)
          try {
            await track.applyConstraints({ advanced: [{ torch: true } as MediaTrackConstraintSet] })
            setTorchOn(true)
          } catch { /* ignored */ }
        }

        loop()
      } catch (e) {
        setStatus({ kind: 'error', message: e instanceof Error ? e.message : 'Camera access failed' })
      }
    }

    function loop() {
      if (cancelled) return
      const video   = videoRef.current
      const canvas  = procCanvas.current
      if (video && canvas && video.videoWidth > 0) {
        const w = PROC_WIDTH
        const h = Math.round(w * (video.videoHeight / video.videoWidth))
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h)
          const img = ctx.getImageData(0, 0, w, h)
          const frame: RgbaFrame = { data: img.data, width: w, height: h }
          const result: QualityResult = evaluateQuality(frame, prevGrayRef.current, DEFAULT_THRESHOLDS)
          prevGrayRef.current = toGrayscale(frame)

          if (!checkingRef.current) {
            if (result.pass) {
              passCountRef.current++
              setStatus({ kind: 'coaching', message: 'Hold steady…' })
              if (passCountRef.current >= PASS_FRAMES_REQUIRED) {
                passCountRef.current = 0
                runHaikuCheck()
              }
            } else {
              passCountRef.current = 0
              setStatus({ kind: 'coaching', message: result.messages[0] ?? 'Align card in the box' })
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    start()
    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [runHaikuCheck])

  // ── Status text ────────────────────────────────────────────────────────────
  const coachingMessage = (() => {
    if (status.kind !== 'coaching') return ''
    // When the torch is on and glare fires, hint to turn it off
    if (torchOn && status.message.startsWith('Glare'))
      return 'Glare on card — try turning off the flashlight ⚡'
    return status.message
  })()

  const statusText =
    status.kind === 'starting'  ? 'Starting camera…' :
    status.kind === 'checking'  ? 'Checking quality…' :
    status.kind === 'captured'  ? '✓ Captured!' :
    status.kind === 'error'     ? status.message :
    coachingMessage || status.message

  const subText =
    status.kind === 'checking'  ? 'AI verifying the card…' :
    status.kind === 'captured'  ? '' :
    status.kind === 'starting'  ? '' :
    status.kind === 'error'     ? '' :
    status.message === 'Hold steady…' ? 'About to capture…' :
    'Position card to auto-capture, or use the button →'

  const isPass = status.kind === 'checking' || status.kind === 'captured'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#000',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Camera feed */}
      <video
        ref={videoRef}
        playsInline muted
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Flash overlay */}
      {flash && (
        <div style={{
          position: 'absolute', inset: 0, background: '#fff',
          zIndex: 10, opacity: 0.7,
          animation: 'none',
        }} />
      )}

      {/* Dark vignette outside the card box — rendered via the card box shadow */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <CardBox isPass={isPass} />
      </div>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '52px 20px 16px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)',
        zIndex: 20,
      }}>
        <button
          onClick={onClose}
          aria-label="Close scanner"
          style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', fontSize: '1.1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600,
          color: '#fff', letterSpacing: '0.01em',
        }}>
          {side === 'front' ? 'Front of Card' : 'Back of Card'}
        </span>

        {/* Torch toggle (only shown if available) */}
        {torchAvail ? (
          <button
            onClick={() => setTorch(!torchOn)}
            aria-label={torchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
            style={{
              width: 42, height: 42, borderRadius: '50%',
              background: torchOn ? 'rgba(212,168,67,0.35)' : 'rgba(0,0,0,0.45)',
              border: `1px solid ${torchOn ? 'rgba(212,168,67,0.6)' : 'rgba(255,255,255,0.2)'}`,
              color: torchOn ? '#d4a843' : '#fff',
              fontSize: '1.15rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >⚡</button>
        ) : (
          <div style={{ width: 42 }} />
        )}
      </div>

      {/* Manual capture button — right side center */}
      <button
        onClick={handleManualCapture}
        aria-label="Capture photo"
        style={{
          position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
          width: 62, height: 62, borderRadius: '50%',
          background: 'rgba(255,255,255,0.92)',
          border: '4px solid rgba(255,255,255,0.5)',
          cursor: 'pointer', zIndex: 20,
          boxShadow: '0 2px 16px rgba(0,0,0,0.55)',
        }}
      />

      {/* Bottom status */}
      {status.kind === 'checking' && (
        <style>{`@keyframes slab-pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>
      )}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '20px 24px 44px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
        zIndex: 20, textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: '0.93rem', fontWeight: 500,
          color: isPass ? '#34c97a' : '#fff',
          margin: 0, letterSpacing: '0.01em',
          textShadow: '0 1px 6px rgba(0,0,0,0.8)',
          transition: 'color 0.2s',
          animation: status.kind === 'checking' ? 'slab-pulse 1.2s ease-in-out infinite' : 'none',
        }}>
          {statusText}
        </p>
        {subText ? (
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.5)', margin: '6px 0 0',
          }}>
            {subText}
          </p>
        ) : null}
      </div>

      {/* Hidden canvases */}
      <canvas ref={procCanvas}   style={{ display: 'none' }} />
      <canvas ref={captureCanvas} style={{ display: 'none' }} />
    </div>
  )
}

// ── Card bounding box with animated corner marks ────────────────────────────
function CardBox({ isPass }: { isPass: boolean }) {
  const color = isPass ? '#34c97a' : 'rgba(255,255,255,0.85)'
  const size = 22  // corner arm length

  return (
    <div style={{
      position: 'relative',
      width: '78%',
      maxWidth: 320,
      aspectRatio: '5 / 7',
      boxShadow: '0 0 0 9999px rgba(0,0,0,0.52)',
      borderRadius: 6,
    }}>
      {/* Four corner marks */}
      {([
        { top: 0, left: 0,  borderTop: true, borderLeft: true },
        { top: 0, right: 0, borderTop: true, borderRight: true },
        { bottom: 0, left: 0,  borderBottom: true, borderLeft: true },
        { bottom: 0, right: 0, borderBottom: true, borderRight: true },
      ] as CornerProps[]).map((c, i) => (
        <Corner key={i} {...c} color={color} size={size} />
      ))}
    </div>
  )
}

interface CornerProps {
  top?: number; bottom?: number; left?: number; right?: number
  borderTop?: boolean; borderBottom?: boolean
  borderLeft?: boolean; borderRight?: boolean
  color: string; size: number
}

function Corner({ top, bottom, left, right, borderTop, borderBottom, borderLeft, borderRight, color, size }: CornerProps) {
  const t = 2.5 // line thickness
  return (
    <div style={{ position: 'absolute', top, bottom, left, right, width: size, height: size }}>
      {borderTop    && <div style={{ position: 'absolute', top: 0,    left: 0, right: 0, height: t, background: color, transition: 'background 0.25s' }} />}
      {borderBottom && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: t, background: color, transition: 'background 0.25s' }} />}
      {borderLeft   && <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0,  width: t,  background: color, transition: 'background 0.25s' }} />}
      {borderRight  && <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: t,  background: color, transition: 'background 0.25s' }} />}
    </div>
  )
}
