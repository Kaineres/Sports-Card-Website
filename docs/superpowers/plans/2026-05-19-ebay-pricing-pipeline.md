# eBay Pricing Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pull real sports card sold-listing prices from eBay, store full history in Supabase, and expose two API routes — a nightly catalog refresh (internal) and a live search endpoint (user-facing).

**Architecture:** Three-layer: (1) pure library functions with no I/O (query builder, snapshot math) that are fully unit-tested, (2) thin I/O wrappers (eBay client, Supabase client, Upstash cache, rate limiter) that compose the library functions, (3) Next.js route handlers that wire everything together. The nightly refresh is triggered by n8n cron → POST `/api/prices/refresh`; live search hits GET `/api/prices/search` with Clerk auth and Upstash rate limiting.

**Tech Stack:** Next.js 16 App Router (TypeScript), Supabase (Postgres), eBay Finding API (findCompletedItems), Upstash Redis (@upstash/redis + @upstash/ratelimit), Clerk (@clerk/nextjs), Zod, Vitest (unit tests).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/20260519000001_pricing_tables.sql` | Create | `cards`, `sold_listings`, `price_snapshots` DDL |
| `apps/web/vitest.config.ts` | Create | Vitest config for node-env tests |
| `apps/web/src/env.d.ts` | Create | TypeScript env var declarations |
| `apps/web/src/lib/supabase/types.ts` | Create | Hand-written DB row types |
| `apps/web/src/lib/supabase/server.ts` | Create | Supabase admin client factory |
| `apps/web/src/lib/ebay/types.ts` | Create | eBay API response + domain types |
| `apps/web/src/lib/ebay/query-builder.ts` | Create | Pure fn: card → eBay query string |
| `apps/web/src/lib/ebay/__tests__/query-builder.test.ts` | Create | Unit tests for query builder |
| `apps/web/src/lib/ebay/client.ts` | Create | findCompletedItems wrapper |
| `apps/web/src/lib/ebay/__tests__/client.test.ts` | Create | Unit tests for eBay client (mocked fetch) |
| `apps/web/src/lib/prices/snapshots.ts` | Create | Pure fn: prices[] → median/avg/high/low |
| `apps/web/src/lib/prices/__tests__/snapshots.test.ts` | Create | Unit tests for snapshot math |
| `apps/web/src/lib/cache/search-cache.ts` | Create | Upstash get/set for search results |
| `apps/web/src/lib/rate-limit/prices.ts` | Create | Upstash sliding-window limiter |
| `apps/web/src/lib/prices/catalog-refresh.ts` | Create | Orchestrate eBay → Supabase for catalog |
| `apps/web/src/lib/prices/search.ts` | Create | Orchestrate eBay → cache → Supabase for search |
| `apps/web/src/app/api/prices/refresh/route.ts` | Create | POST handler (internal secret auth) |
| `apps/web/src/app/api/prices/search/route.ts` | Create | GET handler (Clerk + rate limit) |
| `apps/web/src/middleware.ts` | Create | Clerk middleware (public-route exceptions) |
| `apps/web/src/app/layout.tsx` | Modify | Wrap with ClerkProvider |
| `apps/web/package.json` | Modify | Add deps + test script |

---

## Task 1: Set Up Vitest

**Files:**
- Create: `apps/web/vitest.config.ts`
- Modify: `apps/web/package.json`

- [ ] **Step 1: Install Vitest in apps/web**

```bash
cd apps/web
pnpm add -D vitest
```

Expected: vitest appears in devDependencies in `apps/web/package.json`.

- [ ] **Step 2: Create vitest config**

Create `apps/web/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Add test script to apps/web/package.json**

In `apps/web/package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Final scripts block:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Verify vitest runs (no test files yet = pass)**

```bash
cd apps/web && pnpm test
```

Expected: `No test files found, exiting with code 0` or similar — not an error.

- [ ] **Step 5: Commit**

```bash
git add apps/web/vitest.config.ts apps/web/package.json pnpm-lock.yaml
git commit -m "chore: add Vitest for unit testing in apps/web"
```

---

## Task 2: Install Pricing Pipeline Dependencies

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
cd apps/web
pnpm add @supabase/supabase-js @upstash/redis @upstash/ratelimit @clerk/nextjs zod
```

Expected: all five packages appear in `dependencies` in `apps/web/package.json`.

- [ ] **Step 2: Verify Next.js still starts**

```bash
cd apps/web && pnpm dev
```

Expected: dev server starts on http://localhost:3000 with no module errors. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml
git commit -m "chore: install Supabase, Upstash, Clerk, and Zod in apps/web"
```

---

## Task 3: Configure Environment Variables

**Files:**
- Create: `apps/web/src/env.d.ts`
- Create: `apps/web/.env.local` (not committed — template shown below)

- [ ] **Step 1: Create TypeScript env declarations**

Create `apps/web/src/env.d.ts`:

```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string
    SUPABASE_SERVICE_ROLE_KEY: string
    EBAY_APP_ID: string
    INTERNAL_API_SECRET: string
    UPSTASH_REDIS_REST_URL: string
    UPSTASH_REDIS_REST_TOKEN: string
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string
    CLERK_SECRET_KEY: string
  }
}
```

- [ ] **Step 2: Create .env.local template (fill in real values)**

Create `apps/web/.env.local` — **never commit this file**:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# eBay Finding API
EBAY_APP_ID=YourApp-XXXXX-YourProd-XXXXX-XXXXX

# Internal API secret (generate with: openssl rand -hex 32)
INTERNAL_API_SECRET=your-random-secret-here

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXX
```

Where to get each value:
- Supabase: Project Settings → API → Project URL + Service Role Key
- eBay: developer.ebay.com → My Apps → App ID (Client ID) from your production keyset
- INTERNAL_API_SECRET: run `openssl rand -hex 32` in terminal
- Upstash: console.upstash.com → your Redis DB → REST API tab
- Clerk: dashboard.clerk.com → your app → API Keys

- [ ] **Step 3: Verify .gitignore covers .env.local**

```bash
grep ".env.local" apps/web/.gitignore
```

Expected: `.env.local` appears in the output. If not, add it to `apps/web/.gitignore`.

- [ ] **Step 4: Commit env.d.ts only**

```bash
git add apps/web/src/env.d.ts
git commit -m "chore: add TypeScript declarations for env vars"
```

---

## Task 4: Create Supabase Pricing Tables Migration

**Files:**
- Create: `supabase/migrations/20260519000001_pricing_tables.sql`

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/20260519000001_pricing_tables.sql`:

```sql
-- cards: one row per specific graded card version
CREATE TABLE public.cards (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name      text          NOT NULL,
  sport            text          NOT NULL CHECK (sport IN ('football', 'basketball', 'baseball')),
  year             int           NOT NULL,
  set_name         text          NOT NULL,
  card_number      text          NOT NULL,
  parallel         text          NOT NULL DEFAULT 'Base',
  grading_service  text          NOT NULL CHECK (grading_service IN ('PSA', 'BGS', 'SGC', 'CGC')),
  grade            numeric(3,1)  NOT NULL,
  ebay_search_query text         NOT NULL,
  is_active        boolean       NOT NULL DEFAULT true,
  created_at       timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_cards_is_active ON public.cards (is_active);

-- sold_listings: every eBay sold listing we've ever fetched
CREATE TABLE public.sold_listings (
  id             uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  ebay_item_id   text          UNIQUE NOT NULL,
  card_id        uuid          REFERENCES public.cards(id) ON DELETE SET NULL,
  title          text          NOT NULL,
  sale_price     numeric(10,2) NOT NULL,
  currency       text          NOT NULL DEFAULT 'USD',
  sale_date      timestamptz   NOT NULL,
  ebay_url       text          NOT NULL,
  source         text          NOT NULL CHECK (source IN ('catalog_refresh', 'search')),
  created_at     timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_sold_listings_card_id   ON public.sold_listings (card_id);
CREATE INDEX idx_sold_listings_sale_date ON public.sold_listings (sale_date);
CREATE INDEX idx_sold_listings_ebay_item ON public.sold_listings (ebay_item_id);

-- price_snapshots: daily aggregate per catalog card
CREATE TABLE public.price_snapshots (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id       uuid          NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  snapshot_date date          NOT NULL,
  median_price  numeric(10,2) NOT NULL,
  avg_price     numeric(10,2) NOT NULL,
  low_price     numeric(10,2) NOT NULL,
  high_price    numeric(10,2) NOT NULL,
  sale_count    int           NOT NULL,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (card_id, snapshot_date)
);

CREATE INDEX idx_price_snapshots_card_date ON public.price_snapshots (card_id, snapshot_date DESC);
```

- [ ] **Step 2: Push migration to linked Supabase project**

```bash
cd C:/Users/kaink/OneDrive/Documents/GitHub/Sports-Card-Website
npx supabase db push
```

Expected: migration applies without error. If prompted to confirm, type `y`.

- [ ] **Step 3: Verify tables exist in Supabase Studio**

Open your Supabase project → Table Editor. Confirm `cards`, `sold_listings`, and `price_snapshots` appear with the correct columns.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260519000001_pricing_tables.sql
git commit -m "feat: add Supabase migrations for pricing tables (cards, sold_listings, price_snapshots)"
```

---

## Task 5: Write Database Types

**Files:**
- Create: `apps/web/src/lib/supabase/types.ts`

- [ ] **Step 1: Write TypeScript row types matching the migration**

Create `apps/web/src/lib/supabase/types.ts`:

```typescript
export type Sport = 'football' | 'basketball' | 'baseball'
export type GradingService = 'PSA' | 'BGS' | 'SGC' | 'CGC'
export type ListingSource = 'catalog_refresh' | 'search'

export interface Card {
  id: string
  player_name: string
  sport: Sport
  year: number
  set_name: string
  card_number: string
  parallel: string
  grading_service: GradingService
  grade: number
  ebay_search_query: string
  is_active: boolean
  created_at: string
}

export interface SoldListing {
  id: string
  ebay_item_id: string
  card_id: string | null
  title: string
  sale_price: number
  currency: string
  sale_date: string
  ebay_url: string
  source: ListingSource
  created_at: string
}

export interface PriceSnapshot {
  id: string
  card_id: string
  snapshot_date: string
  median_price: number
  avg_price: number
  low_price: number
  high_price: number
  sale_count: number
  created_at: string
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/supabase/types.ts
git commit -m "feat: add TypeScript types for pricing DB tables"
```

---

## Task 6: Write Supabase Server Client

**Files:**
- Create: `apps/web/src/lib/supabase/server.ts`

- [ ] **Step 1: Write the admin client factory**

Create `apps/web/src/lib/supabase/server.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars not set')
  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
```

This uses the service role key — **only ever call this server-side** (route handlers, server components). It bypasses RLS intentionally for the pricing pipeline, which is a server-only operation.

- [ ] **Step 2: Run typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/supabase/server.ts
git commit -m "feat: add Supabase admin client factory"
```

---

## Task 7: Write eBay API Types

**Files:**
- Create: `apps/web/src/lib/ebay/types.ts`

- [ ] **Step 1: Write eBay domain types**

Create `apps/web/src/lib/ebay/types.ts`:

```typescript
export interface EbayListing {
  itemId: string
  title: string
  salePrice: number
  currency: string
  saleDate: string  // ISO 8601
  ebayUrl: string
}

// Raw shape of one item from eBay Finding API JSON response
export interface EbayRawItem {
  itemId: [string]
  title: [string]
  viewItemURL: [string]
  sellingStatus: [
    {
      currentPrice: [{ __value__: string; '@currencyId': string }]
      sellingState: [string]
    }
  ]
  listingInfo: [{ endTime: [string] }]
}

export interface EbayFindResponse {
  findCompletedItemsResponse: [
    {
      ack: [string]
      searchResult: [{ '@count': string; item?: EbayRawItem[] }]
    }
  ]
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/ebay/types.ts
git commit -m "feat: add eBay Finding API TypeScript types"
```

---

## Task 8: Write and Test eBay Query Builder

**Files:**
- Create: `apps/web/src/lib/ebay/query-builder.ts`
- Create: `apps/web/src/lib/ebay/__tests__/query-builder.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/lib/ebay/__tests__/query-builder.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildEbayQuery } from '../query-builder'

describe('buildEbayQuery', () => {
  it('formats a standard card into a quoted keyword search', () => {
    const result = buildEbayQuery({
      player_name: 'Caleb Williams',
      set_name: 'Panini Mosaic',
      grading_service: 'PSA',
      grade: 10,
      year: 2024,
    })
    expect(result).toBe('"Caleb Williams" "Panini Mosaic" "PSA 10" 2024 rookie')
  })

  it('handles decimal grades correctly', () => {
    const result = buildEbayQuery({
      player_name: 'Victor Wembanyama',
      set_name: 'Prizm',
      grading_service: 'BGS',
      grade: 9.5,
      year: 2023,
    })
    expect(result).toBe('"Victor Wembanyama" "Prizm" "BGS 9.5" 2023 rookie')
  })

  it('preserves spaces in player name and set name', () => {
    const result = buildEbayQuery({
      player_name: 'Marvin Harrison Jr',
      set_name: 'Topps Chrome Update Series',
      grading_service: 'SGC',
      grade: 10,
      year: 2024,
    })
    expect(result).toBe('"Marvin Harrison Jr" "Topps Chrome Update Series" "SGC 10" 2024 rookie')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && pnpm test
```

Expected: FAIL — `Cannot find module '../query-builder'`.

- [ ] **Step 3: Write the minimal implementation**

Create `apps/web/src/lib/ebay/query-builder.ts`:

```typescript
import type { Card } from '../supabase/types'

type QueryInput = Pick<Card, 'player_name' | 'set_name' | 'grading_service' | 'grade' | 'year'>

export function buildEbayQuery(card: QueryInput): string {
  return `"${card.player_name}" "${card.set_name}" "${card.grading_service} ${card.grade}" ${card.year} rookie`
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/web && pnpm test
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/ebay/query-builder.ts apps/web/src/lib/ebay/__tests__/query-builder.test.ts
git commit -m "feat: add eBay query builder with unit tests"
```

---

## Task 9: Write and Test Price Snapshot Computation

**Files:**
- Create: `apps/web/src/lib/prices/snapshots.ts`
- Create: `apps/web/src/lib/prices/__tests__/snapshots.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/src/lib/prices/__tests__/snapshots.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { computeSnapshot } from '../snapshots'

describe('computeSnapshot', () => {
  it('computes median, avg, high, low for an odd-length list', () => {
    const result = computeSnapshot([100, 200, 150])
    expect(result.median).toBe(150)
    expect(result.avg).toBe(150)
    expect(result.low).toBe(100)
    expect(result.high).toBe(200)
  })

  it('computes median for an even-length list (average of two middle values)', () => {
    const result = computeSnapshot([100, 200, 300, 400])
    expect(result.median).toBe(250)
    expect(result.avg).toBe(250)
    expect(result.low).toBe(100)
    expect(result.high).toBe(400)
  })

  it('rounds avg and median to 2 decimal places', () => {
    const result = computeSnapshot([100, 200, 300])
    expect(result.avg).toBe(200)
    const result2 = computeSnapshot([10, 20, 31])
    expect(result2.avg).toBe(20.33)
  })

  it('handles a single price', () => {
    const result = computeSnapshot([150])
    expect(result.median).toBe(150)
    expect(result.avg).toBe(150)
    expect(result.low).toBe(150)
    expect(result.high).toBe(150)
  })

  it('throws on empty array', () => {
    expect(() => computeSnapshot([])).toThrow('Cannot compute snapshot from empty price list')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && pnpm test
```

Expected: FAIL — `Cannot find module '../snapshots'`.

- [ ] **Step 3: Write the implementation**

Create `apps/web/src/lib/prices/snapshots.ts`:

```typescript
export interface SnapshotResult {
  median: number
  avg: number
  low: number
  high: number
}

export function computeSnapshot(prices: number[]): SnapshotResult {
  if (prices.length === 0) throw new Error('Cannot compute snapshot from empty price list')

  const sorted = [...prices].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)

  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]

  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length

  return {
    median: Math.round(median * 100) / 100,
    avg: Math.round(avg * 100) / 100,
    low: sorted[0],
    high: sorted[sorted.length - 1],
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/web && pnpm test
```

Expected: all 5 snapshot tests + 3 query-builder tests pass (8 total).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/prices/snapshots.ts apps/web/src/lib/prices/__tests__/snapshots.test.ts
git commit -m "feat: add price snapshot computation with unit tests"
```

---

## Task 10: Write eBay API Client

**Files:**
- Create: `apps/web/src/lib/ebay/client.ts`
- Create: `apps/web/src/lib/ebay/__tests__/client.test.ts`

- [ ] **Step 1: Write the failing test (mocked fetch)**

Create `apps/web/src/lib/ebay/__tests__/client.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findCompletedItems } from '../client'

const mockItem = {
  itemId: ['123456789'],
  title: ['Caleb Williams 2024 Panini Mosaic PSA 10 Rookie'],
  viewItemURL: ['https://www.ebay.com/itm/123456789'],
  sellingStatus: [
    {
      currentPrice: [{ __value__: '150.00', '@currencyId': 'USD' }],
      sellingState: ['EndedWithSales'],
    },
  ],
  listingInfo: [{ endTime: ['2024-11-15T18:00:00.000Z'] }],
}

const mockResponse = {
  findCompletedItemsResponse: [
    {
      ack: ['Success'],
      searchResult: [{ '@count': '1', item: [mockItem] }],
    },
  ],
}

beforeEach(() => {
  vi.stubEnv('EBAY_APP_ID', 'TestApp-1234')
})

describe('findCompletedItems', () => {
  it('returns mapped listings on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }))

    const result = await findCompletedItems('"Caleb Williams" "Panini Mosaic" "PSA 10" 2024 rookie')

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      itemId: '123456789',
      title: 'Caleb Williams 2024 Panini Mosaic PSA 10 Rookie',
      salePrice: 150,
      currency: 'USD',
      saleDate: '2024-11-15T18:00:00.000Z',
      ebayUrl: 'https://www.ebay.com/itm/123456789',
    })
  })

  it('returns empty array when searchResult has no items', async () => {
    const emptyResponse = {
      findCompletedItemsResponse: [
        {
          ack: ['Success'],
          searchResult: [{ '@count': '0' }],
        },
      ],
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => emptyResponse,
    }))

    const result = await findCompletedItems('no results query')
    expect(result).toHaveLength(0)
  })

  it('throws when fetch returns a non-ok status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    await expect(findCompletedItems('test')).rejects.toThrow('eBay API error: 503')
  })

  it('throws when eBay ack is not Success', async () => {
    const failResponse = {
      findCompletedItemsResponse: [{ ack: ['Failure'], searchResult: [] }],
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => failResponse,
    }))
    await expect(findCompletedItems('test')).rejects.toThrow('eBay API returned: Failure')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && pnpm test
```

Expected: FAIL — `Cannot find module '../client'`.

- [ ] **Step 3: Write the eBay client implementation**

Create `apps/web/src/lib/ebay/client.ts`:

```typescript
import type { EbayFindResponse, EbayListing, EbayRawItem } from './types'

const EBAY_BASE_URL = 'https://svcs.ebay.com/services/search/FindingService/v1'

export async function findCompletedItems(
  query: string,
  opts: { daysBack?: number } = {}
): Promise<EbayListing[]> {
  const appId = process.env.EBAY_APP_ID
  if (!appId) throw new Error('EBAY_APP_ID not set')

  const params = new URLSearchParams({
    'OPERATION-NAME': 'findCompletedItems',
    'SERVICE-VERSION': '1.13.0',
    'SECURITY-APPNAME': appId,
    'RESPONSE-DATA-FORMAT': 'JSON',
    keywords: query,
    categoryId: '213',
    'itemFilter(0).name': 'SoldItemsOnly',
    'itemFilter(0).value': 'true',
    'sortOrder': 'EndTimeSoonest',
    'paginationInput.entriesPerPage': '20',
  })

  if (opts.daysBack) {
    const since = new Date(Date.now() - opts.daysBack * 24 * 60 * 60 * 1000)
    params.set('itemFilter(1).name', 'EndTimeFrom')
    params.set('itemFilter(1).value', since.toISOString())
  }

  const res = await fetch(`${EBAY_BASE_URL}?${params}`)
  if (!res.ok) throw new Error(`eBay API error: ${res.status}`)

  const data: EbayFindResponse = await res.json()
  const response = data.findCompletedItemsResponse?.[0]

  if (response?.ack?.[0] !== 'Success') {
    throw new Error(`eBay API returned: ${response?.ack?.[0]}`)
  }

  const items: EbayRawItem[] = response.searchResult?.[0]?.item ?? []

  return items.map((item) => ({
    itemId: item.itemId[0],
    title: item.title[0],
    salePrice: parseFloat(item.sellingStatus[0].currentPrice[0].__value__),
    currency: item.sellingStatus[0].currentPrice[0]['@currencyId'],
    saleDate: item.listingInfo[0].endTime[0],
    ebayUrl: item.viewItemURL[0],
  }))
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/web && pnpm test
```

Expected: all 12 tests pass (3 query-builder + 5 snapshot + 4 client).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/ebay/client.ts apps/web/src/lib/ebay/__tests__/client.test.ts
git commit -m "feat: add eBay Finding API client with unit tests"
```

---

## Task 11: Write Upstash Search Cache

**Files:**
- Create: `apps/web/src/lib/cache/search-cache.ts`

- [ ] **Step 1: Write the cache module**

Create `apps/web/src/lib/cache/search-cache.ts`:

```typescript
import { Redis } from '@upstash/redis'
import type { EbayListing } from '../ebay/types'

let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return _redis
}

const TTL_SECONDS = 3600 // 1 hour

export function normalizeQuery(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, ' ')
}

export async function getCachedSearch(normalizedQuery: string): Promise<EbayListing[] | null> {
  return getRedis().get<EbayListing[]>(`search:${normalizedQuery}`)
}

export async function setCachedSearch(
  normalizedQuery: string,
  listings: EbayListing[]
): Promise<void> {
  await getRedis().set(`search:${normalizedQuery}`, listings, { ex: TTL_SECONDS })
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/cache/search-cache.ts
git commit -m "feat: add Upstash search result cache (1-hour TTL)"
```

---

## Task 12: Write Upstash Rate Limiter

**Files:**
- Create: `apps/web/src/lib/rate-limit/prices.ts`

- [ ] **Step 1: Write the rate limiter**

Create `apps/web/src/lib/rate-limit/prices.ts`:

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
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      prefix: 'ratelimit:prices:search',
    })
  }
  return _ratelimit
}

export async function checkSearchRateLimit(
  userId: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const result = await getRatelimit().limit(userId)
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  }
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/rate-limit/prices.ts
git commit -m "feat: add Upstash sliding-window rate limiter for search endpoint"
```

---

## Task 13: Write Catalog Refresh Business Logic

**Files:**
- Create: `apps/web/src/lib/prices/catalog-refresh.ts`

- [ ] **Step 1: Write the catalog refresh orchestrator**

Create `apps/web/src/lib/prices/catalog-refresh.ts`:

```typescript
import { createAdminClient } from '../supabase/server'
import { findCompletedItems } from '../ebay/client'
import { computeSnapshot } from './snapshots'
import type { Card } from '../supabase/types'

export interface RefreshResult {
  cards_processed: number
  listings_added: number
  errors: Array<{ card_id: string; error: string }>
}

export async function runCatalogRefresh(): Promise<RefreshResult> {
  const db = createAdminClient()
  const result: RefreshResult = { cards_processed: 0, listings_added: 0, errors: [] }

  const { data: cards, error: fetchError } = await db
    .from('cards')
    .select('*')
    .eq('is_active', true)

  if (fetchError) throw new Error(`Failed to fetch active cards: ${fetchError.message}`)

  for (const card of (cards as Card[])) {
    try {
      result.cards_processed++

      const listings = await findCompletedItems(card.ebay_search_query, { daysBack: 1 })
      if (listings.length === 0) continue

      // Fetch existing item IDs to deduplicate
      const { data: existing } = await db
        .from('sold_listings')
        .select('ebay_item_id')
        .in('ebay_item_id', listings.map((l) => l.itemId))

      const existingIds = new Set((existing ?? []).map((r: { ebay_item_id: string }) => r.ebay_item_id))
      const newListings = listings.filter((l) => !existingIds.has(l.itemId))

      if (newListings.length > 0) {
        const { error: insertError } = await db.from('sold_listings').insert(
          newListings.map((l) => ({
            ebay_item_id: l.itemId,
            card_id: card.id,
            title: l.title,
            sale_price: l.salePrice,
            currency: l.currency,
            sale_date: l.saleDate,
            ebay_url: l.ebayUrl,
            source: 'catalog_refresh',
          }))
        )
        if (insertError) throw new Error(insertError.message)
        result.listings_added += newListings.length
      }

      // Recompute today's snapshot from all listings for this card today
      const today = new Date().toISOString().split('T')[0]
      const { data: todayListings } = await db
        .from('sold_listings')
        .select('sale_price')
        .eq('card_id', card.id)
        .gte('sale_date', `${today}T00:00:00Z`)
        .lte('sale_date', `${today}T23:59:59Z`)

      const prices = (todayListings ?? []).map((r: { sale_price: number }) => r.sale_price)
      if (prices.length === 0) continue

      const snap = computeSnapshot(prices)
      await db.from('price_snapshots').upsert(
        {
          card_id: card.id,
          snapshot_date: today,
          median_price: snap.median,
          avg_price: snap.avg,
          low_price: snap.low,
          high_price: snap.high,
          sale_count: prices.length,
        },
        { onConflict: 'card_id,snapshot_date' }
      )
    } catch (err) {
      result.errors.push({
        card_id: card.id,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return result
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/prices/catalog-refresh.ts
git commit -m "feat: add catalog refresh orchestrator (eBay → deduplicate → Supabase → snapshot)"
```

---

## Task 14: Write Search Business Logic

**Files:**
- Create: `apps/web/src/lib/prices/search.ts`

- [ ] **Step 1: Write the search orchestrator**

Create `apps/web/src/lib/prices/search.ts`:

```typescript
import { createAdminClient } from '../supabase/server'
import { findCompletedItems } from '../ebay/client'
import { normalizeQuery, getCachedSearch, setCachedSearch } from '../cache/search-cache'
import type { EbayListing } from '../ebay/types'

export async function searchCardPrices(rawQuery: string): Promise<EbayListing[]> {
  const normalized = normalizeQuery(rawQuery)

  // Cache hit
  const cached = await getCachedSearch(normalized)
  if (cached) return cached

  // Cache miss — call eBay
  let listings: EbayListing[]
  try {
    listings = await findCompletedItems(normalized, { daysBack: 90 })
  } catch (err) {
    // Fail open: if eBay errors, return empty rather than crashing the user's request
    console.error('eBay search error:', err)
    return []
  }

  // Store new listings in Supabase (card_id = null — not yet matched to catalog)
  if (listings.length > 0) {
    const db = createAdminClient()
    const { data: existing } = await db
      .from('sold_listings')
      .select('ebay_item_id')
      .in('ebay_item_id', listings.map((l) => l.itemId))

    const existingIds = new Set((existing ?? []).map((r: { ebay_item_id: string }) => r.ebay_item_id))
    const newListings = listings.filter((l) => !existingIds.has(l.itemId))

    if (newListings.length > 0) {
      await db.from('sold_listings').insert(
        newListings.map((l) => ({
          ebay_item_id: l.itemId,
          card_id: null,
          title: l.title,
          sale_price: l.salePrice,
          currency: l.currency,
          sale_date: l.saleDate,
          ebay_url: l.ebayUrl,
          source: 'search',
        }))
      )
    }
  }

  // Cache and return
  await setCachedSearch(normalized, listings)
  return listings
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/prices/search.ts
git commit -m "feat: add search orchestrator (cache-check → eBay → Supabase → cache-set)"
```

---

## Task 15: Write POST /api/prices/refresh Route

**Files:**
- Create: `apps/web/src/app/api/prices/refresh/route.ts`

- [ ] **Step 1: Write the route handler**

Create `apps/web/src/app/api/prices/refresh/route.ts`:

```typescript
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
```

- [ ] **Step 2: Run typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Manual smoke test (requires dev server + env vars)**

```bash
cd apps/web && pnpm dev
```

In a second terminal:
```bash
curl -X POST http://localhost:3000/api/prices/refresh \
  -H "x-internal-secret: WRONG_SECRET"
```
Expected: `{"error":"Unauthorized"}` with status 401.

```bash
curl -X POST http://localhost:3000/api/prices/refresh \
  -H "x-internal-secret: YOUR_INTERNAL_API_SECRET"
```
Expected: `{"cards_processed":0,"listings_added":0,"errors":[]}` (catalog is empty — correct for now).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/api/prices/refresh/route.ts
git commit -m "feat: add POST /api/prices/refresh route with internal secret auth"
```

---

## Task 16: Write GET /api/prices/search Route

**Files:**
- Create: `apps/web/src/app/api/prices/search/route.ts`

- [ ] **Step 1: Write the route handler**

Create `apps/web/src/app/api/prices/search/route.ts`:

```typescript
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
```

- [ ] **Step 2: Run typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/api/prices/search/route.ts
git commit -m "feat: add GET /api/prices/search route with Clerk auth and rate limiting"
```

---

## Task 17: Set Up Clerk Provider and Middleware

**Files:**
- Modify: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/middleware.ts`

- [ ] **Step 1: Read current layout**

Read `apps/web/src/app/layout.tsx` to see current content before modifying.

- [ ] **Step 2: Add ClerkProvider to layout**

Wrap the `children` in layout.tsx with `ClerkProvider`. The import comes from `@clerk/nextjs`.

Replace the `<body>` content in `apps/web/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sports Card Tracker",
  description: "Real sports card prices, grading info, and market analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 3: Create Clerk middleware**

Create `apps/web/src/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Routes that do NOT require a Clerk session
// /api/prices/refresh is protected by internal secret instead of Clerk
const isPublicRoute = createRouteMatcher([
  '/',
  '/api/prices/refresh',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

Note: `/api/prices/search` is NOT in the public routes list — unauthenticated requests to it will be redirected to Clerk's sign-in page at the middleware layer (before the route handler even runs).

- [ ] **Step 4: Run typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 5: Verify dev server starts**

```bash
cd apps/web && pnpm dev
```

Expected: starts cleanly. Without Clerk env vars, Clerk will error on requests but the app should still compile.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/layout.tsx apps/web/src/middleware.ts
git commit -m "feat: add Clerk provider and middleware for auth"
```

---

## Task 18: Configure n8n Nightly Workflow

This task is configuration in n8n — no code files to create. Complete these steps in the n8n UI.

- [ ] **Step 1: Create a new workflow in n8n**

Open your n8n instance. Create a new workflow named "Nightly Card Price Refresh".

- [ ] **Step 2: Add Cron trigger node**

Add a **Schedule Trigger** node (n8n's cron node):
- Mode: Custom
- Cron expression: `0 2 * * *`
- This fires at 2:00 AM UTC every day.

- [ ] **Step 3: Add HTTP Request node**

Add an **HTTP Request** node connected to the Cron trigger:
- Method: POST
- URL: `https://your-vercel-app.vercel.app/api/prices/refresh`
  (Replace with your actual Vercel domain. For local testing: use an ngrok tunnel URL.)
- Headers:
  - Name: `x-internal-secret`
  - Value: your `INTERNAL_API_SECRET` value (store it as an n8n credential or environment variable — never hardcode)
- Response Format: JSON

- [ ] **Step 4: Add IF node for error checking**

Add an **IF** node connected to the HTTP Request node:
- Condition: `{{$json.errors.length}} > 0`
- True branch: connect to a notification node (email or Slack)
- False branch: end the workflow

- [ ] **Step 5: Add notification node (optional but recommended)**

Add a **Send Email** or **Slack** node on the True branch to alert you when errors occur. Configure with your preferred notification credentials.

- [ ] **Step 6: Test the workflow manually**

In n8n, click "Test Workflow" — this fires the HTTP request immediately. Verify the response contains `{"cards_processed":0,"listings_added":0,"errors":[]}` (empty catalog is expected before seeding).

- [ ] **Step 7: Activate the workflow**

Toggle the workflow to **Active** in n8n. It will now fire automatically at 2 AM UTC.

---

## Task 19: Seed Initial Catalog

Seed the `cards` table with multi-sport graded rookies to power the first nightly refresh.

- [ ] **Step 1: Open Supabase SQL Editor**

Go to your Supabase project → SQL Editor → New query.

- [ ] **Step 2: Run the seed INSERT**

```sql
INSERT INTO public.cards
  (player_name, sport, year, set_name, card_number, parallel, grading_service, grade, ebay_search_query, is_active)
VALUES
  -- Football
  ('Caleb Williams',        'football',   2024, 'Panini Mosaic',         '301', 'Base',   'PSA', 10, '"Caleb Williams" "Panini Mosaic" "PSA 10" 2024 rookie',        true),
  ('Jayden Daniels',        'football',   2024, 'Panini Mosaic',         '302', 'Base',   'PSA', 10, '"Jayden Daniels" "Panini Mosaic" "PSA 10" 2024 rookie',        true),
  ('Drake Maye',            'football',   2024, 'Panini Mosaic',         '303', 'Base',   'PSA', 10, '"Drake Maye" "Panini Mosaic" "PSA 10" 2024 rookie',            true),
  ('Marvin Harrison Jr',    'football',   2024, 'Panini Mosaic',         '304', 'Base',   'PSA', 10, '"Marvin Harrison Jr" "Panini Mosaic" "PSA 10" 2024 rookie',    true),
  ('Brock Bowers',          'football',   2024, 'Panini Mosaic',         '313', 'Base',   'PSA', 10, '"Brock Bowers" "Panini Mosaic" "PSA 10" 2024 rookie',          true),
  -- Basketball
  ('Victor Wembanyama',     'basketball', 2023, 'Panini Prizm',          '267', 'Base',   'PSA', 10, '"Victor Wembanyama" "Panini Prizm" "PSA 10" 2023 rookie',      true),
  ('Chet Holmgren',         'basketball', 2022, 'Panini Prizm',          '261', 'Base',   'PSA', 10, '"Chet Holmgren" "Panini Prizm" "PSA 10" 2022 rookie',          true),
  ('Paolo Banchero',        'basketball', 2022, 'Panini Prizm',          '268', 'Base',   'PSA', 10, '"Paolo Banchero" "Panini Prizm" "PSA 10" 2022 rookie',         true),
  ('Scoot Henderson',       'basketball', 2023, 'Panini Prizm',          '278', 'Base',   'PSA', 10, '"Scoot Henderson" "Panini Prizm" "PSA 10" 2023 rookie',        true),
  ('Brandon Miller',        'basketball', 2023, 'Panini Prizm',          '272', 'Base',   'PSA', 10, '"Brandon Miller" "Panini Prizm" "PSA 10" 2023 rookie',         true),
  -- Baseball
  ('Jackson Holliday',      'baseball',   2024, 'Topps Chrome',          '100', 'Base',   'PSA', 10, '"Jackson Holliday" "Topps Chrome" "PSA 10" 2024 rookie',       true),
  ('Jackson Chourio',       'baseball',   2024, 'Topps Chrome',          '200', 'Base',   'PSA', 10, '"Jackson Chourio" "Topps Chrome" "PSA 10" 2024 rookie',        true),
  ('Yoshinobu Yamamoto',    'baseball',   2024, 'Topps Chrome',          '150', 'Base',   'PSA', 10, '"Yoshinobu Yamamoto" "Topps Chrome" "PSA 10" 2024 rookie',     true),
  ('Paul Skenes',           'baseball',   2024, 'Topps Chrome',          '300', 'Base',   'PSA', 10, '"Paul Skenes" "Topps Chrome" "PSA 10" 2024 rookie',            true),
  ('Wyatt Langford',        'baseball',   2024, 'Topps Chrome',          '250', 'Base',   'PSA', 10, '"Wyatt Langford" "Topps Chrome" "PSA 10" 2024 rookie',         true);
```

- [ ] **Step 3: Verify seed data**

```sql
SELECT player_name, sport, ebay_search_query FROM public.cards ORDER BY sport, player_name;
```

Expected: 15 rows across football (5), basketball (5), baseball (5).

- [ ] **Step 4: Trigger a manual refresh to test end-to-end**

```bash
curl -X POST https://your-vercel-app.vercel.app/api/prices/refresh \
  -H "x-internal-secret: YOUR_INTERNAL_API_SECRET"
```

Or locally (with env vars set):
```bash
curl -X POST http://localhost:3000/api/prices/refresh \
  -H "x-internal-secret: YOUR_INTERNAL_API_SECRET"
```

Expected response (numbers will vary):
```json
{
  "cards_processed": 15,
  "listings_added": 47,
  "errors": []
}
```

- [ ] **Step 5: Verify data landed in Supabase**

In Supabase SQL Editor:
```sql
SELECT 
  c.player_name,
  COUNT(sl.id) AS listing_count,
  ps.median_price,
  ps.snapshot_date
FROM public.cards c
LEFT JOIN public.sold_listings sl ON sl.card_id = c.id
LEFT JOIN public.price_snapshots ps ON ps.card_id = c.id
GROUP BY c.player_name, ps.median_price, ps.snapshot_date
ORDER BY c.player_name;
```

Expected: rows with listing counts > 0 and median prices for cards that had recent eBay sales.

- [ ] **Step 6: Log seed in a note**

No commit needed — this is direct Supabase data. Note in conversation that catalog is seeded with 15 multi-sport PSA 10 rookies.

---

## Prerequisites Checklist (before starting Task 1)

These are account/access prerequisites. Complete them before writing any code:

- [ ] **eBay Developer account** — Register at developer.ebay.com. Create a production app → copy App ID (Client ID) → set as `EBAY_APP_ID` in `.env.local` and Vercel env vars.
- [ ] **Upstash Redis** — If not yet created: console.upstash.com → Create Database → copy REST URL and token → set as `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- [ ] **Clerk application** — If not yet created: dashboard.clerk.com → Create Application → copy publishable key and secret key → set as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
- [ ] **INTERNAL_API_SECRET** — Generate with `openssl rand -hex 32` → set in `.env.local` and Vercel env vars and n8n credentials.
- [ ] **Supabase service role key** — Supabase → Project Settings → API → Service Role Key → set as `SUPABASE_SERVICE_ROLE_KEY` (never expose client-side).

---

## Known Gaps (not v1, logged for future)

- Junk listing filtering: eBay results include lots, reprints, fake grades, "read description" listings. Future: keyword exclusion list + price outlier detection.
- Card number accuracy in seed: card numbers for basketball/baseball rows above are approximate placeholders — verify against actual checklists before relying on them for catalog display.
- BGS/SGC/CGC graded versions: seed covers PSA 10 only. Add parallel rows for the same player+set with other graders once catalog expands.
- GET /api/prices/card/[id]: serves snapshot history for a catalog card — not in v1 but route is pre-planned in the spec.
- Admin catalog UI: currently add cards via Supabase SQL editor. Future: simple admin form.
