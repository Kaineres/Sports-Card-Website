---
type: concept
tags: [grading, condition, authentication]
updated: 2026-05-18
sources: [[psa-grading-service]], [[psa-grading-standards]], [[bgs-grading-scale]], [[sgc-grading-scale]]
certainty: Certain
---

# Card grading

## For future Claude
This is the foundational concept page explaining what card grading is and how the authentication-then-grading process works across all services.
Relevant when: explaining grading to someone new to it, understanding why authentication precedes condition grading, or orienting before reading service-specific entity pages.
Key fact: grading is a two-step process — authentication (detect fakes/alterations) must pass first; a passing card gets a numeric grade and is sealed in a tamper-evident slab with a cert number.

## TL;DR

Card grading is the process by which a third party authenticates a trading card's genuineness, assesses its condition on a numeric scale, and encapsulates it in a tamper-evident case. The grade then travels with the card as a public, verifiable attribute `[Certain]` — [[psa-grading-service]].

## Two-step process

Per PSA's description, grading is conceptually two operations performed in sequence `[Certain]` — [[psa-grading-service]]:

1. **Authentication** — verify the card is genuine; detect doctoring such as re-coloring, trimming, restoration, altered stock, or cleaning. Counterfeit or altered cards are rejected here. See [[no-grade-outcomes]] for the full taxonomy of detection categories (N1–N9 codes) `[Certain]` — [[psa-grading-standards]].
2. **Grading proper** — assess physical condition (centering, corners, edges, surface, focus, gloss). Assign a numeric grade. See [[grading-scales]].

Authentication must pass before grading occurs `[Certain]` — [[psa-grading-service]].

## The grade as an artifact

Every successfully graded card is encapsulated in a sealed plastic case ("slab") displaying the grade and a unique certification number `[Certain]` — [[psa-grading-service]]. The slab makes the grade physically inseparable from the card and re-verifiable later via the cert number.

## Scales

Grade scales differ across services. See [[grading-scales]] for the breakdown. PSA uses a 10-point scale with 10 = Gem Mint, plus half-grades at 1.5 and 8.5 `[Certain]` — [[psa-grading-standards]]. BGS uses a 10-point scale with half-points at every step, a published **four-subgrade record** (centering, corners, edges, surface), and a Pristine-10 label hierarchy (Black vs Gold) — see [[bgs]] and [[bgs-subgrades]] `[Certain]` — [[bgs-grading-scale]]. SGC uses a **20-step scale** from 1 (POOR) to 10 PRI (Pristine), with half-grades at every step, a single overall grade (no subgrades), and a 10 PRI/10 GM split based on stricter top-level criteria rather than subgrade composition — see [[sgc]] `[Certain]` — [[sgc-grading-scale]]. CGC is not yet ingested.

### Vocabulary divide across services

`[Certain — derived from comparison]` — [[bgs-grading-scale]], [[sgc-grading-scale]], [[psa-grading-standards]]. BGS and SGC share defect-vocabulary that PSA's published standards don't use:

- **"Diamond cut" / "diamond cutting"** — a non-rectangular factory cut. Named by BGS and SGC; not named by PSA.
- **"Refractor lines" / "metallic print lines"** — surface defects on parallels/inserts. Named by BGS and SGC; not named by PSA.

Worth tracking when building cross-service comparison or pricing-model features — same physical defect, different published vocabulary.

## Qualifiers and no-grade outcomes

A graded card may come back as `[Certain]` — [[psa-grading-standards]]:

- A clean numeric grade.
- A numeric grade with a **qualifier** suffix flagging a specific defect type (e.g., "PSA 8 (MK)" — a grade-8 card with marks). See [[grading-qualifiers]].
- **No numeric grade**: instead encapsulated as "Authentic" or "Authentic Altered," or returned with one of 9 N-codes explaining why. See [[no-grade-outcomes]].

## Subjectivity in grading

PSA explicitly acknowledges that grading is partly subjective. Graders reserve the right to make judgment calls at grade boundaries based on **eye appeal** and **market acceptability** for the specific issue `[Certain]` — [[psa-grading-standards]]. Concrete examples from the source:

- A 1955 Topps Sandy Koufax has a yellow background that blends with the border — off-centering is less noticeable, so a borderline card may grade *up* if other characteristics are strong.
- A 1957 Topps Sandy Koufax has high contrast (dark background, white borders) — off-centering is glaring, so a technically-qualifying card (e.g., 70/30 centering) may grade *down* on eye appeal.

This matters for valuation models: the printed centering standard is not always the assigned grade. Predictive pricing that assumes strict adherence to printed standards will diverge from reality some percentage of the time.

## Why grading matters to the market

The ingested sources don't directly explain economic impact, but the existence of a tiered service-pricing structure scaling with **declared card value** `[Certain]` — [[psa-grading-service]] implies graded cards command different prices than ungraded equivalents, and that the grade correlates with value. Market-data sources are needed to confirm magnitudes.

## See also

- [[psa]] — one grading service these sources describe.
- [[bgs]] — second grading service ingested.
- [[bgs-subgrades]] — BGS's four-subgrade evaluation model.
- [[sgc]] — third grading service ingested.
- [[cgc]] — fourth grading service ingested; 20-grade scale, Pristine 10 / Gem Mint 10 two-tier top; TCG criteria published separately.
- [[grading-scales]] — the 1–10 numeric scale.
- [[grading-qualifiers]] — defect suffixes attached to grades.
- [[no-grade-outcomes]] — N1–N9 codes and Authentic/Authentic Altered encapsulation.
- [[grading-service-tiers]] — how grading services price their work.
- [[population-report]] — the grade-distribution database that grading activity produces; key tool for assessing card rarity and value.
- [[card-parallels]] — grading applies to parallels; PSA 10 pop counts within a numbered parallel's print-run ceiling are the core rarity signal.
