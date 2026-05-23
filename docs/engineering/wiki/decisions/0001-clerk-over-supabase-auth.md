---
type: decision
tags: [auth, clerk, supabase, rls, security]
updated: 2026-05-23
sources: []
certainty: Certain
---

# ADR 0001 — Clerk over Supabase Auth

## TL;DR

Use Clerk for all authentication. Supabase Auth is disabled. Supabase RLS policies key off the Clerk JWT `sub` claim.

## Context

SlabMetrics needs user authentication for collections, watchlists, and subscriptions. Supabase includes a built-in auth system (`auth.users`, email/password, OAuth). Clerk is a dedicated auth-as-a-service product with a richer feature set (MFA, device management, session revocation, org support, pre-built UI components).

The critical constraint: **Supabase RLS must know who the user is** to enforce row-level security. This creates a coupling question — does identity live in Supabase or externally?

## Decision

**Clerk handles all auth.** Supabase Auth is disabled entirely (`auth.users` is not used). Supabase is configured with Clerk's JWT secret so it can verify Clerk-issued JWTs. RLS policies use `auth.jwt() ->> 'sub'` (the Clerk user ID) instead of `auth.uid()`.

Pattern in every RLS policy:
```sql
user_id = auth.jwt() ->> 'sub'
```

`user_id` columns store the Clerk `sub` string, not a UUID foreign key to `auth.users`.

## Alternatives considered

**Supabase Auth only** — Rejected. Supabase Auth's feature set (MFA, session management, security tooling) is materially weaker than Clerk's. Clerk's pre-built React components eliminate significant UI work. Migration away from Supabase Auth later would be painful.

**Both systems in parallel** — Rejected. Running two auth systems creates identity sync problems, duplicate user records, and confusion about which is the source of truth. The cost of maintaining sync would compound over time.

## Consequences

**Enables:**
- Rich auth UX out of the box (Clerk's pre-built components, passkeys, MFA, social login)
- Clean separation: Clerk owns identity, Supabase owns data
- No `auth.users` table complexity; no Supabase Auth migration risk

**Costs:**
- Clerk is an external vendor dependency with its own pricing at scale
- Future Claude sessions must know not to use `auth.uid()` — always `auth.jwt() ->> 'sub'`
- Every table with user-scoped data needs `user_id text` columns (not `uuid references auth.users`)

**Locks us into:**
- Clerk JWT format for RLS policies. If we ever switch auth providers, all RLS policies need updating.

## Status

Active.

## See also

- [[topics/architecture]] — system-wide context for the Clerk + Supabase integration
- [[topics/data-model]] — all user-scoped tables use `user_id text` + this RLS pattern
