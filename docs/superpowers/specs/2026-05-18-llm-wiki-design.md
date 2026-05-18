# LLM Wiki — Design

**Date:** 2026-05-18
**Status:** Approved, pending implementation plan
**Vault root:** `docs/` (Obsidian vault inside the Sports-Card-Website repo)

## Motivation

The vault is currently empty (one untouched `Untitled.base` and a `superpowers/` planning folder). We want to instantiate the "LLM Wiki" pattern: an LLM-maintained, persistent, interlinked markdown knowledge base. Raw sources are immutable inputs; the LLM owns the synthesis layer.

Two domains will live in the same vault:

1. **Sports cards** — players, sets, brands, grading services, market dynamics, investment theses.
2. **Sports-Card-Website engineering** — architecture, decisions, vendor evaluations, debugging notes.

These domains overlap (the product is *about* sports cards), and cross-references will be valuable, so they share one vault but live in sibling folders.

## Goals

- LLM maintains both wikis with low per-source overhead.
- Cross-references between the two domains work naturally (Obsidian wikilinks, single graph view).
- Style discipline from the parent `CLAUDE.md` (certainty tags, pushback culture) carries into wiki content.
- Lean by default — no Dataview / Marp / qmd until a real need appears.
- Knowledge compounds: synthesis from queries can be filed back as wiki pages.

## Non-goals

- No custom CLI tooling at v1 (Obsidian's built-in search + `index.md` is enough at the starting scale).
- No automated ingestion pipeline. Sources arrive via Obsidian Web Clipper or manual drop; the human kicks off ingest.
- No multi-user / collaborative editing — single-user vault, single LLM.
- No embedding-based RAG. Indexing is via `index.md` and Obsidian's built-in search.

## Architecture

### Directory layout

```
docs/                                # Obsidian vault root
├── CLAUDE.md                        # wiki schema (loaded when claude starts in docs/)
├── README.md                        # human-facing intro
├── superpowers/                     # planning / specs (NOT part of the wiki itself)
│   ├── specs/
│   └── plans/
├── cards/                           # sports cards sub-wiki
│   ├── raw/                         # immutable sources (human-managed)
│   │   ├── assets/                  # downloaded images
│   │   └── ...                      # articles, transcripts, PDFs, CSVs
│   ├── wiki/                        # LLM-generated pages
│   │   ├── entities/                # players, sets, brands, grading services
│   │   ├── concepts/                # grading, autographs, parallels, market mechanics
│   │   ├── sources/                 # one summary page per raw source
│   │   └── synthesis/               # theses, comparisons, opinions
│   ├── index.md                     # catalog of wiki pages
│   └── log.md                       # chronological event log
└── engineering/                     # Sports-Card-Website project sub-wiki
    ├── raw/
    │   ├── assets/
    │   └── ...
    ├── wiki/
    │   ├── decisions/               # ADRs, numbered (0001-, 0002-, …)
    │   ├── topics/                  # architecture.md, pricing-pipeline.md, etc.
    │   ├── vendors/                 # supabase.md, clerk.md, stripe.md, …
    │   ├── sources/                 # vendor doc / blog post summaries
    │   ├── scratch/                 # debugging notes, "what I tried"
    │   └── synthesis/               # cross-cutting analyses
    ├── index.md
    └── log.md
```

### Ownership rules

- **Human owns:** everything under any `raw/` folder. The LLM reads but never modifies.
- **LLM owns:** everything under any `wiki/` folder, plus `index.md` and `log.md` in both sub-wikis.
- **Co-owned:** `docs/CLAUDE.md` (schema evolves through conversation), `docs/README.md`.
- **Out of scope for the wiki:** `docs/superpowers/` — that's planning/spec material, not wiki content. The LLM should not ingest specs as if they were sources.

### CLAUDE.md placement

`docs/CLAUDE.md` is **separate from** the project-level `Sports-Card-Website/CLAUDE.md`. Claude Code merges CLAUDE.md files up the directory tree:

- Launched from `docs/`: project-level + wiki-level both load.
- Launched from repo root: only project-level loads.

This matches the existing parent-CLAUDE.md policy that "docs/ files are not auto-loaded."

## Page conventions

### Frontmatter

Every wiki page carries this YAML header:

```yaml
---
type: entity | concept | source | synthesis | decision | topic | vendor | scratch
tags: [free-form, but consistent within a type]
updated: YYYY-MM-DD
sources: [[sources/...]]   # array of wikilinks to source-summary pages
certainty: Certain | Likely | Guessing   # overall confidence in page contents
---
```

### Linking

- Use Obsidian-style `[[wikilinks]]` everywhere, not standard markdown links. Survives renames via Obsidian auto-update; populates the graph view.
- All cross-references between wiki pages: `[[entities/lebron-james]]`.
- All citations to sources: `[[sources/2024-03-cci-modern-parallels]]`.

### Certainty tags (inline)

Every factual claim carries `[Certain]`, `[Likely]`, or `[Guessing]` — matching the parent CLAUDE.md style. If a claim can't be tagged, it doesn't belong on the page.

```markdown
LeBron's 2003 Topps Chrome /500 refractor pop is ~80 [Certain] (see [[sources/psa-pop-report-2024]]).
The "modern parallels are overproduced" thesis is contested [Likely] — see [[sources/cci-2025-parallel-glut]].
```

### Contradictions

When a new source disagrees with an existing claim, the LLM does NOT silently overwrite. It adds a "Contradictions" section to the affected page:

```markdown
## Contradictions
- [[sources/psa-pop-report-2024]] says pop is ~80, but [[sources/beckett-2025-q1]] reports ~120. Likely Beckett includes BGS pops alongside PSA [Guessing] — needs verification.
```

Contradictions stay visible until resolved by a newer source or human input. The lint workflow flags long-standing ones for triage.

### Source-summary pages

Every raw file gets exactly one page in `<wiki>/sources/`. Structure:

- H1 title (matches source title).
- Frontmatter with `type: source`, link to raw file path, original URL if available.
- TL;DR (1–3 bullets).
- Key claims, each with a certainty tag.
- "Pages updated by this source" — wikilinks to every page that absorbed content from this source.

This is the bridge between immutable raw and the living wiki: every wiki claim is traceable to a source-summary, which is traceable to a raw file.

### Minimum viable page

Every page has:
- H1 title.
- Valid frontmatter.
- TL;DR (1–2 sentences).
- At least one inbound link from `index.md`.

Orphan pages (no inbound links) are flagged on lint.

## The `docs/CLAUDE.md` schema (~150–200 lines)

Sketch of section structure:

1. **Purpose** — what this vault is, two sub-wikis, ownership rules.
2. **Inherits** — explicit reference to parent CLAUDE.md style (certainty tags, pushback, no softballing). Do not duplicate; just point.
3. **Page conventions** — frontmatter, wikilinks, certainty discipline, contradiction handling, source-summary requirement.
4. **Operations** — ingest / query / lint workflows (detailed below).
5. **Per-wiki guidance** — short notes:
   - Cards: prefer entity/concept distinction; when in doubt, entity.
   - Engineering: when to write an ADR (`decisions/`) vs a topic (`topics/`) vs a scratch note (`scratch/`).
6. **Don't do this** — explicit anti-patterns:
   - Never modify anything in `raw/`.
   - Never fabricate citations.
   - Never overwrite a claim that contradicts new evidence — add a Contradictions section instead.
   - Never skip the `log.md` append on ingest/lint.
   - Never tag a claim that lacks a source.
   - Never ingest content from `docs/superpowers/` — that's planning material, not source material.

## Workflows

### Ingest

Trigger: human drops a file into `<wiki>/raw/` and says "ingest `raw/cards/<file>`".

1. LLM reads the source end-to-end.
2. LLM gives the human a 5-bullet TL;DR and asks "want me to emphasize anything?"
3. LLM writes `<wiki>/sources/<source-slug>.md` (TL;DR + key claims with certainty tags).
4. LLM identifies affected wiki pages, updates them: adds claims, flags contradictions, adds wikilinks, refreshes page `updated:` field.
5. LLM updates `<wiki>/index.md` — adds new pages, refreshes one-line summaries on modified pages.
6. LLM appends a log entry to `<wiki>/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | <source title>
   - source: [[sources/<source-slug>]]
   - new pages: [[…]], [[…]]
   - updated pages: [[…]], [[…]]
   - contradictions flagged: [[…]]
   ```
7. LLM reports back to human: "Touched N pages, created M, flagged K contradictions."

### Query

Trigger: human asks a question.

1. LLM reads the relevant sub-wiki's `index.md` to find candidate pages.
2. LLM reads 3–8 relevant pages (drilling in via wikilinks as needed).
3. LLM answers with:
   - Every factual claim tagged `[Certain] | [Likely] | [Guessing]`.
   - Every claim cited via `[[sources/...]]` wikilink.
4. LLM offers: "Want me to file this analysis as `<wiki>/synthesis/<slug>.md`?" — answers can compound back into the wiki.
5. If filed, append a log entry:
   ```
   ## [YYYY-MM-DD] synthesis | <question>
   - filed as: [[synthesis/<slug>]]
   - draws from: [[…]], [[…]]
   ```

### Lint

Trigger: human says "lint the cards wiki" (or engineering).

1. LLM scans for:
   - Orphan pages (no inbound links anywhere).
   - Long-standing unresolved contradictions.
   - Important entities/concepts mentioned across pages but lacking their own page.
   - Claims without source citations.
   - Frontmatter drift (missing fields, invalid `type` values).
   - Stale `updated:` dates on pages that newer sources should have touched.
2. LLM writes a report to chat — does NOT auto-fix.
3. Human triages; LLM applies approved fixes.
4. Log entry:
   ```
   ## [YYYY-MM-DD] lint | <wiki>
   - issues found: N
   - fixes applied: M
   ```

## Day-zero seed contents

Files created on initial setup:

**Top-level:**
- `docs/CLAUDE.md` — full schema, ~150–200 lines.
- `docs/README.md` — short human intro.

**Cards sub-wiki:**
- `docs/cards/index.md` — empty catalog with section headers (Entities / Concepts / Sources / Synthesis).
- `docs/cards/log.md` — single seed entry: `## [2026-05-18] init | cards wiki seeded`.
- `docs/cards/raw/.gitkeep`, `docs/cards/raw/assets/.gitkeep`.
- `docs/cards/wiki/entities/.gitkeep`, `docs/cards/wiki/concepts/.gitkeep`, `docs/cards/wiki/sources/.gitkeep`, `docs/cards/wiki/synthesis/.gitkeep`.

**Engineering sub-wiki:**
- `docs/engineering/index.md` — empty catalog with section headers (Decisions / Topics / Vendors / Sources / Synthesis).
- `docs/engineering/log.md` — single seed entry.
- All `.gitkeep` placeholders for `raw/`, `raw/assets/`, `wiki/decisions/`, `wiki/topics/`, `wiki/vendors/`, `wiki/sources/`, `wiki/scratch/`, `wiki/synthesis/`.
- **Stubs (frontmatter only, no body), to give early ingests targets** — these come from suggestions in the parent CLAUDE.md:
  - `docs/engineering/wiki/topics/architecture.md`
  - `docs/engineering/wiki/topics/pricing-pipeline.md`
  - `docs/engineering/wiki/topics/data-model.md`
  - `docs/engineering/wiki/decisions/0000-template.md` — ADR template (not a real decision).

Cards sub-wiki stays bare: no presupposed entity pages. First real ingest creates the first entity/concept pages.

## Tooling

**Install:**
1. **Obsidian Web Clipper** (browser extension) — set save folder to `docs/cards/raw/` for card articles, `docs/engineering/raw/` for vendor docs.
2. **Obsidian image-download hotkey** — Settings → Files & Links → Attachment folder path = `<current wiki>/raw/assets/`. Settings → Hotkeys → bind "Download attachments for current file" to `Ctrl+Shift+D`. Run after each clip so referenced images live on disk and the LLM can view them directly.

**Built-in, already available:**
- Obsidian graph view — sanity-check connectivity after a few ingests.
- Git (vault is inside the project repo) — free version history.

**Deliberately deferred (re-evaluate after ~3 months of use):**
- Dataview — add when frontmatter discipline starts paying dividends (e.g., "show me all `decisions/` updated in the last month").
- Marp — add when a synthesis page would genuinely benefit from being a slide deck.
- qmd or other dedicated search — add when `index.md` + Obsidian search starts feeling inadequate (rough threshold: ~200+ wiki pages).

## Open questions / future work

- **First real ingest** — pick a representative source for each sub-wiki to validate the pattern in practice. Likely: one Cardboard Connection article (cards), one Supabase docs page (engineering).
- **YouTube transcript workflow** — depends on how transcripts get extracted (YouTube auto-caption export? third-party tool?). Defer until first attempt.
- **eBay sold data ingestion** — semi-structured data, may need a different ingestion path than text articles. Defer until first dataset arrives.
- **PDF handling** — Claude Code can read PDFs natively up to 20 pages per request; longer PDFs need a chunking workflow. Defer until first long PDF arrives.

## Approval gate

This spec has been reviewed and approved in conversation. Next step: implementation plan via `writing-plans` skill.
