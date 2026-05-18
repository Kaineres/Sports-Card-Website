# Wiki schema

This `docs/` directory is an Obsidian vault and an LLM-maintained wiki. This file tells you (the LLM) how to operate within it.

This file is loaded **in addition to** the parent `Sports-Card-Website/CLAUDE.md`. All policies from the parent — certainty tags (`[Certain]/[Likely]/[Guessing]`), pushback culture, "if my idea is bad, say so first sentence" — apply here. Do not duplicate them; they propagate automatically.

## What this vault is

Two sibling sub-wikis live under this folder:

- `cards/` — sports cards domain knowledge: players, sets, brands, grading services, market dynamics, investment theses.
- `engineering/` — Sports-Card-Website project knowledge: architecture decisions, vendor evaluations, debugging notes.

A planning folder also lives here but is **not part of the wiki:**

- `superpowers/` — specs and plans. Never ingest these as sources.

## Ownership rules

| Path                       | Owner       | LLM may modify?                                   |
|----------------------------|-------------|---------------------------------------------------|
| `<wiki>/raw/**`            | Human       | **NO. Never.** Read-only inputs.                  |
| `<wiki>/wiki/**`           | LLM         | Yes — this is your output layer.                  |
| `<wiki>/index.md`          | LLM         | Yes — update on every ingest.                     |
| `<wiki>/log.md`            | LLM         | Append-only. Never edit prior entries.            |
| `docs/CLAUDE.md` (this)    | Co-owned    | Edit through conversation.                        |
| `docs/README.md`           | Co-owned    | Edit through conversation.                        |
| `docs/superpowers/**`      | Human       | Spec/plan work only; never treat as wiki content. |

`<wiki>` = `cards` or `engineering`.

## Page conventions

All wiki pages (anything under `<wiki>/wiki/`) carry this YAML frontmatter:

```yaml
---
type: entity | concept | source | synthesis | decision | topic | vendor | scratch
tags: [free-form, consistent within a type]
updated: YYYY-MM-DD
sources: [[sources/...]]    # array of wikilinks to source-summary pages
certainty: Certain | Likely | Guessing
---
```

Use Obsidian-style `[[wikilinks]]`, not standard markdown links. They survive renames and populate the graph view.

Every factual claim carries `[Certain]`, `[Likely]`, or `[Guessing]` — same scheme as the parent CLAUDE.md. If a claim can't be tagged, it doesn't belong on the page.

Every claim has a source citation: `[[sources/<slug>]]`. No source = the claim doesn't go in.

### Contradictions

When new evidence disagrees with an existing claim, do **NOT** silently overwrite. Add a "Contradictions" section to the affected page:

```markdown
## Contradictions
- [[sources/foo]] says X, but [[sources/bar]] says Y. Likely Z [Guessing] — needs verification.
```

Lint surfaces unresolved contradictions for triage.

### Source-summary pages

Every raw file gets exactly one page in `<wiki>/sources/`:

- H1 title matching the source.
- Frontmatter: `type: source`, link to raw file path, original URL if known.
- TL;DR (1–3 bullets).
- Key claims, each tagged with certainty.
- "Pages updated by this source" — wikilinks to every wiki page that absorbed content from this source.

This is the bridge between immutable raw and the living wiki. Every wiki claim traces to a source-summary, which traces to a raw file.

### Minimum viable page

Every wiki page has:

- H1 title.
- Valid frontmatter.
- TL;DR (1–2 sentences).
- At least one inbound link from `index.md`.

Orphans get flagged on lint.

## Operations

### Ingest

Trigger: human says "ingest `<wiki>/raw/<file>`".

1. Read the source end-to-end.
2. Give the human a 5-bullet TL;DR. Ask: "want me to emphasize anything?"
3. Write `<wiki>/sources/<slug>.md` per the source-summary spec.
4. Identify affected wiki pages. Update them: add claims, flag contradictions, add wikilinks, bump `updated:`.
5. Update `<wiki>/index.md` (add new pages, refresh changed-page summaries).
6. Append to `<wiki>/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | <source title>
   - source: [[sources/<slug>]]
   - new pages: [[...]]
   - updated pages: [[...]]
   - contradictions flagged: [[...]]
   ```
7. Report back: "Touched N pages, created M, flagged K contradictions."

### Query

Trigger: human asks a question.

1. Read `index.md` for the relevant sub-wiki.
2. Drill into 3–8 pages via wikilinks.
3. Answer with every claim tagged and every claim cited via `[[sources/...]]`.
4. Offer: "Want me to file this as `<wiki>/synthesis/<slug>.md`?" — answers compound back into the wiki.
5. If filed, log:
   ```
   ## [YYYY-MM-DD] synthesis | <question>
   - filed as: [[synthesis/<slug>]]
   - draws from: [[...]]
   ```

### Lint

Trigger: human says "lint cards" or "lint engineering".

Scan for:

- Orphan pages (no inbound links).
- Long-standing unresolved contradictions.
- Entities/concepts mentioned across pages but lacking their own page.
- Claims without source citations.
- Frontmatter drift (missing fields, invalid `type`).
- Stale `updated:` dates on pages newer sources should have touched.

Write a report to chat. Do **NOT** auto-fix. Human triages; apply approved fixes. Log:

```
## [YYYY-MM-DD] lint | <wiki>
- issues found: N
- fixes applied: M
```

## Per-wiki guidance

### `cards/`

Default to **entity pages** when in doubt. A **concept page** is justified when content spans multiple entities (e.g., "PSA grading" applies to all cards). **Synthesis pages** are theses or comparisons — they have opinions, not just facts.

### `engineering/`

When to write what:

- **`decisions/0NNN-<slug>.md`** — durable "we chose X because Y" records. Numbered, dated. Once written, the decision is immutable; subsequent reversals get their own new decision page that references the old one.
- **`topics/<slug>.md`** — evergreen subject pages (`architecture.md`, `pricing-pipeline.md`, `data-model.md`). These evolve.
- **`vendors/<slug>.md`** — one page per vendor (Supabase, Clerk, Stripe, etc.) with status, gotchas, links to docs.
- **`scratch/<slug>.md`** — debugging notes, "what I tried," looser. Promote to topic/decision when it stabilizes.

## Don't do this

- Never modify anything in `raw/`.
- Never fabricate citations. If you need a source you don't have, say so.
- Never silently overwrite a claim contradicted by new evidence — add a Contradictions section.
- Never skip the `log.md` append on ingest, lint, or synthesis-filing.
- Never tag a claim that lacks a source citation.
- Never ingest anything from `docs/superpowers/` — that's planning material, not source material.
- Never delete or rewrite past `log.md` entries. Append only.
- Never create a wiki page without frontmatter + TL;DR + at least one inbound link.
