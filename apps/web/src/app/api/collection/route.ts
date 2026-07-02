import { NextRequest, NextResponse } from 'next/server'
import { guardUserData } from '@/lib/api/user-data-guard'
import { CollectionInputSchema } from '@/lib/collection/schema'
import { listCollection, addCollectionItem } from '@/lib/collection/queries'

export const runtime = 'nodejs'

export async function GET(): Promise<NextResponse> {
  const gate = await guardUserData()
  if (typeof gate !== 'string') return gate
  const userId = gate

  try {
    const items = await listCollection(userId)
    return NextResponse.json({ items })
  } catch (err) {
    console.error('collection GET error', err)
    return NextResponse.json({ error: 'Failed to load collection' }, { status: 500 })
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

  const parsed = CollectionInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const item = await addCollectionItem(userId, parsed.data)
    return NextResponse.json({ item }, { status: 201 })
  } catch (err) {
    console.error('collection POST error', err)
    return NextResponse.json({ error: 'Failed to add card' }, { status: 500 })
  }
}
