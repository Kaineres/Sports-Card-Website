---
type: community
cohesion: 1.00
members: 3
---

# LLM Wiki Plans

**Cohesion:** 1.00 - tightly connected
**Members:** 3 nodes

## Members
- [[LLM Wiki Design Spec]] - document - docs/superpowers/specs/2026-05-18-llm-wiki-design.md
- [[LLM Wiki Implementation Plan]] - document - docs/superpowers/plans/2026-05-18-llm-wiki.md
- [[LLM-Maintained Obsidian Vault Pattern (Human owns raw, LLM owns wiki)]] - rationale - docs/superpowers/specs/2026-05-18-llm-wiki-design.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/LLM_Wiki_Plans
SORT file.name ASC
```
