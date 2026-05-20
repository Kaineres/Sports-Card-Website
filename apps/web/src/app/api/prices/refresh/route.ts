import { NextRequest, NextResponse } from 'next/server'
import { runCatalogRefresh } from '@/lib/prices/catalog-refresh'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = req.headers.get('x-internal-secret')
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runCatalogRefresh()
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Catalog refresh failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
