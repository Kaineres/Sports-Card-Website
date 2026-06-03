<!-- source: https://www.psacard.com/publicapi/documentation | captured: 2026-05-23 -->

# PSA Public API — Reference

## Overview

Base URL: `https://api.psacard.com/publicapi/`
All requests over HTTPS. Responses in JSON or XML.
Swagger/interactive docs: `https://api.psacard.com/publicapi/swagger`

## CRITICAL FINDING FOR SLABMETRICS

**PSA's Public API contains only one endpoint category: Cert Verification.**

There is NO population report API. Pop report data (psacard.com/pop) is not exposed via any official PSA API endpoint. This is the complete published API surface as of 2026-05-23.

Implication: Wedge Signal #4 (pop report changes) CANNOT be built using the PSA Public API. Alternatives required — see GemRate and PriceCharting.

## Authentication

OAuth 2 with password grant. PSA login credentials generate an access token.

Header format:
```
Authorization: bearer <access_token>
```

No separate API key — uses PSA account credentials directly.

## Rate Limits

| Tier | Daily limit | Cost |
|---|---|---|
| Free | **100 API calls/day** | $0 |
| Paid | Higher limits | Contact [email protected] |

Daily limit resets at midnight (timezone unspecified). Paid tier pricing not public.

## Available Endpoints

### Cert Verification

**The only currently available endpoint.**

```
GET https://api.psacard.com/publicapi/cert/GetByCertNumber/{certNumber}
```

Returns grading data for a single PSA cert number. Use case: verify a specific card's grade and authenticity.

Response shape (on success):
```json
{
  "IsValidRequest": true,
  "ServerMessage": "Request successful",
  // cert data fields (grade, year, player, set, etc.)
}
```

Error responses:
- `{ "IsValidRequest": false, "ServerMessage": "Invalid CertNo" }` — malformed cert number
- `{ "IsValidRequest": true, "ServerMessage": "No data found" }` — valid format, no record
- HTTP 500 — typically invalid credentials (also possible server error)
- HTTP 204 — missing cert number in request
- HTTP 4xx — incorrect or invalid request path

## What PSA's API Does NOT Provide

- Population report data (grade counts per card)
- Auction prices
- Price guide data
- Set registry data
- Bulk lookup (only single cert at a time)

All of the above live on psacard.com's web UI but are not exposed via the Public API.

## Population Report — Alternatives

Since PSA's API doesn't expose pop data, alternatives for Wedge Signal #4:

### GemRate (recommended — partner API)
- Universal Pop Report covering PSA, Beckett (BGS), SGC, and CGC in one call
- Updated daily
- Universal card IDs that map across graders and marketplaces
- Partner API — requires direct outreach / demo booking (not self-serve)
- Source: gemrate.com/partner (crawl blocked; assembled from gemrate.com main page and FAQ)

### PriceCharting
- Added PSA & CGC population report data in February 2026 (blog.pricecharting.com)
- API access details unknown — not yet researched
- Less comprehensive than GemRate (2 graders vs 4)

### Direct scraping of psacard.com/pop
- Technically possible but likely against PSA ToS
- Fragile to UI changes; would require ongoing maintenance
- High legal/ToS risk — not recommended

## Action Items

- [ ] Verify whether PSA has a non-public / enterprise pop report API (contact [email protected])
- [ ] Contact GemRate for Partner API pricing and access — this is likely the best path for Wedge Signal #4
- [ ] Research PriceCharting API for pop report data as a fallback
