import { NextRequest, NextResponse } from 'next/server'
import { guardUserData } from '@/lib/api/user-data-guard'
import { deleteCollectionItem } from '@/lib/collection/queries'

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
    const deleted = await deleteCollectionItem(userId, id)
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('collection DELETE error', err)
    return NextResponse.json({ error: 'Failed to remove' }, { status: 500 })
  }
}
