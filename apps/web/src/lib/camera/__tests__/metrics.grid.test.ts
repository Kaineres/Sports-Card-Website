import { describe, it, expect } from 'vitest'
import { lightingMetrics } from '../metrics'
import { solidFrame } from './metrics.test'

// Regression tests for the 8×8 glare grid covering the FULL frame — the old
// floor(size/8) step left an unmeasured strip on the right/bottom edge when the
// dimension was not divisible by 8, so a specular hotspot there was missed.
describe('lightingMetrics — 8×8 grid edge coverage', () => {
  it('catches a blown-out region in the right/bottom edge strip (non-divisible size)', () => {
    // 70 is not divisible by 8: floor(70/8)=8, so the old grid only covered
    // columns/rows 0..64 and never measured the 64..70 strip.
    const w = 70, h = 70
    const frame = solidFrame(w, h, 130)
    // Blow out a 6×6 block sitting entirely inside the old dead strip.
    for (let y = 64; y < 70; y++) {
      for (let x = 64; x < 70; x++) {
        const i = (y * w + x) * 4
        frame.data[i] = 255; frame.data[i + 1] = 255; frame.data[i + 2] = 255
      }
    }
    const m = lightingMetrics(frame)
    // Whole-frame ratio dilutes it away (36/4900 ≈ 0.7%)…
    expect(m.glareRatio).toBeLessThan(0.02)
    // …but the edge cell now covers it, so the hotspot is detected.
    expect(m.maxCellGlareRatio).toBeGreaterThan(0)
  })

  it('still reports maxCellGlareRatio=1 for a fully blown non-divisible frame', () => {
    const m = lightingMetrics(solidFrame(70, 70, 255))
    expect(m.maxCellGlareRatio).toBe(1)
  })

  it('still reports 0 for a bright-but-unclipped non-divisible frame', () => {
    const m = lightingMetrics(solidFrame(70, 70, 235))
    expect(m.maxCellGlareRatio).toBe(0)
  })
})
