# eBay Pricing Pipeline — Design Spec

**Date:** 2026-05-19
**Status:** Approved
**Scope:** Pull real sports card sold-listing prices from eBay, store full history in Supabase, power catalog and search on the website.

---

## Goals

- Surface real, sourced, timestamped card prices on the website (non-negotiable per CLAUDE.md)
- Track price history permanently for catalog cards — enabling trend charts and investment signals
- Support both a curated catalog (featured cards, pre-loaded) and live search (any card a user looks up)
- Update catalog prices nightly via n8n; serve search results live with Upstash caching

## Out of Scope (v1)

- Junk listing filtering (fake grades, lots, reprints) — known gap, future improvement
- 130point or other premium data sources — future addition once subscribers exist
- Mobile app — shares the same API routes, no extra work needed
- Catalog auto-suggestion from orphaned search listings — data is captured, feature is post-MVP

---

## Architecture

Three data flows:

### Flow 1 — Nightly catalog refresh (n8n-driven)

```
n8n cron (2 AM UTC daily)
  → POST /api/prices/refresh  [x-internal-secret header]
    → fetch all active cards from Supabase (is_active = true)
    → for each card:
        → call eBay findCompletedItems (ebay_search_query, last 24h, sold only)
        → skip listings where ebay_item_id already exists in sold_listings
        → write new listings to sold_listings (source = 'catalog_refresh')
        → upsert price_snapshot for today (median, avg, high, low, count)
    → return { cards_processed, listings_added, errors }
```

### Flow 2 — Live search (user-driven)

```
GET /api/prices/search?q=<query>
  → normalize query (lowercase, trim whitespace, collapse multiple spaces)
  → check Upstash: key = "search:<normalized_query>"
      → HIT: return cached results
      → MISS:
          → call eBay findCompletedItems (query, last 90 days, sold only)
          → write new listings to sold_listings (source = 'search', card_id = null)
          → cache in Upstash, TTL = 1 hour
          → return results
```

### Flow 3 — Catalog management (admin)

Direct Supabase table edits (or a future admin UI) manage the `cards` table. Adding a card to the catalog immediately queues it for the next nightly refresh. Orphaned `sold_listings` rows (card_id = null) from search can be backfilled when a searched card is promoted to the catalog.

---

## Data Model

### `cards`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `player_name` | text | e.g. "Caleb Williams" |
| `sport` | text | football / basketball / baseball |
| `year` | int | e.g. 2024 |
| `set_name` | text | e.g. "Panini Mosaic" |
| `card_number` | text | e.g. "301" |
| `parallel` | text | e.g. "Base", "Silver", "Gold Mosaic /10" |
| `grading_service` | text | PSA / BGS / SGC / CGC |
| `grade` | numeric | e.g. 10, 9.5, 9 |
| `ebay_search_query` | text | Auto-generated, manually overridable |
| `is_active` | bool | Include in nightly refresh |
| `created_at` | timestamptz | |

Each row represents one specific card version. "Caleb Williams 2024 Panini Mosaic Base PSA 10" and "Caleb Williams 2024 Panini Mosaic Silver PSA 10" are separate rows with separate price histories.

### `sold_listings`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `ebay_item_id` | text UNIQUE | Deduplication key |
| `card_id` | uuid FK → cards | Nullable — search results not yet matched to catalog |
| `title` | text | Full raw eBay listing title |
| `sale_price` | numeric(10,2) | |
| `currency` | text | Default USD |
| `sale_date` | timestamptz | When the listing sold on eBay |
| `ebay_url` | text | Attribution + source link |
| `source` | text | catalog_refresh / search |
| `created_at` | timestamptz | When we stored it |

### `price_snapshots`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `card_id` | uuid FK → cards | |
| `snapshot_date` | date | |
| `median_price` | numeric(10,2) | |
| `avg_price` | numeric(10,2) | |
| `low_price` | numeric(10,2) | |
| `high_price` | numeric(10,2) | |
| `sale_count` | int | Sold listings that day |
| `created_at` | timestamptz | |

Unique constraint on `(card_id, snapshot_date)`. One snapshot per card per day, recomputed each nightly run.

---

## eBay Integration

**API:** eBay Finding API — `findCompletedItems` endpoint
**Auth:** App ID (Client ID) from eBay Developer account — no OAuth required for read-only calls
**Env var:** `EBAY_APP_ID`

**Query parameters per call:**
- `keywords` = `card.ebay_search_query`
- `categoryId` = `213` (Sports Trading Cards)
- `itemFilter` = `[{ SoldItemsOnly: true }]`
- `sortOrder` = `EndTimeSoonest`
- `paginationInput.entriesPerPage` = `20`

**Auto-generated search query format:**
```
"<player_name>" "<set_name>" "<grading_service> <grade>" <year> rookie
```
Example: `"Caleb Williams" "Panini Mosaic" "PSA 10" 2024 rookie`

**Rate limits:** 5,000 calls/day free tier. A 500-card catalog = 500 calls/night, well within limits.

**Known data quality issue (future):** Raw eBay listings include junk (reprints, lots, fake grades, "read description" listings). No filtering in v1 — flagged for a future countermeasure pass using title keyword exclusions and price outlier detection.

**Future sources:** Architecture supports adding 130point or other data sources via the `source` column on `sold_listings` — no schema changes needed.

---

## Caching & Rate Limiting (Upstash)

**Search cache:**
- Key: `search:<normalized_query>`
- Value: JSON array of sold listings
- TTL: 1 hour
- On eBay failure: serve stale cache (fail open)

**Rate limiting:**
- `/api/prices/refresh` — secret header check only (`x-internal-secret: $INTERNAL_API_SECRET`); not user-accessible
- `/api/prices/search` — per Clerk user ID, sliding window, 10 requests/minute

**Not cached in Upstash:** Catalog card prices — served directly from Supabase `price_snapshots` (fast enough for this read pattern, always current after nightly run).

---

## n8n Workflows

**Workflow 1 — Nightly catalog refresh**
- Trigger: Cron node `0 2 * * *` (2 AM UTC)
- HTTP Request node: POST `/api/prices/refresh` with `x-internal-secret` header
- IF node: check response for errors array
- On error: notification (Slack or email)
- Logs response summary (`cards_processed`, `listings_added`, `errors`) for visibility

**Workflow 2 (future) — Catalog auto-suggestion**
- Query `sold_listings` for `card_id = null` rows with high repeat counts
- Surface as candidates for catalog promotion
- Not v1 — data is already being captured

---

## API Routes

| Route | Method | Caller | Auth |
|---|---|---|---|
| `/api/prices/refresh` | POST | n8n only | `x-internal-secret` header |
| `/api/prices/search` | GET | Frontend users | Clerk session + Upstash rate limit |
| `/api/prices/card/[id]` | GET | Frontend users | Clerk session (future — serves snapshot history for a catalog card) |

---

## Prerequisites

1. **eBay Developer account** — register at developer.ebay.com, create an app, copy the App ID (Client ID) into Vercel env vars as `EBAY_APP_ID`
2. **Seed catalog** — populate the `cards` table with an initial set of graded multi-sport rookies (football, basketball, baseball) before the first nightly run
3. **Upstash Redis instance** — already in stack, needs `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel env vars
4. **Internal API secret** — generate a random secret, set as `INTERNAL_API_SECRET` in Vercel env vars and in n8n as an env var or credential
4. **Supabase migrations** — run migrations to create the three tables before first deployment

---

## eBay ToS Notes

- All displayed prices must include attribution ("Powered by eBay" or similar) and a "prices as of [timestamp]" label
- The `sale_date` and `ebay_url` columns on `sold_listings` satisfy the source + timestamp non-negotiable from CLAUDE.md
- Cached display data should reflect the `snapshot_date` from `price_snapshots`, not claim to be real-time

---

## Future Improvements (logged, not v1)

- Junk listing filtering: keyword exclusion list (reprint, lot, fake, read desc), price outlier detection
- 130point or PWCC as additional data sources
- Catalog auto-suggestion from orphaned search listings
- Intraday refresh for high-demand cards (breaking news, big games)
- Admin UI for catalog management (currently direct Supabase edits)
