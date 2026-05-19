---
type: scratch
tags: [n8n, automation, scraping, wiki-ingest, idea-parked]
updated: 2026-05-19
sources: []
certainty: Guessing
---

# n8n for wiki-ingest automation

## TL;DR

Park: use **n8n** to automate the multi-tab clipping pattern that's currently manual via Obsidian Web Clipper. Pick this up when starting n8n setup for the pricing pipeline — same headless-browser tooling, reuse the investment `[Guessing]`.

## What this would replace

Manual workflow (current):
1. Open Obsidian Web Clipper, click "clip" on a grading page.
2. Realize the page has tabs/accordions and only the visible one captured.
3. Click each tab in the browser, re-clip per tab.
4. End up with N raw files where filename order is clip-order, not grade-order — need to manually build a mapping table during ingest.

Observed pain points across the PSA / BGS / SGC ingests `[Certain — May 2026 session evidence]`:
- PSA: 12 separate clips for 11 grade tabs + 1 trailing-sections page; one botched clip (file 11) yielded only a mid-word fragment.
- BGS: 12 clips; Obsidian Web Clipper's title detection picked up a "Back Button" UI element instead of the page title, so all 12 raw files have the same useless title.
- SGC: 21 clips (cleanest of the three but still 21 manual actions).

## Why n8n specifically

User's `Sports-Card-Website/CLAUDE.md` already lists n8n in the tech stack for "Workflow automation + AI agent orchestration" — so the n8n investment is happening regardless of this idea. The wiki-ingest automation would be a side benefit of that setup, not new vendor adoption `[Likely]`.

n8n primitives that map to this problem:
- **HTTP / Headless-browser nodes** — load the page, execute JS, click tabs, dump DOM.
- **HTML-to-Markdown node or custom function** — convert to the Obsidian-friendly clip format with frontmatter.
- **Filesystem node** — write to `cards/raw/<sane-slug>-<grade-or-state>.md`.
- **Schedule node** — periodic re-ingest to detect content drift (could feed a "stale source" check into the wiki lint).

## Sketch of the flow

```
[Trigger: manual or scheduled]
   ↓
[Launch headless browser (Playwright via n8n community node)]
   ↓
[Navigate to target URL]
   ↓
[For each interactive element (tab/accordion):]
   ├─ click element
   ├─ wait for DOM update
   ├─ extract relevant section as HTML
   ├─ convert HTML → markdown
   └─ write to cards/raw/<service>-<grade>.md with proper frontmatter
   ↓
[Optionally: emit a notification when complete]
```

## Open questions to resolve when picking this up

- `[Guessing]` Does n8n's standard self-hosted instance ship with a headless-browser node, or does it need the Playwright community node? Verify before committing to architecture.
- `[Certain]` Terms of service. PSA / BGS / SGC don't love automated scraping. For a paid subscription product, "we automated capture of their grading-standards pages" is a worse legal posture than "we manually clipped for personal research." Decision required: scope automation to **our own data** (eBay sold listings via API, 130point, etc.), not the standards pages.
- `[Likely]` Naming consistency. The biggest tax during manual ingest was the clip-order → grade-order mapping table. An automated capture should name files deterministically (e.g., `psa-grading-standards-grade-08.md`) and embed the grade in frontmatter directly.
- `[Guessing]` Content drift detection. Standards pages rarely change; pricing pages change often. The same flow could feed different cadences for different sources.

## Don't do this yet

Manual clipping has captured 95% of the grading-standards content already across PSA / BGS / SGC. Remaining gaps (PSA 8.5, pricing tiers, qualifier definitions, no-grade taxonomies) are small enough that finishing them manually is faster than building automation. The actual leverage of n8n is on the **pricing pipeline** — automating clip-style capture of static reference pages is a side benefit, not a justification.

## Promote when

Promote this to a `topics/` page or a `decisions/` ADR if any of these happen `[Guessing]`:

- n8n setup is started for the pricing pipeline (reuse the headless-browser config).
- A new high-cardinality reference source needs ingesting (e.g., a full set checklist with hundreds of cards).
- Standards content drift becomes a recurring problem and manual re-ingest gets old.

## See also

- [[topics/pricing-pipeline]] — the actual reason n8n exists in the stack; this scratch note is a downstream beneficiary.
