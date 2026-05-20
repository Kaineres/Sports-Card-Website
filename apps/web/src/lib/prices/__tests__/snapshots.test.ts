import { describe, it, expect } from 'vitest'
import { computeSnapshot } from '../snapshots'

describe('computeSnapshot', () => {
  it('computes median, avg, high, low for an odd-length list', () => {
    const result = computeSnapshot([100, 200, 150])
    expect(result.median).toBe(150)
    expect(result.avg).toBe(150)
    expect(result.low).toBe(100)
    expect(result.high).toBe(200)
  })

  it('computes median for an even-length list (average of two middle values)', () => {
    const result = computeSnapshot([100, 200, 300, 400])
    expect(result.median).toBe(250)
    expect(result.avg).toBe(250)
    expect(result.low).toBe(100)
    expect(result.high).toBe(400)
  })

  it('rounds avg and median to 2 decimal places', () => {
    const result = computeSnapshot([100, 200, 300])
    expect(result.avg).toBe(200)
    const result2 = computeSnapshot([10, 20, 31])
    expect(result2.avg).toBe(20.33)
  })

  it('handles a single price', () => {
    const result = computeSnapshot([150])
    expect(result.median).toBe(150)
    expect(result.avg).toBe(150)
    expect(result.low).toBe(150)
    expect(result.high).toBe(150)
  })

  it('throws on empty array', () => {
    expect(() => computeSnapshot([])).toThrow('Cannot compute snapshot from empty price list')
  })
})
