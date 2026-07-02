import { describe, it, expect } from 'vitest'
import { CollectionInputSchema, buildCollectionRow } from '../schema'

const valid = {
  player: 'LeBron James',
  card_name: '2003-04 Topps Chrome Rookie',
  set_name: 'Topps Chrome',
  year: 2003,
  sport: 'NBA' as const,
  grading_service: 'PSA' as const,
  grade: 9,
  price_paid: 3200,
}

describe('CollectionInputSchema', () => {
  it('accepts a valid payload and defaults quantity + parallel + already_sold', () => {
    const parsed = CollectionInputSchema.parse(valid)
    expect(parsed.quantity).toBe(1)
    expect(parsed.parallel).toBe('Base')
    expect(parsed.already_sold).toBe(false)
  })
  it('rejects quantity below 1', () => {
    expect(CollectionInputSchema.safeParse({ ...valid, quantity: 0 }).success).toBe(false)
  })
  it('rejects a negative price_paid', () => {
    expect(CollectionInputSchema.safeParse({ ...valid, price_paid: -5 }).success).toBe(false)
  })
  it('requires sale_price and sale_date when already_sold is true', () => {
    expect(CollectionInputSchema.safeParse({ ...valid, already_sold: true }).success).toBe(false)
    expect(
      CollectionInputSchema.safeParse({
        ...valid,
        already_sold: true,
        sale_price: 4000,
        sale_date: '2026-06-01',
      }).success
    ).toBe(true)
  })
  it('rejects a malformed purchase_date', () => {
    expect(CollectionInputSchema.safeParse({ ...valid, purchase_date: '06/01/2026' }).success).toBe(false)
  })
})

describe('buildCollectionRow', () => {
  it('attaches the user_id', () => {
    const row = buildCollectionRow('user_abc', CollectionInputSchema.parse(valid))
    expect(row.user_id).toBe('user_abc')
    expect(row.player).toBe('LeBron James')
  })
})
