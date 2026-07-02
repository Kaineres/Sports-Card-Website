import { createAdminClient } from '@/lib/supabase/server'
import type { WatchlistItem } from '@/lib/supabase/types'
import { buildWatchlistRow, type WatchlistInput } from './schema'

export async function listWatchlist(userId: string): Promise<WatchlistItem[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('watchlist_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as WatchlistItem[]
}

// Idempotent: re-watching the same catalog card updates the snapshot in place
// (unique on user_id + legacy_catalog_id).
export async function addWatchItem(userId: string, input: WatchlistInput): Promise<WatchlistItem> {
  const db = createAdminClient()
  const row = buildWatchlistRow(userId, input)
  const { data, error } = await db
    .from('watchlist_items')
    .upsert(row, { onConflict: 'user_id,legacy_catalog_id' })
    .select()
    .single()
  if (error) throw error
  return data as WatchlistItem
}

export async function removeWatchItem(userId: string, id: string): Promise<boolean> {
  const db = createAdminClient()
  const { count, error } = await db
    .from('watchlist_items')
    .delete({ count: 'exact' })
    .eq('user_id', userId)
    .eq('id', id)
  if (error) throw error
  return (count ?? 0) > 0
}

export async function setAlert(
  userId: string,
  id: string,
  enabled: boolean
): Promise<WatchlistItem | null> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('watchlist_items')
    .update({ alert_enabled: enabled })
    .eq('user_id', userId)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null // no matching row
    throw error
  }
  return data as WatchlistItem
}
