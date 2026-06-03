# Obsidian Vault AI Optimization — Design Spec

**Date:** 2026-05-22
**Status:** Approved, pending implementation plan
**Goal:** Reduce token burn and improve cross-session memory for the SlabMetrics docs vault by wiring automation hooks and improving vault content structure.

---

## Problem Statement

The `docs/` Obsidian vault has solid structure (two sub-wikis, index files, `_CLAUDE.md`) but four gaps that waste tokens and break continuity:

| Problem | Root cause |
|---|---|
| Cold-start token burn | `_CLAUDE.md` exists but isn't auto-loaded — Claude re-reads structure each session |
| Per-page read cost | Wiki pages have no preamble — Claude reads full pages to determine relevance |
| Cross-session knowledge loss | Session insights don't flow back to the vault when context compacts |
| Query cost | No synthesis pages — cross-cutting questions require reading 4-5 entity pages |

---

## Approach

Five changes in two categories:

**Tooling (hooks):**
1. SessionStart hook — auto-inject vault context at session open
2. PostCompact hook — background agent saves session insights on compaction

**Vault content:**
3. AI-first preambles on all existing wiki pages
4. `CRITICAL_FACTS.md` — always-loaded cheat sheet
5. Three synthesis pages for highest-query topics

---

## Section 1 — SessionStart Hook

**File:** `.claude/scripts/load-vault-context.ps1`
**Registration:** Project `.claude/settings.json` under `SessionStart`

**Behavior:** Runs at the start of every Claude Code session in this project. Reads three files and outputs their contents to stdout. Claude Code captures stdout and injects it as a `system-reminder`, so Claude starts every session with vault context already loaded.

**Files injected (~1,500 tokens total):**
- `docs/CRITICAL_FACTS.md` — cheat sheet, read first
- `docs/_CLAUDE.md` — vault operating manual, folder map, auto-save rules
- `docs/cards/index.md` — cards wiki catalog
- `docs/engineering/index.md` — engineering wiki catalog

**Script logic:**
```powershell
# load-vault-context.ps1
# Injected at SessionStart — outputs vault context to stdout for Claude Code system-reminder

$vaultRoot = Join-Path $PSScriptRoot "..\..\docs"

$files = @(
    "CRITICAL_FACTS.md",
    "_CLAUDE.md",
    "cards\index.md",
    "engineering\index.md"
)

foreach ($file in $files) {
    $path = Join-Path $vaultRoot $file
    if (Test-Path $path) {
        Write-Output "=== $file ==="
        Get-Content $path -Raw
        Write-Output ""
    }
}
```

**Settings.json addition:**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -File .claude/scripts/load-vault-context.ps1"
          }
        ]
      }
    ]
  }
}
```

**What it replaces:** Manual "read `_CLAUDE.md`" instructions or relying on Claude to discover it. Cold-start elimination.

---

## Section 2 — PostCompact Hook

**File:** `.claude/scripts/obsidian-bg-agent.ps1`
**Registration:** Project `.claude/settings.json` under `PostCompact`

**Behavior:** Fires automatically after Claude Code compacts the context window. Reads the compaction summary from stdin, spawns a headless `claude --dangerously-skip-permissions -p` subprocess pointed at the vault, and passes it a prompt to propagate vault-worthy items from the summary.

**What the background agent saves:**
- New factual claims → relevant `wiki/entities/` or `wiki/concepts/` pages (updated, not overwritten)
- Engineering decisions made in conversation → `engineering/wiki/scratch/` or `decisions/` pages
- Ingest work completed → `log.md` entry if not already written
- New entities/concepts mentioned 3+ times in the summary → stub pages with frontmatter

**What it never does:**
- Never modifies `raw/`, `superpowers/`, or `company/`
- Never deletes, archives, or restructures pages
- Never resolves contradictions autonomously — adds a `## Contradictions` section per vault rules
- Never asks questions mid-run

**Script logic:**
```powershell
# obsidian-bg-agent.ps1
# Fires on PostCompact — reads summary from stdin, spawns headless Claude to update vault

$summary = $input | Out-String
$vaultRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\docs")

$prompt = @"
Read docs/_CLAUDE.md. This is a PostCompact background pass.

The context was just compacted. The summary of the session so far is:

$summary

Scan the summary for vault-worthy items:
- Factual claims about cards, grading services, or market data → update affected wiki pages
- Engineering decisions made → update engineering/wiki/scratch/ or decisions/ as appropriate
- Ingest work completed in the session → append to the relevant log.md if not already there
- Entities or concepts mentioned 3+ times with no existing page → create a stub

Rules:
- Never modify raw/, superpowers/, or company/
- Never delete or archive anything
- Never silently overwrite a claim — add a Contradictions section if new evidence conflicts
- Append to log.md, never edit past entries
- If nothing vault-worthy is in the summary, exit without touching the vault

Report: list every file touched and why.
"@

$prompt | claude --dangerously-skip-permissions -p --cwd $vaultRoot 2>&1 | Out-File "$env:TEMP\obsidian-bg-agent.log" -Append
```

**Settings.json addition:**
```json
{
  "hooks": {
    "PostCompact": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -File .claude/scripts/obsidian-bg-agent.ps1",
            "async": true
          }
        ]
      }
    ]
  }
}
```

**Debugging:** Background agent logs to `%TEMP%\obsidian-bg-agent.log`.

---

## Section 3 — AI-First Preambles on Existing Wiki Pages

**Scope:** All pages under `docs/cards/wiki/` and `docs/engineering/wiki/` — currently ~30 pages.

**Excluded:** `raw/` files (immutable), source-summary pages (already function as preambles for their raw files — lower priority).

**Format:** A `## For future Claude` section added immediately after frontmatter, before any other content.

**Template:**
```markdown
## For future Claude
<What this page covers in one sentence.>
<When this page is relevant — what questions or tasks should trigger reading it.>
<The single most important fact on the page, stated directly.>
```

**Example — `entities/psa.md`:**
```markdown
## For future Claude
PSA (Professional Sports Authenticator) is the largest card grading service by volume.
Relevant when answering questions about PSA grade definitions, service tiers, pricing, or comparing grading services.
Key fact: PSA uses a 1–10 integer scale (no half-grades except 1.5); turnaround and pricing vary by service tier.
```

**Implementation:** Single pass over all wiki pages in one session. Preambles are derived from existing page content — no new research needed. Cross-linker agent runs after to verify no orphan pages were introduced.

**Maintenance rule:** When a page is updated with new content, the preamble gets updated in the same edit. Never let the preamble go stale.

---

## Section 4 — CRITICAL_FACTS.md

**File:** `docs/CRITICAL_FACTS.md`
**Size constraint:** ≤150 tokens. If it grows past this, it has lost its value — trim.
**Loaded by:** SessionStart hook (first file read, before `_CLAUDE.md`)

**Contents:**
```markdown
# SlabMetrics — Critical Facts

Project: SlabMetrics — sports card pricing & portfolio platform
Phase: Pre-MVP, frontend-only prototype in apps/web/
Vault: Domain knowledge base for cards domain + engineering decisions

Primary domain: Card grading (PSA/BGS/SGC/CGC), parallels, population reports
Active gaps: PSA 8.5, SGC qualifiers, BGS no-grade taxonomy, vendor pages
Engineering wiki: All topic pages are stubs — not authoritative yet

Immutable: docs/cards/raw/ and docs/engineering/raw/ — never modify
Append-only: log.md files — never edit past entries
Never ingest: docs/superpowers/ or docs/company/
```

**Maintenance:** Update when a gap is filled, the phase changes, or a new domain area opens. Owner: human + Claude co-own. Changes through conversation.

---

## Section 5 — Synthesis Pages

Three new pages derived entirely from existing vault content. No new raw material required.

### 5a. `docs/cards/wiki/concepts/grading-services-landscape.md`

**Purpose:** Side-by-side comparison of all four grading services. Replaces reading 4 entity pages for cross-service questions.

**Covers:**
- Grade scales per service (PSA 1–10 integers, BGS 1–10 with subgrades, SGC 1–10, CGC 1–10)
- Subgrade systems (BGS only for standard submissions)
- Service tier structure and approximate pricing
- Turnaround time ranges
- Market position / best-used-for
- Population report availability per service

**Source pages:** `[[entities/psa]]`, `[[entities/bgs]]`, `[[entities/sgc]]`, `[[entities/cgc]]`

### 5b. `docs/cards/wiki/concepts/population-report-guide.md`

**Purpose:** Unified guide to reading and using population reports across all services. Replaces reading 3-4 source-summary pages for pop report questions.

**Covers:**
- What pop count means and what it doesn't
- How to use pop count for investment decisions
- PSA vs BGS vs SGC report differences (availability, update frequency, granularity)
- Common misreadings and how to avoid them

**Source pages:** `[[sources/goingtwice-graded-pop-reports]]`, `[[sources/sundocards-psa-bgs-pop-reports]]`, `[[concepts/population-report]]`, `[[entities/psa]]`, `[[entities/bgs]]`, `[[entities/sgc]]`

### 5c. `docs/cards/wiki/concepts/parallels-and-variations.md`

**Purpose:** Unified view of parallel types, print runs, and how they affect card value. Extends the existing `card-parallels.md` with market context and cross-set patterns.

**Covers:**
- Parallel taxonomy (color, numbered, auto, patch, superfractor)
- Print run tiers and their relationship to value
- Rainbow chase mechanics
- How parallels interact with grading (pop count per parallel matters more than base pop)
- 2024 Mosaic parallel structure as a worked example

**Source pages:** `[[concepts/card-parallels]]`, `[[entities/2024-panini-mosaic-football]]`, `[[entities/panini]]`

### Not synthesized yet

Engineering synthesis pages (vendor comparisons, architecture overview) — deferred until the underlying topic pages have real content. Premature synthesis over stubs adds noise, not signal.

---

## Implementation Order

1. `CRITICAL_FACTS.md` — 10 minutes, standalone, no dependencies
2. SessionStart hook — 20 minutes, depends on `CRITICAL_FACTS.md` existing
3. AI-first preambles — 30-45 minutes, one pass over ~30 pages
4. Synthesis pages — 45-60 minutes, one page at a time derived from existing content
5. PostCompact hook — 20 minutes, last because it references the fully-updated vault

Total estimated effort: ~2.5 hours in a single session.

---

## Success Criteria

- [ ] Every new Claude Code session loads vault context without being asked
- [ ] Every wiki page has a `## For future Claude` preamble
- [ ] `CRITICAL_FACTS.md` exists and stays under 150 tokens
- [ ] Cross-service grading questions answered from one synthesis page, not four entity pages
- [ ] PostCompact fires without errors (check `%TEMP%\obsidian-bg-agent.log`)

---

## Files Created / Modified

| File | Action |
|---|---|
| `docs/CRITICAL_FACTS.md` | Create |
| `docs/_CLAUDE.md` | Update to reference `CRITICAL_FACTS.md` |
| `.claude/scripts/load-vault-context.ps1` | Create |
| `.claude/scripts/obsidian-bg-agent.ps1` | Create |
| `.claude/settings.json` | Add SessionStart + PostCompact hooks |
| `docs/cards/wiki/**/*.md` (~20 pages) | Add preambles |
| `docs/engineering/wiki/**/*.md` (~10 pages) | Add preambles |
| `docs/cards/wiki/concepts/grading-services-landscape.md` | Create |
| `docs/cards/wiki/concepts/population-report-guide.md` | Create |
| `docs/cards/wiki/concepts/parallels-and-variations.md` | Create |
