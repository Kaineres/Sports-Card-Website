import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { searchCardPrices } from '@/lib/prices/search'
import { checkSearchRateLimit } from '@/lib/rate-limit/prices'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success, remaining, reset } = await checkSearchRateLimit(userId)
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
        },
      }
    )
  }

  const q = req.nextUrl.searchParams.get('q')
  if (!q || q.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 })
  }

  const listings = await searchCardPrices(q)
  return NextResponse.json({ listings })
}
