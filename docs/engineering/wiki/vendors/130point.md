---
type: vendor
tags: [data-source, comp-data, ebay, pricing-pipeline, critical-path]
updated: 2026-05-23
sources: [[sources/130point-data-source]]
certainty: Likely
---

# 130point

## For future Claude
130point is the primary candidate comp data source for SlabMetrics' free-tier pricing pipeline. Relevant when: designing the comp ingestion pipeline, evaluating eBay API access options, assessing data source risk, or preparing for the 130point business development conversation referenced in the business plan.
Key fact: eBay's public Finding API was decommissioned in February 2025 — the only remaining path to eBay sold data is eBay's Marketplace Insights API (pre-approved vendors) or a data licensing deal with an intermediary like 130point. This is a critical dependency for SlabMetrics' entire comp-lookup product.

## TL;DR

130point is the longest-running free sports card pricing tool, surfacing actual eBay "Best Offer Accepted" prices that eBay's UI hides. Primary comp data source candidate for SlabMetrics. B2B data product ("Card Pricing Direct") exists but requires direct outreach. eBay API access situation is the critical pipeline risk. `[Likely]` — [[sources/130point-data-source]]

## What It Does

Aggregates sold and active listings from eBay, Fanatics Collect, Goldin, MySlabs, Pristine Auctions, and Heritage Auctions. `[Certain]` — [[sources/130point-data-source]]

Core differentiator: surfaces the **actual accepted price** for eBay Best Offer sales. eBay's default sold-items view shows the original listing price — not the offer price — making it systematically misleading for comp research. `[Certain]` — [[sources/130point-data-source]]

## Products

| Product | Details |
|---|---|
| Free web/mobile tool | Keyword search, actual sale prices, filters, collection tracking. No subscription. |
| Card Pricing Direct (`130point.com/direct`) | B2B product — details not publicly documented. Likely a data licensing or API offering for developers. Requires direct outreach. |

`[Certain — products exist; Guessing — Card Pricing Direct details]` — [[sources/130point-data-source]]

## Critical Risk: eBay API Access

eBay's Finding API (the traditional path to completed/sold items) was deprecated in January 2024 and **decommissioned February 2025**. `[Certain]` — [[sources/130point-data-source]]

The only remaining eBay sold-data API path is the **Marketplace Insights API**, which is restricted to pre-approved vendors only. `[Certain]` — [[sources/130point-data-source]]

130point is still functioning in 2026 — meaning they have either:
- eBay Marketplace Insights API approval (most likely), or
- An alternative non-API data arrangement. `[Likely]`

### Implication for SlabMetrics comp pipeline

SlabMetrics cannot access eBay sold listings directly via API without eBay's explicit Marketplace Insights approval. The business plan notes "eBay developer sandbox keys obtained; production access pending compliance" — this is the gating issue.

**Parallel tracks to run:**
1. Pursue eBay Marketplace Insights API production approval (current path)
2. Contact 130point about Card Pricing Direct licensing terms
3. Keep CardCensus and MySlabs warm as fallbacks

`[Certain — reasoning from known eBay policy]` — [[sources/130point-data-source]]

## Known Limitations

- Coverage gaps: not all eBay sales appear, especially for low-activity/rare cards. `[Certain]`
- Best Offer Accepted prices shown, but confirmed payment not verified (Terapeak is more authoritative on this). `[Certain]`
- Limited filtering: no date-range filter, no seller filter on the free tool. `[Certain]`
- Set/checklist data outdated per third-party reviewers. `[Likely]`

`[All above]` — [[sources/130point-data-source]]

## Action Items

- [ ] Contact 130point directly about Card Pricing Direct: what's offered, pricing, licensing terms, API vs. data feed format
- [ ] Determine whether eBay production access (Marketplace Insights) or 130point licensing is the primary path — pursue both in parallel per the business plan
- [ ] Verify current 130point data coverage for basketball, football, baseball (v1 scope sports)

## See also

- [[topics/pricing-pipeline]] — comp ingestion is the core infrastructure this page feeds.
- [[topics/data-model]] — how comp data is stored; `pop_reports` and comp tables are adjacent schemas.
- [[vendors/card-ladder]] — competitor that also aggregates eBay + other marketplace data; they solved the same API access problem.
- [[vendors/market-movers]] — competitor using eBay + Goldin + Heritage + others; same pipeline problem solved.
- [[company/business-plan]] — Section 5 build sequence: comp pipeline is the Months 1–2 focus; Section 12 risk #3: "data access fails (eBay production rejected + 130point unworkable)."
- [[concepts/population-report]] — pop report data (PSA, BGS) is a complementary signal to the comp data 130point provides; pipeline will likely ingest both
- [[entities/psa]] — PSA comp data and PSA pop report are the two primary data dependencies; 130point provides one leg of the comp data
