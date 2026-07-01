import { describe, it, expect } from 'vitest'
import { tiltAngleDeg, evaluateLevel, DEFAULT_TILT_THRESHOLDS, type Gravity } from '../tilt'

const G = 9.81
// Gravity vector for a phone tilted `deg` from flat, tilt spread along +x.
function tilted(deg: number): Gravity {
  const r = (deg * Math.PI) / 180
  return { x: G * Math.sin(r), y: 0, z: G * Math.cos(r) }
}

describe('tiltAngleDeg', () => {
  it('is 0° when the phone is flat (gravity straight down the z axis)', () => {
    expect(tiltAngleDeg({ x: 0, y: 0, z: G })).toBeCloseTo(0, 3)
  })

  it('is 90° when the phone is held vertical (gravity in the screen plane)', () => {
    expect(tiltAngleDeg({ x: G, y: 0, z: 0 })).toBeCloseTo(90, 3)
  })

  it('recovers the tilt angle regardless of in-plane direction', () => {
    // Same 20° tilt, spread across x and y instead of pure x.
    const r = (20 * Math.PI) / 180
    const h = G * Math.sin(r)
    const g: Gravity = { x: h / Math.SQRT2, y: h / Math.SQRT2, z: G * Math.cos(r) }
    expect(tiltAngleDeg(g)).toBeCloseTo(20, 3)
  })

  it('returns 0 for an all-zero reading instead of NaN', () => {
    expect(tiltAngleDeg({ x: 0, y: 0, z: 0 })).toBe(0)
  })
})

describe('evaluateLevel', () => {
  it('passes just inside the threshold and fails just outside it', () => {
    expect(evaluateLevel(tilted(DEFAULT_TILT_THRESHOLDS.maxTiltDeg - 1)).level).toBe(true)
    expect(evaluateLevel(tilted(DEFAULT_TILT_THRESHOLDS.maxTiltDeg + 3)).level).toBe(false)
  })

  it('attaches coaching only when not level', () => {
    expect(evaluateLevel(tilted(2)).message).toBeNull()
    expect(evaluateLevel(tilted(25)).message).toMatch(/flat and level/i)
  })

  it('does NOT block when there is no sensor data (null → level)', () => {
    const r = evaluateLevel(null)
    expect(r.level).toBe(true)
    expect(r.message).toBeNull()
  })
})
