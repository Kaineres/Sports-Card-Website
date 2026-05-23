---
type: index
updated: 2026-05-19
---

# Engineering wiki — index

Catalog of pages in the Sports-Card-Website engineering sub-wiki. Updated on every ingest.

## Decisions

_(none yet — see [[decisions/0000-template]] for the ADR template)_

## Topics

- [[topics/architecture]] — system diagram, data flow _(stub)_
- [[topics/pricing-pipeline]] — pricing data sources, ingestion, validation _(stub)_
- [[topics/data-model]] — Postgres schema sketches _(stub)_

## Vendors

- [[vendors/130point]] — **critical-path data source**; free comp aggregator surfacing eBay Best Offer Accepted prices; B2B product (Card Pricing Direct) requires direct outreach; eBay API decommissioned Feb 2025 — Marketplace Insights approval required. `[Likely]` — [[sources/130point-data-source]]
- [[vendors/card-ladder]] — competitor; analytics/price guide with 100M+ sales since 2000, player index model, pop report integration. $20/mo Pro. Blocks crawlers. `[Likely]` — [[sources/cardladder-features]]
- [[vendors/market-movers]] — competitor; analytics + collection + alerts + Intelligence Reports (grade/variation ratio analysis). $9.99–$49.99/mo. 75k+ users. Strong community moat. `[Certain]` — [[sources/marketmovers-features]]
- [[vendors/collx]] — competitor; free scanner + peer marketplace + Pro subscription. Hobbyist framing. $9.99/mo Pro. Large free user base; WTP anchored at $0. `[Certain]` — [[sources/collx-pro-features]]
- [[vendors/alt]] — competitor; vertically integrated (portfolio + authenticated marketplace + physical vault). $106M raised. Targets $1k+ premium graded cards — underserves SlabMetrics beachhead. `[Likely]` — [[sources/alt-platform-features]]

## Sources

- [[sources/130point-data-source]] — 130point data source profile including eBay API deprecation risk. Ingested 2026-05-23.
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
