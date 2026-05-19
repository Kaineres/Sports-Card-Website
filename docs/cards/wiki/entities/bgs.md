---
type: entity
tags: [grading-service, company, beckett]
updated: 2026-05-19
sources: [[bgs-grading-scale]], [[goingtwice-graded-pop-reports]]
certainty: Certain
---

# BGS

## TL;DR

BGS (Beckett Grading Services) is a third-party trading card grading company. They grade cards on a 1–10 scale with half-points at every step, but unlike PSA, BGS publishes **four subgrades per card** (centering, corners, edges, surface) plus a composite overall grade `[Certain]` — [[bgs-grading-scale]]. See [[bgs-subgrades]] for the subgrade mechanics.

## What BGS does

- **Four-subgrade evaluation** — every card receives four subgrades, one for each dimension (centering, corners, edges, surface). The overall grade is composited from the four. `[Certain]` — [[bgs-grading-scale]]. Mechanics in [[bgs-subgrades]].
- **Grading on a 1–10 scale with half-points** — final grades are issued in half-point increments (10, 9.5, 9, 8.5, …, 1.5, 1). `[Certain]` — [[bgs-grading-scale]]. BGS publishes detailed criteria for integer grades plus 9.5; half-points are interpolated between the published levels.
- **Pristine 10 label variants** — see below.

## Pristine 10 — Black vs Gold Label

`[Certain]` — [[bgs-grading-scale]]:

- **Black Label** — issued when all four subgrades are 10. Top of the BGS hierarchy.
- **Gold Label** — issued when three subgrades are 10 and one is 9.5, in any combination. The "the only difference" language in BGS's own copy makes clear this is a deliberate, formally-defined hierarchy — not a marketing flourish.

This label distinction has no PSA equivalent.

## BGS-specific terminology

`[Certain]` — [[bgs-grading-scale]]:

- **Diamond cutting** — a centering-defect term for cards cut at a non-rectangular angle. BGS tolerates "very slight" at grade 7, "slight" at 6, "moderate" at 4, "noticeable" at 2, and "heavy" at 1. PSA has no published equivalent term.
- **Back centering systematically looser than front** — across the scale, BGS back-centering tolerances are markedly more permissive than front (e.g., grade 9.5 = 55/45 front but 60/40 back; grade 7 = 65/35 front but 90/10 back). This is grade-design philosophy, not a defect category.

## Self-described market position

Not captured in the current source set — BGS's "about" / "history" copy lives on `beckett.com/grading/about`, not yet ingested.

## Service tiers / pricing

Not captured in the current source set. The scale clips are scale-only; pricing parallel to [[grading-service-tiers]] would require a separate clip from BGS submission pages.

## Population Report

BGS maintains a publicly accessible pop report at `beckett.com/grading/pop-report`, searchable by card `[Certain]` — [[sources/goingtwice-graded-pop-reports]]. BGS grades using half-point increments and four subgrades, so its pop report data is structured differently than PSA's. See [[concepts/population-report]] for cross-grader grade rate comparisons.

## Adjacent products

Not yet ingested. Beckett's broader ecosystem (Beckett Registry, BVG, BCCG sibling services, price guide, marketplace) is mentioned in linked Beckett URLs but not in this source set.

## See also

- [[card-grading]] — grading as a general concept, BGS as one of multiple services.
- [[bgs-subgrades]] — the four-subgrade evaluation model.
- [[grading-scales]] — the 1–10 grade scale; BGS section reproduces grade-by-grade subgrade tolerances.
- [[population-report]] — cross-grader grade rate comparisons; BGS pop report URL.
- [[psa]] — counterpart entity; key differences: BGS publishes subgrades, has Pristine label variants, defines half-points as interpolations.
