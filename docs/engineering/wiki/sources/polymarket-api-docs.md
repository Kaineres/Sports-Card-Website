---
type: source
tags: [prediction-market, polymarket, api, wedge-signal, pricing-pipeline]
updated: 2026-05-23
raw: engineering/raw/2026-05-23-polymarket-api-docs.md
source_url: https://docs.polymarket.com (overview, fetching-markets, sports-market-types, markets-and-events pages)
certainty: Certain
---

# Polymarket API Docs — Source Summary

## TL;DR
- Polymarket is the world's largest prediction market by volume. Three APIs; no auth required for market data.
- Gamma API at `gamma-api.polymarket.com` is the primary endpoint for fetching market/event data.
- Sports-specific endpoints exist: `/sports` (metadata, tag IDs) and `/sports/market-types` (valid type strings).
- Critical sports behavior: all outstanding limit orders are **auto-cancelled at game start** — any live monitoring must handle sudden order-book clearing.

## Key Claims

- No API key required for market data reads. `[Certain]`
- Gamma API base URL: `https://gamma-api.polymarket.com`. `[Certain]`
- Three retrieval strategies for markets: by slug, by tag ID (from `/sports`), by events endpoint. `[Certain]`
- Market identifiers: Condition ID (on-chain, immutable), Question ID (DB), two CTF Token IDs (YES and NO). `[Certain]`
- Event types: single-market binary or multi-market mutually-exclusive. `[Certain]`
- Sports orders: outstanding limit orders auto-cancelled at game start. `[Certain]`
- `/sports` endpoint returns tag IDs, images, resolution sources, series metadata for sports categories. `[Certain]`
- `GET /sports/market-types` returns `{"marketTypes": ["<string>"]}` — list of valid sports market type strings. `[Certain]`
- Pagination via `limit` and `offset`. `[Certain]`
- SDKs: TypeScript, Python, Rust. `[Certain]`
- US-resident trading restrictions exist; monitoring-only use carries minimal regulatory risk. `[Likely]`

## Pages Updated By This Source

- [[vendors/polymarket]]
