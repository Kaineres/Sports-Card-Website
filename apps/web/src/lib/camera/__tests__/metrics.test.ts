import { describe, it, expect } from 'vitest'
import { toGrayscale, sharpnessScore, lightingMetrics, frameDifference, type RgbaFrame } from '../metrics'

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

  it('does not flag bright-but-unclipped content (chrome/foil) as a glare hotspot', () => {
    // 235 is bright — like a silver Prizm border under even light — but not clipped.
    // This is the false positive we fixed: it must NOT read as glare or a hotspot.
    const m = lightingMetrics(solidFrame(64, 64, 235))
    expect(m.meanLuminance).toBeGreaterThan(230) // bright…
    expect(m.glareRatio).toBe(0)                 // …but not clipped
    expect(m.maxCellGlareRatio).toBe(0)
  })

  it('flags a small blown-out (clipped) region the whole-frame ratio dilutes away', () => {
    const w = 64, h = 64
    const frame = solidFrame(w, h, 130)
    // Blow out the top-left 8×8 cell to pure white (a concentrated specular hotspot).
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const i = (y * w + x) * 4
        frame.data[i] = 255; frame.data[i + 1] = 255; frame.data[i + 2] = 255
      }
    }
    const m = lightingMetrics(frame)
    expect(m.glareRatio).toBeLessThan(0.02)        // 64/4096 ≈ 1.6% — under the whole-frame gate
    expect(m.maxCellGlareRatio).toBeGreaterThan(0.9) // but one full cell is blown → hotspot caught
  })

  it('reports a full hotspot for a fully blown-out white frame', () => {
    const m = lightingMetrics(solidFrame(16, 16, 255))
    expect(m.glareRatio).toBe(1)
    expect(m.maxCellGlareRatio).toBe(1)
  })
})

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
