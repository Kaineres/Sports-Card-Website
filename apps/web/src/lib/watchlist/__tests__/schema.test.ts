import { describe, it, expect } from 'vitest'
import { WatchlistInputSchema, AlertPatchSchema, buildWatchlistRow } from '../schema'

const valid = {
  legacy_catalog_id: 21,
  player: 'Victor Wembanyama',
  card_name: '2023-24 Topps Chrome RC Auto',
  set_name: 'Topps Chrome',
  year: 2023,
  sport: 'NBA' as const,
  grading_service: 'PSA' as const,
  grade: 10,
}

describe('WatchlistInputSchema', () => {
  it('accepts a valid payload and defaults parallel + alert_enabled', () => {
    const parsed = WatchlistInputSchema.parse(valid)
    expect(parsed.parallel).toBe('Base')
    expect(parsed.alert_enabled).toBe(false)
  })
  it('rejects an empty player', () => {
    expect(WatchlistInputSchema.safeParse({ ...valid, player: '' }).success).toBe(false)
  })
  it('rejects an out-of-range grade', () => {
    expect(WatchlistInputSchema.safeParse({ ...valid, grade: 11 }).success).toBe(false)
  })
  it('rejects an unknown sport', () => {
    expect(WatchlistInputSchema.safeParse({ ...valid, sport: 'Cricket' }).success).toBe(false)
  })
  it('allows a Raw card (null service + grade)', () => {
    const parsed = WatchlistInputSchema.parse({ ...valid, grading_service: null, grade: null })
    expect(parsed.grade).toBeNull()
  })
})

describe('buildWatchlistRow', () => {
  it('attaches the user_id and preserves fields', () => {
    const row = buildWatchlistRow('user_123', WatchlistInputSchema.parse(valid))
    expect(row.user_id).toBe('user_123')
    expect(row.legacy_catalog_id).toBe(21)
    expect(row.player).toBe('Victor Wembanyama')
  })
})

describe('AlertPatchSchema', () => {
  it('requires a boolean alert_enabled', () => {
    expect(AlertPatchSchema.safeParse({ alert_enabled: true }).success).toBe(true)
    expect(AlertPatchSchema.safeParse({}).success).toBe(false)
  })
})
