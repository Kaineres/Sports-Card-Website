# Sports Card Website

Web + mobile platform for sports card collectors. Tracks card prices, manages portfolio collections, surfaces grading info, and runs predictive analytics on trending cards and positive expected-value opportunities. Subscription-based information product.

## Audience
Sports card collectors and sports enthusiasts who subscribe for optimal pricing and market information.

## Status
Very early. Currently a single `index.html`. Frontend framework not yet chosen. Rough target: 3 months (flexible).

## Working with me (communication policy)
- **Tag every factual claim, opinion, and recommendation** with `[Certain]`, `[Likely]`, or `[Guessing]`. If it's `[Guessing]`, say so out loud. Recommendations ("use Next.js") get tagged the same as facts ("Postgres supports JSONB").
- **Prefer "I don't know" to faked confidence.** Ten "I don't knows" beat one confident wrong answer.
- **Push back harder when I sound sure.** The more confident I sound, the more pressure-testing I need — confidence is a signal to challenge, not concede.
- **If my idea is bad, say so in the first sentence.** No warmup, no softening.
- **If my idea is good, earn the agreement** by surfacing a reason I haven't already thought of — not by restating what I said.

## Tech Stack

| Service | Purpose |
|---|---|
| **Supabase** | Primary database (Postgres). Edge Functions + extensions when needed. **Not** used for auth. |
| **Clerk** | Auth & user management (signup, login, sessions, security). |
| **Vercel** | Deployment / hosting. |
| **GitHub** | Version control. |
| **Stripe** | Payments + subscriptions. |
| **Resend** | Transactional + marketing email. |
| **Twilio** | SMS notifications + verification codes. |
| **Upstash** | Redis — hot cache + rate limiting. |
| **Cloudflare Turnstile** | Bot protection on forms. |
| **Sentry** | Error monitoring. |
| **PostHog** | Product analytics + user behavior. |
| **Pinecone** | Vector DB (similarity search, recommendations, predictive analytics). |
| **n8n** | Workflow automation + AI agent orchestration. |
| **Next.js 16 (App Router)** | Frontend framework. TypeScript. Deployed on Vercel. |
| **Tailwind CSS** | Styling. |
| **shadcn/ui** | Component primitives (copy-in, not a dependency lock). |
| **TanStack Query** | Client-side data fetching + caching. |
| **Zod** | Runtime validation. Shared schemas with mobile. |
| **React Hook Form** | Form state + validation (Zod resolver). |
| **React Native + Expo** | Mobile app (planned, post-web-MVP). Shares TypeScript types + Zod schemas with web. |

## Non-negotiables
- **Pricing accuracy is the product.** Every price must have a source and a timestamp. No estimated or fabricated values shown to users.
- **API-first architecture.** Web and mobile share one backend. Business logic lives server-side (Supabase Edge Functions / route handlers), not in the web frontend.
- **Auth = Clerk, DB = Supabase.** Supabase RLS keys off Clerk user IDs. Do not enable Supabase Auth — don't mix the two systems.

## Conventions
- Never commit secrets. Use Vercel env vars + `.env.local` (gitignored).
- All public-facing forms gated by Turnstile.
- All payment flows go through Stripe — no custom payment logic.
- Server-side rate limit any endpoint that touches Pinecone, n8n, or external pricing APIs (Upstash).

## Deeper context
Longer-form notes live in `docs/` (Obsidian vault). They are **not** auto-loaded — reference specific files when relevant (e.g., "read `docs/pricing-pipeline.md`"). Suggested early notes:
- `docs/architecture.md` — system diagram, data flow
- `docs/pricing-pipeline.md` — data sources, ingestion, validation
- `docs/data-model.md` — Postgres schema sketches
- `docs/decisions.md` — running log of "why we chose X"

## Frontend conventions
- **Next.js 16 App Router is current and has breaking changes vs older training data.** Verify patterns against `node_modules/next/dist/docs/` or current Next.js docs before writing code — do not rely on memory of older versions.
- **Server Components by default.** Drop to `"use client"` only when you need browser APIs, state, or event handlers.
- **Card pages are SEO-critical.** Use SSG / ISR for individual card pages; do not client-render content that should be indexed.
- **Charts and interactive widgets are client islands** inside otherwise-server pages.

## Open decisions
- **Pricing data sources.** eBay sold listings, 130point, PSA, COMC, etc. — needs research + licensing review.
- **Subscription tiers.** Pricing + entitlement model.
- **Chart library.** Recharts vs TanStack Charts vs Visx — pick once analytics requirements are concrete.
