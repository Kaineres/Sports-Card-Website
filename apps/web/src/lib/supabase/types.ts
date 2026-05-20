export type Sport = 'football' | 'basketball' | 'baseball'
export type GradingService = 'PSA' | 'BGS' | 'SGC' | 'CGC'
export type ListingSource = 'catalog_refresh' | 'search'

export interface Card {
  id: string
  player_name: string
  sport: Sport
  year: number
  set_name: string
  card_number: string
  parallel: string
  grading_service: GradingService
  grade: number
  ebay_search_query: string
  is_active: boolean
  created_at: string
}

export interface SoldListing {
  id: string
  ebay_item_id: string
  card_id: string | null
  title: string
  sale_price: number
  currency: string
  sale_date: string
  ebay_url: string
  source: ListingSource
  created_at: string
}

export interface PriceSnapshot {
  id: string
  card_id: string
  snapshot_date: string
  median_price: number
  avg_price: number
  low_price: number
  high_price: number
  sale_count: number
  created_at: string
}
