# SlabMetrics Business Plan

> Source: `Key Documents/SlabMetrics Business Plan.docx`
> Version: 0.1 — May 2026. Internal working document, not for external distribution.
> Cadence: Revisit monthly (first weekend). Full rewrite at each 30/60/90-day milestone of the Decision-Logging Experiment.

---

## 1. Executive Summary

**What:** SlabMetrics is a **decision intelligence platform** for sports card investors. Primary output is the *decision itself* (Buy / Hold / Sell / Submit / Pass) — not raw data for the user to interpret.

**Distinction from incumbents:** Card Ladder = lookup tool. CollX = collection tracker. Market Movers = price alerts. SlabMetrics = synthesizes comp data, [[card-grading|grading EV]], and market signals into per-card actionable recommendations.

### Current State (May 2026)

- Pre-revenue. Pre-launch.
- Prototype exists as a single-file HTML app (built by Kain).
- eBay developer sandbox keys obtained; production access pending compliance.
- **Decision-logging experiment** running — both founders investing $500 personal capital each for 90 days, tracking buy/sell/hold decisions and outcomes.
- Carson leading card show attendance as structured customer research.
- Founders' agreement signed (May 2026, 4-year vest / 1-year cliff).
- No outside capital raised or committed. Early conversations with potential friends-and-family investors, deferred until LLC formed and wedge validated.

### 6-Month Goals

1. Complete 90-day decision-logging experiment → ranked signal list → validated wedge
2. Conduct 30+ structured customer interviews with non-friend card investors
3. Ship comp lookup (free tier) + Buy/Hold/Sell Recommendation Engine (paid tier)
4. Establish brand presence on social (Phase 1 — credibility only, not full content engine)
5. Acquire first **20 paying users** at price ≥ Card Ladder

---

## 2. The Problem

### What card investors actually need to decide

1. Should I **buy** this card at this price? (comp lookup, grade verification, scarcity)
2. Is this raw card worth **submitting** for grading? (grade prediction + EV math)
3. Should I **sell now or hold**? (price trend, catalysts, opportunity cost)
4. What players/sets should I be watching? (market discovery, momentum)

### Why current tools fall short

| Tool | Strength | Weakness |
|---|---|---|
| **[[vendors/card-ladder|Card Ladder]]** | Established data, multi-year history, indices, portfolio tracking. ~$200/yr | Lookup-oriented, not decision-oriented. Comp lookup requires multiple clicks. Does not connect data to actionable decisions. |
| **[[vendors/market-movers|Market Movers]]** | Real-time price alerts, active-trader focus, strong content ecosystem | Alert-driven UX favors flippers over portfolio holders. No decision synthesis. |
| **[[vendors/collx|CollX]]** | Free entry, photo-ID onboarding, large user base, mobile-first | Hobbyist-default framing. No decision intelligence. Community pricing is noisy. Free tier suppresses willingness to pay. |
| **[[vendors/alt|Alt]]** | Premium brand, asset-class framing, vertically integrated (marketplace + analytics) | Positioned toward $1k+ cards; underserves the $50–$500 modern-graded beachhead. Decision intelligence absent. |
| **[[vendors/130point|130point]]** | Comp data | Data source, not a decision layer. |

### Our framing

> SlabMetrics is not a data tool that helps users make decisions. It is a tool whose primary unit of output is **the decision itself.**

---

## 3. Customer

### Primary v1 customer profile (hypothesis, to be validated)

- Self-identifies as an **investor or serious flipper** (not primarily a fan or rip-pack hobbyist)
- Makes buy/sell decisions **at least monthly**
- Currently uses Card Ladder, Market Movers, 130point, or a spreadsheet
- Modern sports focus: basketball, football, baseball
- **Comfortable paying $20–50/month** for tools that demonstrably improve returns or save time

### Who this is NOT for (v1)

- Pure hobbyists with no investment framing
- Vintage-only collectors
- High-end auction-house buyers ($10k+ per card)
- Pure dealers and breakers (inventory management is a different workflow)

### Conversion arc (Phase 2 — gated)

Serious hobbyists with $1k–$5k portfolios are a natural conversion target via a heavy content/media engine (social, video, educational material). **This phase is gated** — does not activate until:
- ≥50 paying investor users with demonstrated retention/engagement
- Both founders agree the investor product is delivering real value

---

## 4. The Wedge

### Positioning statement

> SlabMetrics is the decision intelligence platform for serious sports card investors. The primary unit of output is the decision — Buy, Hold, Sell, Submit, or Pass — not the data behind it.

### v1 wedge feature: Buy/Hold/Sell Recommendation Engine

For each card in a user's collection or watchlist, produce a specific recommendation derived from the synthesis of multiple signals. Show the recommendation *and* the reasoning.

**Five candidate signals (to be validated in 90-day experiment):**

1. Prediction market movements ([[vendors/kalshi|Kalshi]] / [[vendors/polymarket|PolyMarket]] player-event odds)
2. Player injury status
3. Season phase (preseason / regular season / postseason)
4. [[population-report|Pop report changes]] ([[psa|PSA]] population shifts = scarcity dynamics)
5. Frequency-of-sale velocity (how often the card is trading, not just price)

**Failure criterion (defined upfront):** A signal has failed if, after 90 days, buys made primarily on that signal do *not* show better net returns over 30-day and 60-day horizons than the average across all logged buys, by a margin not explained by sample noise. If **zero** of the five signals clear this bar → revise signal set and re-test. No Plan B wedge.

### What we're explicitly NOT leading with

- "Trend forecasting" — too hard a promise to keep without years of data
- "AI grading" — framing: submission candidate scorer yes; AI grader with PSA-level accuracy no
- "More features for less money" — pricing below Card Ladder signals "cheap option"

---

## 5. Product

### What exists today

- Single-file HTML prototype (no backend, no auth, no real data)
- Pages: Browse by league, Market analysis (CardIQ index, top movers), Collection management, Watchlist, AI card grading, Player market pages
- Designed for design iteration and demos, not production users

### v1 scope (6-month goal)

**Must-haves:**
- User accounts (Clerk) + auth
- Comp lookup powered by real [[vendors/ebay-api|eBay]] + [[vendors/130point|130point]] data (basketball, football, baseball — v1 scope)
  - Free tier: watchlist capped ~5 cards, 30-day history cap
- Buy/Hold/Sell Recommendation Engine with ≥1 validated signal (paid/Pro tier)
- Stripe billing for Pro tier
- Basic collection + watchlist tied to accounts
- Mobile-responsive

**Explicitly out of scope for v1:**
- Additional decision intelligence features beyond the wedge
- Marketplace functionality
- Soccer and other non-core sports
- Vintage cards: catalog records exist for search, but no market data or analysis — returns "not yet supported" message
- Tax/cost-basis reporting
- Auction house integrations (Goldin, Heritage, Fanatics Collect)

### Build sequence

| Period | Focus |
|---|---|
| Months 1–2 | eBay production access, 130point integration, comp ingestion pipeline (basketball/football/baseball). Customer interviews in parallel. |
| Months 2–3 | Comp lookup v1 (free tier). Card identity catalog includes vintage for search, no market data for vintage. |
| Months 3–4 | Buy/Hold/Sell Recommendation Engine v1 around validated signals. |
| Month 4 | Closed beta, 10–15 hand-picked card investors. Iterate. |
| Months 5–6 | Public launch with subscription. Goal: 20 paying users. |

*Assumes one developer (Kain) at ~half-time during academic year, full-time during summer.*

---

## 6. Market

- Sports card market peaked 2020–21, declined 2022–23, mixed recovery since
- Investor-identity collector is a real but smaller and more skeptical audience than at peak
- **No top-down TAM number used** — methodology varies wildly; bottom-up estimates to be developed through customer interviews (months 1–3)
- Beachhead: US investor-minded collectors of modern (post-2000) [[psa|PSA]]-graded basketball, football, and baseball cards, primarily ages 25–45

---

## 7. Competitive Landscape

| Capability | [[vendors/card-ladder|Card Ladder]] | [[vendors/market-movers|Market Movers]] | [[vendors/collx|CollX]] | [[vendors/alt|Alt]] | [[vendors/130point|130point]] | SlabMetrics |
|---|---|---|---|---|---|---|
| Sold-comp lookup | ✓ | ✓ | partial | partial | ✓ | ✓ |
| Collection / portfolio tracking | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| Market indices / trend charts | ✓ | ✓ | — | ✓ | — | partial |
| Price alerts | partial | ✓ | — | — | — | ✓ |
| [[population-report\|Pop report integration]] | partial | ✓ | — | — | — | ✓ |
| Prediction-market signal integration | — | — | — | — | — | **✓ (planned)** |
| Per-card buy/hold/sell recommendations | — | — | — | — | — | **✓ (v1 wedge)** |
| Synthesizes multiple signals into decisions | — | — | — | — | — | **✓ (v1 wedge)** |
| Free tier with meaningful functionality | — | partial | ✓ | — | ✓ | ✓ |
| Marketplace / transactions | — | — | partial | ✓ | — | deliberately out of scope |

### Honest competitive position

No defensible network effect, data moat, or distribution advantage yet. Credible angles:
1. Decision-intelligence framing no incumbent leads with
2. Founder-team adjacency to analytical workflows (Kain's EdgeIQ prediction-market infrastructure)
3. Customer research discipline most incumbents skipped

**Must develop at least one moat within 12–18 months.**

---

## 8. Go-to-Market

| Tier | Channel | Owner |
|---|---|---|
| 1 (high-leverage) | Card-Twitter / r/sportscards technical analysis posts | Kain + Carson |
| 1 (high-leverage) | Direct outreach to micro-influencers (5k–50k followers) — free access for reviews | Carson |
| 1 (high-leverage) | Trade shows — brand presence, customer research, beta candidates | Carson |
| 2 (test once product exists) | YouTube partnerships with card investment creators | Carson |
| 2 | Card-investor podcasts (Stacking Slabs etc.) | Carson |
| 2 | Discord server presence (Loupe, breaker servers) | Carson |
| 3 (defer until PMF) | Paid acquisition | Kain |
| 3 | PR / press | — |
| 3 | Grading company partnerships | — |

*Note: trade show audience skews toward hobbyists, not pure investors. Mix with online channels to find high-intent targets.*

---

## 9. Business Model

### Subscription tiers (working hypothesis)

| Tier | What's included | Target price |
|---|---|---|
| **Free** | Full comp lookup with limits (watchlist ~5 cards, 30-day history cap) | $0 |
| **Pro** | Buy/Hold/Sell Recommendation Engine + unlimited watchlist + full history | $25–40/month or $250–400/year |

- Price at or above Card Ladder (~$200/yr) to signal "serious investor tool"
- Final pricing to be validated with customer willingness-to-pay interviews

### Unit economics (placeholder estimates — not validated)

| Metric | Estimate |
|---|---|
| COGS per user/month | $2–5 (data, hosting, payment processing) |
| LTV (gross) at $30/mo × 12-month retention | ~$360 |
| Max CAC for 3:1 LTV:CAC | ~$120 |

*Replace with real data from beta users.*

---

## 10. Team & Operations

| Founder | Domains | Other commitments |
|---|---|---|
| **Kain Kim** | Product, engineering, infrastructure, digital marketing | Coffee roasting business (North Georgia) |
| **Carson Froy** | Card market expertise, brand, social, field marketing, customer research | — |

Both are sophomore-equivalent UGA undergraduates. Part-time during academic terms, full-time during breaks. Objective-based quarterly milestones, not weekly hours.

**Capital posture:** Bootstrap for v1. No required contributions. Reimbursable expenses tracked and paid from revenue before profit distribution.

**Legal:** Informal general partnership today. Founders' agreement signed. Georgia LLC target: within 6 months.

---

## 11. 12-Month Milestones

| Quarter | Key Goals |
|---|---|
| **Q1 (May–Jul 2026)** | Sign founders' agreement. Decision-logging experiment running. eBay production access. 130point conversations. First 10 customer interviews. **Signal validation complete** by Day 90 — identified which candidate signals pass the failure criterion. Buy/Hold/Sell Engine v1 design finalized around validated signals. |
| **Q2 (Aug–Oct 2026)** | Comp lookup v1 live with real eBay data. Wedge v0 built and used internally. 30+ customer interviews total. Closed beta, 5–10 users. |
| **Q3 (Nov 2026–Jan 2027)** | Wedge v1 polished. Stripe integrated. Closed beta expanded 15–20 users. First 5–10 paying customers. Decision-logging experiment v2 with broader signal taxonomy. |
| **Q4 (Feb–Apr 2027)** | Public launch. Subscription live. **Target: 20+ paying users**. Updated business plan + outside-facing memo/deck for advisor/investor conversations. |

*Slippage of 1–2 months on any milestone: expected. 4+ months: reassess scope or capacity.*

---

## 12. Risks

| Rank | Risk | Mitigation |
|---|---|---|
| 1 | Co-founder conflict or departure | Founders' agreement with vesting, clear roles, dispute process. Re-read at each 6-month checkpoint. |
| 2 | Building for users we don't understand (both founders are early card investors; baseball knowledge gap is specific) | 30+ structured interviews including baseball-investor conversations; expand decision-logging to baseball within 30 days; identify baseball advisor within 90 days. |
| 3 | Data access fails (eBay production rejected + 130point unworkable) | Pursue both in parallel; explore CardCensus, MySlabs as backup. |
| 4 | Card market contracts further | Build so the product also serves serious-hobbyist conversion targets; don't bet on pure-investor identity persisting. |
| 5 | Incumbent competitive response (Card Ladder ships competing feature within 90 days of launch) | Build decision intelligence as a multi-capability synthesis — harder to replicate than a single UI change. |
| 6 | Founder time and attention (school, coffee company) | Realistic milestones; objective-based agreement. |
| 7 | Premature scaling | Explicit policy: paid acquisition stays off until 20 organically-acquired paying users with retention data. |

---

## 13. Open Questions (active)

- Which of the five candidate signals actually predict card price movements? → answered by Day 90 experiment
- How widely is the "investor-minded" identity held by collectors? (5%? 25%? 50%?)
- Has card-investor sentiment recovered from 2022–23 cooling?
- What share of investor-minded collectors pay for any analytics tool today?
- Bottom-up estimate: how many people in the US fit our target profile?
- How big is Card Ladder's subscriber base? (any public signals?)
- What's cheapest/fastest channel to find 20 paying users by month 6?
- When do we file the Georgia LLC? (target: within 60 days)
- Who's the first non-founder hire? (likely part-time content/community contractor, not an engineer)
- Do we need a card-market-depth advisor? (almost certainly yes — identify within 90 days)

---

## What this plan is missing (acknowledged)

- Real bottom-up TAM estimate
- Validated customer research synthesis (currently: anecdotes from friends, not structured research)
- Validated pricing (currently: competitive positioning guess, not WTP data)
- Real unit economics (CAC, retention, churn) — comes from beta users
- Detailed financial projections — premature without revenue/cost data
- 5-year founder vision — to be developed before any external pitch

---

## See also

### Company
- [[founder-agreement]] — equity split, vesting, roles, IP assignment, non-compete that governs this plan

### Cards domain knowledge
- [[psa]] — primary grading service; PSA pop report signal is a candidate wedge input; PSA comp data is the free-tier data source
- [[population-report]] — pop report changes listed as a candidate Buy/Hold/Sell signal in Section 4.2; grade distribution drives rarity and value assessments
- [[card-grading]] — grading submission decisions are one of the three core decision types the product solves (the "submit" leg of buy/sell/submit)
- [[grading-services-landscape]] — cross-grader comparison of all four services the product tracks; relevant to GTM channel "grading company partnerships."
- [[population-report-guide]] — operational how-to for interpreting pop report data; pop report changes are candidate signal #4 in the wedge.
- [[parallels-and-variations]] — parallel rarity hierarchy affects comp lookup complexity; a /25 parallel is a fundamentally different comp target than a base card.

### Engineering
- [[architecture]] — system architecture for the platform described in this plan
- [[pricing-pipeline]] — comp data ingestion infrastructure; free-tier product depends on this being live
- [[data-model]] — Postgres schema that persists cards, comps, watchlists, and recommendations

### Vendors
- [[vendors/kalshi]] — Wedge Signal #1 data source; prediction market odds for player-level sports markets
- [[vendors/polymarket]] — Wedge Signal #1 data source (parallel to Kalshi); larger volume, no auth required
- [[vendors/ebay-api]] — primary comp data source; Finding API decommissioned Feb 2025; Marketplace Insights approval is Risk #3
- [[vendors/130point]] — primary comp data fallback; Card Pricing Direct B2B product is the parallel track to eBay approval
- [[vendors/card-ladder]] — closest direct competitor; $200/yr price anchor for SlabMetrics Pro tier
- [[vendors/market-movers]] — competitor; Intelligence Reports feature is the closest incumbent analog to signal synthesis
- [[vendors/collx]] — competitor; free tier anchors WTP at $0; Phase 2 conversion target gated on investor-product PMF
- [[vendors/alt]] — competitor; targets $1k+ premium segment; low overlap with SlabMetrics v1 beachhead
