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

- [[business-plan]] — Section 5.3 defines the build sequence; comp lookup v1 is Months 1–3; pipeline must be live before the free-tier product ships
- [[population-report]] — PSA pop report changes are a candidate Buy/Hold/Sell signal; pipeline may need to ingest pop data in addition to comp data
- [[psa]] — primary grading service and pop report source; eBay + 130point are the primary comp sources
- [[architecture]] — comp ingestion sits within the broader system described here
- [[data-model]] — schema for storing ingested comp records, sources, and timestamps
