---
type: vendor
tags: [prediction-market, wedge-signal, api, sports, data-source]
updated: 2026-05-23
sources: [[sources/kalshi-api-docs]]
certainty: Certain
---

# Kalshi

## For future Claude
Kalshi is a CFTC-regulated US prediction market. This page documents the API access picture for using Kalshi as **Wedge Signal #1** (prediction market movements) in the SlabMetrics Buy/Hold/Sell Recommendation Engine. Relevant when: designing the signal pipeline, evaluating which player-level markets exist, or understanding the rate-limit/auth requirements. Key fact: public market data requires zero authentication — the read side is entirely frictionless.

## TL;DR

Kalshi is the leading regulated US prediction market. Public market data API (no auth, 200 req/sec free) makes it a frictionless Wedge Signal #1 data source for the SlabMetrics recommendation engine. Player-level sports markets (passing yards, TDs, MVP odds) are direct leading indicators for card demand. `[Certain]` — [[sources/kalshi-api-docs]]

## API Access

| Access type | Auth required | Rate limit | How to qualify |
|---|---|---|---|
| Public market data (read) | **None** | 200 tokens/sec | Create account |
| Trading (write) | RSA key signing | 100 tokens/sec | Create account |
| Advanced tier | RSA key signing | 300/300 read/write | Fill out application form |

SlabMetrics only needs read access for signal generation — **no auth setup required for MVP.** `[Certain]` — [[sources/kalshi-api-docs]]

## Market Hierarchy

Category → Subcategory → Series → Event → Market

Ticker format: `{Series}-{Event}-{Market}` (e.g., `KXHIGHNY-24JAN01-T60`). Do not parse tickers for hierarchy — use API endpoints. `[Certain]`

## SlabMetrics Signal Use Case

**Wedge Signal #1**: Prediction market movements as leading indicators for card price changes.

Examples:
- Patrick Mahomes MVP odds rising 10% → likely increase in Mahomes card demand → **Buy** signal for Mahomes RCs and autos
- QB passing yards market heavily skewing Yes → player in a shootout game → short-term card price spike
- Player injury market (will X play this week?) resolving No → **Hold/Sell** for that player's cards

Signal extraction pattern:
1. Poll `/markets?series={player_series}` daily for baseline
2. Detect significant price movements (configurable threshold, e.g. ≥5% in 24h)
3. Map market ticker → player → card catalog entries
4. Feed movement magnitude + direction into recommendation engine

Coverage gap: need to verify specific NFL/NBA/MLB player-level market tickers. `[Guessing — tickers unverified]`

## Key Endpoints

```
GET /series?category=Sports        # Enumerate all sports series — start here
GET /events?series={ticker}        # Markets within a series
GET /markets/{ticker}              # Single market price + metadata
GET /markets/{ticker}/orderbook    # Current orderbook depth
GET /trades?ticker={ticker}        # Recent trades
```

## Risk Assessment

| Risk | Severity | Notes |
|---|---|---|
| No auth for read | **None** | Frictionless data source |
| Sports market coverage | Medium | Specific player-prop tickers unverified; run inventory query first |
| Platform risk | Low | CFTC-regulated, operational, established |
| Signal reliability | Medium | Low-volume markets may be thin/manipulable; filter by volume |

## Action Items

- [ ] Query `GET /series?category=Sports` to enumerate all available sports and player-level series
- [ ] Confirm NFL, NBA, MLB player performance markets (passing yards, TDs, points, etc.) exist
- [ ] Define signal threshold: what price movement triggers a card recommendation update?
- [ ] Map Kalshi player series tickers to SlabMetrics player catalog (player name → card catalog)
- [ ] Determine polling cadence: daily baseline scan + hourly during game weeks

## See also

- [[vendors/polymarket]] — parallel prediction-market data source; no auth, larger volume, sports-specific endpoints. Run both as redundant signal inputs for Wedge Signal #1.
- [[topics/pricing-pipeline]] — the signal pipeline architecture that will consume Kalshi data.
- [[company/business-plan]] — Section on the 5 candidate wedge signals; Kalshi/Polymarket = Signal #1.
- [[vendors/ebay-api]] — Wedge Signal #5 data source (frequency-of-sale velocity). Different signal, same pipeline.
