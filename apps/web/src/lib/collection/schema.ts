import { z } from 'zod'
import { SPORT_LABELS, GRADING_SERVICES } from '@/lib/watchlist/schema'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')

export const CollectionInputSchema = z
  .object({
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
    cert_number: z.string().max(50).optional(),
    price_paid: z.number().nonnegative().optional(),
    est_value: z.number().nonnegative().optional(),
    quantity: z.number().int().min(1).default(1),
    already_sold: z.boolean().default(false),
    purchase_date: isoDate.optional(),
    sale_price: z.number().nonnegative().optional(),
    sale_date: isoDate.optional(),
  })
  .refine((d) => !d.already_sold || (d.sale_price != null && d.sale_date != null), {
    message: 'sale_price and sale_date are required when already_sold is true',
    path: ['sale_price'],
  })
export type CollectionInput = z.infer<typeof CollectionInputSchema>

export function buildCollectionRow(userId: string, input: CollectionInput): Record<string, unknown> {
  return { user_id: userId, ...input }
}
