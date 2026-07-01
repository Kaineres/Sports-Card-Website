# SlabMetrics — Mobile App

## 95% Confidence Rule
Do not make any changes until you have 95% confidence in what you need to build. Ask follow-up questions until you reach that confidence.

## Tech Stack

| Service | Purpose |
|---|---|
| **Supabase** | Primary database (Postgres). Edge Functions + extensions when needed. **Not** used for auth. |
| **Clerk** | Auth & user management. Supabase RLS keys off Clerk user IDs. Do not enable Supabase Auth. |
| **Vercel** | Deployment / hosting. |
| **Stripe** | Payments + subscriptions. |
| **Resend** | Transactional + marketing email. |
| **Twilio** | SMS notifications + verification codes. |
| **Upstash** | Redis — hot cache + rate limiting. |
| **Cloudflare Turnstile** | Bot protection on forms. |
| **Sentry** | Error monitoring. |
| **PostHog** | Product analytics + user behavior. |
| **Pinecone** | Vector DB (similarity search, recommendations, predictive analytics). |
| **n8n** | Workflow automation + AI agent orchestration. |
| **React Native + Expo** | **Primary platform.** iOS + Android mobile app. |
| **Expo Router** | File-based navigation (App Router pattern for mobile). |
| **NativeWind** | Tailwind CSS for React Native styling. |
| **Zod** | Runtime validation. Shared schemas across mobile + web. |
| **TanStack Query** | Client-side data fetching + caching. |
| **React Hook Form** | Form state + validation (Zod resolver). |
| **Next.js 16 (App Router)** | Web companion / marketing + SEO surface. Deployed on Vercel. |
| **Tailwind CSS** | Web styling. |
| **shadcn/ui** | Web component primitives (copy-in, not a dependency lock). |

## Build Commands

```bash
# Mobile (primary)
cd apps/mobile
npx expo start        # dev server (opens Expo Go or simulator)
npx expo run:ios      # native iOS build
npx expo run:android  # native Android build

# Web companion
cd apps/web
npm run dev      # local dev server
npm run build    # production build
npm run lint     # lint check
```

## Conventions

- Never commit secrets. Use Vercel env vars + `.env.local` (gitignored).
- All public-facing forms gated by Turnstile.
- All payment flows go through Stripe — no custom payment logic.
- Server-side rate limit any endpoint that touches Pinecone, n8n, or external pricing APIs (Upstash).
- Business logic lives server-side (Supabase Edge Functions / route handlers), not in the web frontend.
- Every price shown to users must have a source and a timestamp — no estimated or fabricated values.

## Mobile Conventions

- **React Native + Expo is the primary surface.** Build features for mobile first; web is secondary.
- **Camera and device APIs** (camera, torch, haptics, notifications) are the core differentiator — use Expo SDK modules.
- **Shared logic** (Zod schemas, API clients, business logic) lives in `packages/` so both mobile and web can consume it.
- **No client-side business logic** — keep pricing, grading, and AI calls server-side (Supabase Edge Functions / route handlers).

## Web Conventions

- **Server Components by default.** Drop to `"use client"` only when you need browser APIs, state, or event handlers.
- **Next.js 16 App Router** has breaking changes vs older training data — verify patterns before writing code.
- **Card pages are SEO-critical.** Use SSG / ISR; do not client-render indexable content.

## Applied Learning

When something fails repeatedly, when the user has to re-explain, or when a workaround is found for a platform/tool limitation, add a one-line bullet here. Keep each bullet under 15 words. No explanations. Only add things that will save time in future sessions.

- Templates + Puppeteer for visual consistency. AI image gen for one-offs only.
- Agents fail silently on wrong paths. Always verify hardcoded paths.
- New skills need a validation step before rendering. First runs have data gaps.
- Google Slides `autofit` crashes batchUpdate. Set font sizes explicitly.
- Windows Developer Mode required for symlinks (Paperclip, etc.).
- `temperature` is deprecated for claude-sonnet-5 — omit it or API 400s.
- No local ANTHROPIC_API_KEY; grader runs only on Vercel — test in production.
- `docs/` is a separate gitignored repo (no remote). Tracked docs go in `dev-docs/`.
- Bash tool sandbox discards git index writes — disable sandbox to commit.
- Auto-deploy timer commits working tree to main every ~1–2 min.
