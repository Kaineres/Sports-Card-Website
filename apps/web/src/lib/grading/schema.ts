// Zod schemas for the grading engine — shared request + agent-output contracts.
// Validation lives here so both the API route and the agent parse against one source
// of truth (and the model is forced to return a shape we can render).
import { z } from 'zod'

export const HOUSES = ['PSA', 'BGS'] as const
export const FACTORS = ['centering', 'corners', 'edges', 'surface'] as const
export const CONFIDENCE = ['high', 'medium', 'low'] as const
export const PHOTO_QUALITY = ['good', 'marginal', 'poor'] as const

// Lighting condition a submitted image was captured under. Lets the agent know
// which frames it can trust for surface (raking) vs. centering (even). Optional
// now; the guided multi-capture flow (Phase 2) will populate it per frame.
export const LIGHTING = ['even', 'raking', 'unknown'] as const

// Advisory qualifier tags (card IS graded, but a flaw is flagged). MK/MC are
// always applied by PSA when present; the rest are informational in our app.
export const QUALIFIER_CODES = ['OC', 'ST', 'PD', 'OF', 'MK', 'MC'] as const

// No-grade / alteration reason codes. When one of these fires, PSA refuses to
// assign a number — we suppress the numeric grade and surface the reason.
export const NO_GRADE_CODES = ['N0', 'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9'] as const

const gradeNumber = z.number().min(1).max(10)
// A [low, high] plausibility band. Enforce ordering so the UI never renders an
// inverted range.
const gradeRange = z
  .tuple([gradeNumber, gradeNumber])
  .refine(([lo, hi]) => lo <= hi, { message: 'range low must be <= high' })

// ── Request ─────────────────────────────────────────────────────────────────
// Images arrive as data-URL / base64 strings (mirrors the existing quality-check
// route), keeping the client simple — no multipart handling required. The .max()
// is a server-side size ceiling (defense in depth behind client downscaling);
// ~10MB of base64 ≈ a ~7MB photo, well above a downscaled JPEG.
const imageString = z.string().min(1, 'empty image').max(10_000_000, 'image too large')

export const GradeRequestSchema = z.object({
  house: z.enum(HOUSES).default('PSA'),
  front: imageString,
  back: imageString.optional(),
  lighting: z.enum(LIGHTING).default('unknown'),
})
export type GradeRequest = z.infer<typeof GradeRequestSchema>

// ── Agent output ─────────────────────────────────────────────────────────────
export const FactorSchema = z.object({
  name: z.enum(FACTORS),
  score: gradeNumber,
  range: gradeRange,
  reasoning: z.string().min(1),
})
export type Factor = z.infer<typeof FactorSchema>

// Advisory qualifier the model attaches when a single honest flaw is present.
export const QualifierSchema = z.object({
  code: z.enum(QUALIFIER_CODES),
  note: z.string().min(1),
})
export type Qualifier = z.infer<typeof QualifierSchema>

// Set when the model sees evidence PSA would not numerically grade. When present,
// the UI shows the code + reason INSTEAD of the number.
export const NoGradeSchema = z.object({
  code: z.enum(NO_GRADE_CODES),
  reason: z.string().min(1),
})
export type NoGrade = z.infer<typeof NoGradeSchema>

export const GradeResultSchema = z.object({
  house: z.enum(HOUSES),
  overall: gradeNumber,
  overallRange: gradeRange,
  confidence: z.enum(CONFIDENCE),
  photoQuality: z.enum(PHOTO_QUALITY),
  factors: z
    .array(FactorSchema)
    .length(4)
    .refine((fs) => new Set(fs.map((f) => f.name)).size === 4, {
      message: 'factors must be four distinct attributes',
    }),
  // Advisory tags shown alongside the grade (OC, ST, …). Empty when clean.
  qualifiers: z.array(QualifierSchema).default([]),
  // Non-null when the card is unfit for a numeric grade (trimmed/altered/fake).
  notGraded: NoGradeSchema.nullable().default(null),
  summary: z.string().min(1),
  // Populated by the guardrail when a rule adjusts the model's proposed overall,
  // or when surface is capped for flat-light-only input. Surfaced in the UI.
  notes: z.array(z.string()).default([]),
})
export type GradeResult = z.infer<typeof GradeResultSchema>

// The agent proposes everything EXCEPT `notes`, which the guardrail derives. It
// DOES propose `qualifiers` and `notGraded` (the model detects those); mapping.ts
// then reconciles the final `overall`/`notes` and honors `notGraded`.
export const AgentOutputSchema = GradeResultSchema.omit({ notes: true })
export type AgentOutput = z.infer<typeof AgentOutputSchema>
