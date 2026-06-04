import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json() as { image: string }
    if (!image) return NextResponse.json({ error: 'Missing image' }, { status: 400 })

    // Strip data-url prefix if present
    const base64 = image.replace(/^data:image\/\w+;base64,/, '')

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 64,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
          },
          {
            type: 'text',
            text: 'Does this image show a physical sports card or trading card (baseball, basketball, football, Pokémon, etc.) clearly visible and filling most of the frame? A wallet, phone, hand, table, or any other object is NOT a card. Only reply true if you can clearly see a card. Reply with JSON only: {"cardVisible":true} or {"cardVisible":false}',
          },
        ],
      }],
    })

    const text = (message.content[0] as { type: string; text: string }).text.trim()
    const match = text.match(/\{[\s\S]*"cardVisible"\s*:\s*(true|false)[\s\S]*\}/)
    const cardVisible = match ? match[1] === 'true' : false

    return NextResponse.json({ cardVisible })
  } catch (err) {
    console.error('quality-check error', err)
    return NextResponse.json({ error: 'Check failed' }, { status: 500 })
  }
}
