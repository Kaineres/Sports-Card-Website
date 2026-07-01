import { describe, it, expect } from 'vitest'
import { reconcileOverall } from '../mapping'
import type { AgentOutput, Factor } from '../schema'

// ---- valid-AgentOutput fixture builder ----
// Defaults to a clean, internally-consistent PSA 9 (all factors 9, high confidence)
// so each test overrides only the field it exercises. `factors` overrides pick up
// the per-name score; anything unspecified stays at 9. `qualifiers`/`notGraded`
// default to the clean state ([] and null) — the schema now requires both.
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
    qualifiers: [],
    notGraded: null,
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

describe('reconcileOverall — PSA-holistic cap', () => {
  it('forgives ONE lagging attribute: corners 8, others 10 → overall 9 (not 8)', () => {
    // Canonical case from the design spec. A single minor flaw does not sink the card.
    const out = reconcileOverall(
      makeOutput({ overall: 9, overallRange: [9, 9], factors: factors(10, 8, 10, 10) }),
      { hasRakingLight: true },
    )
    expect(out.overall).toBe(9)
    expect(out.overall).not.toBe(8)
    // The model already proposed 9, so the holistic rule did not *lower* anything —
    // no "capped" note should fire on plain agreement.
    expect(out.notes.some((n) => n.includes('capped'))).toBe(false)
  })

  it('caps an over-optimistic single-flaw proposal down one grade (10 → 9) with a note', () => {
    const out = reconcileOverall(
      makeOutput({ overall: 10, overallRange: [9, 10], factors: factors(10, 8, 10, 10) }),
      { hasRakingLight: true },
    )
    expect(out.overall).toBe(9) // bounded to one grade above the lone weak attribute
    const capNote = out.notes.find((n) => n.includes('capped'))
    expect(capNote).toBeDefined()
    expect(capNote).toContain('corners')
  })

  it('applies the strict weakest cap when TWO or more attributes lag', () => {
    // corners AND edges at 8 → two laggards → overall held to the weakest (8).
    const out = reconcileOverall(
      makeOutput({ overall: 9, overallRange: [8, 9], factors: factors(10, 8, 8, 10) }),
      { hasRakingLight: true },
    )
    expect(out.overall).toBe(8)
    const capNote = out.notes.find((n) => n.includes('capped'))
    expect(capNote).toBeDefined()
    expect(capNote).toContain('corners')
    expect(capNote).toContain('edges')
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

describe('reconcileOverall — factor snapping', () => {
  it('snaps every factor score down to the PSA ladder', () => {
    const out = reconcileOverall(
      makeOutput({ overall: 9, factors: factors(9.5, 8.7, 10, 9.2) }),
      { hasRakingLight: true },
    )
    const byName = Object.fromEntries(out.factors.map((f) => [f.name, f.score]))
    expect(byName.centering).toBe(9) // 9.5 → 9 (no PSA 9.5)
    expect(byName.corners).toBe(8.5) // 8.7 → 8.5
    expect(byName.edges).toBe(10)
    expect(byName.surface).toBe(9) // 9.2 → 9
    for (const f of out.factors) {
      expect(PSA_SCALE_CONTAINS(f.score)).toBe(true)
    }
  })
})

describe('reconcileOverall — snapDown kills off-scale grades', () => {
  it('never returns 9.5 (an invalid PSA grade) and does not mistake the snap for a cap', () => {
    const out = reconcileOverall(
      makeOutput({ overall: 9.5, overallRange: [9.5, 9.5], factors: factors(9.5, 9.5, 9.5, 9.5) }),
      { hasRakingLight: true },
    )
    expect(out.overall).toBe(9)
    expect(out.overall).not.toBe(9.5)
    expect(out.overallRange).not.toContain(9.5)
    // Pure ladder-snapping (9.5 → 9) must NOT fire the holistic-cap note.
    expect(out.notes.some((n) => n.includes('capped'))).toBe(false)
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

describe('reconcileOverall — confidence cap', () => {
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

  it('caps confidence to at most medium on flat light even when surface is modest', () => {
    // No raking light, no surface >= 9 downgrade trigger — the broader thin-evidence
    // cap must still ensure confidence is not left at "high".
    const out = reconcileOverall(
      makeOutput({ confidence: 'high', factors: factors(8, 8, 8, 8) }),
    )
    expect(out.confidence).not.toBe('high')
    expect(out.confidence).toBe('medium')
    expect(out.notes.some((n) => n.includes('Confidence capped at medium'))).toBe(true)
  })
})

describe('reconcileOverall — range clamp', () => {
  it('caps the high end by the holistic overall and keeps low <= overall <= high', () => {
    // Single lagging attribute (corners 8) → overall 9; the model's high end of 10
    // must be pulled down to the reconciled overall.
    const out = reconcileOverall(
      makeOutput({ overall: 10, overallRange: [8, 10], factors: factors(10, 8, 10, 10) }),
      { hasRakingLight: true },
    )
    expect(out.overall).toBe(9)
    const [low, high] = out.overallRange
    expect(PSA_SCALE_CONTAINS(low)).toBe(true)
    expect(PSA_SCALE_CONTAINS(high)).toBe(true)
    expect(high).toBeLessThanOrEqual(out.overall) // high end capped by the holistic cap
    expect(low).toBeLessThanOrEqual(out.overall)
    expect(out.overall).toBeLessThanOrEqual(high)
  })
})

describe('reconcileOverall — notGraded passthrough', () => {
  it('preserves notGraded and still snaps factors (UI suppresses the number)', () => {
    const notGraded = { code: 'N1' as const, reason: 'Hooked, unnaturally sharp edges — evidence of trimming.' }
    const out = reconcileOverall(
      makeOutput({
        overall: 9,
        notGraded,
        factors: factors(9.5, 8, 9, 9),
      }),
      { hasRakingLight: true },
    )
    // The no-grade state is preserved verbatim...
    expect(out.notGraded).toEqual(notGraded)
    // ...and a best-guess numeric overall is still present (the app hides it).
    expect(typeof out.overall).toBe('number')
    // Factors are still snapped to the ladder.
    for (const f of out.factors) {
      expect(PSA_SCALE_CONTAINS(f.score)).toBe(true)
    }
  })
})

// Local mirror of the valid ladder for range-membership assertions.
const PSA_SCALE = [10, 9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1]
function PSA_SCALE_CONTAINS(n: number): boolean {
  return PSA_SCALE.includes(n)
}
