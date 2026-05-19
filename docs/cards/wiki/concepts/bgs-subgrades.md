---
type: concept
tags: [grading, bgs, subgrades]
updated: 2026-05-18
sources: [[bgs-grading-scale]]
certainty: Certain
---

# BGS Subgrades

## TL;DR

BGS evaluates every card across **four subgrade dimensions** — centering, corners, edges, surface — then composites them into an **overall grade** `[Certain]` — [[bgs-grading-scale]]. This is the structural difference between BGS and PSA: PSA publishes a single number; BGS publishes four numbers plus a composite. The four-subgrade record is what enables the BGS **Pristine Black Label vs Gold Label** distinction at grade 10.

## The four dimensions

`[Certain]` — [[bgs-grading-scale]]. Every BGS-published grade definition (10 through 1) lists tolerances in these four categories, in this order:

1. **Centering** — measured separately for front and back. Tolerances tighten at higher grades. Back tolerances are systematically looser than front (e.g., 9.5 = 55/45 front, 60/40 back).
2. **Corners** — perfection / fuzziness / notching / rounding / layering, in escalating defect severity as grade drops.
3. **Edges** — smoothness, chipping, notching, layering. Edge layering is a distinct defect category from corner layering.
4. **Surface** — print spots, color/focus imperfections, scratches, scuffing, gloss loss, **metallic print lines** (a BGS-named defect), creases, stains, tears.

## Compositing rule

`[Certain]` — [[bgs-grading-scale]]. BGS does not publish an explicit averaging or worst-of formula in the captured source. What *is* explicit:

- The four subgrades together determine the overall grade.
- At grade 10 specifically, the composition rule is published: four 10s → Black Label; three 10s + one 9.5 → Gold Label.
- For other grades, the source describes only per-subgrade tolerances, not how subgrades roll up to an overall. `[Guessing]` — likely the overall grade is bounded by the worst subgrade, with judgment for borderline cases, but this is not stated in the captured source. Worth flagging on re-ingest.

## Pristine 10 label hierarchy

`[Certain]` — [[bgs-grading-scale]]. At the overall grade of 10 Pristine, BGS issues one of two labels based on subgrade composition:

| Label | Subgrade composition |
|---|---|
| **Black Label** | All four subgrades = 10. |
| **Gold Label** | Exactly three subgrades = 10, one subgrade = 9.5, in any combination of categories. |

The Black/Gold distinction has no PSA equivalent and carries strong market value implications among BGS-graded high-grade cards.

## Half-points

`[Certain]` — [[bgs-grading-scale]]. BGS-published criteria cover integer grades plus 9.5 only. Half-points (8.5, 7.5, …, 1.5) are explicitly described by BGS as interpolations: a card receives a half-point grade when it "typically share[s] characteristics from both the level above and the level below the actual grade given." Whether subgrades themselves are also issued in half-points (or only the overall) is not made explicit in the captured source — `[Likely yes]` based on the Gold Label rule requiring a 9.5 subgrade, but worth verifying.

## BGS-specific defect terminology

- **Diamond cutting** — non-rectangular cut, a centering defect. Tolerated in escalating amounts from grade 7 down to grade 1.
- **Metallic print lines** — a distinct surface-defect category named in every grade tier. `[Certain]` — [[bgs-grading-scale]]. PSA does not appear to publish this as a named defect category.

## See also

- [[bgs]] — entity page.
- [[grading-scales]] — the 1–10 numeric scale; BGS section reproduces grade-by-grade subgrade tolerances.
- [[grading-qualifiers]] — PSA-style qualifier suffixes; BGS appears to use the subgrade record itself in lieu of single-letter qualifiers, but this needs verification.
- [[card-grading]] — grading as a general concept.
