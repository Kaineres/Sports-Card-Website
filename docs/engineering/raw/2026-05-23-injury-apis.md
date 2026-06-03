<!-- source: https://www.balldontlie.io/, https://nfl.balldontlie.io, web search | captured: 2026-05-23 -->

# Player Injury APIs — Reference

## Context for SlabMetrics

Player injury status is Wedge Signal #2 in the Buy/Hold/Sell recommendation engine. A star QB going on IR triggers a sell signal for their cards; a player returning from injury triggers a buy signal. Need an API that provides:
- Current injury status per player (Questionable / Out / IR / Doubtful / Active)
- Near real-time updates during the NFL/NBA season
- Coverage: NFL primary, NBA secondary (most card demand is driven by these two leagues)

## BALLDONTLIE — Primary Candidate

Website: balldontlie.io
NFL docs: nfl.balldontlie.io
OpenAPI spec: `https://www.balldontlie.io/openapi/nfl.yml`
MCP server: mcp.balldontlie.io (direct AI agent access)

### Coverage
20+ leagues: NFL, NBA, MLB, NHL, WNBA, NCAAF, NCAAB, soccer (EPL, La Liga, Champions League, MLS), tennis, golf (PGA), MMA, esports (CS2, LoL, Dota 2), Formula 1.

### Pricing (per sport)

| Tier | Requests/min | Price | Player Injuries? |
|---|---|---|---|
| Free | 5 | $0 | **No** |
| All-Star | 60 | $9.99/mo | **Yes** |
| GOAT | 600 | $39.99/mo | Yes |
| All-Access (all sports) | 600 | $299.99/mo | Yes |

**Key finding**: Player injury endpoint requires All-Star tier ($9.99/mo per sport) minimum. Not available on the free tier.

48-hour free trial of GOAT tier available (requires payment method; no charge until trial ends).

### Authentication
API key in Authorization header:
```
Authorization: YOUR_API_KEY
```
Free account: create at app.balldontlie.io (no credit card required for free tier).

### NFL Injury Endpoint

```
GET https://api.balldontlie.io/nfl/v1/player_injuries
```

Requires: All-Star tier or higher.

Query parameters:
- `cursor` — pagination cursor
- `per_page` — results per page (default 25, max 100)
- `team_ids[]` — filter by team IDs
- `player_ids[]` — filter by player IDs

Response shape:
```json
{
  "data": [
    {
      "player": {
        "id": 85,
        "first_name": "Dorian",
        "last_name": "Thompson-Robinson",
        "position": "Quarterback",
        "position_abbreviation": "QB",
        "jersey_number": "17",
        "team": {
          "id": 8,
          "location": "Cleveland",
          "name": "Browns",
          "abbreviation": "CLE"
        }
      },
      "status": "Questionable",
      "comment": "Thompson-Robinson (finger) received negative X-ray results...",
      "date": "2024-10-21T16:04:00.000Z"
    }
  ],
  "meta": { "next_cursor": 62089, "per_page": 25 }
}
```

Status values: Questionable, Doubtful, Out, IR (Injured Reserve), and Active (not injured).

Pagination: cursor-based (not offset). Use `meta.next_cursor` for next page.

### Additional Relevant Endpoints (All-Star+)
- `GET /nfl/v1/players` — full player list with positions
- `GET /nfl/v1/players?search={name}` — search by name
- `GET /nfl/v1/season_stats` — season-level stats per player (useful for signal context)

### Webhooks (All-Access only — $299.99/mo)
Real-time `player.injury` events delivered via HTTP POST. 500K deliveries/month included.
For SlabMetrics MVP, polling is sufficient — webhooks are a v2 optimization.

---

## API-Sports — Free Fallback

Website: api-sports.io
Free tier: 100 requests/day (all endpoints, no credit card required)
NFL + NBA both covered with injury endpoints.

Specific endpoint documentation not captured in this ingest — API-Sports uses a standard REST pattern but exact injury endpoint path and response shape need verification via their docs at api-sports.io.

**Risk**: 100 req/day free limit is tight for daily injury polling across full NFL/NBA rosters (1,696 NFL players + ~450 NBA players active per season). Likely insufficient at free tier; paid plan pricing unclear.

---

## Sportradar — Enterprise Option

Not researched in detail. Industry-standard for professional sports data. Used by most major sports betting and media companies. Pricing is enterprise-level (thousands of dollars/month). Likely overkill for SlabMetrics v1 but relevant as the data source that BALLDONTLIE and similar aggregators pull from.

---

## Recommendation for SlabMetrics

**BALLDONTLIE All-Star at $9.99/mo per sport** is the clear MVP path:
- NFL ($9.99/mo) covers the primary card demand driver
- NBA ($9.99/mo) covers secondary demand
- Total: $19.99/mo for both leagues
- 60 req/min is more than sufficient for daily injury polling
- MCP server enables direct n8n / AI agent integration

Signal design: poll `/nfl/v1/player_injuries` daily; detect status changes (Active → Out/IR = sell signal; IR → Active = buy signal); map player_id → card catalog entries.
