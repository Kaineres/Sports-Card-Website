import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { checkUserDataRateLimit } from '@/lib/rate-limit/user-data'

// Runs the shared front-door checks for collection/watchlist endpoints.
// Returns the Clerk userId on success, or a NextResponse the caller should
// return immediately (401 unauth, 503 limiter down, 429 limited).
export async function guardUserData(): Promise<string | NextResponse> {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let rl: { success: boolean; remaining: number; reset: number }
  try {
    rl = await checkUserDataRateLimit(userId)
  } catch (err) {
    console.error('user-data ratelimit unavailable', err)
    return NextResponse.json(
      { error: 'Rate limiting unavailable, try again shortly' },
      { status: 503 }
    )
  }
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(rl.reset),
        },
      }
    )
  }
  return userId
}
