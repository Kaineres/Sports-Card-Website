import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { GradeRequestSchema } from '@/lib/grading/schema'
import { gradeCard } from '@/lib/grading/agent'
import { reconcileOverall } from '@/lib/grading/mapping'

// The Anthropic SDK needs the Node runtime, not edge.
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = GradeRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    // Optional Upstash rate limit — NO-OP when env unset. Degrades gracefully:
    // never 500 solely because rate limiting is unavailable.
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const ratelimit = new Ratelimit({
          redis: Redis.fromEnv(),
          limiter: Ratelimit.slidingWindow(10, '1 m'),
          prefix: 'grade',
        })
        const key = req.headers.get('x-forwarded-for') ?? 'anon'
        const { success } = await ratelimit.limit(key)
        if (!success) {
          return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
        }
      } catch (rlErr) {
        console.error('grade ratelimit unavailable', rlErr)
      }
    }

    const output = await gradeCard(parsed.data)
    const result = reconcileOverall(output, {
      hasRakingLight: parsed.data.lighting === 'raking',
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('grade error', err)
    return NextResponse.json({ error: 'Grading failed' }, { status: 500 })
  }
}
