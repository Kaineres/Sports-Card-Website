import { createAdminClient } from '../supabase/server'
import { findCompletedItems } from '../ebay/client'
import { computeSnapshot } from './snapshots'
import type { Card } from '../supabase/types'

export interface RefreshResult {
  cards_processed: number
  listings_added: number
  errors: Array<{ card_id: string; error: string }>
}

export async function runCatalogRefresh(): Promise<RefreshResult> {
  const db = createAdminClient()
  const result: RefreshResult = { cards_processed: 0, listings_added: 0, errors: [] }

  const { data: cards, error: fetchError } = await db
    .from('cards')
    .select('*')
    .eq('is_active', true)

  if (fetchError) throw new Error(`Failed to fetch active cards: ${fetchError.message}`)

  for (const card of (cards as Card[])) {
    try {
      result.cards_processed++

      const listings = await findCompletedItems(card.ebay_search_query, { daysBack: 1 })
      if (listings.length === 0) continue

      const { data: existing } = await db
        .from('sold_listings')
        .select('ebay_item_id')
        .in('ebay_item_id', listings.map((l) => l.itemId))

      const existingIds = new Set((existing ?? []).map((r: { ebay_item_id: string }) => r.ebay_item_id))
      const newListings = listings.filter((l) => !existingIds.has(l.itemId))

      if (newListings.length > 0) {
        const { error: insertError } = await db.from('sold_listings').insert(
          newListings.map((l) => ({
            ebay_item_id: l.itemId,
            card_id: card.id,
            title: l.title,
            sale_price: l.salePrice,
            currency: l.currency,
            sale_date: l.saleDate,
            ebay_url: l.ebayUrl,
            source: 'catalog_refresh',
          }))
        )
        if (insertError) throw new Error(insertError.message)
        result.listings_added += newListings.length
      }

      const today = new Date().toISOString().split('T')[0]
      const { data: todayListings } = await db
        .from('sold_listings')
        .select('sale_price')
        .eq('card_id', card.id)
        .gte('sale_date', `${today}T00:00:00Z`)
        .lte('sale_date', `${today}T23:59:59Z`)

      const prices = (todayListings ?? []).map((r: { sale_price: number }) => r.sale_price)
      if (prices.length === 0) continue

      const snap = computeSnapshot(prices)
      await db.from('price_snapshots').upsert(
        {
          card_id: card.id,
          snapshot_date: today,
          median_price: snap.median,
          avg_price: snap.avg,
          low_price: snap.low,
          high_price: snap.high,
          sale_count: prices.length,
        },
        { onConflict: 'card_id,snapshot_date' }
      )
    } catch (err) {
      result.errors.push({
        card_id: card.id,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return result
}
