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
