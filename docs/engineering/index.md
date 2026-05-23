---
type: index
updated: 2026-05-23
---

# Engineering wiki — index

Catalog of pages in the Sports-Card-Website engineering sub-wiki. Updated on every ingest.

## Decisions

- [[decisions/0001-clerk-over-supabase-auth]] — Clerk handles all auth; Supabase Auth disabled; RLS keys off Clerk JWT `sub` claim. `[Certain]`
- [[decisions/0002-nextjs-app-router]] — Next.js 16 App Router; Server Components default; `"use client"` for islands only; card pages SSG/ISR for SEO. `[Certain]`
- [[decisions/0003-ebay-130point-parallel-tracks]] — eBay Marketplace Insights + 130point Card Pricing Direct run simultaneously; never serialize. `[Certain]`

_(See [[decisions/0000-template]] for the ADR template.)_

## Topics

- [[topics/architecture]] — full tech stack, component map, data flow, Clerk+Supabase RLS wiring, non-negotiables
- [[topics/pricing-pipeline]] — comp data sources (eBay + 130point parallel tracks), wedge signal architecture, n8n orchestration sketch, accuracy non-negotiables
- [[topics/data-model]] — Postgres table sketches (cards, comps, collections, watchlist, recommendations, subscriptions, pop_snapshots), RLS pattern

## Vendors

- [[vendors/ebay-api]] — **critical-path data source**; Finding API decommissioned Feb 2025; Browse API (active listings only, EPN approval); Marketplace Insights API (sold data, Limited Release, partner approval only). `[Certain]` — [[sources/ebay-api-docs]]
- [[vendors/130point]] — **critical-path data source**; free comp aggregator surfacing eBay Best Offer Accepted prices; B2B product (Card Pricing Direct) requires direct outreach; eBay API decommissioned Feb 2025 — Marketplace Insights approval required. `[Likely]` — [[sources/130point-data-source]]
- [[vendors/kalshi]] — **Wedge Signal #1 data source**; CFTC-regulated US prediction market; public market data requires no auth; 200 req/sec free; sports player-level markets (passing yards, TDs, MVP) are leading indicators for card demand. `[Certain]` — [[sources/kalshi-api-docs]]
- [[vendors/polymarket]] — **Wedge Signal #1 data source**; world's largest prediction market by volume; Gamma API requires no auth; sports endpoints (`/sports`, `/sports/market-types`); sports orders auto-cancel at game start. `[Certain]` — [[sources/polymarket-api-docs]]
- [[vendors/card-ladder]] — competitor; analytics/price guide with 100M+ sales since 2000, player index model, pop report integration. $20/mo Pro. Blocks crawlers. `[Likely]` — [[sources/cardladder-features]]
- [[vendors/market-movers]] — competitor; analytics + collection + alerts + Intelligence Reports (grade/variation ratio analysis). $9.99–$49.99/mo. 75k+ users. Strong community moat. `[Certain]` — [[sources/marketmovers-features]]
- [[vendors/collx]] — competitor; free scanner + peer marketplace + Pro subscription. Hobbyist framing. $9.99/mo Pro. Large free user base; WTP anchored at $0. `[Certain]` — [[sources/collx-pro-features]]
- [[vendors/alt]] — competitor; vertically integrated (portfolio + authenticated marketplace + physical vault). $106M raised. Targets $1k+ premium graded cards — underserves SlabMetrics beachhead. `[Likely]` — [[sources/alt-platform-features]]

## Sources

- [[sources/ebay-api-docs]] — eBay API landscape post-Finding API decommission; Marketplace Insights access requirements. Ingested 2026-05-23.
- [[sources/130point-data-source]] — 130point data source profile including eBay API deprecation risk. Ingested 2026-05-23.
- [[sources/kalshi-api-docs]] — Kalshi Trade API: no-auth public market data, rate limits, sports market hierarchy. Ingested 2026-05-23.
- [[sources/polymarket-api-docs]] — Polymarket Gamma API: no-auth market data, sports endpoints, game-start order cancellation. Ingested 2026-05-23.
- [[sources/cardladder-features]] — Card Ladder features and pricing (assembled from search/listings; direct crawl blocked). Ingested 2026-05-23.
- [[sources/marketmovers-features]] — Market Movers homepage features and pricing. Ingested 2026-05-23.
- [[sources/collx-pro-features]] — CollX Pro features and pricing page. Ingested 2026-05-23.
- [[sources/alt-platform-features]] — Alt platform features (third-party review + fee data; alt.xyz is JS-rendered). Ingested 2026-05-23.

## Scratch

- [[scratch/n8n-wiki-ingest-automation]] — parked idea: use n8n's headless-browser nodes to automate the multi-tab clipping pattern when the pricing-pipeline n8n setup starts. `[Guessing]` — no source.

## Synthesis

_(none yet)_

## Related

- [[company/index]] — business plan and founders' agreement that define what this engineering wiki is building toward
