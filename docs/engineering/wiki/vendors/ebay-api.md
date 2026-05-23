---
type: vendor
tags: [data-source, ebay, api, pricing-pipeline, critical-path]
updated: 2026-05-23
sources: [[sources/ebay-api-docs]]
certainty: Certain
---

# eBay API

## For future Claude
eBay is the primary source of sports card comp data for SlabMetrics' free-tier comp lookup. This page documents the current API access landscape after the 2025 Finding API decommission. Relevant when: designing the comp ingestion pipeline, evaluating access options, assessing production approval status, or understanding why 130point exists as a necessary intermediary.
Key fact: The old findCompletedItems API is gone. The only remaining path to eBay sold data is the Marketplace Insights API — which is gatekept for pre-approved eBay business partners. Small developers are routinely denied. This is Risk #3 in the business plan.

## TL;DR

eBay sold-listing data is now behind two approval gates: eBay Partner Network (Browse API production) and a separate eBay business unit approval (Marketplace Insights API). The Finding API that powered 130point and competitors for years was decommissioned February 2025. `[Certain]` — [[sources/ebay-api-docs]]

## Current API Landscape

### Browse API (active listings only)

- Searches active eBay listings. Keyword search, category filters, condition, price, seller.
- **Does not return sold/completed items.** Active listings only.
- Production access: requires eBay Partner Network (EPN) enrollment and approval.
- EPN evaluates proposed business model before granting access.
- Sandbox: self-service, available to any registered developer immediately.
- Useful for SlabMetrics "what's currently for sale at what price" queries — not for comp lookup.

`[Certain]` — [[sources/ebay-api-docs]]

### Marketplace Insights API (sold data — gatekept)

- Returns sales history of items sold on eBay.
- **The only official API path to eBay sold/completed listing data.**
- Designated "Limited Release" — not publicly available.
- Access requires separate approval from eBay business units (beyond EPN).
- OAuth scope: `https://api.ebay.com/oauth/api_scope/buy.marketplace.insights`
- Community reports: small and independent developers are routinely denied. eBay staff: "limited to approved partners and access can't be granted at this time."
- Best path: direct application to eBay developer support with a clear business case.

`[Certain]` — [[sources/ebay-api-docs]]

### Finding API / Shopping API — DECOMMISSIONED

| API | Deprecated | Decommissioned |
|---|---|---|
| Finding API (findCompletedItems, findItemsAdvanced) | 2024-01-04 | **2025-02-05** |
| Shopping API | 2024-01-04 | **2025-02-05** |

These are gone. Any code or integration written against them no longer works. `[Certain]` — [[sources/ebay-api-docs]]

## Best Offer Accepted Prices

eBay's UI shows the original listing price for Best Offer Accepted transactions — not the actual accepted price. This makes raw eBay sold data misleading for comp purposes.

The actual price is buried in the listing page source (`taxexc` field). 130point built their core value prop around surfacing these real prices. The Browse API does not expose this field for completed listings. `[Certain]` — [[sources/ebay-api-docs]]

This means even if SlabMetrics gets Browse API production access, it can't reproduce 130point's comp accuracy without Marketplace Insights or a data licensing deal.

## Access Status for SlabMetrics

| Access type | Status | Notes |
|---|---|---|
| Sandbox | Obtained | Business plan: "eBay developer sandbox keys obtained" |
| Browse API production (EPN) | Pending | "Production access pending compliance" — actually pending EPN approval |
| Marketplace Insights production | Not applied | Must apply separately to eBay business unit |

## Risk Assessment

**HIGH risk**: Marketplace Insights API approval for a pre-revenue startup is far from guaranteed. eBay has denied independent developers. The business case must be compelling.

**Medium risk**: Browse API EPN approval is more accessible but still not automatic. Timeline unknown.

**Mitigation**: Pursue 130point Card Pricing Direct licensing in parallel. If eBay access is delayed or denied, 130point is the fallback. Do not serialize these — run both tracks simultaneously. `[Certain — reasoning]` — [[sources/ebay-api-docs]], [[company/business-plan]]

## Action Items

- [ ] Apply to eBay developer support specifically for Marketplace Insights API access — separate from the EPN/Browse API application
- [ ] Prepare business case: decision intelligence platform, not a competing marketplace, serves card investors
- [ ] Contact 130point Card Pricing Direct in parallel — do not wait on eBay
- [ ] Verify EPN application status and expected timeline

## See also

- [[vendors/130point]] — primary fallback if Marketplace Insights denied; also surfaces Best Offer Accepted prices that Browse API cannot.
- [[topics/pricing-pipeline]] — comp ingestion architecture that depends on this access.
- [[topics/data-model]] — comp data schema; what fields eBay returns drives the schema design.
- [[vendors/card-ladder]] — competitor that already has eBay data access; benchmarks what comp lookup should look like.
- [[vendors/market-movers]] — competitor that already has eBay data access.
- [[company/business-plan]] — Section 12 Risk #3: "Data access fails (eBay production rejected + 130point unworkable)."
- [[concepts/population-report]] — PSA pop report data is a separate pipeline dependency from eBay comp data; the two signals (comp prices + grade scarcity) combine in the recommendation engine
- [[entities/psa]] — PSA is the primary grading service whose comps drive eBay sold-listing value; PSA-graded cards are the primary comp lookup use case for v1
