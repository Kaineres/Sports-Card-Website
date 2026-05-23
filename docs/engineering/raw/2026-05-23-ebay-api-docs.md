<!-- sources: developer.ebay.com (crawl blocked 403), eBay community forums (crawl blocked 403), assembled from search result snippets, eBay community forum summaries, eBay developer program overview pages | captured: 2026-05-23 -->
<!-- direct crawl of developer.ebay.com, community.ebay.com all blocked; content assembled from search snippets and verified developer community discussion summaries -->

# eBay API Documentation — Comp Data Pipeline Reference

## eBay API suite overview (relevant to SlabMetrics)

eBay offers several API families. Only the Buy APIs and one deprecated Traditional API are relevant to SlabMetrics' comp data pipeline.

### Buy APIs (current)

| API | Purpose | Sold data? | Access |
|---|---|---|---|
| **Browse API** | Search active listings, get item details | No — active listings only | eBay Partner Network approval required for production |
| **Marketplace Insights API** | Sales history of items sold on eBay | **Yes — this is the only one** | Limited Release — pre-approved eBay business partners only |
| Feed API | Bulk item data feeds | No | Partner-only |
| Deal API | Sale events, coupons | No | Standard |
| Order API | Checkout and purchase flow | No | Standard |

### Traditional APIs (DEPRECATED/DECOMMISSIONED)

| API | Deprecation | Decommission | Notes |
|---|---|---|---|
| **Finding API** (findCompletedItems, findItemsAdvanced) | 2024-01-04 | **2025-02-05** | The original sold-listings API. Now gone. |
| **Shopping API** | 2024-01-04 | **2025-02-05** | Now gone. |

The findCompletedItems call — the traditional path to eBay sold/completed listing data — **no longer exists**. It was decommissioned February 5, 2025.

---

## Browse API — what it can and cannot do

The Browse API is the official replacement for the Finding API. Key facts:

- Searches **active listings** only. Cannot retrieve sold/completed items.
- Has advanced search: keyword, category, filters (condition, price, location, seller, etc.)
- Production access requires eBay Partner Network (EPN) enrollment and approval.
- EPN acceptance is based on proposed business model + agreement to abide by eBay policies.
- "Intended for eBay partners only."

**For SlabMetrics**: Browse API is useful for "what's currently for sale at what price" but cannot answer "what did this card actually sell for." Cannot build comp lookup on Browse API alone.

---

## Marketplace Insights API — the only sold-data path

The Marketplace Insights API retrieves sales history of items sold on eBay.

### Access status: Limited Release

- Not available to all developers. Designated as a "Limited Release" API.
- Available **only to select developers approved by eBay business units**.
- Access requests from independent/small developers are routinely denied based on community reports: "it's limited to approved partners and access can't be granted at this time" — eBay staff response to developer request.
- Best path: reach out directly to eBay developer support and apply; approval based on business case.

### What it returns
Sales history of sold eBay items — effectively what the old findCompletedItems returned, but gatekept.

### Scope
OAuth scope: `https://api.ebay.com/oauth/api_scope/buy.marketplace.insights` — this is the scope that needs to be approved.

---

## Sandbox vs. Production

| Environment | Access | Notes |
|---|---|---|
| Sandbox | Anyone who creates an eBay developer account | Free, self-service. Good for development and testing. |
| Production (Browse API) | eBay Partner Network (EPN) approval required | Application-based. Business model evaluated. |
| Production (Marketplace Insights) | eBay business unit approval (separate from EPN) | Harder to obtain. Limited Release. |

The business plan notes "eBay developer sandbox keys obtained; production access pending compliance" — this is correct framing, but the gate is not just compliance. It's a partner approval decision eBay makes on business model merit.

---

## Best Offer Accepted prices — special case

eBay's default sold-item UI shows the original listing price for Best Offer Accepted transactions — not the actual accepted price. This is a known data quality issue in the hobby.

- The actual accepted price is accessible via page source (`taxexc` field in the listing HTML) — manual workaround only.
- 130point built their core value prop around surfacing these actual prices. This means 130point is doing something beyond standard API access (web scraping, Marketplace Insights API, or a data licensing arrangement with eBay).
- The Browse API does not expose Best Offer Accepted prices for completed listings.

---

## Risk summary for SlabMetrics pricing pipeline

| Risk | Severity | Notes |
|---|---|---|
| Marketplace Insights API access denied | **HIGH** | Small developers commonly denied; no guaranteed path. |
| Browse API production access delayed | Medium | EPN approval process; business model evaluation. Sandbox available for dev. |
| 130point Card Pricing Direct unavailable or expensive | Medium | B2B product exists but pricing/terms not public. |
| Both eBay + 130point unavailable | **HIGH** | Fallbacks: CardCensus, MySlabs, COMC (per business plan risk section) |

**Recommended parallel tracks:**
1. Apply for eBay EPN production access now (already in progress).
2. Contact eBay developer support separately about Marketplace Insights API access — make the business case (decision intelligence for card investors, not a competing marketplace).
3. Contact 130point about Card Pricing Direct in parallel.
4. Do not wait on one before pursuing others.

---

## What competitors likely have

- **Card Ladder, Market Movers, 130point**: Almost certainly have eBay Marketplace Insights API access or a data licensing arrangement — they're established players with existing eBay data relationships.
- **SlabMetrics**: Starting from scratch. EPN + Marketplace Insights approvals are the gating items for the comp lookup free tier.
