# Obsidian Vault AI Optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire SessionStart + PostCompact hooks for automatic vault context loading and session knowledge saving, add AI-first preambles to all 30 wiki pages, create CRITICAL_FACTS.md, and write 3 synthesis pages.

**Architecture:** Two PowerShell hook scripts registered in `.claude/settings.json` handle automation. Vault content changes (preambles, CRITICAL_FACTS.md, synthesis pages) are direct file edits. No new dependencies.

**Tech Stack:** PowerShell 5.1, Claude Code hooks (SessionStart, PostCompact), plain Markdown.

---

## File Map

| File | Action |
|---|---|
| `docs/CRITICAL_FACTS.md` | Create |
| `docs/_CLAUDE.md` | Modify — add reference to CRITICAL_FACTS.md |
| `.claude/scripts/load-vault-context.ps1` | Create |
| `.claude/scripts/obsidian-bg-agent.ps1` | Create |
| `.claude/settings.json` | Modify — add SessionStart + PostCompact hooks (preserve existing PostToolUse) |
| `docs/cards/wiki/entities/*.md` (6 pages) | Modify — add `## For future Claude` preamble |
| `docs/cards/wiki/concepts/*.md` (8 pages) | Modify — add `## For future Claude` preamble |
| `docs/cards/wiki/sources/*.md` (12 pages) | Modify — add `## For future Claude` preamble |
| `docs/engineering/wiki/**/*.md` (4 pages, skip template) | Modify — add `## For future Claude` preamble |
| `docs/cards/wiki/concepts/grading-services-landscape.md` | Create |
| `docs/cards/wiki/concepts/population-report-guide.md` | Create |
| `docs/cards/wiki/concepts/parallels-and-variations.md` | Create |
| `docs/cards/index.md` | Modify — add 3 new synthesis pages |
| `docs/cards/log.md` | Modify — append synthesis log entry |

---

## Task 1: Create CRITICAL_FACTS.md

**Files:**
- Create: `docs/CRITICAL_FACTS.md`
- Modify: `docs/_CLAUDE.md`

- [ ] **Step 1: Create CRITICAL_FACTS.md**

Write `docs/CRITICAL_FACTS.md` with exactly this content:

```markdown
# SlabMetrics — Critical Facts

Project: SlabMetrics — sports card pricing & portfolio platform
Phase: Pre-MVP, frontend-only prototype in apps/web/
Vault: Domain knowledge base — cards domain + engineering decisions

Primary domain: Card grading (PSA/BGS/SGC/CGC), parallels, population reports
Active gaps: PSA 8.5 definition, SGC qualifiers, BGS no-grade taxonomy, all vendor pages
Engineering wiki: All topic pages are stubs — not authoritative yet

Immutable: docs/cards/raw/ and docs/engineering/raw/ — never modify
Append-only: log.md files — never edit past entries
Off-limits: docs/superpowers/ and docs/company/ — never ingest as wiki content
```

- [ ] **Step 2: Verify token count**

Run:
```powershell
(Get-Content docs/CRITICAL_FACTS.md -Raw).Split(' ').Count
```
Expected: under 120 words. If over 150, trim — the file loses its value if it grows.

- [ ] **Step 3: Update _CLAUDE.md to reference CRITICAL_FACTS.md**

In `docs/_CLAUDE.md`, find the `## Key Files` section and add `CRITICAL_FACTS.md` as the first entry:

```markdown
## Key Files

- Critical facts: [[CRITICAL_FACTS]]
- Cards index: [[cards/index]]
- Engineering index: [[engineering/index]]
- Cards log: [[cards/log]]
- Engineering log: [[engineering/log]]
- Full operating rules: [[CLAUDE.md]]
```

- [ ] **Step 4: Commit**

```powershell
git add docs/CRITICAL_FACTS.md docs/_CLAUDE.md
git commit -m "feat(vault): add CRITICAL_FACTS.md cheat sheet and reference from _CLAUDE.md"
```

---

## Task 2: SessionStart Hook

**Files:**
- Create: `.claude/scripts/load-vault-context.ps1`
- Modify: `.claude/settings.json`

- [ ] **Step 1: Create the hook script**

Write `.claude/scripts/load-vault-context.ps1`:

```powershell
# Injected at SessionStart — outputs vault context to stdout so Claude Code includes
# it as a system-reminder at the start of every session in this project.

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

- [ ] **Step 2: Update settings.json**

Replace the entire contents of `.claude/settings.json` with:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PROJECT_DIR:-.}/.claude/scripts/qmd-refresh.mjs\"",
            "timeout": 5
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -NonInteractive -File \".claude/scripts/load-vault-context.ps1\""
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 3: Verify script runs without error**

```powershell
powershell -NonInteractive -File ".claude/scripts/load-vault-context.ps1"
```

Expected: outputs `=== CRITICAL_FACTS.md ===` followed by file contents, then `=== _CLAUDE.md ===`, etc. No errors.

- [ ] **Step 4: Commit**

```powershell
git add .claude/scripts/load-vault-context.ps1 .claude/settings.json
git commit -m "feat(vault): add SessionStart hook to auto-inject vault context"
```

- [ ] **Step 5: Manual verification (after commit)**

Restart Claude Code in this project. Check the first `<system-reminder>` block — it should contain `=== CRITICAL_FACTS.md ===` and the vault file contents. If missing, check that `powershell` is on PATH and the script path is correct.

---

## Task 3a: AI-First Preambles — Entity Pages (6 pages)

**Files:** All 6 files under `docs/cards/wiki/entities/`

**Preamble format:** Insert a `## For future Claude` section immediately after the `# Title` line and before `## TL;DR`. Three sentences: (1) what this page covers, (2) when to read it, (3) the single most important fact.

**Worked example for `psa.md`** (insert after `# PSA`):
```markdown
## For future Claude
PSA (Professional Sports Authenticator) is the dominant grading service by volume — the most-referenced entity in this vault.
Relevant when: answering questions about PSA grade definitions, service tiers, submission pricing, N-codes, or comparing PSA to BGS/SGC/CGC.
Key fact: PSA uses integer grades 1–10 with half-grades only at 1.5 and 8.5; authentication (screens 9 N-codes) must pass before grading; every graded card is encapsulated with a LightHouse™ cert number.
```

- [ ] **Step 1: Add preamble to each entity page**

For each file, read it, then insert `## For future Claude` between the `# <Title>` line and `## TL;DR`. Follow the three-sentence format above.

Pages to process:
- `docs/cards/wiki/entities/psa.md`
- `docs/cards/wiki/entities/bgs.md`
- `docs/cards/wiki/entities/sgc.md`
- `docs/cards/wiki/entities/cgc.md`
- `docs/cards/wiki/entities/panini.md`
- `docs/cards/wiki/entities/2024-panini-mosaic-football.md`

- [ ] **Step 2: Verify all 6 pages have the preamble**

```powershell
Select-String -Path "docs\cards\wiki\entities\*.md" -Pattern "## For future Claude" | Measure-Object | Select-Object -ExpandProperty Count
```
Expected: `6`

- [ ] **Step 3: Commit**

```powershell
git add docs/cards/wiki/entities/
git commit -m "feat(vault): add AI-first preambles to entity pages"
```

---

## Task 3b: AI-First Preambles — Concept Pages (8 pages)

**Files:** All 8 files under `docs/cards/wiki/concepts/`

**Worked example for `card-grading.md`** (insert after `# Card grading`):
```markdown
## For future Claude
This is the foundational concept page explaining what card grading is and how the authentication-then-grading process works across all services.
Relevant when: explaining grading to someone new to it, understanding why authentication precedes condition grading, or orienting before reading service-specific entity pages.
Key fact: grading is a sequential two-step process — authentication (detect fakes/alterations) must pass first; a passing card gets a numeric grade and is sealed in a tamper-evident slab with a cert number.
```

- [ ] **Step 1: Add preamble to each concept page**

Pages to process:
- `docs/cards/wiki/concepts/card-grading.md`
- `docs/cards/wiki/concepts/grading-scales.md`
- `docs/cards/wiki/concepts/grading-service-tiers.md`
- `docs/cards/wiki/concepts/grading-qualifiers.md`
- `docs/cards/wiki/concepts/no-grade-outcomes.md`
- `docs/cards/wiki/concepts/bgs-subgrades.md`
- `docs/cards/wiki/concepts/card-parallels.md`
- `docs/cards/wiki/concepts/population-report.md`

- [ ] **Step 2: Verify all 8 pages have the preamble**

```powershell
Select-String -Path "docs\cards\wiki\concepts\*.md" -Pattern "## For future Claude" | Measure-Object | Select-Object -ExpandProperty Count
```
Expected: `8` (will become 11 after synthesis pages are added in Task 4 — that's fine)

- [ ] **Step 3: Commit**

```powershell
git add docs/cards/wiki/concepts/
git commit -m "feat(vault): add AI-first preambles to concept pages"
```

---

## Task 3c: AI-First Preambles — Source-Summary Pages (12 pages)

**Files:** All 11 files under `docs/cards/wiki/sources/`

Source-summary pages have a different structure — they summarize a raw file, not a domain topic. The preamble format adapts: (1) what raw source this summarizes and what it covers, (2) which wiki pages it feeds, (3) the most important claim it contains.

**Worked example for `psa-grading-standards.md`** (insert after `# <title>`):
```markdown
## For future Claude
This page summarizes the 13-clip PSA grading standards source (psacard.com/gradingstandards) covering grade definitions 1–10 plus qualifiers and policy carve-outs.
Relevant when: tracing claims about PSA grade definitions, policy carve-outs (hand-cut cards, miscuts), or N-codes back to their source.
Key fact: this is the primary source for all PSA grade-level definitions in [[entities/psa]] and [[concepts/grading-scales]]; it fed 12 of the 13 clips (clip 11 was a botched fragment).
```

- [ ] **Step 1: Add preamble to each source-summary page**

Pages to process:
- `docs/cards/wiki/sources/psa-grading-service.md`
- `docs/cards/wiki/sources/psa-grading-standards.md`
- `docs/cards/wiki/sources/bgs-grading-scale.md`
- `docs/cards/wiki/sources/sgc-grading-scale.md`
- `docs/cards/wiki/sources/bgs-grading-overview.md`
- `docs/cards/wiki/sources/cgc-grading-scale.md`
- `docs/cards/wiki/sources/packz-psa-population-report-guide.md`
- `docs/cards/wiki/sources/yahoo-population-count-explained.md`
- `docs/cards/wiki/sources/psa-market-report-population-perspective.md`
- `docs/cards/wiki/sources/goingtwice-graded-pop-reports.md`
- `docs/cards/wiki/sources/sundocards-psa-bgs-pop-reports.md`
- `docs/cards/wiki/sources/beckett-2024-panini-mosaic-football.md`

- [ ] **Step 2: Verify all 12 pages have the preamble**

```powershell
Select-String -Path "docs\cards\wiki\sources\*.md" -Pattern "## For future Claude" | Measure-Object | Select-Object -ExpandProperty Count
```
Expected: `12`

- [ ] **Step 3: Commit**

```powershell
git add docs/cards/wiki/sources/
git commit -m "feat(vault): add AI-first preambles to source-summary pages"
```

---

## Task 3d: AI-First Preambles — Engineering Wiki Pages (4 pages)

**Files:** 4 active pages under `docs/engineering/wiki/` (skip `decisions/0000-template.md` — it's a template, not a content page)

Engineering pages are stubs. The preamble should be honest about that: (1) what this page covers, (2) current state (stub vs. real content), (3) what it will contain when fleshed out.

**Worked example for `topics/architecture.md`** (insert after `# Architecture`):
```markdown
## For future Claude
This page covers the SlabMetrics system architecture — frontend, backend, data flow, and vendor integrations.
Current state: stub with placeholder structure — not yet authoritative; do not cite claims from this page.
When fleshed out it will contain: system diagram, component responsibilities, Supabase/Clerk/Vercel integration points, and API design decisions.
```

- [ ] **Step 1: Add preamble to each engineering page**

Pages to process:
- `docs/engineering/wiki/topics/architecture.md`
- `docs/engineering/wiki/topics/pricing-pipeline.md`
- `docs/engineering/wiki/topics/data-model.md`
- `docs/engineering/wiki/scratch/n8n-wiki-ingest-automation.md`

- [ ] **Step 2: Verify all 4 pages have the preamble**

```powershell
Select-String -Path "docs\engineering\wiki\**\*.md" -Pattern "## For future Claude" -Recurse | Measure-Object | Select-Object -ExpandProperty Count
```
Expected: `4`

- [ ] **Step 3: Commit**

```powershell
git add docs/engineering/wiki/
git commit -m "feat(vault): add AI-first preambles to engineering wiki pages"
```

---

## Task 4a: Synthesis Page — Grading Services Landscape

**Files:**
- Create: `docs/cards/wiki/concepts/grading-services-landscape.md`
- Read first: `entities/psa.md`, `entities/bgs.md`, `entities/sgc.md`, `entities/cgc.md`

- [ ] **Step 1: Read all four entity pages**

Read these files in full before writing:
- `docs/cards/wiki/entities/psa.md`
- `docs/cards/wiki/entities/bgs.md`
- `docs/cards/wiki/entities/sgc.md`
- `docs/cards/wiki/entities/cgc.md`

- [ ] **Step 2: Create the synthesis page**

Write `docs/cards/wiki/concepts/grading-services-landscape.md` using this structure. Fill every section from the entity pages read in Step 1 — no placeholders:

```markdown
---
type: synthesis
tags: [grading-service, comparison, landscape]
updated: 2026-05-22
sources: [[entities/psa]], [[entities/bgs]], [[entities/sgc]], [[entities/cgc]]
certainty: Certain
---

# Grading Services Landscape

## For future Claude
This synthesis compares all four major grading services (PSA, BGS, SGC, CGC) side by side.
Relevant when: answering cross-service questions, recommending which service to use, or understanding how grades translate across services.
Key fact: all four use a 1–10 scale but differ significantly — BGS has subgrades and half-points at every step, SGC has a 20-step scale with a PRI/GM split, CGC is newest with fewest details ingested.

## TL;DR
[2-sentence summary drawn from entity pages]

## Grade Scales at a Glance

| Service | Scale | Half-grades | Subgrades | Top label |
|---|---|---|---|---|
| [[entities/psa\|PSA]] | 1–10 integer | 1.5 and 8.5 only | No | PSA 10 Gem Mint |
| [[entities/bgs\|BGS]] | [fill from bgs.md] | [fill] | Yes (4) | [fill] |
| [[entities/sgc\|SGC]] | [fill from sgc.md] | [fill] | No | [fill] |
| [[entities/cgc\|CGC]] | [fill from cgc.md] | [fill] | [fill] | [fill] |

## Subgrade Systems
[BGS is the only service with published subgrades. Fill from bgs.md and bgs-subgrades concept page.]

## Service Tiers and Pricing
[Fill from grading-service-tiers concept page and entity pages. Note: CGC pricing not yet ingested.]

## Population Reports
[Which services publish pop reports, where to find them, granularity differences. Fill from entity pages and population-report concept.]

## Best Used For
[One-liner per service: when you'd submit to PSA vs BGS vs SGC vs CGC. Fill from entity pages.]

## Known Gaps
- CGC: service tier pricing not yet ingested
- PSA: 8.5 grade definition not yet captured
- SGC: qualifier system not yet ingested
- BGS: no-grade taxonomy not yet ingested

## See also
- [[entities/psa]] — PSA detail page
- [[entities/bgs]] — BGS detail page
- [[entities/sgc]] — SGC detail page
- [[entities/cgc]] — CGC detail page
- [[concepts/grading-scales]] — grade scale definitions
- [[concepts/grading-service-tiers]] — tier/pricing detail
- [[concepts/bgs-subgrades]] — BGS subgrade system detail
- [[concepts/population-report]] — pop report concept
```

**Important:** Replace every `[fill from X]` with actual content from the entity pages. No placeholders in the final file.

- [ ] **Step 3: Verify backlinks**

```powershell
Select-String -Path "docs\cards\wiki\concepts\grading-services-landscape.md" -Pattern "\[\[entities/"
```
Expected: matches for `psa`, `bgs`, `sgc`, `cgc` all present.

- [ ] **Step 4: Commit**

```powershell
git add docs/cards/wiki/concepts/grading-services-landscape.md
git commit -m "feat(vault): add grading-services-landscape synthesis page"
```

---

## Task 4b: Synthesis Page — Population Report Guide

**Files:**
- Create: `docs/cards/wiki/concepts/population-report-guide.md`
- Read first: `concepts/population-report.md`, `sources/goingtwice-graded-pop-reports.md`, `sources/sundocards-psa-bgs-pop-reports.md`, `sources/packz-psa-population-report-guide.md`, `sources/psa-market-report-population-perspective.md`, `sources/yahoo-population-count-explained.md`

- [ ] **Step 1: Read all source pages**

Read the six files listed above before writing.

- [ ] **Step 2: Create the synthesis page**

Write `docs/cards/wiki/concepts/population-report-guide.md`:

```markdown
---
type: synthesis
tags: [population-report, investing, grading]
updated: 2026-05-22
sources: [[sources/goingtwice-graded-pop-reports]], [[sources/sundocards-psa-bgs-pop-reports]], [[sources/packz-psa-population-report-guide]], [[sources/psa-market-report-population-perspective]], [[sources/yahoo-population-count-explained]]
certainty: Certain
---

# Population Report Guide

## For future Claude
This synthesis consolidates all vault knowledge on reading and using population reports across PSA, BGS, and SGC.
Relevant when: answering questions about pop count meaning, how to use pop reports for investment decisions, or differences between services' pop report systems.
Key fact: pop count = total graded copies at that grade level across all submissions; low pop at a high grade means scarcity and typically commands a premium, but raw pop count must be interpreted with grade distribution context.

## TL;DR
[2-sentence summary from source pages]

## What Pop Count Means
[Fill from source pages: definition, what the number represents, what it does NOT represent]

## How to Use Pop Count for Investment Decisions
[Fill: high pop vs low pop implications, grade cliff effects, using pop with recent sales data]

## Common Misreadings
[Fill: mistakes collectors make interpreting pop reports]

## PSA vs BGS vs SGC Pop Report Differences

| | PSA | BGS | SGC |
|---|---|---|---|
| Report availability | [fill] | [fill] | [fill] |
| Update frequency | [fill] | [fill] | [fill] |
| Parallel breakdown | [fill] | [fill] | [fill] |

## See also
- [[concepts/population-report]] — base concept page
- [[entities/psa]] — PSA pop report location
- [[entities/bgs]] — BGS pop report location
- [[entities/sgc]] — SGC pop report location
- [[sources/goingtwice-graded-pop-reports]] — source: GoingTwice pop report guide
- [[sources/sundocards-psa-bgs-pop-reports]] — source: Sundocards PSA/BGS comparison
```

**Important:** Replace every `[fill]` with actual content from the source pages. No placeholders in the final file.

- [ ] **Step 3: Verify backlinks**

```powershell
Select-String -Path "docs\cards\wiki\concepts\population-report-guide.md" -Pattern "\[\[sources/"
```
Expected: at least 4 source matches.

- [ ] **Step 4: Commit**

```powershell
git add docs/cards/wiki/concepts/population-report-guide.md
git commit -m "feat(vault): add population-report-guide synthesis page"
```

---

## Task 4c: Synthesis Page — Parallels and Variations

**Files:**
- Create: `docs/cards/wiki/concepts/parallels-and-variations.md`
- Read first: `concepts/card-parallels.md`, `entities/2024-panini-mosaic-football.md`, `entities/panini.md`

- [ ] **Step 1: Read source pages**

Read the three files listed above before writing.

- [ ] **Step 2: Create the synthesis page**

Write `docs/cards/wiki/concepts/parallels-and-variations.md`:

```markdown
---
type: synthesis
tags: [parallels, print-run, value, set-structure]
updated: 2026-05-22
sources: [[concepts/card-parallels]], [[entities/2024-panini-mosaic-football]], [[entities/panini]]
certainty: Certain
---

# Parallels and Variations

## For future Claude
This synthesis covers parallel card types, print runs, and how they affect card value — extending the base card-parallels concept page with market context.
Relevant when: explaining what a parallel is, understanding rainbow chases, assessing how parallel rarity affects grade premiums, or ingesting a new set that has parallels.
Key fact: parallels are alternate versions of base cards differentiated by color/finish/serial number; numbered parallels have a print run stamped on the card (e.g., /25 means 25 copies exist); lower print run = higher scarcity premium, especially at high grades where pop count is naturally tiny.

## TL;DR
[2-sentence summary from source pages]

## Parallel Taxonomy
[Fill from card-parallels.md: types of parallels, color-coded tiers, numbered vs unnumbered, autos, patches, superfractors]

## Print Run Tiers and Value Implications
[Fill: how /1, /5, /10, /25, /49, /99, /149, /199, /299, base unnumbered relate to each other in terms of scarcity and market premium]

## Rainbow Chase Mechanics
[Fill: what a rainbow is, how collectors approach completing one, which tiers are typically in a rainbow]

## How Parallels Interact with Grading
[Fill: why pop count per parallel matters more than base card pop, PSA 10 /25 vs PSA 10 base comparison, grading cost/benefit for low-print-run cards]

## 2024 Panini Mosaic — Worked Example
[Fill from 2024-panini-mosaic-football.md: list the parallel structure, note Mosaic Pattern rainbow with 38 base parallels, explain how this set illustrates the taxonomy above]

## See also
- [[concepts/card-parallels]] — base concept page (taxonomy detail)
- [[entities/2024-panini-mosaic-football]] — worked example set
- [[entities/panini]] — manufacturer context
- [[concepts/grading-service-tiers]] — grading cost context for parallel submissions
- [[concepts/population-report]] — pop count interpretation for parallels
```

**Important:** Replace every `[fill]` with actual content from the source pages. No placeholders in the final file.

- [ ] **Step 3: Verify backlinks**

```powershell
Select-String -Path "docs\cards\wiki\concepts\parallels-and-variations.md" -Pattern "\[\["
```
Expected: links to `card-parallels`, `2024-panini-mosaic-football`, `panini` all present.

- [ ] **Step 4: Commit**

```powershell
git add docs/cards/wiki/concepts/parallels-and-variations.md
git commit -m "feat(vault): add parallels-and-variations synthesis page"
```

---

## Task 4d: Update Index and Log

**Files:**
- Modify: `docs/cards/index.md`
- Modify: `docs/cards/log.md`

- [ ] **Step 1: Read the current index**

Read `docs/cards/index.md` to find the concepts section.

- [ ] **Step 2: Add the 3 new synthesis pages to the index**

In `docs/cards/index.md`, find the Concepts section and add entries for all three new pages:

```markdown
- [[concepts/grading-services-landscape]] — synthesis: side-by-side comparison of PSA, BGS, SGC, CGC
- [[concepts/population-report-guide]] — synthesis: how to read and use pop reports across all services
- [[concepts/parallels-and-variations]] — synthesis: parallel types, print runs, and value implications
```

- [ ] **Step 3: Append to log**

Append to `docs/cards/log.md`:

```markdown
## [2026-05-22] synthesis | Grading services landscape, population report guide, parallels and variations
- new pages: [[concepts/grading-services-landscape]], [[concepts/population-report-guide]], [[concepts/parallels-and-variations]]
- draws from: [[entities/psa]], [[entities/bgs]], [[entities/sgc]], [[entities/cgc]], [[concepts/card-parallels]], [[entities/2024-panini-mosaic-football]], [[sources/goingtwice-graded-pop-reports]], [[sources/sundocards-psa-bgs-pop-reports]], [[sources/packz-psa-population-report-guide]]
```

- [ ] **Step 4: Commit**

```powershell
git add docs/cards/index.md docs/cards/log.md
git commit -m "feat(vault): update cards index and log with 3 synthesis pages"
```

---

## Task 4e: Cross-Linker Verification

Run the cross-linker agent to verify no orphan pages were introduced and no entity names are missing wikilinks after the preamble and synthesis work.

- [ ] **Step 1: Invoke the cross-linker agent**

In Claude Code, say: "Run the cross-linker agent on the docs vault."

The cross-linker agent is at `.claude/agents/cross-linker`. It scans for:
- Entity/concept names mentioned in body text that should be `[[wikilinks]]` but aren't
- Orphan pages with no inbound links

- [ ] **Step 2: Review suggestions and apply approved fixes**

The agent suggests fixes — it never auto-applies. Review each suggestion and approve or reject. Common fixes after adding synthesis pages: new synthesis pages may need to be linked from entity pages that they reference.

- [ ] **Step 3: Commit any approved link fixes**

```powershell
git add docs/cards/wiki/
git commit -m "fix(vault): add missing wikilinks identified by cross-linker after synthesis pass"
```

---

## Task 5: PostCompact Hook

**Files:**
- Create: `.claude/scripts/obsidian-bg-agent.ps1`
- Modify: `.claude/settings.json`

- [ ] **Step 1: Create the background agent script**

Write `.claude/scripts/obsidian-bg-agent.ps1`:

```powershell
# Fires on PostCompact — reads the compaction summary from stdin and spawns a headless
# Claude agent to propagate vault-worthy items back into the docs/ vault.
# Logs to %TEMP%\obsidian-bg-agent.log for debugging.

$summary = [Console]::In.ReadToEnd()

if ([string]::IsNullOrWhiteSpace($summary)) {
    exit 0
}

$vaultRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\docs")

$prompt = @"
Read _CLAUDE.md first. This is a PostCompact background pass — the conversation context was just compacted.

Here is the summary of the session so far:

$summary

Scan the summary for vault-worthy items and update the vault:
- Factual claims about cards, grading services, parallels, or market data → update the relevant wiki/entities/ or wiki/concepts/ page
- Engineering decisions made in conversation → add to engineering/wiki/scratch/ or decisions/ as appropriate  
- Ingest work completed in the session → append to the relevant log.md if not already there
- Entities or concepts mentioned 3+ times with no existing wiki page → create a stub with frontmatter and TL;DR

Rules (same as _CLAUDE.md):
- Never modify raw/, superpowers/, or company/
- Never delete or archive anything
- Never silently overwrite a claim that conflicts with new evidence — add a Contradictions section
- Append to log.md, never edit past entries
- If nothing vault-worthy is in the summary, exit without touching any file

End with: list every file you touched and one sentence explaining why.
"@

$logFile = Join-Path $env:TEMP "obsidian-bg-agent.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

try {
    $result = $prompt | claude --dangerously-skip-permissions -p --cwd $vaultRoot 2>&1
    Add-Content -Path $logFile -Value "[$timestamp] SUCCESS`n$result`n---"
} catch {
    Add-Content -Path $logFile -Value "[$timestamp] ERROR: $_`n---"
}
```

- [ ] **Step 2: Update settings.json with PostCompact hook**

Replace the entire contents of `.claude/settings.json` with the final merged version:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PROJECT_DIR:-.}/.claude/scripts/qmd-refresh.mjs\"",
            "timeout": 5
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -NonInteractive -File \".claude/scripts/load-vault-context.ps1\""
          }
        ]
      }
    ],
    "PostCompact": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -NonInteractive -File \".claude/scripts/obsidian-bg-agent.ps1\"",
            "timeout": 120,
            "async": true
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 3: Verify script syntax**

```powershell
powershell -NonInteractive -Command "& { . '.claude\scripts\obsidian-bg-agent.ps1' }" 2>&1
```
Expected: no parse errors (the script exits immediately on empty stdin — that's correct).

- [ ] **Step 4: Commit**

```powershell
git add .claude/scripts/obsidian-bg-agent.ps1 .claude/settings.json
git commit -m "feat(vault): add PostCompact hook to auto-save session insights to vault"
```

- [ ] **Step 5: Manual verification**

After a few sessions accumulate, check `%TEMP%\obsidian-bg-agent.log` to verify the agent is running and reporting file touches. If the log is empty after a context compaction, verify `claude` is on PATH and the vault path resolves correctly.

---

## Completion Checklist

- [ ] `docs/CRITICAL_FACTS.md` exists and is under 150 tokens
- [ ] `docs/_CLAUDE.md` references CRITICAL_FACTS in Key Files
- [ ] `.claude/scripts/load-vault-context.ps1` runs without errors
- [ ] SessionStart hook fires on session open (manual verify: check system-reminder)
- [ ] All 26 cards wiki pages have `## For future Claude`
- [ ] All 4 engineering wiki pages have `## For future Claude`
- [ ] `grading-services-landscape.md` exists with no `[fill]` placeholders
- [ ] `population-report-guide.md` exists with no `[fill]` placeholders
- [ ] `parallels-and-variations.md` exists with no `[fill]` placeholders
- [ ] `cards/index.md` includes all 3 synthesis pages
- [ ] `cards/log.md` has synthesis log entry
- [ ] PostCompact hook is registered and script is valid PowerShell
