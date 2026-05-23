---
type: topic
tags: [pricing, data-pipeline, ebay, 130point, n8n, wedge-signals]
updated: 2026-05-23
sources: []
certainty: Likely
---

# Pricing pipeline

## For future Claude
This page covers the SlabMetrics pricing data pipeline — data sources, ingestion architecture, signal generation, and accuracy guarantees. Relevant when: designing the comp ingestion flow, evaluating data source access, understanding the wedge signal architecture, or assessing why 130point is a parallel track not a fallback.
Key constraint: **pricing accuracy is the product**. Every price must have a source and a timestamp. No estimated or fabricated values can be surfaced to users.
Key blocker: eBay Marketplace Insights API approval is the primary gating item for comp lookup. 130point Card Pricing Direct must be pursued in parallel — not after.

## TL;DR

Two parallel tracks deliver comp data: (1) eBay Marketplace Insights API (if approved) and (2) 130point Card Pricing Direct (B2B licensing). n8n orchestrates ingestion. Five candidate wedge signals feed the Buy/Hold/Sell recommendation engine. Neither eBay track nor 130point can be serialized — both must be pursued simultaneously. `[Certain]` — [[vendors/ebay-api]], [[vendors/130point]], [[company/business-plan]].

## Comp data sources

### Track 1 — eBay Marketplace Insights API

The only official API path to eBay sold/completed listing data. `[Certain]` — [[vendors/ebay-api]].

| Item | Status |
|---|---|
| Sandbox access | Obtained |
| Browse API production (EPN) | Pending EPN approval |
| Marketplace Insights API | Not yet applied — requires separate eBay business unit approval |

**Risk: HIGH.** Small/independent developers are routinely denied Marketplace Insights access. Must apply with a compelling business case (decision intelligence for card investors, not a competing marketplace). `[Certain]` — [[vendors/ebay-api]].

**Best Offer Accepted gap**: eBay UI shows listing price, not actual accepted price, for Best Offer transactions. The real price requires the `taxexc` field in listing HTML — not accessible via Browse API. `[Certain]` — [[vendors/ebay-api]].

### Track 2 — 130point Card Pricing Direct

130point is a free comp aggregator that surfaces actual eBay Best Offer Accepted prices (the data eBay hides). Their B2B product (Card Pricing Direct) is the primary mitigation if eBay Marketplace Insights is denied. `[Likely]` — [[vendors/130point]].

- Requires direct outreach to 130point — pricing and terms not public.
- Must be contacted in parallel with eBay application, not after.
- 130point's data moat is specifically the Best Offer Accepted price surfacing that the standard eBay API cannot replicate. `[Certain]` — [[vendors/130point]].

### Parallel track rule

Do not serialize these. Risk #3 in the business plan is "both eBay production rejected AND 130point unworkable." Running both tracks simultaneously keeps fallback options open. `[Certain]` — [[company/business-plan]].

## Wedge signals (Buy/Hold/Sell recommendation engine)

Five candidate signals being evaluated in the 90-day experiment. All are inputs to the recommendation engine, not the comp lookup itself.

| # | Signal | Data source | Access |
|---|---|---|---|
| 1 | Prediction market movements | [[vendors/kalshi]], [[vendors/polymarket]] | No auth required — frictionless |
| 2 | Player injury status | TBD (Sportradar, ESPN API) | Not yet researched |
| 3 | Season phase | Internal calendar logic | No external dependency |
| 4 | Pop report changes | PSA API (not yet ingested) | Access TBD |
| 5 | Frequency-of-sale velocity | eBay comp data (same as Track 1/2) | Depends on comp access |

Signal #1 is the most frictionless: Kalshi and Polymarket both provide public market data with zero authentication. `[Certain]` — [[vendors/kalshi]], [[vendors/polymarket]].

Signal #2 and Signal #4 have no engineering documentation yet — data source research needed before pipeline design. `[Guessing]`

## Pipeline architecture (sketch)

```
Comp data:
  eBay Marketplace Insights API / 130point Card Pricing Direct
    → n8n HTTP Request node (scheduled)
      → validation (source + timestamp required, no nulls)
        → Supabase comps table

Wedge signals:
  Kalshi/Polymarket APIs (polled daily, no auth)
  PSA pop report API (polled weekly, TBD)
  Injury APIs (near real-time during season, TBD)
    → n8n signal nodes
      → Supabase recommendations table (Buy/Hold/Sell + signal scores)

Rate limiting:
  All external API calls → Upstash rate limiter before execution
```

`[Likely — pre-MVP sketch; subject to revision once data source contracts are in place]`

## Accuracy non-negotiables

Per CLAUDE.md: **pricing accuracy is the product.**

- Every comp record must have: `source` (ebay / 130point / etc.), `sourced_at` (timestamp), `card_id`, `price`, `grading_service`, `grade`.
- No estimated or interpolated prices shown to users.
- If a source is unavailable, surface "no recent comps" — never fabricate.
- Best Offer Accepted prices must be flagged as such (they represent actual transaction prices, not listing prices). `[Certain]`

## Open questions

- Which n8n node type handles eBay / 130point API calls? (HTTP Request node, likely — but n8n docs not yet ingested.)
- What is the comp freshness window? (How old can a comp be before it's excluded from the lookup?)
- Deduplication: if both eBay and 130point return the same sale, how do we merge?
- How do we handle eBay auctions vs. Buy It Now vs. Best Offer Accepted differently in the schema?

## Action items

- [ ] Apply for eBay Marketplace Insights API access — separate from EPN application
- [ ] Contact 130point about Card Pricing Direct licensing
- [ ] Ingest n8n docs to understand pipeline orchestration capabilities
- [ ] Research player injury APIs (Wedge Signal #2) — Sportradar, ESPN, FantasyPros
- [ ] Research PSA pop report API (Wedge Signal #4)

## See also

- [[company/business-plan]] — Section 5.3: comp lookup v1 is Months 1–3; pipeline must be live before free-tier ships
- [[topics/architecture]] — pipeline is a subsystem of the broader system
- [[topics/data-model]] — `comps` and `recommendations` tables that the pipeline writes to
- [[vendors/ebay-api]] — Track 1 comp source; Marketplace Insights API is the blocker
- [[vendors/130point]] — Track 2 comp source; Card Pricing Direct is the parallel track
- [[vendors/kalshi]] — Wedge Signal #1; no auth, frictionless
- [[vendors/polymarket]] — Wedge Signal #1 (parallel); no auth, higher volume
- [[entities/psa]] — pop report data source for Wedge Signal #4
- [[concepts/population-report]] — PSA pop report changes as a signal input
- [[decisions/0003-ebay-130point-parallel-tracks]] — ADR recording the parallel-track decision
