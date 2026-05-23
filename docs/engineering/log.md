# Engineering wiki — log

Chronological, append-only.

## [2026-05-18] init | engineering wiki seeded

- created `index.md`, `log.md`
- stub topic pages: [[topics/architecture]], [[topics/pricing-pipeline]], [[topics/data-model]]
- ADR template: [[decisions/0000-template]]
- empty directories: `raw/`, `raw/assets/`, `wiki/vendors/`, `wiki/sources/`, `wiki/scratch/`, `wiki/synthesis/`

## [2026-05-23] ingest | eBay API documentation

- source: [[sources/ebay-api-docs]]
- raw: `engineering/raw/2026-05-23-ebay-api-docs.md`
- new pages: [[vendors/ebay-api]]
- updated pages: `index.md`; [[vendors/130point]] (Best Offer Accepted finding reinforces 130point's data moat)
- contradictions flagged: none
- critical finding: Finding API decommissioned Feb 2025. Only Marketplace Insights API has sold data — Limited Release, pre-approved eBay partners only. Small developers routinely denied. Browse API (EPN approval) returns active listings only — cannot build comp lookup on it alone. SlabMetrics must pursue both eBay Marketplace Insights approval and 130point Card Pricing Direct in parallel, not serially.
- developer.ebay.com and community.ebay.com both block crawlers; content assembled from search snippets and community forum summaries.

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

## [2026-05-23] ingest | Kalshi and Polymarket API documentation

- sources: [[sources/kalshi-api-docs]], [[sources/polymarket-api-docs]]
- raw: `engineering/raw/2026-05-23-kalshi-api-docs.md`, `engineering/raw/2026-05-23-polymarket-api-docs.md`
- new pages: [[vendors/kalshi]], [[vendors/polymarket]]
- updated pages: `index.md` (Vendors and Sources sections updated with both prediction-market data sources)
- contradictions flagged: none
- critical finding: Both Kalshi and Polymarket provide public market data with **zero authentication required** — frictionless Wedge Signal #1 data sources. Kalshi is CFTC-regulated; Polymarket has higher volume. Both have sports player-level markets relevant to card demand signals. Key gotcha: Polymarket sports orders auto-cancel at game start — read-only polling unaffected. Sports-specific tickers/tag IDs must be inventoried before signal pipeline can be designed.

## [2026-05-23] cross-link | vault backlink audit applied

- fixes applied: 14 files edited (business-plan, 3 topic stubs, 8 vendor pages, 3 cards wiki pages)
- issues resolved: broken bare-stem links in topic stubs, missing business-plan→vendor backlinks, missing cross-wiki See also entries
- orphan improvement: source pages remain source-side only (design decision — source pages are intentionally minimal bridges)
- method: cross-linker agent audit → user approved all fixes → applied in batch

## [2026-05-19] scratch | n8n for wiki-ingest automation

- filed as: [[scratch/n8n-wiki-ingest-automation]]
- trigger: parked an idea surfaced during the cards-wiki PSA/BGS/SGC manual-clipping sessions — n8n's headless-browser nodes could automate the multi-tab clipping pattern once n8n is being set up for the pricing pipeline.
- updated pages: `index.md` (scratch section now lists this note).
- not promoted: stays in `scratch/` until n8n is actually being stood up for the pricing pipeline; promote then.
