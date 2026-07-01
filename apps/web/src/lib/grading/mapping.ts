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

  // ── Rule 1: snap every factor score onto the ladder ─────────────────────────
  // The model sometimes emits off-scale sub-scores (e.g. 8.7, 9.5). Snap each one
  // down to the PSA ladder so downstream math and the UI only ever see valid grades.
  const factors: Factor[] = output.factors.map((f) => ({ ...f, score: snapDown(f.score) }))

  // ── Rule 2: PSA-holistic cap (replaces the old strict min()) ─────────────────
  // PSA grades holistically: a single lagging attribute is forgiven (a MINT 9 is
  // allowed exactly one minor flaw), and only TWO OR MORE lagging attributes cap
  // the overall hard at the weakest. Sort the four sub-scores ascending
  // (s0<=s1<=s2<=s3) and reason off the two weakest. Use the model's ORIGINAL
  // scores here — snapping is a separate concern, and comparing against the
  // model's proposal must not mistake a plain 9.5→9 snap for a real cap.
  const sorted = [...output.factors.map((f) => f.score)].sort((a, b) => a - b)
  const s0 = sorted[0] // weakest
  const s1 = sorted[1] // runner-up

  // "Lag" test: if the runner-up is strictly stronger than the weakest, only ONE
  // attribute lags — forgive it, bounded by BOTH the runner-up and one full
  // integer grade above the weakest. Otherwise two-or-more lag → strict weakest cap.
  const singleFlaw = s1 > s0
  const holisticCap = singleFlaw ? Math.min(s1, s0 + 1) : s0

  // Never let the reconciled overall exceed the model's proposal; then snap down.
  const finalOverall = snapDown(Math.min(output.overall, holisticCap))

  // Only call it a "cap" when the holistic rule actually pulled the grade below the
  // model's proposal — NOT when the final number merely dropped via ladder-snapping.
  if (holisticCap < output.overall) {
    const limiting = output.factors
      .filter((f: Factor) => f.score === s0)
      .map((f) => `${f.name} ${f.score.toFixed(1)}`)
      .join(', ')
    notes.push(
      singleFlaw
        ? `Overall capped at ${finalOverall} by weakest attribute (${limiting}) — held to one grade above the lone lagging attribute.`
        : `Overall capped at ${finalOverall} by weakest attributes (${limiting}) — two or more attributes lag, so the overall cannot exceed the weakest.`,
    )
  }

  // ── Rule 3: surface ceiling (flat-light honesty) ────────────────────────────
  // Without a raking/grazing frame we can't see fine scratches or print lines, so
  // the surface score is a best-case ceiling — always disclose that, and soften
  // confidence when the model claims a pristine surface it couldn't have verified.
  let confidence = output.confidence
  const surface = factors.find((f) => f.name === 'surface')
  if (!opts?.hasRakingLight) {
    notes.push(
      'Surface graded from flat, even lighting only — fine scratches and print lines may be hidden. The surface score is a best-case ceiling; add a raking/grazing-light photo to confirm.',
    )
    if (surface && surface.score >= 9 && confidence === 'high') {
      confidence = 'medium'
      notes.push(
        'Surface confidence reduced: cannot fully verify a clean surface under flat lighting.',
      )
    }
  }

  // ── Rule 4: thin-evidence confidence cap ────────────────────────────────────
  // Evidence is thin when there is no raking-light frame (flat/unknown lighting) or
  // the surface factor is missing — either way we can't justify top confidence, so
  // cap at medium. This subsumes the narrower surface-only downgrade above.
  const thinEvidence = !opts?.hasRakingLight || !surface
  if (thinEvidence && confidence === 'high') {
    confidence = 'medium'
    notes.push(
      'Confidence capped at medium: evidence is thin (no raking-light frame or missing surface read), so certainty is limited.',
    )
  }

  // ── Rule 5: range clamp + holistic high-cap ─────────────────────────────────
  // Snap both ends onto the scale, cap the high end by the reconciled overall (the
  // band must not promise more than the holistic cap allows), and keep finalOverall
  // inside the band.
  let low = snapDown(output.overallRange[0])
  let high = snapDown(output.overallRange[1])
  if (high > finalOverall) high = finalOverall
  if (finalOverall < low) low = finalOverall
  if (finalOverall > high) high = finalOverall
  const overallRange: [number, number] = [low, high]

  // ── Rule 6: assemble ────────────────────────────────────────────────────────
  // `notGraded` (and `qualifiers`) flow through untouched via the spread — when the
  // model no-graded the card, we still snap factors and keep notes but do not fight
  // the no-grade state; the UI hides the number and shows the code + reason.
  return { ...output, factors, overall: finalOverall, overallRange, confidence, notes }
}
