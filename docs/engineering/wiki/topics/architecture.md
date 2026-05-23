---
type: topic
tags: [architecture, system-design, next-js, supabase, clerk, vercel]
updated: 2026-05-23
sources: []
certainty: Likely
---

# Architecture

## For future Claude
This page documents the SlabMetrics system architecture — confirmed tech stack choices, component responsibilities, and data flow. Relevant when: designing a new feature, wiring a new vendor integration, understanding where business logic lives, or deciding whether something belongs in the frontend vs. backend.
Key constraint: **API-first**. Web and mobile share one backend. Business logic lives server-side (Supabase Edge Functions or Next.js route handlers), never in the React frontend. Auth = Clerk only — Supabase Auth is disabled and must not be used.

## TL;DR

SlabMetrics is a Next.js 16 App Router frontend (Vercel) backed by Supabase Postgres, with Clerk handling all auth. n8n orchestrates the pricing data pipeline. Server Components are the default; client components are islands only. `[Certain]` — [[company/business-plan]], CLAUDE.md.

## Tech stack

| Layer | Service | Role |
|---|---|---|
| Frontend | **Next.js 16 App Router** (TypeScript) | Web app. Deployed on Vercel. |
| Styling | **Tailwind CSS** + **shadcn/ui** | Components copied in — not a dependency lock. |
| Data fetching | **TanStack Query** | Client-side caching and server state. |
| Forms | **React Hook Form** + **Zod** | Form state + runtime validation. Zod schemas shared with mobile. |
| Database | **Supabase** (Postgres) | Primary database. Edge Functions for server-side logic. |
| Auth | **Clerk** | All auth — signup, login, sessions, MFA, security. |
| Payments | **Stripe** | Subscriptions + all payment flows. No custom payment logic. |
| Cache / rate limiting | **Upstash** (Redis) | Hot cache + rate limiting on external API calls. |
| Email | **Resend** | Transactional + marketing email. |
| SMS | **Twilio** | SMS notifications + verification codes. |
| Bot protection | **Cloudflare Turnstile** | All public-facing forms. |
| Error monitoring | **Sentry** | Runtime error capture. |
| Product analytics | **PostHog** | User behavior + funnel analysis. |
| Vector DB | **Pinecone** | Similarity search, card recommendations, predictive analytics. |
| Workflow automation | **n8n** | Pricing pipeline orchestration + AI agent workflows. |
| Mobile (planned) | **React Native + Expo** | Post-web-MVP. Shares TypeScript types + Zod schemas with web. |

`[Certain]` — CLAUDE.md tech stack table.

## Non-negotiables

- **Auth = Clerk, DB = Supabase.** Supabase RLS keys off Clerk user IDs. Supabase Auth is disabled — do not enable it.
- **API-first.** Web and mobile share one backend. Business logic in Supabase Edge Functions or Next.js route handlers — never in the React layer.
- **Pricing accuracy.** Every price must have a source and a timestamp. No estimated or fabricated values shown to users.
- **All forms gated by Turnstile.** No public form without bot protection.
- **All payment flows through Stripe.** No custom payment logic.
- **Rate limit external API calls via Upstash.** Any endpoint touching Pinecone, n8n, or external pricing APIs must be rate-limited.

`[Certain]` — CLAUDE.md non-negotiables.

## Frontend conventions

- **Server Components by default.** Drop to `"use client"` only for browser APIs, state, or event handlers.
- **Card pages are SEO-critical.** Use SSG / ISR for individual card pages — do not client-render indexable content.
- **Charts and interactive widgets are client islands** inside otherwise-server pages.
- **Next.js 16 App Router has breaking changes** vs. older training data. Verify patterns against current docs, not memory of Next.js 13/14.

`[Certain]` — CLAUDE.md frontend conventions.

## Data flow (high-level)

```
External pricing APIs (eBay, 130point)
  → n8n ingestion pipeline
    → Supabase Postgres (comps table, timestamped + sourced)
      → Next.js route handlers / Edge Functions
        → React Server Components → user

Prediction market APIs (Kalshi, Polymarket) — no auth needed
  → n8n signal polling
    → recommendations table (Buy/Hold/Sell + signal scores)

User request:
  Browser → Next.js (Vercel)
    → Clerk JWT verified
      → Supabase RLS (row-level security keyed to Clerk user ID)
        → query results → Server Component → HTML
```

`[Likely — pre-MVP sketch; subject to revision]`

## Clerk + Supabase RLS wiring

Supabase RLS policies use the Clerk JWT's `sub` claim as the user identifier:

```sql
-- example RLS policy
auth.jwt() ->> 'sub' = user_id
```

Clerk issues a JWT; Supabase verifies it via a configured JWT secret. This is the standard pattern — do not use Supabase's own user management or `auth.users` table. `[Certain]` — CLAUDE.md non-negotiable.

See [[decisions/0001-clerk-over-supabase-auth]] for the rationale.

## Open questions

- Supabase Edge Functions vs. Next.js route handlers — where does each type of server-side logic live? (No ADR yet.)
- CDN / image optimization strategy for card images.
- WebSocket vs. polling for real-time price alerts.

## See also

- [[company/business-plan]] — product scope and feature set this architecture must support
- [[topics/pricing-pipeline]] — the most complex subsystem; n8n + external API ingestion
- [[topics/data-model]] — Postgres schema; tables the architecture reads and writes
- [[decisions/0001-clerk-over-supabase-auth]] — why Clerk is auth, not Supabase Auth
- [[decisions/0002-nextjs-app-router]] — why Next.js 16 App Router + Server Components default
- [[vendors/ebay-api]] — critical-path pricing data source
- [[vendors/130point]] — comp data fallback and parallel track
- [[vendors/kalshi]] — Wedge Signal #1 data source
- [[vendors/polymarket]] — Wedge Signal #1 data source (parallel)
