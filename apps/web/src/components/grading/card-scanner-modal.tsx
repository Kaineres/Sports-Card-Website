'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { evaluateQuality, DEFAULT_THRESHOLDS, type QualityResult } from '@/lib/camera/quality'
import { toGrayscale, type RgbaFrame } from '@/lib/camera/metrics'

const PROC_WIDTH = 320
const PASS_FRAMES_REQUIRED = 4    // consecutive local-pass frames before firing Haiku
const HAIKU_COOLDOWN_MS = 2500    // min gap between Haiku calls
const MSG_STABLE_FRAMES = 12      // coaching message must hold for ~200ms at 60fps before displaying
const MOTION_ABORT_THRESHOLD = 14 // mean abs frame-diff that cancels an in-flight AI check

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
  const passCountRef       = useRef(0)
  const lastHaikuRef       = useRef(0)
  const checkingRef        = useRef(false) // prevents concurrent Haiku calls
  const abortRef           = useRef<AbortController | null>(null) // cancels in-flight Haiku call
  const msgCandidateRef    = useRef('')
  const msgCandidateCount  = useRef(0)

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

  // ── Auto-capture Haiku gate (guards cooldown + pass count) ────────────────
  // The RAF loop can abort this mid-flight via abortRef if the camera moves —
  // in that case we silently revert to coaching (the loop already set the status).
  const runHaikuCheck = useCallback(async () => {
    if (checkingRef.current) return
    const now = Date.now()
    if (now - lastHaikuRef.current < HAIKU_COOLDOWN_MS) return
    checkingRef.current = true
    lastHaikuRef.current = now
    setStatus({ kind: 'checking' })

    const dataUrl = captureFrame()
    if (!dataUrl) { checkingRef.current = false; return }

    const controller = new AbortController()
    abortRef.current = controller
    let timedOut = false
    const timeoutId = setTimeout(() => { timedOut = true; controller.abort() }, 8000)

    const accept = () => {
      setFlash(true)
      setStatus({ kind: 'captured' })
      setTimeout(() => { setFlash(false); onCapture(captureToFile(dataUrl)) }, 350)
    }

    try {
      const res = await fetch('/api/grading/quality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { cardVisible } = await res.json() as { cardVisible: boolean }
      if (cardVisible) {
        accept()
      } else {
        passCountRef.current = 0
        setStatus({ kind: 'coaching', message: 'Card not recognized — make sure the full card fills the frame' })
      }
    } catch (e) {
      if (timedOut) {
        // Local gates passed but the AI never answered — accept the frame.
        accept()
      } else if (e instanceof Error && e.name === 'AbortError') {
        // Camera moved — the RAF loop already reverted us to "Hold steady…". Do nothing.
        passCountRef.current = 0
      } else {
        passCountRef.current = 0
        setStatus({ kind: 'coaching', message: 'Check failed — hold steady and try again' })
      }
    } finally {
      clearTimeout(timeoutId)
      checkingRef.current = false
      abortRef.current = null
      prevGrayRef.current = null
    }
  }, [captureFrame, captureToFile, onCapture])

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

        // Detect torch support but leave it OFF by default.
        // Foil, chrome, prizm, and refractor cards (very common) glare badly under
        // direct torch; users who need light can tap ⚡. We surface a hint when too dark.
        const track = stream.getVideoTracks()[0]
        const caps = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean }
        if (caps.torch) setTorchAvail(true)

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

          if (checkingRef.current) {
            // AI check in flight. If the camera moves noticeably, cancel it and
            // drop straight back to "Hold steady…" (border returns to white). The
            // check resumes automatically once the frame is stable + green again.
            const motion = result.metrics.motion
            if (motion !== null && motion > MOTION_ABORT_THRESHOLD) {
              abortRef.current?.abort()
              passCountRef.current = 0
              lastHaikuRef.current = 0 // reset cooldown — re-check fires immediately on re-stabilize
              setStatus({ kind: 'coaching', message: 'Hold steady…' })
            }
          } else if (result.pass) {
            passCountRef.current++
            msgCandidateRef.current = ''
            msgCandidateCount.current = 0
            if (passCountRef.current >= PASS_FRAMES_REQUIRED) {
              passCountRef.current = 0
              runHaikuCheck()  // owns the transition to 'checking' — no competing setStatus
            } else {
              setStatus({ kind: 'coaching', message: 'Hold steady…' })
            }
          } else {
            passCountRef.current = 0
            const candidate = result.messages[0] ?? 'Align card in the box'
            if (candidate === msgCandidateRef.current) {
              msgCandidateCount.current++
            } else {
              msgCandidateRef.current = candidate
              msgCandidateCount.current = 1
            }
            if (msgCandidateCount.current >= MSG_STABLE_FRAMES) {
              setStatus({ kind: 'coaching', message: candidate })
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
      abortRef.current?.abort() // prevent in-flight Haiku from calling onCapture after close
    }
  }, [runHaikuCheck])

  // ── Status text ────────────────────────────────────────────────────────────
  const coachingMessage = (() => {
    if (status.kind !== 'coaching') return ''
    if (torchOn && status.message.startsWith('Glare'))
      return 'Glare on card — try turning off the flashlight ⚡'
    if (!torchOn && torchAvail && status.message.startsWith('Too dark'))
      return 'Too dark — try enabling the flashlight ⚡'
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
    'Position the card to capture automatically'

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


      {/* Bottom status — single stable text node, no content-swapping animation
          (an opacity keyframe on this <p> promoted it to a compositor layer on
          iOS and left a ghost of the previous message when the text changed). */}
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
        }}>
          {statusText}
        </p>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.5)', margin: '6px 0 0',
          minHeight: '1.1em',
        }}>
          {subText}
        </p>
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
