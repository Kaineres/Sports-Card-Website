---
type: decision
tags: [frontend, next-js, react, server-components, vercel]
updated: 2026-05-23
sources: []
certainty: Certain
---

# ADR 0002 — Next.js 16 App Router + Server Components default

## TL;DR

Use Next.js 16 App Router. Server Components are the default; `"use client"` is used only for browser APIs, state, or event handlers. Card pages use SSG/ISR for SEO.

## Context

SlabMetrics needs a web frontend deployable on Vercel that is:
1. SEO-friendly for card detail pages (individual card comps should be indexable)
2. Fast for data-heavy views (price tables, portfolio summaries)
3. Shareable with the planned React Native mobile app at the TypeScript/Zod schema level

Next.js 16 introduced the App Router (stable in Next 13, fully mature by Next 16) with React Server Components as the default rendering model.

## Decision

**Next.js 16 App Router** is the frontend framework. Deployed on Vercel (native integration, zero-config).

**Rendering rules:**
- Server Components by default — all route segments and layouts are server-rendered unless explicitly opted out
- `"use client"` only when a component needs: browser APIs (window, localStorage), React state/hooks, or event handlers (onClick, onChange)
- Charts, real-time price widgets, and interactive collection editors are client islands inside otherwise-server pages
- Card detail pages: **SSG with ISR** — statically generated at build time, revalidated on a schedule. Not client-rendered. SEO is critical for discovery.

## Alternatives considered

**Pages Router (Next.js legacy)** — Rejected. App Router is the current direction for Next.js. Starting a new project on Pages Router would create migration debt immediately.

**Remix** — Considered briefly. Strong server-rendering story and good DX, but smaller ecosystem, less mature Vercel integration, and team familiarity is lower. Next.js wins on ecosystem and deployment simplicity.

**SPA (Vite + React)** — Rejected. No SSR/SSG means card pages are not indexable. Comp lookup is a core free-tier feature that should be discoverable via search. SEO is non-negotiable.

## Consequences

**Enables:**
- Card detail pages are fully indexable (SSG/ISR)
- Server Components reduce client bundle size and eliminate loading states for static data
- Vercel deployment is zero-config
- TypeScript + Zod schemas shared with React Native mobile (post-MVP)

**Costs:**
- Next.js 16 App Router has breaking changes vs. Next.js 12/13 patterns — LLM training data is unreliable for App Router specifics. Must verify patterns against current docs, not memory.
- Mixing Server and Client Components requires discipline — the `"use client"` boundary is easy to over-use

**Locks us into:**
- Vercel as the natural deployment target (though self-hosting is possible)
- React ecosystem for the foreseeable future

## Status

Active.

## See also

- [[topics/architecture]] — full system context including SSR/SSG rendering decisions
- [[company/business-plan]] — card detail pages and comp lookup are the free-tier SEO surface
