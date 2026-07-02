# Collection & Watchlist Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist the Collection and Watchlist features to Supabase, scoped to the signed-in Clerk user, in a way that upgrades cleanly to real eBay pricing later.

**Architecture:** Each saved row carries a denormalized identity snapshot plus a nullable `catalog_card_id` link to `public.cards`. Access follows the existing recipe: Next.js API routes → Clerk `auth()` → Upstash fail-closed rate limit → Zod validation → service-role admin client with every query scoped to `user_id`. Business logic lives in thin, testable `lib/` helpers; pure functions are unit-tested (matching the repo convention — the repo does NOT mock the Supabase client).

**Tech Stack:** Next.js 16 (App Router), React, TypeScript, Supabase (`@supabase/supabase-js`), Clerk (`@clerk/nextjs`), Upstash (`@upstash/ratelimit`, `@upstash/redis`), Zod, Vitest.

**Design spec:** `apps/web/dev-docs/specs/2026-07-01-collection-watchlist-persistence-design.md`

## Global Constraints

- Scope is `apps/web` only.
- Never show fabricated market values. Collection shows the user's own numbers; Watchlist market columns show a "price pending" state until eBay data links in.
- Every DB read/write is scoped to the Clerk `userId`.
- Do not enable Supabase Auth; auth is Clerk. DB access uses the service-role admin client (`createAdminClient()`), which bypasses RLS — per-user scoping is enforced in application code.
- Rate limits fail **closed**: if the limiter backend is unreachable, return `503` (never continue).
- Ownership failures on delete/patch return `404` (not `403`), to avoid revealing another user's row exists.
- All commands run from `apps/web/`. Tests: `npm run test`. Types: `npm run typecheck`. Lint: `npm run lint`.
- `grade` is `numeric(3,1)` (e.g. `10`, `9.5`); `null` for Raw. `grading_service` is one of `PSA`/`BGS`/`SGC`/`CGC`; `null` for Raw.
- Sport is stored as the frontend league label (`NBA`/`NFL`/`MLB`/`NHL`/`Soccer`/`WNBA`/`UFC/MMA`/`Golf`).

---

### Task 1: Database migration — user tables

**Files:**
- Create: `supabase/migrations/20260701000001_user_tables.sql`

**Interfaces:**
- Produces: tables `public.watchlist_items` and `public.collection_items` with the columns referenced by every later task.

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/20260701000001_user_tables.sql`:

```sql
-- watchlist_items: one row per card a user is watching.
CREATE TABLE public.watchlist_items (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           text          NOT NULL,
  legacy_catalog_id int,
  catalog_card_id   uuid          REFERENCES public.cards(id) ON DELETE SET NULL,
  player            text          NOT NULL,
  card_name         text          NOT NULL,
  set_name          text,
  year              int,
  card_number       text,
  parallel          text          NOT NULL DEFAULT 'Base',
  grading_service   text          CHECK (grading_service IS NULL OR grading_service IN ('PSA','BGS','SGC','CGC')),
  grade             numeric(3,1),
  sport             text          NOT NULL,
  alert_enabled     boolean       NOT NULL DEFAULT false,
  created_at        timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (user_id, legacy_catalog_id)
);

CREATE INDEX idx_watchlist_items_user ON public.watchlist_items (user_id);

-- collection_items: one row per card a user owns. Duplicates allowed.
CREATE TABLE public.collection_items (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          text          NOT NULL,
  catalog_card_id  uuid          REFERENCES public.cards(id) ON DELETE SET NULL,
  player           text          NOT NULL,
  card_name        text          NOT NULL,
  set_name         text,
  year             int,
  card_number      text,
  parallel         text          NOT NULL DEFAULT 'Base',
  grading_service  text          CHECK (grading_service IS NULL OR grading_service IN ('PSA','BGS','SGC','CGC')),
  grade            numeric(3,1),
  sport            text          NOT NULL,
  cert_number      text,
  price_paid       numeric(10,2),
  est_value        numeric(10,2),
  quantity         int           NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  already_sold     boolean       NOT NULL DEFAULT false,
  purchase_date    date,
  sale_price       numeric(10,2),
  sale_date        date,
  created_at       timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_collection_items_user ON public.collection_items (user_id);

-- Defense in depth: block the anon/public key entirely. Only the service-role
-- backend (which bypasses RLS) can read/write these tables.
ALTER TABLE public.watchlist_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
```

- [ ] **Step 2: Apply the migration to the remote project**

Apply via the Supabase MCP `apply_migration` tool (name: `user_tables`, the SQL above), or `supabase db push` if the CLI is linked.
Expected: both tables created, no errors.

- [ ] **Step 3: Verify the tables exist**

Use the Supabase MCP `list_tables` tool (or `execute_sql` with `select table_name from information_schema.tables where table_schema='public'`).
Expected: `watchlist_items` and `collection_items` are listed.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260701000001_user_tables.sql
git commit -m "feat(db): add watchlist_items and collection_items tables"
```

---

### Task 2: Supabase TypeScript row types

**Files:**
- Modify: `apps/web/src/lib/supabase/types.ts`

**Interfaces:**
- Produces: `WatchlistItem`, `CollectionItem` interfaces; reuses existing `GradingService` type.

- [ ] **Step 1: Append the row types**

Add to the end of `apps/web/src/lib/supabase/types.ts`:

```typescript
export type SportLabel =
  | 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'Soccer' | 'WNBA' | 'UFC/MMA' | 'Golf'

export interface WatchlistItem {
  id: string
  user_id: string
  legacy_catalog_id: number | null
  catalog_card_id: string | null
  player: string
  card_name: string
  set_name: string | null
  year: number | null
  card_number: string | null
  parallel: string
  grading_service: GradingService | null
  grade: number | null
  sport: SportLabel
  alert_enabled: boolean
  created_at: string
}

export interface CollectionItem {
  id: string
  user_id: string
  catalog_card_id: string | null
  player: string
  card_name: string
  set_name: string | null
  year: number | null
  card_number: string | null
  parallel: string
  grading_service: GradingService | null
  grade: number | null
  sport: SportLabel
  cert_number: string | null
  price_paid: number | null
  est_value: number | null
  quantity: number
  already_sold: boolean
  purchase_date: string | null
  sale_price: number | null
  sale_date: string | null
  created_at: string
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/types.ts
git commit -m "feat(types): add WatchlistItem and CollectionItem row types"
```

---

### Task 3: Grade-label parsing utility

**Files:**
- Create: `apps/web/src/lib/cards/grade.ts`
- Test: `apps/web/src/lib/cards/__tests__/grade.test.ts`

**Interfaces:**
- Produces:
  - `parseGradeLabel(label: string): { grading_service: GradingService | null; grade: number | null }`
  - `formatGradeLabel(service: GradingService | null, grade: number | null): string`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/lib/cards/__tests__/grade.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { parseGradeLabel, formatGradeLabel } from '../grade'

describe('parseGradeLabel', () => {
  it('parses a PSA integer grade', () => {
    expect(parseGradeLabel('PSA 10')).toEqual({ grading_service: 'PSA', grade: 10 })
  })
  it('parses a BGS half grade', () => {
    expect(parseGradeLabel('BGS 9.5')).toEqual({ grading_service: 'BGS', grade: 9.5 })
  })
  it('treats "Raw" as ungraded', () => {
    expect(parseGradeLabel('Raw')).toEqual({ grading_service: null, grade: null })
  })
  it('treats an unknown service as ungraded', () => {
    expect(parseGradeLabel('FOO 9')).toEqual({ grading_service: null, grade: null })
  })
})

describe('formatGradeLabel', () => {
  it('formats a graded card', () => {
    expect(formatGradeLabel('PSA', 10)).toBe('PSA 10')
  })
  it('formats a half grade without a trailing zero', () => {
    expect(formatGradeLabel('BGS', 9.5)).toBe('BGS 9.5')
  })
  it('formats ungraded as "Raw"', () => {
    expect(formatGradeLabel(null, null)).toBe('Raw')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- grade`
Expected: FAIL (cannot find module `../grade`).

- [ ] **Step 3: Write the implementation**

Create `apps/web/src/lib/cards/grade.ts`:

```typescript
import type { GradingService } from '../supabase/types'

const SERVICES: readonly GradingService[] = ['PSA', 'BGS', 'SGC', 'CGC']

// Turns a UI grade label ("PSA 10", "BGS 9.5", "Raw") into the split
// service + numeric grade we store. Anything unrecognized is treated as Raw.
export function parseGradeLabel(
  label: string
): { grading_service: GradingService | null; grade: number | null } {
  const [rawService, rawGrade] = label.trim().split(/\s+/)
  const service = SERVICES.find((s) => s === rawService)
  const grade = Number(rawGrade)
  if (!service || !Number.isFinite(grade)) {
    return { grading_service: null, grade: null }
  }
  return { grading_service: service, grade }
}

// Inverse of parseGradeLabel, for display.
export function formatGradeLabel(
  service: GradingService | null,
  grade: number | null
): string {
  if (!service || grade == null) return 'Raw'
  return `${service} ${grade}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- grade`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/cards/grade.ts src/lib/cards/__tests__/grade.test.ts
git commit -m "feat(cards): add grade label parse/format util"
```

---

### Task 4: Watchlist Zod schema + row builder

**Files:**
- Create: `apps/web/src/lib/watchlist/schema.ts`
- Test: `apps/web/src/lib/watchlist/__tests__/schema.test.ts`

**Interfaces:**
- Consumes: `SportLabel`, `GradingService` from `@/lib/supabase/types`.
- Produces:
  - `WatchlistInputSchema` (Zod), `type WatchlistInput`
  - `AlertPatchSchema` (Zod), `type AlertPatch`
  - `buildWatchlistRow(userId: string, input: WatchlistInput): Record<string, unknown>`
  - `SPORT_LABELS`, `GRADING_SERVICES` constants

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/lib/watchlist/__tests__/schema.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { WatchlistInputSchema, AlertPatchSchema, buildWatchlistRow } from '../schema'

const valid = {
  legacy_catalog_id: 21,
  player: 'Victor Wembanyama',
  card_name: '2023-24 Topps Chrome RC Auto',
  set_name: 'Topps Chrome',
  year: 2023,
  sport: 'NBA' as const,
  grading_service: 'PSA' as const,
  grade: 10,
}

describe('WatchlistInputSchema', () => {
  it('accepts a valid payload and defaults parallel + alert_enabled', () => {
    const parsed = WatchlistInputSchema.parse(valid)
    expect(parsed.parallel).toBe('Base')
    expect(parsed.alert_enabled).toBe(false)
  })
  it('rejects an empty player', () => {
    expect(WatchlistInputSchema.safeParse({ ...valid, player: '' }).success).toBe(false)
  })
  it('rejects an out-of-range grade', () => {
    expect(WatchlistInputSchema.safeParse({ ...valid, grade: 11 }).success).toBe(false)
  })
  it('rejects an unknown sport', () => {
    expect(WatchlistInputSchema.safeParse({ ...valid, sport: 'Cricket' }).success).toBe(false)
  })
  it('allows a Raw card (null service + grade)', () => {
    const parsed = WatchlistInputSchema.parse({ ...valid, grading_service: null, grade: null })
    expect(parsed.grade).toBeNull()
  })
})

describe('buildWatchlistRow', () => {
  it('attaches the user_id and preserves fields', () => {
    const row = buildWatchlistRow('user_123', WatchlistInputSchema.parse(valid))
    expect(row.user_id).toBe('user_123')
    expect(row.legacy_catalog_id).toBe(21)
    expect(row.player).toBe('Victor Wembanyama')
  })
})

describe('AlertPatchSchema', () => {
  it('requires a boolean alert_enabled', () => {
    expect(AlertPatchSchema.safeParse({ alert_enabled: true }).success).toBe(true)
    expect(AlertPatchSchema.safeParse({}).success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- watchlist/__tests__/schema`
Expected: FAIL (cannot find module `../schema`).

- [ ] **Step 3: Write the implementation**

Create `apps/web/src/lib/watchlist/schema.ts`:

```typescript
import { z } from 'zod'

export const SPORT_LABELS = ['NBA', 'NFL', 'MLB', 'NHL', 'Soccer', 'WNBA', 'UFC/MMA', 'Golf'] as const
export const GRADING_SERVICES = ['PSA', 'BGS', 'SGC', 'CGC'] as const

export const WatchlistInputSchema = z.object({
  legacy_catalog_id: z.number().int().positive().optional(),
  catalog_card_id: z.string().uuid().nullable().optional(),
  player: z.string().min(1).max(200),
  card_name: z.string().min(1).max(300),
  set_name: z.string().max(200).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  card_number: z.string().max(50).optional(),
  parallel: z.string().max(120).default('Base'),
  grading_service: z.enum(GRADING_SERVICES).nullable().optional(),
  grade: z.number().min(1).max(10).nullable().optional(),
  sport: z.enum(SPORT_LABELS),
  alert_enabled: z.boolean().default(false),
})
export type WatchlistInput = z.infer<typeof WatchlistInputSchema>

export const AlertPatchSchema = z.object({
  alert_enabled: z.boolean(),
})
export type AlertPatch = z.infer<typeof AlertPatchSchema>

// Attaches the owning user to a validated payload. undefined optional keys are
// dropped by supabase-js's JSON serialization, so DB column defaults apply.
export function buildWatchlistRow(userId: string, input: WatchlistInput): Record<string, unknown> {
  return { user_id: userId, ...input }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- watchlist/__tests__/schema`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/watchlist/schema.ts src/lib/watchlist/__tests__/schema.test.ts
git commit -m "feat(watchlist): add input schema and row builder"
```

---

### Task 5: Collection Zod schema + row builder

**Files:**
- Create: `apps/web/src/lib/collection/schema.ts`
- Test: `apps/web/src/lib/collection/__tests__/schema.test.ts`

**Interfaces:**
- Consumes: `SPORT_LABELS`, `GRADING_SERVICES` from `@/lib/watchlist/schema`.
- Produces:
  - `CollectionInputSchema` (Zod), `type CollectionInput`
  - `buildCollectionRow(userId: string, input: CollectionInput): Record<string, unknown>`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/lib/collection/__tests__/schema.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { CollectionInputSchema, buildCollectionRow } from '../schema'

const valid = {
  player: 'LeBron James',
  card_name: '2003-04 Topps Chrome Rookie',
  set_name: 'Topps Chrome',
  year: 2003,
  sport: 'NBA' as const,
  grading_service: 'PSA' as const,
  grade: 9,
  price_paid: 3200,
}

describe('CollectionInputSchema', () => {
  it('accepts a valid payload and defaults quantity + parallel + already_sold', () => {
    const parsed = CollectionInputSchema.parse(valid)
    expect(parsed.quantity).toBe(1)
    expect(parsed.parallel).toBe('Base')
    expect(parsed.already_sold).toBe(false)
  })
  it('rejects quantity below 1', () => {
    expect(CollectionInputSchema.safeParse({ ...valid, quantity: 0 }).success).toBe(false)
  })
  it('rejects a negative price_paid', () => {
    expect(CollectionInputSchema.safeParse({ ...valid, price_paid: -5 }).success).toBe(false)
  })
  it('requires sale_price and sale_date when already_sold is true', () => {
    expect(CollectionInputSchema.safeParse({ ...valid, already_sold: true }).success).toBe(false)
    expect(
      CollectionInputSchema.safeParse({
        ...valid,
        already_sold: true,
        sale_price: 4000,
        sale_date: '2026-06-01',
      }).success
    ).toBe(true)
  })
  it('rejects a malformed purchase_date', () => {
    expect(CollectionInputSchema.safeParse({ ...valid, purchase_date: '06/01/2026' }).success).toBe(false)
  })
})

describe('buildCollectionRow', () => {
  it('attaches the user_id', () => {
    const row = buildCollectionRow('user_abc', CollectionInputSchema.parse(valid))
    expect(row.user_id).toBe('user_abc')
    expect(row.player).toBe('LeBron James')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- collection/__tests__/schema`
Expected: FAIL (cannot find module `../schema`).

- [ ] **Step 3: Write the implementation**

Create `apps/web/src/lib/collection/schema.ts`:

```typescript
import { z } from 'zod'
import { SPORT_LABELS, GRADING_SERVICES } from '@/lib/watchlist/schema'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')

export const CollectionInputSchema = z
  .object({
    catalog_card_id: z.string().uuid().nullable().optional(),
    player: z.string().min(1).max(200),
    card_name: z.string().min(1).max(300),
    set_name: z.string().max(200).optional(),
    year: z.number().int().min(1900).max(2100).optional(),
    card_number: z.string().max(50).optional(),
    parallel: z.string().max(120).default('Base'),
    grading_service: z.enum(GRADING_SERVICES).nullable().optional(),
    grade: z.number().min(1).max(10).nullable().optional(),
    sport: z.enum(SPORT_LABELS),
    cert_number: z.string().max(50).optional(),
    price_paid: z.number().nonnegative().optional(),
    est_value: z.number().nonnegative().optional(),
    quantity: z.number().int().min(1).default(1),
    already_sold: z.boolean().default(false),
    purchase_date: isoDate.optional(),
    sale_price: z.number().nonnegative().optional(),
    sale_date: isoDate.optional(),
  })
  .refine((d) => !d.already_sold || (d.sale_price != null && d.sale_date != null), {
    message: 'sale_price and sale_date are required when already_sold is true',
    path: ['sale_price'],
  })
export type CollectionInput = z.infer<typeof CollectionInputSchema>

export function buildCollectionRow(userId: string, input: CollectionInput): Record<string, unknown> {
  return { user_id: userId, ...input }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- collection/__tests__/schema`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/collection/schema.ts src/lib/collection/__tests__/schema.test.ts
git commit -m "feat(collection): add input schema and row builder"
```

---

### Task 6: Watchlist queries, rate-limit helper, API guard, and routes

**Files:**
- Create: `apps/web/src/lib/rate-limit/user-data.ts`
- Create: `apps/web/src/lib/api/user-data-guard.ts`
- Create: `apps/web/src/lib/watchlist/queries.ts`
- Create: `apps/web/src/app/api/watchlist/route.ts`
- Create: `apps/web/src/app/api/watchlist/[id]/route.ts`

**Interfaces:**
- Consumes: `WatchlistInput`, `buildWatchlistRow`, `WatchlistInputSchema`, `AlertPatchSchema` (Task 4); `createAdminClient` from `@/lib/supabase/server`; `WatchlistItem` (Task 2).
- Produces:
  - `checkUserDataRateLimit(userId: string): Promise<{ success: boolean; remaining: number; reset: number }>`
  - `guardUserData(): Promise<string | NextResponse>` (returns `userId` on success, else an early `NextResponse`)
  - `listWatchlist(userId)`, `addWatchItem(userId, input)`, `removeWatchItem(userId, id)`, `setAlert(userId, id, enabled)`

No automated tests for this task — it is thin glue over Supabase/Clerk/Upstash, which the repo verifies via typecheck + manual/integration (consistent with `lib/prices/search.ts`, which has no DB-mock test). The pure logic it depends on is already covered by Tasks 3–5.

- [ ] **Step 1: Write the rate-limit helper**

Create `apps/web/src/lib/rate-limit/user-data.ts`:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let _ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit {
  if (!_ratelimit) {
    _ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      prefix: 'ratelimit:userdata',
    })
  }
  return _ratelimit
}

export async function checkUserDataRateLimit(
  userId: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const result = await getRatelimit().limit(userId)
  return { success: result.success, remaining: result.remaining, reset: result.reset }
}
```

- [ ] **Step 2: Write the API guard**

Create `apps/web/src/lib/api/user-data-guard.ts`:

```typescript
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
```

- [ ] **Step 3: Write the watchlist queries**

Create `apps/web/src/lib/watchlist/queries.ts`:

```typescript
import { createAdminClient } from '@/lib/supabase/server'
import type { WatchlistItem } from '@/lib/supabase/types'
import { buildWatchlistRow, type WatchlistInput } from './schema'

export async function listWatchlist(userId: string): Promise<WatchlistItem[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('watchlist_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as WatchlistItem[]
}

// Idempotent: re-watching the same catalog card updates the snapshot in place
// (unique on user_id + legacy_catalog_id).
export async function addWatchItem(userId: string, input: WatchlistInput): Promise<WatchlistItem> {
  const db = createAdminClient()
  const row = buildWatchlistRow(userId, input)
  const { data, error } = await db
    .from('watchlist_items')
    .upsert(row, { onConflict: 'user_id,legacy_catalog_id' })
    .select()
    .single()
  if (error) throw error
  return data as WatchlistItem
}

export async function removeWatchItem(userId: string, id: string): Promise<boolean> {
  const db = createAdminClient()
  const { count, error } = await db
    .from('watchlist_items')
    .delete({ count: 'exact' })
    .eq('user_id', userId)
    .eq('id', id)
  if (error) throw error
  return (count ?? 0) > 0
}

export async function setAlert(
  userId: string,
  id: string,
  enabled: boolean
): Promise<WatchlistItem | null> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('watchlist_items')
    .update({ alert_enabled: enabled })
    .eq('user_id', userId)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null // no matching row
    throw error
  }
  return data as WatchlistItem
}
```

- [ ] **Step 4: Write the collection-style list/create route**

Create `apps/web/src/app/api/watchlist/route.ts`:

```typescript
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
```

- [ ] **Step 5: Write the per-item route**

Create `apps/web/src/app/api/watchlist/[id]/route.ts`:

```typescript
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
```

- [ ] **Step 6: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/rate-limit/user-data.ts src/lib/api/user-data-guard.ts src/lib/watchlist/queries.ts src/app/api/watchlist
git commit -m "feat(watchlist): add queries, rate-limit guard, and API routes"
```

---

### Task 7: Collection queries and API routes

**Files:**
- Create: `apps/web/src/lib/collection/queries.ts`
- Create: `apps/web/src/app/api/collection/route.ts`
- Create: `apps/web/src/app/api/collection/[id]/route.ts`

**Interfaces:**
- Consumes: `CollectionInput`, `buildCollectionRow`, `CollectionInputSchema` (Task 5); `guardUserData` (Task 6); `CollectionItem` (Task 2).
- Produces: `listCollection(userId)`, `addCollectionItem(userId, input)`, `deleteCollectionItem(userId, id)`.

No automated tests (same rationale as Task 6; pure logic covered by Task 5).

- [ ] **Step 1: Write the collection queries**

Create `apps/web/src/lib/collection/queries.ts`:

```typescript
import { createAdminClient } from '@/lib/supabase/server'
import type { CollectionItem } from '@/lib/supabase/types'
import { buildCollectionRow, type CollectionInput } from './schema'

export async function listCollection(userId: string): Promise<CollectionItem[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('collection_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as CollectionItem[]
}

export async function addCollectionItem(
  userId: string,
  input: CollectionInput
): Promise<CollectionItem> {
  const db = createAdminClient()
  const row = buildCollectionRow(userId, input)
  const { data, error } = await db
    .from('collection_items')
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return data as CollectionItem
}

export async function deleteCollectionItem(userId: string, id: string): Promise<boolean> {
  const db = createAdminClient()
  const { count, error } = await db
    .from('collection_items')
    .delete({ count: 'exact' })
    .eq('user_id', userId)
    .eq('id', id)
  if (error) throw error
  return (count ?? 0) > 0
}
```

- [ ] **Step 2: Write the list/create route**

Create `apps/web/src/app/api/collection/route.ts`:

```typescript
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
```

- [ ] **Step 3: Write the per-item route**

Create `apps/web/src/app/api/collection/[id]/route.ts`:

```typescript
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
```

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/collection/queries.ts src/app/api/collection
git commit -m "feat(collection): add queries and API routes"
```

---

### Task 8: Rewire the watchlist context to be account-backed

**Files:**
- Modify: `apps/web/src/lib/watchlist-context.tsx` (full rewrite)

**Interfaces:**
- Consumes: `GET/POST /api/watchlist`, `DELETE /api/watchlist/[id]`; `BROWSE_CATALOG` from `@/lib/catalog`; `parseGradeLabel` (Task 3); Clerk `useAuth`, `useClerk`.
- Produces: unchanged public surface — `useWatchlist()` returns `{ watchedIds: Set<number>; toggle: (id: number) => void; isWatched: (id: number) => boolean; loading: boolean }`. Existing callers in `browse/page.tsx` and `watchlist/page.tsx` (`toggle(id)`, `isWatched(id)`, `watchedIds`) keep working unchanged.

- [ ] **Step 1: Rewrite the context**

Replace the entire contents of `apps/web/src/lib/watchlist-context.tsx`:

```tsx
'use client'

import {
  createContext, useContext, useState, useEffect, useCallback, useMemo, useRef,
} from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'
import { BROWSE_CATALOG } from './catalog'
import { parseGradeLabel } from './cards/grade'

interface WatchRow { id: string; legacy_catalog_id: number | null }

interface WatchlistCtx {
  watchedIds: Set<number>
  toggle: (id: number) => void
  isWatched: (id: number) => boolean
  loading: boolean
}

const WatchlistContext = createContext<WatchlistCtx>({
  watchedIds: new Set(),
  toggle: () => {},
  isWatched: () => false,
  loading: false,
})

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { redirectToSignIn } = useClerk()
  const [rows, setRows] = useState<WatchRow[]>([])
  const [loading, setLoading] = useState(false)

  // legacy_catalog_id -> row id, for optimistic removal without a refetch.
  const rowByLegacy = useRef<Map<number, string>>(new Map())
  useEffect(() => {
    const m = new Map<number, string>()
    for (const r of rows) if (r.legacy_catalog_id != null) m.set(r.legacy_catalog_id, r.id)
    rowByLegacy.current = m
  }, [rows])

  const watchedIds = useMemo(
    () => new Set(rows.map((r) => r.legacy_catalog_id).filter((x): x is number => x != null)),
    [rows]
  )

  // Load from the server once Clerk is ready and the user is signed in.
  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) { setRows([]); return }
    let active = true
    setLoading(true)
    fetch('/api/watchlist')
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => {
        if (!active) return
        setRows((d.items ?? []).map((i: { id: string; legacy_catalog_id: number | null }) => ({
          id: i.id, legacy_catalog_id: i.legacy_catalog_id,
        })))
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [isLoaded, isSignedIn])

  const isWatched = useCallback((id: number) => watchedIds.has(id), [watchedIds])

  const toggle = useCallback((id: number) => {
    if (!isSignedIn) { redirectToSignIn(); return }

    const existingRowId = rowByLegacy.current.get(id)
    if (existingRowId) {
      // Optimistic remove, revert on failure.
      setRows((prev) => prev.filter((r) => r.id !== existingRowId))
      fetch(`/api/watchlist/${existingRowId}`, { method: 'DELETE' })
        .then((r) => { if (!r.ok) throw new Error('delete failed') })
        .catch(() => {
          setRows((prev) =>
            prev.some((r) => r.id === existingRowId)
              ? prev
              : [...prev, { id: existingRowId, legacy_catalog_id: id }]
          )
        })
      return
    }

    const card = BROWSE_CATALOG.find((c) => c.id === id)
    if (!card) return
    const tempId = `temp-${id}`
    // Optimistic add.
    setRows((prev) => [...prev, { id: tempId, legacy_catalog_id: id }])

    const { grading_service, grade } = parseGradeLabel(card.grade)
    const payload = {
      legacy_catalog_id: id,
      player: card.player,
      card_name: card.cardName,
      set_name: card.setName,
      year: card.year,
      sport: card.sport,
      grading_service,
      grade,
    }
    fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('add failed'))))
      .then((d) => {
        setRows((prev) => prev.map((r) => (r.id === tempId ? { id: d.item.id, legacy_catalog_id: id } : r)))
      })
      .catch(() => {
        setRows((prev) => prev.filter((r) => r.id !== tempId))
      })
  }, [isSignedIn, redirectToSignIn])

  return (
    <WatchlistContext.Provider value={{ watchedIds, toggle, isWatched, loading }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  return useContext(WatchlistContext)
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 3: Manual verification**

Run `npm run dev`. Signed in: on `/browse`, click a Watch star → it fills and stays filled after refresh (persisted). Click again → it clears and stays cleared after refresh. Signed out: clicking a star redirects to Clerk sign-in. Existing `MOCK_WATCHLIST` cards (ids 101–105) on `/watchlist` no longer auto-appear (they were localStorage seeds; now the list is server-driven).

- [ ] **Step 4: Commit**

```bash
git add src/lib/watchlist-context.tsx
git commit -m "feat(watchlist): back the watchlist context with Supabase via API"
```

---

### Task 9: Wire the Collection page to the API

**Files:**
- Modify: `apps/web/src/app/collection/page.tsx`

**Interfaces:**
- Consumes: `GET/POST /api/collection`, `DELETE /api/collection/[id]`; `CollectionItem` (Task 2); `parseGradeLabel`, `formatGradeLabel` (Task 3); Clerk `useAuth`, `useClerk`.

- [ ] **Step 1: Replace mock state with a server load**

In `apps/web/src/app/collection/page.tsx`, update the existing React import (line 3, currently `import { useState, useMemo, useRef } from 'react'`) to also pull in `useEffect` and `useCallback`:

```tsx
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
```

Then add the new module imports below it:

```tsx
import { useAuth, useClerk } from '@clerk/nextjs'
import type { CollectionItem } from '@/lib/supabase/types'
import { parseGradeLabel, formatGradeLabel } from '@/lib/cards/grade'
```

Delete the `MOCK` array (the `const MOCK: CollCard[] = [ ... ]` block). In `CollectionPage()`, replace `const [cards] = useState<CollCard[]>(MOCK)` with server-backed state:

```tsx
const { isLoaded, isSignedIn } = useAuth()
const [items, setItems] = useState<CollectionItem[]>([])
const [loadError, setLoadError] = useState(false)

const reload = useCallback(() => {
  fetch('/api/collection')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
    .then((d) => { setItems(d.items ?? []); setLoadError(false) })
    .catch(() => setLoadError(true))
}, [])

useEffect(() => {
  if (!isLoaded || !isSignedIn) return
  reload()
}, [isLoaded, isSignedIn, reload])
```

(Add `useCallback` to the existing `react` import.) Map each `CollectionItem` to the shape the existing table renders (`CollCard`), computing display fields from the user's own numbers — **no fabricated market value**:

```tsx
const cards: CollCard[] = useMemo(() => items.map((it) => {
  const purchase = it.price_paid ?? 0
  const value = it.est_value ?? purchase           // user's own estimate; falls back to cost
  return {
    id: it.id, // uuid string — used as React key and delete target
    player: it.player,
    cardName: it.card_name,
    setName: it.set_name ?? '',
    year: it.year ?? 0,
    grade: formatGradeLabel(it.grading_service, it.grade),
    sport: it.sport,
    qty: it.quantity,
    purchasePrice: purchase,
    currentValue: value,
    change: value - purchase,
    percentChange: purchase > 0 ? ((value - purchase) / purchase) * 100 : 0,
  }
}), [items])
```

Note: `CollCard.id` is typed `number`; it is used only as a React key and for the delete handler. Change the `CollCard` interface `id` field to `string` (so the mapping above type-checks with no cast) and update any numeric-id usages (search the file for `card.id`) to treat it as a string key. Wire the row's delete/remove control (if present) — or add one — to:

```tsx
async function handleDelete(id: string) {
  const prev = items
  setItems((cur) => cur.filter((c) => c.id !== id))   // optimistic
  const res = await fetch(`/api/collection/${id}`, { method: 'DELETE' })
  if (!res.ok) setItems(prev)                          // revert
}
```

- [ ] **Step 2: Gate the page behind sign-in**

Near the top of the returned JSX in `CollectionPage()`, short-circuit for signed-out users:

```tsx
const { redirectToSignIn } = useClerk()
// ...inside the component body, before the main return:
if (isLoaded && !isSignedIn) {
  return (
    <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--text)' }}>
        Sign in to view your collection
      </p>
      <button
        onClick={() => redirectToSignIn()}
        style={{
          marginTop: '1rem', padding: '10px 24px',
          background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
          border: 'none', borderRadius: '8px', color: '#0d1117',
          fontFamily: 'var(--font-display)', fontWeight: 700, cursor: 'pointer',
        }}
      >
        Sign In
      </button>
    </div>
  )
}
```

Add an empty state where the table renders when `!loadError && items.length === 0`: a short "No cards yet — add your first card" message. Add a retry affordance when `loadError` is true (a "Couldn't load — Retry" button calling `reload()`).

- [ ] **Step 3: Add the new modal fields and submit handler**

In `AddModal`, add state for the new fields (below the existing `useState` lines):

```tsx
const [cardNumber, setCardNumber] = useState('')
const [parallel, setParallel]     = useState('Base')
const [certNumber, setCertNumber] = useState('')
const [purchaseDate, setPurchaseDate] = useState('')
const [saleprice, setSalePrice]   = useState('')
const [saleDate, setSaleDate]     = useState('')
const [submitting, setSubmitting] = useState(false)
const [error, setError]           = useState('')
```

Change `AddModalProps` to receive an `onadded` callback: `interface AddModalProps { onClose: () => void; onAdded: () => void }`. Add input fields for **Card Number**, **Parallel**, and **Cert Number** in the Card Details grid (mirror the existing `inputStyle` inputs), a **Purchase Date** input (`type="date"`, value `purchaseDate`), and — shown only when `alreadySold` is checked — **Sale Price** (`type="number"`) and **Sale Date** (`type="date"`) inputs. Replace the "Add to Collection" button's (currently handler-less) markup with a submit that posts to the API:

```tsx
async function handleSubmit() {
  setError('')
  const { grading_service, grade: gradeNum } = parseGradeLabel(grade)
  const payload: Record<string, unknown> = {
    player, card_name: cardName, set_name: setName || undefined,
    year: year ? Number(year) : undefined,
    card_number: cardNumber || undefined,
    parallel: parallel || 'Base',
    grading_service, grade: gradeNum,
    sport,
    cert_number: certNumber || undefined,
    price_paid: pricePaid ? Number(pricePaid) : undefined,
    est_value: estValue ? Number(estValue) : undefined,
    quantity: qty ? Number(qty) : 1,
    already_sold: alreadySold,
    purchase_date: purchaseDate || undefined,
    sale_price: alreadySold && saleprice ? Number(saleprice) : undefined,
    sale_date: alreadySold && saleDate ? saleDate : undefined,
  }
  if (!player.trim() || !cardName.trim()) { setError('Player and card name are required'); return }
  setSubmitting(true)
  try {
    const res = await fetch('/api/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('save failed')
    onAdded()
    onClose()
  } catch {
    setError('Could not save. Check the fields and try again.')
  } finally {
    setSubmitting(false)
  }
}
```

Wire the button: `onClick={handleSubmit}`, `disabled={submitting}`, text `{submitting ? 'Saving…' : 'Add to Collection'}`, and render `{error && <p style={{ color: '#e05c5c', ... }}>{error}</p>}` above the footer. Update the render site: `{showModal && <AddModal onClose={() => setShowModal(false)} onAdded={reload} />}`.

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS. (Resolve any `card.id` numeric-usage type errors surfaced by the `id: string` change.)

- [ ] **Step 5: Manual verification**

`npm run dev`, signed in, on `/collection`: the list is empty initially; open the modal, fill player/card/grade + price paid, Add → the card appears in the table and survives a refresh. Mark "already sold" → sale price/date inputs appear and are required. Delete a card → it disappears and stays gone after refresh. Signed out → the sign-in gate shows.

- [ ] **Step 6: Commit**

```bash
git add src/app/collection/page.tsx
git commit -m "feat(collection): persist collection via API; add identity + P&L fields"
```

---

### Task 10: Wire the Watchlist page to the API

**Files:**
- Modify: `apps/web/src/app/watchlist/page.tsx`

**Interfaces:**
- Consumes: `GET /api/watchlist`, `PATCH /api/watchlist/[id]`; `WatchlistItem` (Task 2); `formatGradeLabel` (Task 3); `useWatchlist` (Task 8).

- [ ] **Step 1: Load the watchlist from the server**

In `apps/web/src/app/watchlist/page.tsx`, add imports:

```tsx
import { useAuth, useClerk } from '@clerk/nextjs'
import type { WatchlistItem } from '@/lib/supabase/types'
import { formatGradeLabel } from '@/lib/cards/grade'
```

Delete the `MOCK_WATCHLIST` array and everything derived from it (`mockWatchlistIds`, the `browsedWatched` split, and the `MOCK_WATCHLIST`-seeded `alerts`/`ranges` initializers). Replace with server state fetched on mount:

```tsx
const { isLoaded, isSignedIn } = useAuth()
const [items, setItems] = useState<WatchlistItem[]>([])
const [loadError, setLoadError] = useState(false)

useEffect(() => {
  if (!isLoaded || !isSignedIn) return
  fetch('/api/watchlist')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
    .then((d) => { setItems(d.items ?? []); setLoadError(false) })
    .catch(() => setLoadError(true))
}, [isLoaded, isSignedIn])
```

- [ ] **Step 2: Render from `items` with "price pending" (no fabricated values)**

Rebuild the `displayed` list from `items` (apply the existing player/card/set/year/grade filters against these fields), mapping each `WatchlistItem` to the row shape the table renders. For any market-value / %-change / sparkline cell, render a **"—"** or **"Price pending"** placeholder instead of a number, because there is no eBay data yet:

```tsx
const displayed = useMemo(() => {
  let list = items.map((it) => ({
    id: it.id,
    player: it.player,
    cardName: it.card_name,
    setName: it.set_name ?? '',
    year: it.year ?? 0,
    grade: formatGradeLabel(it.grading_service, it.grade),
    sport: it.sport,
    alertEnabled: it.alert_enabled,
    // No fabricated market data until eBay lands:
    currentValue: null as number | null,
    percentChange: null as number | null,
    priceHistory: [] as number[],
  }))
  const q = playerFilter.trim().toLowerCase()
  if (q) list = list.filter((c) => c.player.toLowerCase().includes(q))
  // ...apply the remaining existing filters (cardFilter, setFilter, yearFilter, gradeFilter) the same way...
  return list
}, [items, playerFilter, cardFilter, setFilter, yearFilter, gradeFilter, sort])
```

In the row markup, wherever `currentValue` / `percentChange` were shown, render a placeholder while the value is null (it always is pre-eBay): `{card.currentValue == null ? <span style={{ color: 'var(--text3)' }}>Price pending</span> : <span>${'{'}card.currentValue{'}'}</span>}`. Keep the existing money/number formatting only inside the non-null branch (no new helper needed). Where the sparkline chart was drawn, render a muted "Awaiting price data" placeholder when `priceHistory.length === 0`. Remove the sort options that depend on value/change (or leave them as no-ops that don't reorder while all values are null).

- [ ] **Step 3: Persist the alert toggle**

Replace the local `toggleAlert` with an API-backed, optimistic version keyed on the row id (string):

```tsx
async function toggleAlert(id: string, next: boolean) {
  setItems((prev) => prev.map((it) => (it.id === id ? { ...it, alert_enabled: next } : it)))
  const res = await fetch(`/api/watchlist/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alert_enabled: next }),
  })
  if (!res.ok) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, alert_enabled: !next } : it)))
  }
}
```

Wire the bell control: `onClick={() => toggleAlert(card.id, !card.alertEnabled)}`. Add a sign-in gate (reuse the pattern from Task 9 Step 2) and an empty state ("Nothing on your watchlist yet — add cards from Browse"). Add a retry button when `loadError` is true. Keep using `useWatchlist().toggle(...)` for any unwatch control on this page (the star), which already round-trips through Task 8.

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS. (Resolve type errors from the `id: number → string` and `currentValue: number → number | null` changes.)

- [ ] **Step 5: Manual verification**

`npm run dev`, signed in: watch a couple of cards on `/browse`, then open `/watchlist` — those cards appear, with market columns reading "Price pending" (no fake numbers). Toggle a bell → it flips and survives refresh. Unwatch via the star → the card leaves the list and stays gone after refresh. Signed out → the sign-in gate shows.

- [ ] **Step 6: Full check + commit**

```bash
npm run test && npm run typecheck && npm run lint
git add src/app/watchlist/page.tsx
git commit -m "feat(watchlist): load from API, persist alerts, show price-pending state"
```

---

## Verification summary

- **Automated tests** (`npm run test`): grade util (Task 3), watchlist schema/builder (Task 4), collection schema/builder (Task 5). These cover the logic where bugs live (defaults, the `already_sold` refinement, grade range, sport enum, snapshot mapping, `user_id` attachment).
- **Typecheck/lint**: every task ends green.
- **Manual/integration**: the Supabase round-trip (queries + routes) is verified by clicking through Browse/Collection/Watchlist while signed in and confirming persistence across refresh — consistent with the repo's convention of not mocking the Supabase client.

## Deferred (from the spec — not in this plan)

Photo file storage, price-alert *logic*, guest mode / local-to-account merge, editing a collection card, tags/folders, multi-currency, a full transaction ledger, and proper Clerk-JWT RLS. The `catalog_card_id` columns ship empty now and are linked by the one-time eBay backfill later — no schema change required.
