<!-- source: docs.kalshi.com | captured: 2026-05-23 | pages: welcome, rate-limits, market-data-quickstart, api-keys, glossary -->

# Kalshi API Documentation — SlabMetrics Reference

## Overview

Kalshi is a regulated US prediction market. The Trade API provides real-time market data and trade execution.

- Base URL: `https://external-api.kalshi.com/trade-api/v2`
- Demo/sandbox environment available at a separate base URL
- OpenAPI spec and AsyncAPI spec available for download from the docs site
- Relevant to SlabMetrics: Candidate Wedge Signal #1 — prediction market movements as a leading indicator for card prices

---

## Rate Limits

Token-bucket system. Separate **Read** and **Write** budgets per API key.

| Tier | Read (tokens/sec) | Write (tokens/sec) | How to qualify |
|---|---|---|---|
| Basic | 200 | 100 | Complete account signup |
| Advanced | 300 | 300 | Complete Advanced API application form |
| Premier | 1000 | 1000 | Contact Kalshi |
| Paragon | 2000 | 2000 | Contact Kalshi |
| Prime | 4000 | 4000 | Contact Kalshi |

- HTTP 429 returned when limit exceeded
- Exponential backoff required
- Write bucket holds ~2 seconds of budget for bursting
- Most endpoints consume 1 token; bulk endpoints may consume more

---

## Authentication

### Public endpoints (no auth)
Market data, series, events, markets — no auth required. Safe for read-only comp/signal fetching.

### Trading endpoints (RSA auth required)
Required headers for authenticated requests:
- `KALSHI-ACCESS-KEY` — Key ID (from account settings)
- `KALSHI-ACCESS-TIMESTAMP` — Unix timestamp in milliseconds
- `KALSHI-ACCESS-SIGNATURE` — RSA PSS SHA-256 signature of `timestamp + method + path_without_query`

Key format: RSA private key generated in Kalshi account settings (PEM format).

Signing pattern (Python pseudocode):
```python
msg = f"{timestamp}{method}{path}"  # e.g. "1716500000000GET/trade-api/v2/events"
signature = rsa_sign(private_key, msg, algorithm="PSS", hash="SHA256")
```

---

## Market Hierarchy / Glossary

Kalshi uses a strict 5-level taxonomy. **Do not parse tickers to infer relationships** — use the API.

| Level | What it is | Example |
|---|---|---|
| Category | High-level grouping (e.g., Sports, Economics, Finance) | Sports |
| Subcategory | Subdivision within a category | NFL |
| Series | Collection of related recurring events; same ticker prefix | KXHIGHNY |
| Event | Basic unit for market members — container for one or more markets | KXHIGHNY-24JAN01 |
| Market | Single binary yes/no market | KXHIGHNY-24JAN01-T60 |

Ticker convention: `{Series}-{Event}-{Market}` — but parse via API, not string splitting.

---

## Key Endpoints (Public, No Auth)

```
GET /series                        # List all series
GET /series/{series_ticker}        # Get a specific series
GET /events                        # List events (supports category, series filters)
GET /events/{event_ticker}         # Get a specific event
GET /markets                       # List markets (supports event, status, series filters)
GET /markets/{market_ticker}       # Get a specific market
GET /markets/{market_ticker}/orderbook  # Current orderbook
GET /trades                        # Recent trades
```

Pagination: cursor-based (`cursor` param for next page). `limit` param controls page size.

---

## Sports Coverage (Relevant to SlabMetrics)

Kalshi has sports markets under the Sports category. For card price signal purposes:
- NFL player performance markets (passing yards, touchdowns, etc.) are direct leading indicators for QB/WR card demand
- Player status markets (will X start this week?) may surface injury/suspension signals before official announcements
- Season outcome markets (playoff odds, MVP) correlate with seasonal demand patterns

Specific ticker patterns for NFL/NBA/MLB need to be confirmed by querying `/series?category=Sports` and browsing.

---

## Risk Assessment for SlabMetrics

| Risk | Severity | Notes |
|---|---|---|
| No auth needed for read | **Low** | Public market data freely accessible |
| Rate limits for free tier | Low | 200 read tokens/sec is ample for signal polling |
| Sports market coverage gaps | Medium | Verify specific player markets exist before building signal pipeline |
| Kalshi platform risk | Low | CFTC-regulated, established |

---

## Action Items

- [ ] Query `/series?category=Sports` to enumerate available sport types and confirm NFL/NBA player markets exist
- [ ] Identify ticker patterns for key sports (NFL, NBA, MLB) player performance markets
- [ ] Design polling cadence — how often to check for market movement (daily for signal baseline, hourly near game time?)
- [ ] Determine which markets correlate with which card types (QB markets → QB RC prices)
