import { describe, it, expect } from 'vitest'
import { reconcileOverall } from '../mapping'
import type { AgentOutput, Factor } from '../schema'

// ---- valid-AgentOutput fixture builder ----
// Defaults to a clean, internally-consistent PSA 9 (all factors 9, high confidence)
// so each test overrides only the field it exercises. `factors` overrides pick up
// the per-name score; anything unspecified stays at 9.
function makeOutput(overrides: Partial<AgentOutput> = {}): AgentOutput {
  const factor = (name: Factor['name'], score: number): Factor => ({
    name,
    score,
    range: [score, score],
    reasoning: `${name} looks like a ${score}`,
  })
  return {
    house: 'PSA',
    overall: 9,
    overallRange: [9, 9],
    confidence: 'high',
    photoQuality: 'good',
    factors: [
      factor('centering', 9),
      factor('corners', 9),
      factor('edges', 9),
      factor('surface', 9),
    ],
    summary: 'A clean, well-centered card.',
    ...overrides,
  }
}

// A factor helper for building override factor arrays inline.
function factors(c: number, co: number, e: number, s: number): Factor[] {
  const f = (name: Factor['name'], score: number): Factor => ({
    name,
    score,
    range: [score, score],
    reasoning: `${name} ${score}`,
  })
  return [f('centering', c), f('corners', co), f('edges', e), f('surface', s)]
}

describe('reconcileOverall — weakest-attribute cap', () => {
  it('caps overall 9 down to 8 when corners are only 8', () => {
    const out = reconcileOverall(
      makeOutput({ overall: 9, factors: factors(9, 8, 9, 9) }),
      { hasRakingLight: true },
    )
    expect(out.overall).toBe(8)
    const capNote = out.notes.find((n) => n.includes('capped'))
    expect(capNote).toBeDefined()
    expect(capNote).toContain('corners')
  })

  it('is a no-op when already consistent (overall === weakest, raking light on)', () => {
    const out = reconcileOverall(
      makeOutput({ overall: 9, factors: factors(9, 9, 9, 9) }),
      { hasRakingLight: true },
    )
    expect(out.overall).toBe(9)
    expect(out.notes.some((n) => n.includes('capped'))).toBe(false)
    expect(out.notes.some((n) => n.includes('Surface graded from flat'))).toBe(false)
    expect(out.notes).toHaveLength(0)
  })
})

describe('reconcileOverall — snapDown kills off-scale grades', () => {
  it('never returns 9.5 (an invalid PSA grade)', () => {
    const out = reconcileOverall(
      makeOutput({ overall: 9.5, overallRange: [9.5, 9.5], factors: factors(9.5, 9.5, 9.5, 9.5) }),
      { hasRakingLight: true },
    )
    expect(out.overall).toBe(9)
    expect(out.overall).not.toBe(9.5)
    expect(out.overallRange).not.toContain(9.5)
  })
})

describe('reconcileOverall — surface ceiling note', () => {
  it('adds the flat-light surface note when hasRakingLight is omitted', () => {
    const out = reconcileOverall(makeOutput())
    expect(out.notes.some((n) => n.startsWith('Surface graded from flat'))).toBe(true)
  })

  it('does not add the surface note when hasRakingLight is true', () => {
    const out = reconcileOverall(makeOutput(), { hasRakingLight: true })
    expect(out.notes.some((n) => n.startsWith('Surface graded from flat'))).toBe(false)
  })
})

describe('reconcileOverall — confidence downgrade', () => {
  it('downgrades high → medium under flat light when surface >= 9', () => {
    const out = reconcileOverall(
      makeOutput({ confidence: 'high', factors: factors(9, 9, 9, 9.5) }),
    )
    expect(out.confidence).toBe('medium')
    expect(out.notes.some((n) => n.includes('Surface confidence reduced'))).toBe(true)
  })

  it('does not downgrade when hasRakingLight is true', () => {
    const out = reconcileOverall(
      makeOutput({ confidence: 'high', factors: factors(9, 9, 9, 9.5) }),
      { hasRakingLight: true },
    )
    expect(out.confidence).toBe('high')
    expect(out.notes.some((n) => n.includes('Surface confidence reduced'))).toBe(false)
  })
})

describe('reconcileOverall — range clamp', () => {
  it('snaps the high end and keeps low <= overall <= high after a cap', () => {
    const out = reconcileOverall(
      makeOutput({ overall: 9, overallRange: [8, 10], factors: factors(9, 8, 9, 9) }),
      { hasRakingLight: true },
    )
    expect(out.overall).toBe(8)
    const [low, high] = out.overallRange
    expect(PSA_SCALE_CONTAINS(low)).toBe(true)
    expect(PSA_SCALE_CONTAINS(high)).toBe(true)
    expect(low).toBeLessThanOrEqual(out.overall)
    expect(out.overall).toBeLessThanOrEqual(high)
  })
})

// Local mirror of the valid ladder for range-membership assertions.
const PSA_SCALE = [10, 9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1]
function PSA_SCALE_CONTAINS(n: number): boolean {
  return PSA_SCALE.includes(n)
}
