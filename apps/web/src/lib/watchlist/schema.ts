import { z } from 'zod'
import type { SportLabel, GradingService } from '@/lib/supabase/types'

// Literal tuples (not just the types) so z.enum() has values to validate
// against; `satisfies` keeps them checked against the canonical DB row types.
export const SPORT_LABELS = ['NBA', 'NFL', 'MLB', 'NHL', 'Soccer', 'WNBA', 'UFC/MMA', 'Golf'] as const satisfies readonly SportLabel[]
export const GRADING_SERVICES = ['PSA', 'BGS', 'SGC', 'CGC'] as const satisfies readonly GradingService[]

export const WatchlistInputSchema = z.object({
  legacy_catalog_id: z.number().int().positive().optional(),
  catalog_card_id: z.string().uuid().nullable().optional(),
  player: z.string().min(1).max(200),
  card_name: z.string().min(1).max(300),
  set_name: z.string().max(200).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  card_number: z.string().max(50).optional(),
  parallel: z.string().max(120).default('Base'),
  grading_service: z.enum(GRADING_SERVICES).nullable().optional(),
  grade: z.number().min(1).max(10).nullable().optional(),
  sport: z.enum(SPORT_LABELS),
  alert_enabled: z.boolean().default(false),
})
export type WatchlistInput = z.infer<typeof WatchlistInputSchema>

export const AlertPatchSchema = z.object({
  alert_enabled: z.boolean(),
})
export type AlertPatch = z.infer<typeof AlertPatchSchema>

// Attaches the owning user to a validated payload. undefined optional keys are
// dropped by supabase-js's JSON serialization, so DB column defaults apply.
export function buildWatchlistRow(userId: string, input: WatchlistInput): Record<string, unknown> {
  return { user_id: userId, ...input }
}
