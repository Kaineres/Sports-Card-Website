---
type: source
tags: [data-source, ebay, api, pricing-pipeline, critical-path]
updated: 2026-05-23
raw: engineering/raw/2026-05-23-ebay-api-docs.md
source_url: https://developer.ebay.com (crawl blocked — assembled from search snippets and community forum summaries)
certainty: Certain
---

# eBay API Docs — Source Summary

## TL;DR
- Finding API (findCompletedItems) decommissioned February 2025 — gone permanently.
- Browse API replaces it but returns **active listings only** — no sold data.
- Marketplace Insights API is the only path to sold/completed item data — **Limited Release, pre-approved eBay business partners only**. Small developers routinely denied.
- Production access for Browse API requires eBay Partner Network (EPN) approval. Marketplace Insights requires separate eBay business unit approval.

## Key Claims

- Finding API and Shopping API deprecated 2024-01-04, decommissioned 2025-02-05. `[Certain]`
- Browse API is the official replacement — searches active listings only, no sold/completed item data. `[Certain]`
- Marketplace Insights API retrieves sales history of sold eBay items. Designated "Limited Release." Available only to select developers approved by eBay business units. `[Certain]`
- Community reports: small/independent developers are denied Marketplace Insights access. eBay staff response: "limited to approved partners, access can't be granted at this time." `[Certain — community reports]`
- Browse API production access requires eBay Partner Network (EPN) enrollment and approval based on business model. `[Certain]`
- Sandbox access is self-service and available to any registered developer. `[Certain]`
- Best Offer Accepted prices are not exposed via Browse API for completed listings — 130point surfaces these via some other mechanism. `[Certain]`
- OAuth scope for Marketplace Insights: `https://api.ebay.com/oauth/api_scope/buy.marketplace.insights`. `[Certain]`

## Pages Updated By This Source

- [[vendors/ebay-api]]
- [[vendors/130point]] — Best Offer Accepted finding reinforces 130point's data moat
