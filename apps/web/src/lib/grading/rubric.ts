// Rubric loader/validator + prompt serializer for the grading engine.
// The hand-authored PSA rubric (rubrics/psa.json) is the single source of truth
// for grade tiers, criteria, and the reconciliation rules. This module loads +
// validates it, and renders a compact plain-text view for the system prompt.
// Pure — no network, no DOM.
import psaRubric from './rubrics/psa.json'

// Structural type derived straight from the JSON. resolveJsonModule is on
// (tsconfig.json), so `typeof` gives us a faithful shape without a hand-written
// interface that could drift from the file.
export type PsaRubric = typeof psaRubric

// Re-exported scale for reuse (same array the JSON declares — no fabrication).
export const PSA_SCALE: number[] = psaRubric.scale

// ── Load + validate ──────────────────────────────────────────────────────────
// Memoized: validation runs once, repeated callers get the cached object.
let cached: PsaRubric | null = null

// Substantive keys the rest of the engine relies on. Provenance keys (`_about`,
// `_sources`, notes) are intentionally NOT required — they're internal metadata.
const REQUIRED_KEYS: readonly string[] = [
  'scale',
  'criteria.centering',
  'criteria.corners',
  'criteria.edges',
  'criteria.surface',
  'overallRule',
  'surfaceCeiling',
]

// Dotted-path lookup (only one level of nesting used, kept generic anyway).
function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key]
    return undefined
  }, obj)
}

export function loadRubric(house: 'PSA' = 'PSA'): PsaRubric {
  if (house !== 'PSA') {
    throw new Error(`Rubric for house "${house}" is not implemented — only PSA is supported (BGS TBD).`)
  }
  if (cached) return cached

  const rubric = psaRubric as PsaRubric
  const missing = REQUIRED_KEYS.filter((k) => getPath(rubric, k) == null)
  if (missing.length > 0) {
    throw new Error(`PSA rubric is missing required key(s): ${missing.join(', ')}`)
  }

  cached = rubric
  return cached
}

// ── Prompt serializer ─────────────────────────────────────────────────────────
// Strip internal certainty markers ([C]/[L]/[G] and variants like [C/L],
// [G from 10 definition], [G interpolated ...]) from emitted text.
function stripMarkers(text: string): string {
  return text.replace(/\s*\[[CLG][^\]]*\]/g, '').trim()
}

// Render one grade→text criteria block (corners/edges/surface), skipping `_`
// provenance keys and preserving scale order.
function renderStringTiers(tiers: Record<string, unknown>): string {
  return psaRubric.scale
    .map((g) => {
      const v = tiers[String(g)]
      return typeof v === 'string' ? `  ${g}: ${stripMarkers(v)}` : null
    })
    .filter(Boolean)
    .join('\n')
}

export function serializeRubricForPrompt(rubric: PsaRubric): string {
  const c = rubric.criteria
  const out: string[] = []

  out.push(`# ${rubric.house} GRADING RUBRIC`)
  out.push('')

  // Scale — single line.
  out.push('## SCALE')
  out.push(rubric.scale.join(', '))
  out.push('')

  // Grade names.
  out.push('## GRADE NAMES')
  for (const g of rubric.scale) {
    const name = (rubric.gradeNames as Record<string, string>)[String(g)]
    if (name) out.push(`  ${g}: ${name}`)
  }
  out.push('')

  // Per-grade holistic anchors (GEM-MT 10 / MINT 9 / … definitions) — the
  // calibration text the model needs to place a card on the scale. Marker-stripped,
  // scale order.
  out.push('## GRADE DEFINITIONS')
  for (const g of rubric.scale) {
    const def = (rubric.gradeDefinitions as Record<string, string>)[String(g)]
    if (def) out.push(`  ${g}: ${stripMarkers(def)}`)
  }
  out.push('')

  // Centering — front/back ratios per tier + the below-five note.
  out.push('## CENTERING')
  out.push(`  measure: ${stripMarkers(c.centering._measure)}`)
  for (const g of rubric.scale) {
    const tier = (c.centering as Record<string, unknown>)[String(g)]
    if (tier && typeof tier === 'object') {
      const t = tier as { front?: string; back?: string }
      if (t.front && t.back) out.push(`  ${g}: front ${t.front}, back ${t.back}`)
    }
  }
  out.push(`  below 5: ${stripMarkers(c.centering.belowFive)}`)
  out.push('')

  // Corners / edges / surface — grade→text tiers.
  out.push('## CORNERS')
  out.push(`  measure: ${stripMarkers(c.corners._measure)}`)
  out.push(renderStringTiers(c.corners as Record<string, unknown>))
  out.push('')

  out.push('## EDGES')
  out.push(`  measure: ${stripMarkers(c.edges._measure)}`)
  out.push(renderStringTiers(c.edges as Record<string, unknown>))
  out.push('')

  out.push('## SURFACE')
  out.push(`  measure: ${stripMarkers(c.surface._measure)}`)
  out.push(renderStringTiers(c.surface as Record<string, unknown>))
  out.push('')

  // Overall reconciliation rule (weakest attribute caps the overall).
  out.push('## OVERALL RULE')
  out.push(stripMarkers(rubric.overallRule))
  out.push('')

  // Surface ceiling — VERBATIM. Critical capture-limitation instruction; do not
  // strip markers or reword.
  out.push('## SURFACE CEILING (CRITICAL — follow exactly)')
  out.push(rubric.surfaceCeiling)
  out.push('')

  // Qualifiers.
  out.push('## QUALIFIERS')
  for (const q of rubric.qualifiers) {
    out.push(`  ${q.code}: ${q.meaning} (${q.applied})`)
  }
  out.push('')

  // No-grade policy + reason codes.
  out.push('## NO GRADE (Authentic / reason codes)')
  out.push(`  policy: ${stripMarkers(rubric.noGrade._policy)}`)
  for (const [code, meaning] of Object.entries(rubric.noGrade.codes)) {
    out.push(`  ${code}: ${stripMarkers(meaning as string)}`)
  }

  return out.join('\n')
}
