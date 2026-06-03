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
