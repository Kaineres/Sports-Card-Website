import { NextRequest, NextResponse } from 'next/server'
import { guardUserData } from '@/lib/api/user-data-guard'
import { WatchlistInputSchema } from '@/lib/watchlist/schema'
import { listWatchlist, addWatchItem } from '@/lib/watchlist/queries'

export const runtime = 'nodejs'

export async function GET(): Promise<NextResponse> {
  const gate = await guardUserData()
  if (typeof gate !== 'string') return gate
  const userId = gate

  try {
    const items = await listWatchlist(userId)
    return NextResponse.json({ items })
  } catch (err) {
    console.error('watchlist GET error', err)
    return NextResponse.json({ error: 'Failed to load watchlist' }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const gate = await guardUserData()
  if (typeof gate !== 'string') return gate
  const userId = gate

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = WatchlistInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const item = await addWatchItem(userId, parsed.data)
    return NextResponse.json({ item }, { status: 201 })
  } catch (err) {
    console.error('watchlist POST error', err)
    return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 })
  }
}
