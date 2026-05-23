---
type: topic
tags: [data-model, postgres, supabase, rls, schema]
updated: 2026-05-23
sources: []
certainty: Likely
---

# Data model

## For future Claude
This page covers the SlabMetrics Postgres data model — core tables, relationships, and Supabase RLS configuration. Relevant when: designing a new feature that needs DB tables, writing RLS policies, understanding what data the app owns vs. what Clerk owns, or evaluating whether a field belongs in Supabase or Pinecone.
Key constraint: **Supabase RLS keys off Clerk user IDs** (`auth.jwt() ->> 'sub'`). Supabase Auth is disabled — `auth.users` is not used. User identity is always the Clerk `sub` claim from the JWT.

## TL;DR

Core entities: `cards` (catalog), `comps` (price records), `collections` (user holdings), `watchlist_items`, `recommendations` (Buy/Hold/Sell), `subscriptions` (Stripe state), `pop_snapshots` (population report history). All user-scoped tables use RLS keyed to the Clerk JWT `sub` claim. `[Likely — pre-MVP sketch]`

## Core tables (sketch)

### `cards` — card catalog

The central reference table. Every comp, collection entry, and recommendation points to a card.

```sql
cards (
  id              uuid primary key,
  player_name     text not null,
  year            smallint,
  set_name        text,           -- e.g. "2024 Panini Mosaic Football"
  card_number     text,           -- e.g. "301"
  subset          text,           -- e.g. "Rookies", "Hall of Fame"
  parallel        text,           -- e.g. "Silver Prizm", "Gold" — null = base
  grading_service text,           -- PSA | BGS | SGC | CGC | null (raw)
  grade           numeric(3,1),   -- e.g. 10, 9.5 — null if raw/ungraded
  created_at      timestamptz default now()
)
```

`[Likely]` — derived from business plan feature set and [[entities/psa]], [[entities/bgs]] grade structures.

### `comps` — price records

Every price record is immutable — append-only. No price is modified after ingestion; updates are new rows.

```sql
comps (
  id          uuid primary key,
  card_id     uuid references cards(id),
  price_cents integer not null,      -- stored in cents to avoid float issues
  source      text not null,         -- "ebay_marketplace_insights" | "130point" | etc.
  sale_type   text,                  -- "auction" | "buy_it_now" | "best_offer_accepted"
  sold_at     timestamptz not null,  -- when the sale occurred (not when we ingested it)
  sourced_at  timestamptz not null,  -- when we ingested this record
  raw_ref     text                   -- source-side ID for deduplication
)
```

`sale_type` distinguishes Best Offer Accepted (actual price) from listing price — critical for accuracy. `[Certain — derived from [[vendors/ebay-api]] Best Offer Accepted finding]`

### `collections` — user card holdings

```sql
collections (
  id              uuid primary key,
  user_id         text not null,     -- Clerk sub claim
  card_id         uuid references cards(id),
  quantity        smallint default 1,
  purchase_price_cents integer,
  purchased_at    date,
  notes           text,
  created_at      timestamptz default now()
)
-- RLS: user_id = auth.jwt() ->> 'sub'
```

### `watchlist_items`

```sql
watchlist_items (
  id        uuid primary key,
  user_id   text not null,
  card_id   uuid references cards(id),
  added_at  timestamptz default now(),
  unique(user_id, card_id)
)
-- RLS: user_id = auth.jwt() ->> 'sub'
```

### `recommendations` — Buy/Hold/Sell signals

```sql
recommendations (
  id            uuid primary key,
  card_id       uuid references cards(id),
  signal        text not null,       -- "Buy" | "Hold" | "Sell" | "Submit" | "Pass"
  confidence    numeric(3,2),        -- 0.00–1.00
  generated_at  timestamptz not null,
  expires_at    timestamptz,
  signal_inputs jsonb                -- raw signal scores: {prediction_market: 0.8, pop_change: 0.3, ...}
)
```

Recommendations are **card-scoped, not user-scoped** — the Buy/Hold/Sell signal is the same for all users looking at the same card. Users may get personalized weighting later (e.g., weight signals by portfolio exposure) but that's post-v1. `[Likely]`

### `subscriptions` — Stripe state

```sql
subscriptions (
  id                      uuid primary key,
  user_id                 text not null unique,  -- Clerk sub claim
  stripe_subscription_id  text unique,
  stripe_customer_id      text,
  tier                    text,          -- "free" | "pro" | "investor"
  status                  text,          -- Stripe subscription status
  current_period_end      timestamptz,
  updated_at              timestamptz
)
-- RLS: user_id = auth.jwt() ->> 'sub'
```

Stripe is the source of truth for subscription state — this table is a cache/projection. `[Certain]`

### `pop_snapshots` — population report history

```sql
pop_snapshots (
  id              uuid primary key,
  card_id         uuid references cards(id),
  grading_service text not null,     -- PSA | BGS | SGC | CGC
  grade           numeric(3,1) not null,
  population      integer not null,
  captured_at     timestamptz not null
)
```

Population is append-only — captures a point-in-time snapshot so changes over time can be detected (Wedge Signal #4). `[Likely]`

## Supabase RLS + Clerk pattern

Clerk issues a JWT with a `sub` claim (the Clerk user ID). Supabase is configured with Clerk's JWT secret to verify the token. RLS policies reference this claim:

```sql
-- Example: users can only see their own collections
create policy "own_collections" on collections
  for all using (user_id = auth.jwt() ->> 'sub');
```

Supabase Auth (`auth.users`, `auth.uid()`) is **disabled and unused**. Do not use `auth.uid()` — use `auth.jwt() ->> 'sub'` instead. `[Certain]` — See [[decisions/0001-clerk-over-supabase-auth]].

## Pinecone vs. Supabase boundary

- **Supabase**: structured data — cards, comps, user collections, subscriptions, recommendations.
- **Pinecone**: vector embeddings — card similarity, semantic search, recommendation scoring. Does not own the authoritative record; always cites back to a Supabase `card_id`.

`[Likely]`

## Open questions

- How is the `cards` catalog populated? Manual seeding, eBay catalog import, or community-driven?
- Should `comps` be partitioned by `sold_at` date for query performance at scale?
- `recommendations.signal_inputs` as JSONB vs. normalized signal tables — JSONB is simpler for v1 but harder to query analytically.
- How are card variants (same player, same year, different parallel) modeled — separate rows in `cards` or a `parallel` column?

## See also

- [[topics/architecture]] — overall system context; Supabase is the primary DB layer
- [[topics/pricing-pipeline]] — the pipeline writes to `comps` and `recommendations`
- [[company/business-plan]] — v1 feature set determines which tables are needed at launch
- [[decisions/0001-clerk-over-supabase-auth]] — why RLS uses Clerk JWT, not Supabase Auth
- [[vendors/ebay-api]] — comp data source; `sale_type` field directly addresses the Best Offer Accepted finding
- [[vendors/130point]] — comp data source; same schema, different `source` value
- [[entities/psa]] — pop report source for `pop_snapshots` table
- [[concepts/population-report]] — what pop report data means; feeds `pop_snapshots` design
