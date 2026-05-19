---
type: concept
tags: [grading, bgs, subgrades]
updated: 2026-05-19
sources: [[bgs-grading-scale]], [[bgs-grading-overview]]
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

`[Certain]` — [[bgs-grading-scale]], [[bgs-grading-overview]]. At overall grade 10 Pristine, BGS issues one of two labels based on subgrade composition:

| Label | Subgrade composition | Centering (Black only) |
|---|---|---|
| **Black Label** | All four subgrades = 10. | 50/50 front; 55/45 or better back. |
| **Gold Label** | Three subgrades = 10, one = 9.5, any combination. | — |

The Black/Gold distinction has no PSA or SGC equivalent and carries strong market value implications. The 50/50 front centering requirement for Black Label is stricter than any other published BGS standard `[Certain]` — [[bgs-grading-overview]].

## Half-points

`[Certain]` — [[bgs-grading-scale]], [[bgs-grading-overview]]. BGS issues grades in half-point increments. Half-points are explicitly defined as interpolations: a card receives a half-point grade when it "typically share[s] characteristics from both the level above and the level below the actual grade given." Subgrades are also issued in half-points — confirmed by the Gold Label rule requiring a 9.5 subgrade `[Certain]` — [[bgs-grading-overview]].

## BGS-specific defect terminology

- **Diamond cutting** — non-rectangular cut, a centering defect. Tolerated in escalating amounts from grade 7 down to grade 1.
- **Metallic print lines** — a distinct surface-defect category named in every grade tier. `[Certain]` — [[bgs-grading-scale]]. PSA does not appear to publish this as a named defect category.

## See also

- [[bgs]] — entity page.
- [[grading-scales]] — the 1–10 numeric scale; BGS section reproduces grade-by-grade subgrade tolerances.
- [[grading-qualifiers]] — PSA-style qualifier suffixes; BGS appears to use the subgrade record itself in lieu of single-letter qualifiers, but this needs verification.
- [[card-grading]] — grading as a general concept.
