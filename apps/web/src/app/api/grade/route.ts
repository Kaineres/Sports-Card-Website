import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { GradeRequestSchema } from '@/lib/grading/schema'
import { gradeCard } from '@/lib/grading/agent'
import { reconcileOverall } from '@/lib/grading/mapping'

// The Anthropic SDK needs the Node runtime, not edge.
export const runtime = 'nodejs'

// Hard ceiling on the raw request body, checked before we ever parse or grade.
// The schema caps each image at 10MB of base64; two maxed-out images plus JSON
// overhead sits just under this. Anything larger is an obviously abusive payload
// and is rejected up front (413) so it never reaches the model.
const MAX_BODY_BYTES = 22_000_000
// Combined front+back string length cap (defense in depth behind imageString.max).
const MAX_COMBINED_IMAGE_CHARS = 20_000_000

// Mandatory, fail-closed rate limiter. Keyed on the Clerk userId (not the
// spoofable x-forwarded-for header). Mirrors src/lib/rate-limit/prices.ts:
// sliding window of 10 requests / minute. Constructed lazily so a build without
// Upstash env vars doesn't crash import — but a request with missing/broken
// backend fails CLOSED (see checkGradeRateLimit).
let _ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit {
  if (!_ratelimit) {
    _ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      prefix: 'ratelimit:grade',
    })
  }
  return _ratelimit
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Require Clerk auth — 401 before any work (same mechanism as prices/search).
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Mandatory, fail-closed rate limit keyed on the Clerk userId. If the
  //    backend is missing/unreachable we return 503 rather than continuing.
  let rl: { success: boolean; remaining: number; reset: number }
  try {
    const result = await getRatelimit().limit(userId)
    rl = { success: result.success, remaining: result.remaining, reset: result.reset }
  } catch (rlErr) {
    console.error('grade ratelimit unavailable', rlErr)
    return NextResponse.json(
      { error: 'Rate limiting unavailable, try again shortly' },
      { status: 503 },
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
      },
    )
  }

  // 3a. Reject obviously oversized bodies up front via Content-Length, before we
  //     buffer or parse anything.
  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: 'Request body too large' },
      { status: 413 },
    )
  }

  try {
    const body = await req.json()

    // 3b. Second size guard on the combined image payload (Content-Length can be
    //     absent or spoofed; this measures the actual decoded strings).
    if (body && typeof body === 'object') {
      const frontLen = typeof body.front === 'string' ? body.front.length : 0
      const backLen = typeof body.back === 'string' ? body.back.length : 0
      if (frontLen + backLen > MAX_COMBINED_IMAGE_CHARS) {
        return NextResponse.json(
          { error: 'Request body too large' },
          { status: 413 },
        )
      }
    }

    const parsed = GradeRequestSchema.safeParse(body)
    if (!parsed.success) {
      // 5. Do not leak the full zod error contract — terse generic summary only.
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 },
      )
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
