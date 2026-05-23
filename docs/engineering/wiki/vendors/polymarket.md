---
type: vendor
tags: [prediction-market, wedge-signal, api, sports, data-source]
updated: 2026-05-23
sources: [[sources/polymarket-api-docs]]
certainty: Certain
---

# Polymarket

## For future Claude
Polymarket is the world's largest prediction market by volume. This page documents the API access picture for using Polymarket as **Wedge Signal #1** (prediction market movements) in the SlabMetrics Buy/Hold/Sell Recommendation Engine. Relevant when: designing the signal pipeline, understanding what sports markets exist, or assessing API access requirements. Key fact: no authentication is required for market data reads — the entire Gamma API is open. Key risk: all sports market orders are auto-cancelled at game start, which matters if building any live/near-live monitoring.

## TL;DR

Polymarket is the world's largest prediction market by volume. Gamma API (`gamma-api.polymarket.com`) requires no auth for market data reads. Sports-specific endpoints (`/sports`, `/sports/market-types`) exist. Larger liquidity than Kalshi for most markets means more reliable signal. Sports orders auto-cancel at game start. `[Certain]` — [[sources/polymarket-api-docs]]

## API Access

| Access type | Auth required | Cost |
|---|---|---|
| Market data read (Gamma API) | **None** | Free |
| Trading (CLOB API) | Wallet + signature | Gas fees (on-chain) |

SlabMetrics only needs Gamma API reads for signal generation — **no auth, no cost.** `[Certain]` — [[sources/polymarket-api-docs]]

## Key Endpoints

```
GET /markets                      # List markets (filter: slug, tag_id, active, closed)
GET /markets/{conditionId}        # Single market detail
GET /events                       # List events
GET /events/{slug}                # Single event by slug
GET /sports                       # Sports tag IDs, series, resolution sources
GET /sports/market-types          # Valid sports market type strings
```

Pagination: `limit` + `offset` params. `[Certain]`

## Market Data Model

- **Market**: single binary yes/no question. Has Condition ID (on-chain), Question ID (DB), two Token IDs (YES + NO). Price = probability (0–1 float).
- **Event**: container for markets. Single-binary or multi-outcome (mutually exclusive; prices sum to ~1).
- **Volume** and **liquidity** fields available — use as signal reliability filter.

`[Certain]` — [[sources/polymarket-api-docs]]

## SlabMetrics Signal Use Case

**Wedge Signal #1**: Prediction market movements as leading indicators for card price changes.

Polymarket advantages over Kalshi for this use case:
- Higher volume = more liquid markets = more reliable price signals
- `/sports/market-types` endpoint gives structured taxonomy of market categories
- Tag ID system makes sports filtering systematic

Signal extraction pattern:
1. `GET /sports` → build tag ID → sport mapping
2. `GET /markets?tag_id={nfl_tag}&active=true` → list all active NFL markets
3. Filter to player-level prop markets (passing yards, TDs, MVP, etc.)
4. Poll daily; compare price to 24h prior; flag movements ≥ threshold
5. Map player → card catalog → feed Buy/Hold/Sell signal

**Critical gotcha**: sports limit orders auto-cancel at game start. Don't build any stateful order-tracking — read-only price polling only. `[Certain]`

## Risk Assessment

| Risk | Severity | Notes |
|---|---|---|
| No auth for read | **None** | Frictionless |
| Sports order auto-cancellation | Low for SlabMetrics | Read-only signal polling unaffected — only matters for trading |
| US regulatory risk for users | Low | Monitoring-only use by SlabMetrics carries minimal risk; user-facing prediction features would need legal review |
| Signal reliability on thin markets | Medium | Filter by volume floor (e.g., discard markets under $10k volume) |
| API availability / rate limits | Low | No documented rate limits for unauthenticated Gamma API reads; assume reasonable |

## Action Items

- [ ] Call `GET /sports` to enumerate sports categories and their tag IDs
- [ ] Call `GET /sports/market-types` to understand the full market type taxonomy
- [ ] Identify player-level prop market types (player performance vs. game outcomes vs. season outcomes)
- [ ] Define volume floor for signal reliability filtering
- [ ] Prototype: fetch all active NFL markets, extract price movements over 24h window, map to player names

## See also

- [[vendors/kalshi]] — parallel prediction-market data source; regulated, US-only, similar read-only API. Run both as redundant inputs for Wedge Signal #1 — use whichever has better coverage for each market type.
- [[topics/pricing-pipeline]] — the signal pipeline architecture that will consume Polymarket data.
- [[company/business-plan]] — Section on the 5 candidate wedge signals; Kalshi/Polymarket = Signal #1.
- [[vendors/ebay-api]] — Wedge Signal #5 data source (frequency-of-sale velocity). Different signal, same pipeline.
