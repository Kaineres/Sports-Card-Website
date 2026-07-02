import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let _ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit {
  if (!_ratelimit) {
    _ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      prefix: 'ratelimit:userdata',
    })
  }
  return _ratelimit
}

export async function checkUserDataRateLimit(
  userId: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const result = await getRatelimit().limit(userId)
  return { success: result.success, remaining: result.remaining, reset: result.reset }
}
