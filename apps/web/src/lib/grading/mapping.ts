// Overall-grade reconciliation guardrail — pure, deterministic post-processing on
// the agent's proposed grade. The model is good at reading a card but bad at PSA's
// arithmetic rules, so we don't trust its `overall` blindly: we re-derive it from
// the per-attribute scores and PSA's discrete scale, then attach explanatory notes.
// No I/O, no randomness — same input always maps to the same GradeResult.
import type { AgentOutput, GradeResult, Factor } from './schema'

// PSA's valid whole-/half-grade ladder (mirrors psa.json). Note there is NO 9.5:
// PSA jumps 9 → 10, unlike BGS. Kept descending so snapDown can scan top-down.
const PSA_SCALE = [10, 9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1] as const

// Largest PSA_SCALE value <= n. Clamps to the ends of the ladder. This is what
// kills off-scale numbers the model sometimes emits (e.g. 9.5 → 9, 7.8 → 7.5).
function snapDown(n: number): number {
  if (n >= 10) return 10
  if (n < 1) return 1
  for (const g of PSA_SCALE) if (g <= n) return g
  return 1 // unreachable (1 is the floor), but keeps the return total
}

export function reconcileOverall(
  output: AgentOutput,
  opts?: { hasRakingLight?: boolean },
): GradeResult {
  const notes: string[] = []

  // ── Rule 2: weakest-attribute cap ──────────────────────────────────────────
  // PSA's overall can never exceed its weakest sub-grade. Cap the model's proposal
  // at the min factor score, then snap to the discrete scale.
  const weakest = Math.min(...output.factors.map((f) => f.score))
  const finalOverall = snapDown(Math.min(output.overall, weakest))

  if (finalOverall < output.overall) {
    // Name the factor(s) sitting at the weakest score so the note explains *why*.
    const limiting = output.factors
      .filter((f: Factor) => f.score === weakest)
      .map((f) => `${f.name} ${f.score.toFixed(1)}`)
      .join(', ')
    notes.push(
      `Overall capped at ${finalOverall} by weakest attribute (${limiting}) — a PSA grade cannot exceed its weakest attribute.`,
    )
  }

  // ── Rule 3: surface ceiling (flat-light honesty) ────────────────────────────
  // Without a raking/grazing frame we can't see fine scratches or print lines, so
  // the surface score is a best-case ceiling — always disclose that, and soften
  // confidence when the model claims a pristine surface it couldn't have verified.
  let confidence = output.confidence
  if (!opts?.hasRakingLight) {
    notes.push(
      'Surface graded from flat, even lighting only — fine scratches and print lines may be hidden. The surface score is a best-case ceiling; add a raking/grazing-light photo to confirm.',
    )
    const surface = output.factors.find((f) => f.name === 'surface')
    if (surface && surface.score >= 9 && confidence === 'high') {
      confidence = 'medium'
      notes.push(
        'Surface confidence reduced: cannot fully verify a clean surface under flat lighting.',
      )
    }
  }

  // ── Rule 4: range clamp ─────────────────────────────────────────────────────
  // Snap both ends onto the scale and make sure finalOverall sits inside the band.
  let low = snapDown(output.overallRange[0])
  let high = snapDown(output.overallRange[1])
  if (finalOverall < low) low = finalOverall
  if (finalOverall > high) high = finalOverall
  const overallRange: [number, number] = [low, high]

  // ── Rule 5: assemble ────────────────────────────────────────────────────────
  return { ...output, overall: finalOverall, overallRange, confidence, notes }
}
