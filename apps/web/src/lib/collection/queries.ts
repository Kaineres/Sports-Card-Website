import { createAdminClient } from '@/lib/supabase/server'
import type { CollectionItem } from '@/lib/supabase/types'
import { buildCollectionRow, type CollectionInput } from './schema'

export async function listCollection(userId: string): Promise<CollectionItem[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('collection_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as CollectionItem[]
}

export async function addCollectionItem(
  userId: string,
  input: CollectionInput
): Promise<CollectionItem> {
  const db = createAdminClient()
  const row = buildCollectionRow(userId, input)
  const { data, error } = await db
    .from('collection_items')
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return data as CollectionItem
}

export async function deleteCollectionItem(userId: string, id: string): Promise<boolean> {
  const db = createAdminClient()
  const { count, error } = await db
    .from('collection_items')
    .delete({ count: 'exact' })
    .eq('user_id', userId)
    .eq('id', id)
  if (error) throw error
  return (count ?? 0) > 0
}
