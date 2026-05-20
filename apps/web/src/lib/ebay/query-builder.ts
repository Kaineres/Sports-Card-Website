import type { Card } from '../supabase/types'

type QueryInput = Pick<Card, 'player_name' | 'set_name' | 'grading_service' | 'grade' | 'year'>

export function buildEbayQuery(card: QueryInput): string {
  return `"${card.player_name}" "${card.set_name}" "${card.grading_service} ${card.grade}" ${card.year} rookie`
}
