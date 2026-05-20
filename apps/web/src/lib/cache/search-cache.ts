import { Redis } from '@upstash/redis'
import type { EbayListing } from '../ebay/types'

let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return _redis
}

const TTL_SECONDS = 3600 // 1 hour

export function normalizeQuery(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, ' ')
}

export async function getCachedSearch(normalizedQuery: string): Promise<EbayListing[] | null> {
  return getRedis().get<EbayListing[]>(`search:${normalizedQuery}`)
}

export async function setCachedSearch(
  normalizedQuery: string,
  listings: EbayListing[]
): Promise<void> {
  await getRedis().set(`search:${normalizedQuery}`, listings, { ex: TTL_SECONDS })
}
