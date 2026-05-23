---
type: source
tags: [prediction-market, kalshi, api, wedge-signal, pricing-pipeline]
updated: 2026-05-23
raw: engineering/raw/2026-05-23-kalshi-api-docs.md
source_url: https://docs.kalshi.com (welcome, rate-limits, quickstart, api-keys, glossary pages)
certainty: Certain
---

# Kalshi API Docs — Source Summary

## TL;DR
- Kalshi is a CFTC-regulated US prediction market. Trade API provides real-time market data and trade execution.
- Public market data endpoints require **no authentication** — safe and free for signal polling.
- RSA key signing required only for trading; SlabMetrics is read-only so auth complexity is irrelevant for MVP.
- Sports markets exist under a Category→Subcategory→Series→Event→Market hierarchy. Specific player-level props need verification via `/series?category=Sports`.

## Key Claims

- Base URL: `https://external-api.kalshi.com/trade-api/v2`. Demo environment available separately. `[Certain]`
- Public endpoints (series, events, markets, trades, orderbook) require no authentication. `[Certain]`
- Rate limit tiers: Basic (200/100 req/sec read/write) qualifies with account signup only — no application needed. `[Certain]`
- Write endpoints require RSA PSS SHA-256 signature; headers: KALSHI-ACCESS-KEY, KALSHI-ACCESS-TIMESTAMP, KALSHI-ACCESS-SIGNATURE. `[Certain]`
- Taxonomy: Category → Subcategory → Series → Event → Market. Ticker format: `{Series}-{Event}-{Market}`. Do not parse tickers to infer hierarchy — use API. `[Certain]`
- Sports category exists; NFL player performance markets (passing yards, TDs) are relevant leading indicators for card demand. `[Likely]` — specific tickers unverified.
- Pagination is cursor-based. `[Certain]`

## Pages Updated By This Source

- [[vendors/kalshi]]
