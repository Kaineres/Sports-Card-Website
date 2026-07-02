# Collection & Watchlist Persistence — Design

**Date:** 2026-07-01
**Status:** Approved (design), pending implementation plan
**Scope:** `apps/web` only
**Author:** brainstormed with Claude

## For future Claude (summary)

Persist the Collection and Watchlist features to Supabase, scoped to the
signed-in Clerk user. Today both are ephemeral: Watchlist is a `Set<number>` in
`localStorage` (`watchlist-context.tsx`) pointing at the static, fabricated
`BROWSE_CATALOG`; Collection's Add modal is pure component state that saves
nowhere. This design makes both real, per-account, and cross-device — and does
so in a way that upgrades cleanly to real eBay pricing later with **no schema
change and no user re-entry**.

The central idea: each saved row carries a **denormalized identity snapshot**
(the card's fields) **plus a nullable `catalog_card_id`** link to the real
`public.cards` catalog. It works today (no populated catalog needed) and, when
eBay lands, a one-time backfill links rows to `cards.id` so prices flow in
automatically.

## Goals

- Signed-in users can add/remove Collection cards and watch/unwatch cards, with
  data saved in Supabase and available on any device.
- Track enough per-card data to be a real portfolio (identity + basic P&L).
- Zero fabricated market values shown to users (honors the CLAUDE.md rule:
  "every price shown must have a source and a timestamp").
- Clean, migration-free transition to real eBay pricing.

## Non-goals (deferred)

- **Photo file storage** — the upload / scan-to-autofill UI stays, but image
  files are not persisted yet (needs Supabase Storage; separate pass).
- **Price alerts logic** — needs real prices (eBay). Only the on/off flag is
  persisted now.
- **Guest mode / local-to-account merge** — Collection & Watchlist require
  sign-in. Signed-out users are prompted to sign in.
- **Editing a Collection card** — v1 is add / list / remove.
- **Tags / folders**, **multi-currency**, and a **full transaction ledger**
  (multiple buys/sells per card) — larger subsystems for later.
- **Proper Supabase RLS keyed off Clerk JWT** — tracked as future hardening
  across the whole app, not just this feature (see Security).

## Decisions (locked during brainstorm)

1. **Card reference model:** denormalized identity snapshot + nullable
   `catalog_card_id`. (Rejected: FK-to-cards-only — requires seeding a fake
   catalog now and can't represent user-owned cards absent from the catalog;
   legacy-numeric-id-only — guarantees a painful remap later.)
2. **Access pattern:** Next.js API routes + Clerk `auth()` + service-role admin
   client + Upstash rate limiting + Zod validation — identical to the existing
   `/api/grade` and `/api/prices/search` recipe. (Rejected: Server Actions —
   inconsistent with the codebase; DB-enforced RLS off Clerk JWT — meaningful
   side-quest no existing feature does yet.)
3. **Auth:** sign-in required.
4. **First-cut scope:** persist typed details + money info + alert flag now;
   defer photo files.
5. **Extra fields added now** (cheap now, painful to retrofit): richer identity
   (`card_number`, `parallel`, split `grading_service` + `grade`, `cert_number`)
   and basic P&L (`purchase_date`, `sale_price`, `sale_date`). Optional extras
   (`notes`, rookie/auto/relic flags, `serial_number`, watchlist `target_price`)
   explicitly left out of v1.

## Data model

Two new tables, both tied to the Clerk user via `user_id` (text — Clerk ids are
strings). Both carry the shared identity snapshot and the nullable catalog link.

### Shared identity snapshot (both tables)

These mirror `public.cards` field-for-field so the eBay backfill match is
deterministic:

- `player` (text, not null)
- `card_name` (text, not null)
- `set_name` (text)
- `year` (int)
- `card_number` (text)
- `parallel` (text, default `'Base'`)
- `grading_service` (text, nullable — one of PSA/BGS/SGC/CGC; null = Raw)
- `grade` (numeric(3,1), nullable — e.g. 10, 9.5; null = Raw)
- `sport` (text — UI label such as NBA/NFL/MLB; see Known inconsistency below)
- `catalog_card_id` (uuid, nullable, `REFERENCES public.cards(id) ON DELETE SET NULL`)

### `public.watchlist_items`

Shared identity snapshot, plus:

- `id` (uuid, pk, default `gen_random_uuid()`)
- `user_id` (text, not null)
- `legacy_catalog_id` (int, nullable) — the numeric `BROWSE_CATALOG` id, so
  Browse heart icons match against today's static catalog
- `alert_enabled` (boolean, not null, default false)
- `created_at` (timestamptz, not null, default now())
- **Unique** `(user_id, legacy_catalog_id)` — no double-watching a catalog card.
- Index on `user_id`.

Note: today's `BROWSE_CATALOG` does not carry `card_number` / `parallel`, so for
watched cards those columns stay empty until the catalog gets richer. The
columns are present regardless.

### `public.collection_items`

Shared identity snapshot, plus ownership/money:

- `id` (uuid, pk, default `gen_random_uuid()`)
- `user_id` (text, not null)
- `cert_number` (text, nullable) — the graded slab's certification number
- `price_paid` (numeric(10,2), nullable)
- `est_value` (numeric(10,2), nullable)
- `quantity` (int, not null, default 1, check `>= 1`)
- `already_sold` (boolean, not null, default false)
- `purchase_date` (date, nullable)
- `sale_price` (numeric(10,2), nullable)
- `sale_date` (date, nullable)
- `created_at` (timestamptz, not null, default now())
- Duplicates allowed (no unique constraint — a user may own multiples or log
  separately).
- Index on `user_id`.

### Known inconsistency to be aware of

`public.cards.sport` uses a narrow CHECK (`football`/`basketball`/`baseball`,
lowercase), while the frontend uses league labels (NBA/NFL/MLB/NHL/Soccer/WNBA/
UFC/MMA/Golf). The snapshot stores the **frontend label**; the canonical mapping
is resolved via `catalog_card_id` at backfill time. The `cards` CHECK will need
widening when the real catalog is built — out of scope here, noted for later.

## API endpoints

All follow the existing recipe: Clerk `auth()` → 401 if none; Upstash
fail-closed rate limit keyed on `userId`; Zod validation; service-role admin
client with every query scoped `.eq('user_id', userId)`.

**Collection**
- `GET /api/collection` — list the user's cards
- `POST /api/collection` — add a card
- `DELETE /api/collection/[id]` — remove one (ownership-checked)

**Watchlist**
- `GET /api/watchlist` — list watched cards
- `POST /api/watchlist` — watch a card (sends the snapshot; idempotent on the
  unique constraint)
- `DELETE /api/watchlist/[id]` — unwatch
- `PATCH /api/watchlist/[id]` — toggle `alert_enabled`

Business logic lives in thin, testable helpers; route files stay thin:

- `src/lib/collection/schema.ts` (Zod), `src/lib/collection/queries.ts`
  (`listCollection`, `addCollectionItem`, `deleteCollectionItem`)
- `src/lib/watchlist/schema.ts` (Zod), `src/lib/watchlist/queries.ts`
  (`listWatchlist`, `addWatchItem`, `removeWatchItem`, `setAlert`)

## Client wiring & data flow

- **`watchlist-context.tsx`** — replace localStorage with account-backed state.
  On mount (if signed in) fetch `GET /api/watchlist`. `toggle` takes the card's
  details (Browse already has them) to send a snapshot, updates the UI
  optimistically, then POST/DELETEs; reverts on failure. Signed-out → prompt
  sign-in.
- **`collection/page.tsx`** — load from `GET /api/collection`; Add modal POSTs;
  remove button DELETEs. Drop the ephemeral/mock behavior. Add modal grows
  inputs: card number, parallel, cert #, a grading-service picker beside grade
  (dropdown becomes service + grade so it saves split), purchase date, and sale
  price/date (shown when "already sold" is checked).
- **`watchlist/page.tsx`** — load from `GET /api/watchlist`; remove
  `MOCK_WATCHLIST`.
- **Data fetching:** plain `fetch` + React state. TanStack Query is in the
  intended stack but not installed in `apps/web`; not pulled in here to avoid
  scope creep (adopt app-wide later).

### Price honesty (no fabricated values)

- **Collection** shows the user's own numbers (paid / est. value / P&L vs. those)
  — user input, not fabricated market data. ✅
- **Watchlist** market-value / %-change columns and sparklines show a **"price
  pending"** state, not fake numbers. They activate once eBay data links in.
- Trade-off: the Watchlist page looks less "full" than today's mock demo until
  eBay lands. Accepted (honest placeholders per the CLAUDE.md rule).

## Error handling & edge cases

- **401** if not signed in (all endpoints, before any work).
- **Rate limit:** `429` when exceeded; `503` if the limiter backend is
  unreachable (fail-closed — never silently continue). Keyed on `userId`.
- **Validation (400, terse):** sane year range, `quantity >= 1`, non-negative
  prices, grade valid for the chosen service, `sale_price`/`sale_date` required
  only when `already_sold` is true. Do not leak the full Zod error contract.
- **Ownership:** delete/patch confirm the row belongs to the user; otherwise
  `404` (not `403`, to avoid revealing another user's row exists).
- **Duplicate watch:** handled as "already watching" via the unique constraint —
  no user-facing error.
- **Optimistic actions roll back** on failure with a brief error message.
- **Load failures** render a retry state, not a broken page.
- **Empty states** — friendly "add your first card" on both pages.

## Security

- Primary enforcement: route handlers scope every query to the Clerk `userId`
  (matches existing code, which uses the service-role client that bypasses RLS).
- Defense-in-depth: enable RLS on both new tables with no permissive policies so
  the public/anon key cannot read or write them — only the service-role backend
  can. (Existing pricing tables don't enable RLS; doing so here is a low-cost
  improvement.)
- Proper RLS keyed off a Clerk JWT claim is future, app-wide hardening — noted,
  not done here.

## Testing (Vitest, matching existing `__tests__` style)

- **Schema tests:** valid/invalid inputs; "sale price+date required when sold";
  grade-valid-for-service.
- **Query-layer tests:** mock the admin client; assert every read/write is
  scoped by `user_id`, delete/patch enforce ownership, duplicate-watch is
  handled.
- **Endpoint behavior:** 401 (no user), 429/503 (rate limit), 400 (bad input),
  happy path.

## Files created / touched

**New**
- `supabase/migrations/<timestamp>_user_tables.sql` — the two tables, indexes,
  RLS enable.
- `src/lib/collection/schema.ts`, `src/lib/collection/queries.ts`
- `src/lib/watchlist/schema.ts`, `src/lib/watchlist/queries.ts`
- `src/app/api/collection/route.ts`, `src/app/api/collection/[id]/route.ts`
- `src/app/api/watchlist/route.ts`, `src/app/api/watchlist/[id]/route.ts`
- Tests under the matching `__tests__` directories.

**Edited**
- `src/lib/supabase/types.ts` — add the new row types.
- `src/lib/watchlist-context.tsx` — account-backed.
- `src/app/collection/page.tsx` — load/add/remove + new modal fields.
- `src/app/watchlist/page.tsx` — load from API + "price pending" state.
- Reuse the `src/lib/rate-limit/prices.ts` pattern (generalize a helper if
  convenient).

## eBay upgrade path

1. **Today:** `catalog_card_id` empty; watchlist prices "pending"; collection
   shows the user's own numbers.
2. **eBay goes live:** populate `public.cards` with real graded cards + prices,
   then run a **one-time backfill** linking user rows to `cards.id` by matching
   the identity fields (player / set / year / card_number / parallel /
   grading_service / grade). New adds link on insert when a match exists.
   Because the snapshot columns mirror `cards` field-for-field, the match is
   deterministic.
3. **After:** Collection and Watchlist join through `catalog_card_id →
   price_snapshots` for real market value + history. No schema change, no user
   re-entry — the screens come alive.
