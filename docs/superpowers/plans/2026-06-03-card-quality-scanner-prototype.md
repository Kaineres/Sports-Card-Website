# Card Quality Scanner Prototype — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an instrumented Tier-A photo-quality scanner (sharpness, lighting/glare, stability, resolution) as pure, unit-tested functions plus a live mobile camera component with an on-screen debug readout, so quality detection can be proven and calibrated on real cards before the rest of the grading engine is built.

**Architecture:** Pure metric functions operate on raw RGBA pixel data (no DOM) so they are deterministically unit-testable and portable to React Native later. A thin `evaluateQuality` layer combines them with calibratable thresholds into a pass/fail result with coaching messages. A `"use client"` camera component downscales each video frame to a hidden canvas, runs `evaluateQuality`, and renders a live debug HUD. A dedicated calibration page mounts the component in isolation.

**Tech Stack:** Next.js 16 App Router, TypeScript, Vitest (node env), browser `getUserMedia` + `<canvas>`. No new npm dependencies.

**Scope note:** This is Phase 2 Tier-A only (the reliable signals) from `docs/superpowers/specs/2026-06-03-ai-card-grading-engine-design.md`. Perspective and corner-occlusion (Tier B) are deliberately excluded until the core is proven. The grading agent is a separate later plan.

**All commands run from `apps/web/`.**

---

## File Structure

- Create: `apps/web/src/lib/camera/metrics.ts` — pure metric functions (grayscale, sharpness, lighting, frame difference). No DOM.
- Create: `apps/web/src/lib/camera/quality.ts` — thresholds + `evaluateQuality` + `meetsResolution`.
- Create: `apps/web/src/lib/camera/__tests__/metrics.test.ts` — tests for metric functions.
- Create: `apps/web/src/lib/camera/__tests__/quality.test.ts` — tests for `evaluateQuality`/`meetsResolution`.
- Create: `apps/web/src/components/grading/camera-scanner.tsx` — live camera component + debug HUD (manually tested).
- Create: `apps/web/src/app/grading/scanner-test/page.tsx` — isolated calibration page (dev-only, unlinked).

---

## Task 1: Frame type + grayscale conversion

**Files:**
- Create: `apps/web/src/lib/camera/metrics.ts`
- Test: `apps/web/src/lib/camera/__tests__/metrics.test.ts`

- [ ] **Step 1: Write the failing test** (creates the test file with shared synthetic-frame helpers used by later tasks)

```ts
import { describe, it, expect } from 'vitest'
import { toGrayscale, type RgbaFrame } from '../metrics'

// ---- shared synthetic-frame helpers (reused by later tasks) ----
export function solidFrame(w: number, h: number, gray: number): RgbaFrame {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = gray; data[i + 1] = gray; data[i + 2] = gray; data[i + 3] = 255
  }
  return { data, width: w, height: h }
}

export function checkerFrame(w: number, h: number, a: number, b: number): RgbaFrame {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = (x + y) % 2 === 0 ? a : b
      const i = (y * w + x) * 4
      data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255
    }
  }
  return { data, width: w, height: h }
}

describe('toGrayscale', () => {
  it('returns one luminance byte per pixel', () => {
    const gray = toGrayscale(solidFrame(4, 3, 100))
    expect(gray.length).toBe(12)
  })

  it('maps a neutral-gray RGBA pixel to the same luminance value', () => {
    const gray = toGrayscale(solidFrame(2, 2, 130))
    expect(Array.from(gray)).toEqual([130, 130, 130, 130])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/camera/__tests__/metrics.test.ts`
Expected: FAIL — cannot resolve `../metrics` / `toGrayscale is not a function`.

- [ ] **Step 3: Write minimal implementation**

```ts
// apps/web/src/lib/camera/metrics.ts
// Pure image-quality metrics. No DOM — operate on raw RGBA pixel data so they are
// deterministically unit-testable and portable to React Native (expo-camera) later.

export interface RgbaFrame {
  /** RGBA bytes, length = width * height * 4 */
  data: Uint8ClampedArray
  width: number
  height: number
}

/** Convert an RGBA frame to a grayscale luminance array (length = width*height). */
export function toGrayscale(frame: RgbaFrame): Uint8ClampedArray {
  const { data } = frame
  const gray = new Uint8ClampedArray(data.length / 4)
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    // Rec. 601 luma
    gray[p] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0
  }
  return gray
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/camera/__tests__/metrics.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/camera/metrics.ts src/lib/camera/__tests__/metrics.test.ts
git commit -m "feat(camera): RgbaFrame type + grayscale conversion"
```

---

## Task 2: Sharpness (variance of Laplacian)

**Files:**
- Modify: `apps/web/src/lib/camera/metrics.ts`
- Test: `apps/web/src/lib/camera/__tests__/metrics.test.ts`

- [ ] **Step 1: Write the failing test** (append to the existing test file; reuses `solidFrame`/`checkerFrame`)

```ts
import { sharpnessScore } from '../metrics'

describe('sharpnessScore', () => {
  it('is ~0 for a flat, uniform frame', () => {
    expect(sharpnessScore(solidFrame(16, 16, 120))).toBeLessThan(1)
  })

  it('is high for a high-contrast checkerboard (in focus)', () => {
    expect(sharpnessScore(checkerFrame(16, 16, 100, 160))).toBeGreaterThan(1000)
  })

  it('rates a sharp pattern higher than a flat one', () => {
    const sharp = sharpnessScore(checkerFrame(16, 16, 100, 160))
    const flat = sharpnessScore(solidFrame(16, 16, 130))
    expect(sharp).toBeGreaterThan(flat)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/camera/__tests__/metrics.test.ts`
Expected: FAIL — `sharpnessScore is not a function`.

- [ ] **Step 3: Write minimal implementation** (append to `metrics.ts`)

```ts
/**
 * Sharpness via variance of the Laplacian. Higher = sharper / more in focus.
 * Applies a 4-neighbour Laplacian kernel to the grayscale image and returns the
 * variance of the response. Blurry images produce a low-variance response.
 */
export function sharpnessScore(frame: RgbaFrame): number {
  const { width, height } = frame
  if (width < 3 || height < 3) return 0
  const gray = toGrayscale(frame)
  const lap: number[] = []
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x
      const v = -4 * gray[i] + gray[i - 1] + gray[i + 1] + gray[i - width] + gray[i + width]
      lap.push(v)
    }
  }
  let mean = 0
  for (const v of lap) mean += v
  mean /= lap.length
  let varSum = 0
  for (const v of lap) varSum += (v - mean) * (v - mean)
  return varSum / lap.length
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/camera/__tests__/metrics.test.ts`
Expected: PASS (5 tests total).

- [ ] **Step 5: Commit**

```bash
git add src/lib/camera/metrics.ts src/lib/camera/__tests__/metrics.test.ts
git commit -m "feat(camera): sharpness via variance of Laplacian"
```

---

## Task 3: Lighting metrics (brightness, glare, darkness)

**Files:**
- Modify: `apps/web/src/lib/camera/metrics.ts`
- Test: `apps/web/src/lib/camera/__tests__/metrics.test.ts`

- [ ] **Step 1: Write the failing test** (append)

```ts
import { lightingMetrics } from '../metrics'

describe('lightingMetrics', () => {
  it('reports mid luminance and no glare/dark for a neutral-gray frame', () => {
    const m = lightingMetrics(solidFrame(10, 10, 130))
    expect(m.meanLuminance).toBeCloseTo(130, 0)
    expect(m.glareRatio).toBe(0)
    expect(m.darkRatio).toBe(0)
  })

  it('reports full glare for a blown-out white frame', () => {
    const m = lightingMetrics(solidFrame(10, 10, 255))
    expect(m.glareRatio).toBe(1)
  })

  it('reports full darkness for a crushed-black frame', () => {
    const m = lightingMetrics(solidFrame(10, 10, 0))
    expect(m.darkRatio).toBe(1)
    expect(m.meanLuminance).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/camera/__tests__/metrics.test.ts`
Expected: FAIL — `lightingMetrics is not a function`.

- [ ] **Step 3: Write minimal implementation** (append to `metrics.ts`)

```ts
export interface LightingMetrics {
  meanLuminance: number // 0-255
  glareRatio: number    // fraction of near-white (>=250) pixels
  darkRatio: number     // fraction of near-black (<=10) pixels
}

/** Brightness + glare + darkness metrics from the grayscale histogram. */
export function lightingMetrics(frame: RgbaFrame): LightingMetrics {
  const gray = toGrayscale(frame)
  let sum = 0, glare = 0, dark = 0
  for (let p = 0; p < gray.length; p++) {
    const v = gray[p]
    sum += v
    if (v >= 250) glare++
    if (v <= 10) dark++
  }
  const n = gray.length || 1
  return { meanLuminance: sum / n, glareRatio: glare / n, darkRatio: dark / n }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/camera/__tests__/metrics.test.ts`
Expected: PASS (8 tests total).

- [ ] **Step 5: Commit**

```bash
git add src/lib/camera/metrics.ts src/lib/camera/__tests__/metrics.test.ts
git commit -m "feat(camera): lighting metrics (brightness, glare, darkness)"
```

---

## Task 4: Frame difference (motion / stability)

**Files:**
- Modify: `apps/web/src/lib/camera/metrics.ts`
- Test: `apps/web/src/lib/camera/__tests__/metrics.test.ts`

- [ ] **Step 1: Write the failing test** (append)

```ts
import { frameDifference } from '../metrics'

describe('frameDifference', () => {
  it('is 0 for identical buffers', () => {
    const a = new Uint8ClampedArray([10, 20, 30, 40])
    const b = new Uint8ClampedArray([10, 20, 30, 40])
    expect(frameDifference(a, b)).toBe(0)
  })

  it('equals the per-pixel delta for a uniform shift', () => {
    const a = new Uint8ClampedArray([0, 0, 0, 0])
    const b = new Uint8ClampedArray([255, 255, 255, 255])
    expect(frameDifference(a, b)).toBe(255)
  })

  it('throws when buffers differ in length', () => {
    expect(() => frameDifference(new Uint8ClampedArray([1]), new Uint8ClampedArray([1, 2])))
      .toThrow('same length')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/camera/__tests__/metrics.test.ts`
Expected: FAIL — `frameDifference is not a function`.

- [ ] **Step 3: Write minimal implementation** (append to `metrics.ts`)

```ts
/**
 * Mean absolute difference between two grayscale buffers (0-255).
 * Used for stability/motion: ~0 = still, large = moving. Buffers must match length.
 */
export function frameDifference(prev: Uint8ClampedArray, curr: Uint8ClampedArray): number {
  if (prev.length !== curr.length) {
    throw new Error('frameDifference: frames must be the same length')
  }
  if (prev.length === 0) return 0
  let sum = 0
  for (let p = 0; p < prev.length; p++) sum += Math.abs(prev[p] - curr[p])
  return sum / prev.length
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/camera/__tests__/metrics.test.ts`
Expected: PASS (11 tests total).

- [ ] **Step 5: Commit**

```bash
git add src/lib/camera/metrics.ts src/lib/camera/__tests__/metrics.test.ts
git commit -m "feat(camera): frame difference for motion/stability"
```

---

## Task 5: Quality evaluation + thresholds + resolution check

**Files:**
- Create: `apps/web/src/lib/camera/quality.ts`
- Test: `apps/web/src/lib/camera/__tests__/quality.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { evaluateQuality, meetsResolution, DEFAULT_THRESHOLDS } from '../quality'
import { toGrayscale, type RgbaFrame } from '../metrics'

function solidFrame(w: number, h: number, gray: number): RgbaFrame {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = gray; data[i + 1] = gray; data[i + 2] = gray; data[i + 3] = 255
  }
  return { data, width: w, height: h }
}
function checkerFrame(w: number, h: number, a: number, b: number): RgbaFrame {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = (x + y) % 2 === 0 ? a : b
    const i = (y * w + x) * 4
    data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255
  }
  return { data, width: w, height: h }
}

describe('evaluateQuality', () => {
  it('passes a sharp, well-lit, stable frame', () => {
    const good = checkerFrame(16, 16, 100, 160) // sharp; mean luma 130; no glare/dark
    const prev = toGrayscale(good)              // identical prev => no motion
    const res = evaluateQuality(good, prev, DEFAULT_THRESHOLDS)
    expect(res.sharp).toBe(true)
    expect(res.lit).toBe(true)
    expect(res.stable).toBe(true)
    expect(res.pass).toBe(true)
  })

  it('fails and coaches on a dark, blurry frame', () => {
    const dark = solidFrame(16, 16, 30)
    const res = evaluateQuality(dark, toGrayscale(dark), DEFAULT_THRESHOLDS)
    expect(res.lit).toBe(false)
    expect(res.sharp).toBe(false)
    expect(res.pass).toBe(false)
    expect(res.messages[0]).toMatch(/dark/i)
  })

  it('is not stable on the first frame (no previous frame)', () => {
    const good = checkerFrame(16, 16, 100, 160)
    const res = evaluateQuality(good, null, DEFAULT_THRESHOLDS)
    expect(res.metrics.motion).toBeNull()
    expect(res.stable).toBe(false)
  })

  it('detects motion between two different frames', () => {
    const good = checkerFrame(16, 16, 100, 160)
    const prevGray = toGrayscale(solidFrame(16, 16, 0))
    const res = evaluateQuality(good, prevGray, DEFAULT_THRESHOLDS)
    expect(res.stable).toBe(false)
  })
})

describe('meetsResolution', () => {
  it('accepts a long edge at or above the minimum', () => {
    expect(meetsResolution(1920, 1080)).toBe(true)
  })
  it('rejects a too-small capture', () => {
    expect(meetsResolution(640, 480)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/camera/__tests__/quality.test.ts`
Expected: FAIL — cannot resolve `../quality`.

- [ ] **Step 3: Write minimal implementation**

```ts
// apps/web/src/lib/camera/quality.ts
import {
  toGrayscale,
  sharpnessScore,
  lightingMetrics,
  frameDifference,
  type RgbaFrame,
} from './metrics'

export interface QualityThresholds {
  minSharpness: number  // variance-of-Laplacian floor
  minLuminance: number  // too dark below this (0-255)
  maxLuminance: number  // too bright above this (0-255)
  maxGlareRatio: number // fraction of blown-out pixels allowed
  maxDarkRatio: number  // fraction of crushed-black pixels allowed
  maxMotion: number     // mean abs frame diff allowed for "stable"
  minLongEdge: number   // min capture long-edge (px) for enough detail
}

// STARTING-POINT thresholds — MUST be calibrated on-device against real card
// photos (see Task 7). Treat as a first guess, not final values.
export const DEFAULT_THRESHOLDS: QualityThresholds = {
  minSharpness: 80,
  minLuminance: 60,
  maxLuminance: 235,
  maxGlareRatio: 0.02,
  maxDarkRatio: 0.25,
  maxMotion: 6,
  minLongEdge: 1000,
}

export interface QualityResult {
  sharp: boolean
  lit: boolean
  stable: boolean
  pass: boolean
  metrics: {
    sharpness: number
    meanLuminance: number
    glareRatio: number
    darkRatio: number
    motion: number | null // null when there is no previous frame
  }
  messages: string[] // coaching, highest priority first
}

/** True when the camera's capture long-edge is large enough for fine detail. */
export function meetsResolution(width: number, height: number, minLongEdge = DEFAULT_THRESHOLDS.minLongEdge): boolean {
  return Math.max(width, height) >= minLongEdge
}

/**
 * Evaluate one frame against the thresholds. `prevGray` is the previous frame's
 * grayscale buffer for motion detection (pass null on the first frame).
 */
export function evaluateQuality(
  frame: RgbaFrame,
  prevGray: Uint8ClampedArray | null,
  thresholds: QualityThresholds = DEFAULT_THRESHOLDS,
): QualityResult {
  const sharpness = sharpnessScore(frame)
  const light = lightingMetrics(frame)
  const currGray = toGrayscale(frame)
  const motion = prevGray && prevGray.length === currGray.length
    ? frameDifference(prevGray, currGray)
    : null

  const sharp = sharpness >= thresholds.minSharpness
  const tooDark = light.meanLuminance < thresholds.minLuminance
  const tooBright = light.meanLuminance > thresholds.maxLuminance
  const glary = light.glareRatio > thresholds.maxGlareRatio
  const crushed = light.darkRatio > thresholds.maxDarkRatio
  const lit = !tooDark && !tooBright && !glary && !crushed
  const stable = motion === null ? false : motion <= thresholds.maxMotion

  const messages: string[] = []
  if (tooDark) messages.push('Too dark — find brighter light')
  else if (tooBright) messages.push('Too bright — reduce direct light')
  if (glary) messages.push('Glare detected — tilt the card or move the light')
  if (crushed) messages.push('Shadows too deep — even out the lighting')
  if (!sharp) messages.push('Hold steady to focus')
  if (motion !== null && !stable) messages.push('Hold still')

  return {
    sharp, lit, stable,
    pass: sharp && lit && stable,
    metrics: {
      sharpness,
      meanLuminance: light.meanLuminance,
      glareRatio: light.glareRatio,
      darkRatio: light.darkRatio,
      motion,
    },
    messages,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/camera/__tests__/quality.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/camera/quality.ts src/lib/camera/__tests__/quality.test.ts
git commit -m "feat(camera): evaluateQuality + calibratable thresholds + resolution check"
```

---

## Task 6: Live camera component with debug HUD

**Files:**
- Create: `apps/web/src/components/grading/camera-scanner.tsx`

This component uses the browser camera and cannot run in the node test env — it is verified by typecheck here and manual on-device testing in Task 7.

- [ ] **Step 1: Write the component**

```tsx
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
```

- [ ] **Step 2: Typecheck the component**

Run: `npm run typecheck`
Expected: PASS (no type errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/grading/camera-scanner.tsx
git commit -m "feat(camera): live scanner component with debug HUD"
```

---

## Task 7: Calibration page + on-device calibration

**Files:**
- Create: `apps/web/src/app/grading/scanner-test/page.tsx`

- [ ] **Step 1: Write the calibration page**

```tsx
// apps/web/src/app/grading/scanner-test/page.tsx
import { CameraScanner } from '@/components/grading/camera-scanner'

export default function ScannerTestPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0804', padding: '1.5rem' }}>
      <h1 style={{ color: '#d4a843', fontFamily: 'var(--font-serif, serif)', fontSize: '1.4rem', margin: 0 }}>
        Quality Scanner — Calibration
      </h1>
      <p style={{ color: '#888', fontSize: 13, fontFamily: 'monospace', margin: '6px 0 16px' }}>
        Point the rear camera at a card. Watch the live metrics, then tune the
        thresholds in <code>src/lib/camera/quality.ts</code>.
      </p>
      <CameraScanner />
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Run the full test suite (regression check)**

Run: `npm test`
Expected: all camera tests pass (17 total: 11 metrics + 6 quality), and no previously-passing tests break.

- [ ] **Step 4: Commit**

```bash
git add src/app/grading/scanner-test/page.tsx
git commit -m "feat(camera): isolated calibration page for the quality scanner"
```

- [ ] **Step 5: Manual on-device calibration (human-in-the-loop)**

Camera APIs require a secure context (HTTPS or `localhost`) and a real camera, so this step is manual and cannot be automated.

1. Start the dev server: `npm run dev`, open `http://localhost:3000/grading/scanner-test` on a desktop with a webcam to confirm the live readout works at all. (Alternatively, since this repo auto-deploys, open the deployed `/grading/scanner-test` URL on your phone for the real rear-camera test.)
2. Hold a card in the box under different conditions and watch the HUD:
   - **Good photo:** sharp, even light, steady → all four rows should go ✓ and show **READY**.
   - **Blurry / moving:** Sharp ✗ and/or Stable ✗.
   - **Too dark / glare:** Lit ✗ with the matching coaching message.
3. Note the metric values where good vs bad photos sit, then adjust `DEFAULT_THRESHOLDS` in `src/lib/camera/quality.ts` so good cards pass and bad ones fail. Re-run `npm test` after any threshold edit (the tests use synthetic frames with wide margins and should still pass; if a threshold change breaks a test, reconcile the test's expectation).
4. Repeat until the gate feels right across a few cards and lighting setups. Commit the tuned thresholds:

```bash
git add src/lib/camera/quality.ts
git commit -m "chore(camera): calibrate quality thresholds from on-device testing"
```

---

## Self-Review

**1. Spec coverage (Tier-A scope):**
- Sharpness → Task 2 ✓
- Lighting (brightness/glare/dark) → Task 3 ✓
- Stability (motion) → Task 4 ✓
- Resolution check → Task 5 (`meetsResolution`) ✓
- Live mobile camera + card overlay → Task 6 ✓
- On-screen debug readout → Task 6 (`DebugReadout`) ✓
- Unit tests on synthetic frames → Tasks 1–5 ✓
- Calibration loop → Task 7 ✓
- Framing-by-pixel, perspective, occlusion → intentionally excluded (Tier B); the overlay box is a visual guide only. Documented in scope note.

**2. Placeholder scan:** No TBD/TODO/"handle errors appropriately". Every code step contains complete code. Manual step (7.5) is explicitly human-in-the-loop with concrete instructions, not a hidden gap.

**3. Type consistency:** `RgbaFrame` defined in Task 1, imported everywhere. `QualityResult`/`QualityThresholds`/`DEFAULT_THRESHOLDS` defined in Task 5, consumed unchanged in Task 6. `evaluateQuality(frame, prevGray, thresholds)` and `meetsResolution(width, height)` signatures match across the component and tests. `toGrayscale`, `sharpnessScore`, `lightingMetrics`, `frameDifference` names consistent across files.
