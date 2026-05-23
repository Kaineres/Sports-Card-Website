---
type: topic
tags: [pricing, data-pipeline]
updated: 2026-05-18
sources: []
certainty: Guessing
---

# Pricing pipeline

## For future Claude

This page covers the pricing data pipeline — data sources, ingestion flow, validation, and accuracy guarantees.
Current state: stub with placeholder structure — not yet authoritative; do not cite claims from this page.
When fleshed out it will contain: licensed data source details, ingestion architecture, timestamp/attribution requirements, and fabrication-detection rules.

_(Stub — to be filled out once pricing data sources are chosen. Pricing accuracy is the product, per the parent CLAUDE.md non-negotiables.)_

## TL;DR

Pending. Open decision in parent CLAUDE.md: data sources (eBay sold, 130point, PSA, COMC).

## Open questions

- Which sources are licensable for resale?
- How do we attribute and timestamp every price?
- How do we detect and reject fabricated or estimated values?

## See also

- [[company/business-plan]] — Section 5.3 defines the build sequence; comp lookup v1 is Months 1–3; pipeline must be live before the free-tier product ships
- [[concepts/population-report]] — PSA pop report changes are a candidate Buy/Hold/Sell signal; pipeline may need to ingest pop data in addition to comp data
- [[entities/psa]] — primary grading service and pop report source; eBay + 130point are the primary comp sources
- [[topics/architecture]] — comp ingestion sits within the broader system described here
- [[topics/data-model]] — schema for storing ingested comp records, sources, and timestamps
- [[vendors/ebay-api]] — critical-path comp data source; Marketplace Insights API approval is the primary blocker
- [[vendors/130point]] — comp data fallback and parallel track; Card Pricing Direct licensing conversation
