# Sports-Card-Website knowledge vault

This `docs/` directory is an Obsidian vault. It holds two LLM-maintained wikis:

- **`cards/`** — sports cards domain knowledge (players, sets, brands, grading, market dynamics).
- **`engineering/`** — Sports-Card-Website project knowledge (architecture, decisions, vendor notes).

The wikis are maintained by an LLM agent (Claude Code), not by hand. See [[CLAUDE]] for the schema and operating rules.

## Quickstart

1. Open this folder as an Obsidian vault.
2. Launch Claude Code from inside `docs/`:
   ```
   cd docs
   claude
   ```
3. **Add a source:** drop the file into `cards/raw/` or `engineering/raw/`, then ask Claude to ingest it.
4. **Query:** ask Claude any question. It reads the relevant `index.md`, drills into pages, and answers with citations.
5. **Health-check:** ask Claude to "lint cards" or "lint engineering" periodically.

## Layout

```
cards/         sports cards sub-wiki
engineering/   Sports-Card-Website project sub-wiki
CLAUDE.md      wiki schema (Claude reads this automatically)
superpowers/   specs and plans for vault evolution — NOT part of the wiki
```

## Ownership

- **You own:** everything under `raw/`. Claude reads but never modifies.
- **Claude owns:** everything under `wiki/`, plus `index.md` and `log.md`.
- **Co-owned:** this file and `CLAUDE.md`. Edit through conversation.
