// apps/web/src/components/grading/camera-scanner.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { evaluateQuality, meetsResolution, DEFAULT_THRESHOLDS, type QualityResult } from '@/lib/camera/quality'
import { toGrayscale, type RgbaFrame } from '@/lib/camera/metrics'

const PROC_WIDTH = 320 // downscaled processing width — keeps per-frame cost low on mobile

export function CameraScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prevGrayRef = useRef<Uint8ClampedArray | null>(null)
  const rafRef = useRef<number | null>(null)
  const [result, setResult] = useState<QualityResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resOk, setResOk] = useState<boolean | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (cancelled) return
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()
        const settings = stream.getVideoTracks()[0]?.getSettings() ?? {}
        setResOk(meetsResolution(settings.width ?? 0, settings.height ?? 0))
        loop()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Camera access failed')
      }
    }

    function loop() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video && canvas && video.videoWidth > 0) {
        const w = PROC_WIDTH
        const h = Math.round(w * (video.videoHeight / video.videoWidth))
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h)
          const img = ctx.getImageData(0, 0, w, h)
          const frame: RgbaFrame = { data: img.data, width: w, height: h }
          setResult(evaluateQuality(frame, prevGrayRef.current, DEFAULT_THRESHOLDS))
          prevGrayRef.current = toGrayscale(frame)
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    start()
    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
      {error && <div style={{ color: '#e05c5c', padding: 16, fontFamily: 'monospace' }}>Camera error: {error}</div>}
      <div style={{ position: 'relative' }}>
        <video ref={videoRef} playsInline muted style={{ width: '100%', display: 'block', borderRadius: 12 }} />
        <div
          style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '62%', aspectRatio: '5 / 7',
            border: `3px solid ${result?.pass ? '#34c97a' : 'rgba(255,255,255,0.7)'}`,
            borderRadius: 10, boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)', transition: 'border-color 0.2s',
          }}
        />
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <DebugReadout result={result} resOk={resOk} />
    </div>
  )
}

function DebugReadout({ result, resOk }: { result: QualityResult | null; resOk: boolean | null }) {
  if (!result) {
    return <div style={{ padding: 12, fontFamily: 'monospace', fontSize: 12, color: '#aaa' }}>Starting camera…</div>
  }
  const m = result.metrics
  const line = (label: string, ok: boolean, val: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 12, padding: '2px 0' }}>
      <span style={{ color: ok ? '#34c97a' : '#e0a05c' }}>{ok ? '✓' : '✗'} {label}</span>
      <span style={{ color: '#ccc' }}>{val}</span>
    </div>
  )
  return (
    <div style={{ padding: 12, background: 'rgba(0,0,0,0.6)', borderRadius: 8, marginTop: 8 }}>
      {line('Sharp', result.sharp, m.sharpness.toFixed(0))}
      {line('Lit', result.lit, `lum ${m.meanLuminance.toFixed(0)} · glare ${(m.glareRatio * 100).toFixed(1)}% · dark ${(m.darkRatio * 100).toFixed(0)}%`)}
      {line('Stable', result.stable, m.motion === null ? '—' : m.motion.toFixed(1))}
      {line('Resolution', resOk === true, resOk === null ? '—' : resOk ? 'ok' : 'low')}
      <div style={{ marginTop: 8, fontWeight: 700, color: result.pass ? '#34c97a' : '#e0a05c', fontFamily: 'monospace' }}>
        {result.pass ? '✓ READY' : result.messages[0] ?? 'Align card in the box'}
      </div>
    </div>
  )
}
