import { NextRequest, NextResponse } from 'next/server'
import { guardUserData } from '@/lib/api/user-data-guard'
import { AlertPatchSchema } from '@/lib/watchlist/schema'
import { removeWatchItem, setAlert } from '@/lib/watchlist/queries'

export const runtime = 'nodejs'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const gate = await guardUserData()
  if (typeof gate !== 'string') return gate
  const userId = gate
  const { id } = await params

  try {
    const deleted = await removeWatchItem(userId, id)
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('watchlist DELETE error', err)
    return NextResponse.json({ error: 'Failed to remove' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const gate = await guardUserData()
  if (typeof gate !== 'string') return gate
  const userId = gate
  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = AlertPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const item = await setAlert(userId, id, parsed.data.alert_enabled)
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ item })
  } catch (err) {
    console.error('watchlist PATCH error', err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
