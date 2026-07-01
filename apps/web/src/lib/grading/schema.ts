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

const gradeNumber = z.number().min(1).max(10)
const gradeRange = z.tuple([gradeNumber, gradeNumber])

// ── Request ─────────────────────────────────────────────────────────────────
// Images arrive as data-URL / base64 strings (mirrors the existing quality-check
// route), keeping the client simple — no multipart handling required.
const imageString = z.string().min(1, 'empty image')

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

export const GradeResultSchema = z.object({
  house: z.enum(HOUSES),
  overall: gradeNumber,
  overallRange: gradeRange,
  confidence: z.enum(CONFIDENCE),
  photoQuality: z.enum(PHOTO_QUALITY),
  factors: z.array(FactorSchema).length(4),
  summary: z.string().min(1),
  // Populated by the guardrail when a rule adjusts the model's proposed overall,
  // or when surface is capped for flat-light-only input. Surfaced in the UI.
  notes: z.array(z.string()).default([]),
})
export type GradeResult = z.infer<typeof GradeResultSchema>

// The agent proposes everything EXCEPT the reconciled fields the guardrail owns.
// It returns this; mapping.ts then derives the final `overall`/`notes`.
export const AgentOutputSchema = GradeResultSchema.omit({ notes: true })
export type AgentOutput = z.infer<typeof AgentOutputSchema>
