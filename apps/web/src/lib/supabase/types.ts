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

export type SportLabel =
  | 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'Soccer' | 'WNBA' | 'UFC/MMA' | 'Golf'

export interface WatchlistItem {
  id: string
  user_id: string
  legacy_catalog_id: number | null
  catalog_card_id: string | null
  player: string
  card_name: string
  set_name: string | null
  year: number | null
  card_number: string | null
  parallel: string
  grading_service: GradingService | null
  grade: number | null
  sport: SportLabel
  alert_enabled: boolean
  created_at: string
}

export interface CollectionItem {
  id: string
  user_id: string
  catalog_card_id: string | null
  player: string
  card_name: string
  set_name: string | null
  year: number | null
  card_number: string | null
  parallel: string
  grading_service: GradingService | null
  grade: number | null
  sport: SportLabel
  cert_number: string | null
  price_paid: number | null
  est_value: number | null
  quantity: number
  already_sold: boolean
  purchase_date: string | null
  sale_price: number | null
  sale_date: string | null
  created_at: string
}
