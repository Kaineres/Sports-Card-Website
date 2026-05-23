---
type: topic
tags: [data-model, postgres, supabase]
updated: 2026-05-18
sources: []
certainty: Guessing
---

# Data model

## For future Claude

This page covers the Postgres data model — table structure, relationships, and Supabase RLS configuration.
Current state: stub with placeholder structure — not yet authoritative; do not cite claims from this page.
When fleshed out it will contain: table schemas for cards, comps, watchlists, collections, subscriptions, and RLS policies keyed to Clerk user IDs.

_(Stub — to be filled out as schema decisions land. Postgres on Supabase, RLS keyed off Clerk user IDs.)_

## TL;DR

Pending. Will hold Postgres table sketches once the first decisions are made.

## See also

- [[company/business-plan]] — product scope and v1 feature set determine which entities need Postgres tables (cards, comps, watchlists, collections, recommendations, subscriptions)
- [[topics/pricing-pipeline]] — comp ingestion writes to the tables defined here
- [[topics/architecture]] — overall system context for how the data model fits in
