---
type: concept
tags: [grading, qualifiers, condition]
updated: 2026-05-18
sources: [[psa-grading-standards]]
certainty: Certain
---

# Grading qualifiers

## For future Claude
This page documents PSA's qualifier system — short defect codes appended to a numeric grade (e.g., "PSA 8 (MK)") — though only the MK (Marks) qualifier is fully defined in the current ingested source.
Relevant when: interpreting a graded card's label that includes a parenthetical code, understanding why two PSA 8s may differ in market value, or ingesting additional PSA qualifier documentation.
Key fact: only MK (any writing, ink, pencil marks, or impression from writing) is fully text-defined in current sources; the codes for Miscut, Off-center, Staining, Print defect, and Out of focus are referenced but their code letters and definitions were not captured in the ingest.

## TL;DR

Qualifiers are short codes PSA appends to a numeric grade when a specific defect is present. A card might receive, for example, "PSA 8 (MK)" — a grade-8 card with marks `[Certain]` — [[psa-grading-standards]]. Only **MK** is defined in full in the ingested source; other defect categories are referenced via image examples without their code letters or text definitions.

## Captured qualifier

### MK — Marks

Any card with writing, ink marks, pencil marks, or evidence of an impression left from the act of writing receives the MK designation `[Certain]` — [[psa-grading-standards]].

## Referenced-but-not-defined qualifier categories

The source references the following defect categories via image filenames in the qualifier section, but their text definitions did not survive the page save `[Certain that these categories exist as defect types; codes and definitions are not in this source]` — [[psa-grading-standards]]:

- **Miscut** — factory cut deviates from the issue's intended appearance.
- **Off-center** — centering exceeds the unqualified-grade tolerance for the issue.
- **Staining** — discoloration on the card surface.
- **Print defect** — manufacturing imperfection in printing.
- **Out of focus** — printed image lacks crisp focus.

The qualifier code letters for these (commonly cited in the hobby as MC, OC, ST, PD, OF) are **not in the ingested source**. A clean re-ingest or a separate source is needed to confirm.

## See also

- [[grading-scales]] — the numeric grade the qualifier modifies.
- [[no-grade-outcomes]] — when a defect is severe enough that the card gets no numeric grade at all.
- [[card-grading]] — grading as a process.
- [[psa]] — the service whose qualifier system is documented here; MK is the only fully defined qualifier in current sources.
- [[bgs]] — uses the four-subgrade record in lieu of single-letter qualifiers; BGS qualifier system (if separate) not yet ingested.
- [[sgc]] — qualifier system not yet ingested.
- [[cgc]] — qualifier system not yet ingested.
