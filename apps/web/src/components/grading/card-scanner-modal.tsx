'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { evaluateQuality, DEFAULT_THRESHOLDS, type QualityResult } from '@/lib/camera/quality'
import { toGrayscale, type RgbaFrame } from '@/lib/camera/metrics'
import { evaluateLevel, DEFAULT_TILT_THRESHOLDS, type Gravity } from '@/lib/camera/tilt'

const PROC_WIDTH = 320
const PASS_FRAMES_REQUIRED = 4    // consecutive local-pass frames before firing Haiku
const HAIKU_COOLDOWN_MS = 2500    // min gap between Haiku calls
const MSG_STABLE_FRAMES = 12      // coaching message must hold for ~200ms at 60fps before displaying
const MOTION_ABORT_THRESHOLD = 14 // mean abs frame-diff that cancels an in-flight AI check

// CardBox overlay geometry — MUST stay in sync with the <CardBox> component below.
// The quality metrics are computed ONLY over this region of interest (the card),
// not the whole frame, so a dark background never skews sharpness/luminance/glare.
const CARD_BOX_WIDTH_PCT = 0.78  // CardBox width: 78%
const CARD_BOX_MAX_WIDTH = 320   // CardBox maxWidth: 320px
const CARD_BOX_ASPECT_W  = 5     // aspectRatio 5 / 7  (width : height)
const CARD_BOX_ASPECT_H  = 7

// TEMPORARY — set to true to pause after each AI-accepted frame for threshold calibration.
// Shows a "Save to Photos" button (iOS share sheet → Save Image). Remove before shipping.
const DEBUG_DOWNLOAD_ACCEPTED = false

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
  const lastGatePassRef    = useRef(false) // latest on-device quality-gate result (live frame)
  const msgCandidateRef    = useRef('')
  const msgCandidateCount  = useRef(0)
  const gravityRef         = useRef<Gravity | null>(null)   // latest device gravity reading
  const bubbleDotRef       = useRef<HTMLDivElement>(null)   // level-guide bubble (moved imperatively)
  const motionHandlerRef   = useRef<((e: DeviceMotionEvent) => void) | null>(null)

  const [status, setStatus]       = useState<Status>({ kind: 'starting' })
  const [flash, setFlash]         = useState(false)
  const [debugCapture, setDebugCapture] = useState<{ dataUrl: string; file: File } | null>(null)
  // Level-guide availability: 'idle' until we probe; 'needs-permission' on iOS
  // (must ask via a user tap); 'granted' once we're receiving motion; 'denied' /
  // 'unavailable' → we silently skip the level gate (never hard-block).
  const [motionState, setMotionState] = useState<'idle' | 'needs-permission' | 'granted' | 'denied' | 'unavailable'>('idle')

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
      if (DEBUG_DOWNLOAD_ACCEPTED) {
        setTimeout(() => { setFlash(false); setDebugCapture({ dataUrl, file: captureToFile(dataUrl) }) }, 350)
      } else {
        setTimeout(() => { setFlash(false); onCapture(captureToFile(dataUrl)) }, 350)
      }
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
        // The AI never answered. Do NOT blindly accept — a timeout is not a
        // card-present confirmation. Fall back to the on-device quality gate:
        // only capture if the LIVE frame still passes the local gate; otherwise
        // keep scanning. Never capture a frame that failed the local gate just
        // because the AI timed out.
        if (lastGatePassRef.current) {
          accept()
        } else {
          passCountRef.current = 0
          setStatus({ kind: 'coaching', message: 'Hold steady…' })
        }
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

  // ── Device-tilt "level" guide ─────────────────────────────────────────────
  // Reads the gravity vector to tell whether the phone is flat/level over the
  // card (straight-on), gating auto-capture so we never grade a tilted shot.
  const attachMotion = useCallback(() => {
    if (motionHandlerRef.current) return
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (a && a.x != null) {
        gravityRef.current = { x: a.x ?? 0, y: a.y ?? 0, z: a.z ?? 0 }
      }
    }
    motionHandlerRef.current = handler
    window.addEventListener('devicemotion', handler)
    setMotionState('granted')
  }, [])

  // iOS 13+ requires DeviceMotionEvent.requestPermission() from a user gesture.
  const requestMotion = useCallback(async () => {
    const DME = window.DeviceMotionEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> }
    try {
      const res = await DME.requestPermission?.()
      if (res === 'granted') attachMotion()
      else setMotionState('denied')
    } catch {
      setMotionState('denied')
    }
  }, [attachMotion])

  useEffect(() => {
    const DME = typeof window !== 'undefined'
      ? (window.DeviceMotionEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> } | undefined)
      : undefined
    if (!DME) { setMotionState('unavailable'); return }
    if (typeof DME.requestPermission === 'function') {
      setMotionState('needs-permission') // iOS — wait for the "Enable level guide" tap
    } else {
      attachMotion() // Android / sensor-equipped browsers: no permission gate
    }
    return () => {
      if (motionHandlerRef.current) {
        window.removeEventListener('devicemotion', motionHandlerRef.current)
        motionHandlerRef.current = null
      }
    }
  }, [attachMotion])

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
        // ── ROI crop (object-fit: cover mapping) ───────────────────────────
        // The video is rendered with object-fit: cover, so it is scaled UP to
        // fill the element and cropped on the overflowing axis. To measure only
        // the pixels the user frames inside the CardBox we map the on-screen box
        // back into the video's intrinsic (source) pixel coordinates:
        //
        //   scale     = max(elW/vW, elH/vH)        // cover fills the element
        //   dispW/H   = vW*scale, vH*scale         // displayed video size (>= element)
        //   offsetX/Y = (el - disp) / 2            // <= 0; overflow, centered
        //   srcX      = (boxLeft - offsetX) / scale  // element px -> source px
        //   srcW      = boxW / scale
        //
        // CardBox is centered, width = min(78% of elW, 320px), aspect 5:7.
        const vW = video.videoWidth
        const vH = video.videoHeight
        const elW = video.clientWidth  || vW
        const elH = video.clientHeight || vH

        const scale   = Math.max(elW / vW, elH / vH)
        const offsetX = (elW - vW * scale) / 2
        const offsetY = (elH - vH * scale) / 2

        const boxW    = Math.min(CARD_BOX_WIDTH_PCT * elW, CARD_BOX_MAX_WIDTH)
        const boxH    = boxW * (CARD_BOX_ASPECT_H / CARD_BOX_ASPECT_W)
        const boxLeft = (elW - boxW) / 2
        const boxTop  = (elH - boxH) / 2

        // On-screen box -> source sub-rectangle, clamped to the frame bounds.
        let sx = (boxLeft - offsetX) / scale
        let sy = (boxTop  - offsetY) / scale
        let sw = boxW / scale
        let sh = boxH / scale
        sx = Math.max(0, Math.min(sx, vW - 1))
        sy = Math.max(0, Math.min(sy, vH - 1))
        sw = Math.max(1, Math.min(sw, vW - sx))
        sh = Math.max(1, Math.min(sh, vH - sy))

        const w = PROC_WIDTH
        const h = Math.max(1, Math.round(w * (sh / sw)))
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
          // 9-arg drawImage: copy ONLY the ROI sub-rect into the proc canvas.
          ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h)
          const img = ctx.getImageData(0, 0, w, h)
          const frame: RgbaFrame = { data: img.data, width: w, height: h }
          const result: QualityResult = evaluateQuality(frame, prevGrayRef.current, DEFAULT_THRESHOLDS)
          prevGrayRef.current = toGrayscale(frame)

          // Level gate: is the phone flat/level over the card (straight-on shot)?
          const levelRes = evaluateLevel(gravityRef.current, DEFAULT_TILT_THRESHOLDS)
          // Move the bubble-guide dot imperatively — no per-frame React re-render.
          const dot = bubbleDotRef.current
          if (dot) {
            const g = gravityRef.current
            const R = 26                 // px the bubble can travel from center
            const scale = R / 1.3        // ~1.3 m/s² horizontal ≈ tilt threshold → edge
            // Axis signs tuned for portrait; may need on-device calibration.
            const dx = g ? Math.max(-R, Math.min(R, g.x * scale)) : 0
            const dy = g ? Math.max(-R, Math.min(R, -g.y * scale)) : 0
            dot.style.transform = `translate(${dx}px, ${dy}px)`
            dot.style.background = levelRes.level ? '#34c97a' : '#ffd24a'
          }

          const ready = result.pass && levelRes.level
          lastGatePassRef.current = ready  // live gate result for AI-timeout fallback

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
          } else if (ready) {
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
            // Frame problems first (can't judge level if we can't see the card);
            // if the frame is good but the phone is tilted, coach to level.
            const candidate = !result.pass
              ? (result.messages[0] ?? 'Align card in the box')
              : (levelRes.message ?? 'Hold steady…')
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
  const coachingMessage = status.kind === 'coaching' ? status.message : ''

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

        <div style={{ width: 42 }} />
      </div>


      {/* Level guide — the bubble centers + turns green when the phone is flat/level */}
      {motionState === 'granted' && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 132,
          display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none',
        }}>
          <div style={{
            position: 'relative', width: 72, height: 72, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute', width: 20, height: 20, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.45)',
            }} />
            <div ref={bubbleDotRef} style={{
              width: 16, height: 16, borderRadius: '50%', background: '#ffd24a',
              boxShadow: '0 0 8px rgba(0,0,0,0.5)', transition: 'background 0.2s',
            }} />
          </div>
        </div>
      )}

      {/* iOS: one-time tap to enable the motion sensor behind the level guide */}
      {motionState === 'needs-permission' && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 128,
          display: 'flex', justifyContent: 'center', zIndex: 25,
        }}>
          <button
            onClick={requestMotion}
            style={{
              padding: '10px 18px', borderRadius: 999,
              background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', fontFamily: 'var(--font-display)', fontSize: '0.85rem',
              fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)',
            }}
          >
            Enable level guide
          </button>
        </div>
      )}

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

      {/* TEMPORARY debug overlay — shows accepted frame so it can be saved to Photos */}
      {debugCapture && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 20, padding: 24,
        }}>
          <p style={{ color: '#34c97a', fontFamily: 'var(--font-display)', fontSize: '0.85rem', margin: 0 }}>
            DEBUG — AI accepted this frame
          </p>
          <img
            src={debugCapture.dataUrl}
            alt="Accepted frame"
            style={{ maxWidth: '100%', maxHeight: '55vh', borderRadius: 8, objectFit: 'contain' }}
          />
          <button
            onClick={async () => {
              if (navigator.canShare?.({ files: [debugCapture.file] })) {
                try { await navigator.share({ files: [debugCapture.file], title: 'Card scan debug' }) }
                catch { /* cancelled */ }
              }
            }}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12,
              background: '#34c97a', border: 'none', color: '#000',
              fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Save to Photos ↑
          </button>
          <button
            onClick={() => { setDebugCapture(null); onCapture(debugCapture.file) }}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 12,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', fontFamily: 'var(--font-display)', fontSize: '0.95rem', cursor: 'pointer',
            }}
          >
            Continue without saving
          </button>
        </div>
      )}
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
