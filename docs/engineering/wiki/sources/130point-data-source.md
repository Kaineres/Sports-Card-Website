---
type: source
tags: [data-source, comp-data, ebay, pricing-pipeline]
updated: 2026-05-23
raw: engineering/raw/2026-05-23-130point-data-source.md
source_url: https://130point.com (crawl blocked — assembled from third-party reviews, community forums, eBay developer docs)
certainty: Likely
---

# 130point — Data Source Profile (Source Summary)

## TL;DR
- 130point is the primary free sports card comp tool; its core value is surfacing actual eBay "Best Offer Accepted" prices that eBay hides from default sold listings.
- Aggregates from eBay, Fanatics Collect, Goldin, MySlabs, Pristine Auctions, Heritage. Free consumer tier; B2B product ("Card Pricing Direct") exists but details require direct outreach.
- **Critical risk**: eBay's Finding API decommissioned Feb 2025; only Marketplace Insights API (pre-approved vendors) remains. SlabMetrics needs either eBay production approval or a 130point licensing deal.

## Key Claims

- Surfaces eBay "Best Offer Accepted" actual sale prices — the core differentiator vs. eBay UI. `[Certain]`
- Aggregates: eBay, Fanatics Collect, Goldin, MySlabs, Pristine Auctions, Heritage. `[Certain]`
- Free on web and mobile, no subscription required for pricing. `[Certain]`
- "Card Pricing Direct" product exists at 130point.com/direct — B2B/developer offering. Details not publicly documented. `[Certain — product exists; Guessing — it's a licensing/API product]`
- eBay Finding API deprecated 2024-01-04, decommissioned 2025-02-05. `[Certain]` — eBay developer docs
- Only remaining eBay sold-data API path: Marketplace Insights API, pre-approved vendors only. `[Certain]` — eBay developer docs
- 130point is still functional in 2026 — implies approved eBay access or an alternative data arrangement. `[Likely]`
- Known gaps: incomplete sales coverage for low-activity cards; no confirmed-payment verification (Terapeak is more authoritative). `[Certain]`

## Pages Updated By This Source

- [[vendors/130point]]
