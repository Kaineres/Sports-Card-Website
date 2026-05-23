<!-- sources: 130point.com (crawl blocked 403), cardcollecting101.com/tools/130-point/, 10kcardjourney.blog/2025/04/03/why-130point-is-an-essential-tool-for-card-collectors/, forums.collectors.com/discussion/1045021, developer.ebay.com/api-docs/buy/static/api-insights.html, x.com/SCUncensored/status/1823900468612915533 | captured: 2026-05-23 -->

# 130point — Data Source Profile

## What 130point is

130point (130point.com) is the longest-running free sports card and collectibles pricing tool, self-described as "the most trusted" in the industry. Primary value: surfaces actual eBay "Best Offer Accepted" prices, which eBay's default sold-items UI hides (shows the original listing price instead of the accepted offer price). This makes 130point indispensable for true comp data — without it, eBay sold listings systematically overstate card values.

Name origin: "130 point" refers to the card thickness (in thousandths of an inch) for thick memorabilia/relic inserts.

## What it aggregates

Sold and active listings from:
- eBay (primary — including Best Offer Accepted prices)
- Fanatics Collect
- Goldin
- MySlabs
- Pristine Auctions
- Heritage Auctions

## Key features (consumer/free tier)

- Keyword search across sold and active listings
- Actual sale prices including eBay Best Offer Accepted (the core differentiator)
- Filtering by grading company, card type, marketplace
- Historical data for tracking price trends over time
- Collection tracking: current value, total paid, gain/loss, ROI
- Set/player checklists (noted by third-party reviewers as somewhat outdated)
- Free on web and mobile (iOS and Android)
- No subscription required for core pricing features

## Card Pricing Direct (130point.com/direct)

130point offers a B2B product called "Card Pricing Direct" at 130point.com/direct. Direct crawl blocked (HTTP 403). No public documentation found. This is almost certainly their data licensing/API product for developers and businesses. Details require direct outreach to 130point.

## eBay API situation — CRITICAL RISK for SlabMetrics pricing pipeline

### Background

In October 2020, eBay announced it was restricting API access to sales history. The traditional FindingAPI (findCompletedItems call) was restricted to eBay-approved vendors only. 130point survived this — believed to have applied for and received eBay Marketplace Insights API access.

### Current state (as of 2025–2026)

- eBay's Finding API and Shopping API were **deprecated 2024-01-04** and **decommissioned 2025-02-05**.
- The only remaining API path to completed/sold item data is the **Marketplace Insights API** — which is limited to a **select group of pre-approved vendors**.
- 130point is still functional as of 2026, indicating they maintained approved access through some arrangement with eBay.

### Implications for SlabMetrics

1. **SlabMetrics cannot directly access eBay sold listings via API without eBay's Marketplace Insights approval.** The old Finding API path is gone. The business plan notes "eBay developer sandbox keys obtained; production access pending compliance" — this is the approval process referenced.
2. **If eBay production approval is denied or delayed**, 130point's Card Pricing Direct becomes the primary comp data path — a B2B licensing deal, not an API integration.
3. **130point as a comp source has known gaps**: Not all eBay sales appear (possible coverage gaps for rare/low-activity cards). Best Offer Accepted prices shown, but confirmed payment not guaranteed (Terapeak is more authoritative on payment confirmation).

## Limitations noted by users

1. Incomplete sales data: not all eBay sales appear, especially for rare/low-activity cards.
2. Limited filtering: no date-range filter, no seller filter.
3. Best Offer Accepted prices may not reflect confirmed paid transactions (vs. Terapeak which confirms payment).
4. Set/checklist data is outdated per third-party reviewers.

## Summary risk assessment

| Scenario | Comp data path |
|---|---|
| eBay production API approved | Direct eBay Marketplace Insights API integration |
| eBay approval delayed/denied | 130point Card Pricing Direct licensing deal |
| Both fail | CardCensus, MySlabs, COMC as fallbacks (per business plan risk section) |

Direct outreach to 130point about Card Pricing Direct should happen in parallel with eBay production access application — the business plan lists this under Months 1–2.
