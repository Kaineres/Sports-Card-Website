# Engineering wiki — log

Chronological, append-only.

## [2026-05-18] init | engineering wiki seeded

- created `index.md`, `log.md`
- stub topic pages: [[topics/architecture]], [[topics/pricing-pipeline]], [[topics/data-model]]
- ADR template: [[decisions/0000-template]]
- empty directories: `raw/`, `raw/assets/`, `wiki/vendors/`, `wiki/sources/`, `wiki/scratch/`, `wiki/synthesis/`

## [2026-05-23] ingest | 130point data source profile

- source: [[sources/130point-data-source]]
- raw: `engineering/raw/2026-05-23-130point-data-source.md`
- new pages: [[vendors/130point]]
- updated pages: `index.md` (130point added to Vendors and Sources)
- contradictions flagged: none
- critical finding: eBay Finding API decommissioned Feb 2025 — only Marketplace Insights API (pre-approved vendors) remains. SlabMetrics needs eBay production approval or 130point Card Pricing Direct licensing deal. Both tracks should run in parallel. Direct crawl of 130point.com blocked (HTTP 403); Card Pricing Direct product details require direct outreach.

## [2026-05-23] ingest | competitor intelligence (Card Ladder, Market Movers, CollX, Alt)

- sources: [[sources/cardladder-features]], [[sources/marketmovers-features]], [[sources/collx-pro-features]], [[sources/alt-platform-features]]
- raw: `engineering/raw/2026-05-23-cardladder-features.md`, `engineering/raw/2026-05-23-marketmovers-features.md`, `engineering/raw/2026-05-23-collx-pro-features.md`, `engineering/raw/2026-05-23-alt-platform-features.md`
- new pages: [[vendors/card-ladder]], [[vendors/market-movers]], [[vendors/collx]], [[vendors/alt]]
- updated pages: `index.md` (Vendors and Sources sections populated for first time)
- notes: Card Ladder blocks automated crawlers (HTTP 403) — raw file assembled from search snippets and App Store/Zendesk listings; direct manual crawl recommended before launch competitive review. Alt's alt.xyz is JavaScript-rendered — sourced from third-party review + moneymade.io fee data; fee structure should be verified manually.
- contradictions flagged: none

## [2026-05-19] scratch | n8n for wiki-ingest automation

- filed as: [[scratch/n8n-wiki-ingest-automation]]
- trigger: parked an idea surfaced during the cards-wiki PSA/BGS/SGC manual-clipping sessions — n8n's headless-browser nodes could automate the multi-tab clipping pattern once n8n is being set up for the pricing pipeline.
- updated pages: `index.md` (scratch section now lists this note).
- not promoted: stays in `scratch/` until n8n is actually being stood up for the pricing pipeline; promote then.
