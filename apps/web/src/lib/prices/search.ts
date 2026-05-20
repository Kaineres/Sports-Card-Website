import { createAdminClient } from '../supabase/server'
import { findCompletedItems } from '../ebay/client'
import { normalizeQuery, getCachedSearch, setCachedSearch } from '../cache/search-cache'
import type { EbayListing } from '../ebay/types'

export async function searchCardPrices(rawQuery: string): Promise<EbayListing[]> {
  const normalized = normalizeQuery(rawQuery)

  const cached = await getCachedSearch(normalized)
  if (cached) return cached

  let listings: EbayListing[]
  try {
    listings = await findCompletedItems(normalized, { daysBack: 90 })
  } catch (err) {
    console.error('eBay search error:', err)
    return []
  }

  if (listings.length > 0) {
    const db = createAdminClient()
    const { data: existing } = await db
      .from('sold_listings')
      .select('ebay_item_id')
      .in('ebay_item_id', listings.map((l) => l.itemId))

    const existingIds = new Set((existing ?? []).map((r: { ebay_item_id: string }) => r.ebay_item_id))
    const newListings = listings.filter((l) => !existingIds.has(l.itemId))

    if (newListings.length > 0) {
      await db.from('sold_listings').insert(
        newListings.map((l) => ({
          ebay_item_id: l.itemId,
          card_id: null,
          title: l.title,
          sale_price: l.salePrice,
          currency: l.currency,
          sale_date: l.saleDate,
          ebay_url: l.ebayUrl,
          source: 'search',
        }))
      )
    }
  }

  await setCachedSearch(normalized, listings)
  return listings
}
