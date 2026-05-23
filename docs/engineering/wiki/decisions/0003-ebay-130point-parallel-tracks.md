---
type: decision
tags: [pricing-pipeline, ebay, 130point, data-sources, risk]
updated: 2026-05-23
sources: [[sources/ebay-api-docs]], [[sources/130point-data-source]]
certainty: Certain
---

# ADR 0003 — eBay + 130point comp data as parallel tracks

## TL;DR

Pursue eBay Marketplace Insights API approval and 130point Card Pricing Direct licensing simultaneously — never serially. These are parallel tracks, not primary + fallback.

## Context

SlabMetrics' free-tier comp lookup requires access to eBay sold listing data. The obvious path — eBay's API — has a critical blocker: the Finding API was decommissioned February 2025. The only remaining path to eBay sold data is the **Marketplace Insights API**, which is:

- Designated "Limited Release" — not publicly available
- Available only to pre-approved eBay business partners
- Routinely denied to small/independent developers

An alternative exists: **130point**, a free comp aggregator that built its product on top of eBay sold data. Their B2B product (Card Pricing Direct) licenses comp data including **Best Offer Accepted prices** — actual transaction prices that eBay's own UI hides (showing listing price instead). This data cannot be replicated even with Marketplace Insights API access alone.

The original instinct was to pursue eBay first and treat 130point as a fallback if eBay fails. This is wrong.

## Decision

**Both tracks run simultaneously from day one.**

- Apply to eBay Marketplace Insights API immediately with a business case framed as "decision intelligence for card investors, not a competing marketplace"
- Contact 130point about Card Pricing Direct pricing and terms in the same week
- Do not wait on one before pursuing the other

If both succeed: use eBay as primary, 130point as data quality enhancement (Best Offer Accepted reconciliation).
If only eBay succeeds: still need 130point for Best Offer Accepted price accuracy.
If only 130point succeeds: 130point becomes the primary comp source.
If neither succeeds: escalate to fallback sources (COMC, MySlabs, CardCensus) per business plan Risk #3.

## Alternatives considered

**eBay first, 130point if denied** — Rejected. eBay Marketplace Insights approval timeline is unknown and denial risk is high. Serializing the tracks means 130point outreach starts months later. Parallel pursuit costs almost nothing (one email vs. one application) and eliminates the delay risk entirely.

**130point only** — Rejected. If 130point licensing is expensive or unavailable, having eBay direct access as a backup is valuable. Also, direct eBay access enables richer data (real-time, full listing metadata) that 130point may not expose.

**Scraping eBay directly** — Rejected. Against eBay ToS. Creates legal risk and technical fragility (scrapes break on site changes). Not a viable production path.

## Consequences

**Enables:**
- Faster time to comp data access — whichever track closes first unblocks the free-tier product
- Best Offer Accepted price accuracy (only achievable via 130point)
- Reduced Risk #3 exposure from the business plan

**Costs:**
- Two simultaneous outreach tracks to manage
- Two potential licensing/contract negotiations

**Locks us into:**
- Nothing — this decision keeps options open, not closes them

## Status

Active. Neither application has been submitted as of 2026-05-23.

## See also

- [[vendors/ebay-api]] — full eBay API access landscape; two-gate approval process
- [[vendors/130point]] — 130point data source profile; Card Pricing Direct B2B product
- [[topics/pricing-pipeline]] — the pipeline this decision feeds into
- [[company/business-plan]] — Risk #3: "Data access fails (eBay production rejected + 130point unworkable)"
