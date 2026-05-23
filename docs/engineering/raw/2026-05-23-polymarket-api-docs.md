<!-- source: docs.polymarket.com | captured: 2026-05-23 | pages: overview, fetching-markets, sports-market-types, markets-and-events-concepts -->

# Polymarket API Documentation — SlabMetrics Reference

## Overview

Polymarket is the world's largest prediction market by volume. Binary yes/no markets on real-world events.

- Three separate APIs: Gamma API (market data), CLOB API (order book / trading), and a third (notifications/activity)
- **No authentication required for market data** — freely accessible
- SDKs available: TypeScript, Python, Rust
- Builder Program: apply for rewards for building on Polymarket
- Relevant to SlabMetrics: Candidate Wedge Signal #1 — prediction market movements as leading indicator for card prices

---

## Core Concepts

### Markets
A market = single binary yes/no question.

Key identifiers:
- **Condition ID** — on-chain identifier for the market condition (immutable)
- **Question ID** — database-side ID for the question
- **Token IDs** — two CTF (Conditional Token Framework) ERC-1155 token IDs: one for YES, one for NO

Price = probability expressed as 0–1 (e.g., 0.72 = 72% chance Yes).

### Events
An event = container for one or more markets.

- **Single-market event**: one binary question. Simplest case.
- **Multi-market event**: mutually exclusive multi-outcome (e.g., "Who wins the Super Bowl?" with one market per team). Prices across all markets sum to ~1.

### Sports-Specific Behavior
**Critical**: outstanding limit orders on sports markets are **automatically cancelled at game start**. This means open orders cannot persist through the game. Any polling system must account for sudden order-book clearing.

---

## Gamma API — Market Data

Base URL: `https://gamma-api.polymarket.com`

No API key required. REST, JSON responses.

### Fetching Markets

Three retrieval strategies:

**By slug:**
```
GET /markets?slug={slug}
```
Slugs are URL-friendly event names (e.g., `nfl-super-bowl-2025`).

**By tag:**
```
GET /markets?tag_id={id}
```
Get tag IDs from `/sports` endpoint first.

**By events:**
```
GET /events?limit=N&offset=N
GET /events?slug={slug}
```

### Sports Endpoints
```
GET /sports              # Sports metadata: tag IDs, images, resolution sources, series
GET /sports/market-types # Returns list of valid sports market type strings
```

Response format for `/sports/market-types`:
```json
{"marketTypes": ["<string>", ...]}
```

Pagination: `limit` and `offset` query params.

---

## Key Endpoints Summary

```
GET /markets                       # List markets (supports slug, tag_id, active, closed filters)
GET /markets/{conditionId}         # Single market by condition ID
GET /events                        # List events
GET /events/{slug}                 # Single event by slug
GET /sports                        # Sports categories/tags/series metadata
GET /sports/market-types           # Valid sports market type strings
```

---

## Data Shape (Representative)

```json
{
  "conditionId": "0xabc...",
  "question": "Will Patrick Mahomes throw 300+ yards in Super Bowl LIX?",
  "outcomePrices": ["0.62", "0.38"],
  "outcomes": ["Yes", "No"],
  "volume": "1240000",
  "liquidity": "85000",
  "endDate": "2025-02-09T23:59:00Z",
  "active": true,
  "closed": false,
  "tags": [{"id": "21580", "label": "NFL"}]
}
```

---

## Sports Coverage Notes

- Polymarket has NFL, NBA, MLB, soccer, and other sports markets
- `/sports` endpoint returns metadata: which tag IDs correspond to which sports
- Market type strings (from `/sports/market-types`) classify markets within sports (e.g., "player props", "game winner")
- Player-level markets (passing yards, touchdowns, etc.) exist and are relevant to card demand signals
- Volume and liquidity fields indicate market depth — low-liquidity markets are less reliable as signals

---

## Risk Assessment for SlabMetrics

| Risk | Severity | Notes |
|---|---|---|
| No auth needed for read | **Low** | Free, open API |
| Sports order auto-cancellation at game start | Medium | Must handle sudden order-book clearing in any live monitoring |
| Market availability gaps | Low | Large platform; major sports well-covered |
| Polymarket legal/regulatory risk | Medium | US-resident restrictions exist; platform has faced regulatory scrutiny. Monitoring only (no trading) carries minimal risk. |
| Low-liquidity markets as signals | Medium | Small markets may be manipulable; filter by volume threshold |

---

## Action Items

- [ ] Call `GET /sports` to enumerate available sports categories and their tag IDs
- [ ] Call `GET /sports/market-types` to understand market type taxonomy
- [ ] Identify player-level prop markets (passing yards, TD totals) for key QBs/WRs/RBs
- [ ] Determine volume/liquidity floor for signal validity (e.g., discard markets under $10k volume)
- [ ] Design signal extraction: what market price movements (e.g., player MVP odds rising >5% in 24h) should trigger a Buy signal for that player's cards?
- [ ] Check whether Polymarket has NBA player markets for off-season card demand signals
