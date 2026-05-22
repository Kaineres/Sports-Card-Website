---
type: entity
tags: [grading-service, company, beckett]
updated: 2026-05-19
sources: [[bgs-grading-scale]], [[goingtwice-graded-pop-reports]], [[bgs-grading-overview]]
certainty: Certain
---

# BGS

## For future Claude
BGS (Beckett Grading Services) is a third-party grading company and the only major grader that publishes four subgrades per card (centering, corners, edges, surface) directly on the slab label.
Relevant when: answering questions about BGS subgrade mechanics, the Black/Gold/Silver label hierarchy, BGS centering tolerances (including the looser back-centering standard), service tier pricing, or comparing BGS to PSA/SGC/CGC.
Key fact: BGS grades on a 1–10 scale with half-points at every step; a Black label requires all four subgrades to be 10 (perfect Pristine), while a Gold label requires Pristine 10 or Gem Mint 9.5 — a distinction with no PSA or SGC equivalent that significantly affects slab market value.

## TL;DR

BGS (Beckett Grading Services) is a third-party trading card grading company. They grade cards on a 1–10 scale with half-points at every step, publishing **four subgrades per card** (centering, corners, edges, surface) plus a composite overall grade — and are the only major grader to display all four subgrades directly on the slab label `[Certain]` — [[bgs-grading-scale]], [[bgs-grading-overview]]. Grades sports, gaming (Pokémon), and non-sports (Star Wars, etc.) cards. See [[bgs-subgrades]] for subgrade mechanics.

## What BGS does

- **Four-subgrade evaluation** — every card receives four subgrades (centering, corners, edges, surface); overall grade is composited from the four. `[Certain]` — [[bgs-grading-scale]]. Mechanics in [[bgs-subgrades]].
- **Grading on a 1–10 scale with half-points** — final grades in half-point increments (10, 9.5, 9, 8.5, …, 1.5, 1). `[Certain]` — [[bgs-grading-scale]], [[bgs-grading-overview]].
- **3-tier label system** — see below.
- **Authenticity check included** — every card examined for trimming, doctoring, and alteration before grading begins `[Certain]` — [[bgs-grading-overview]].
- **Card scope** — sports, gaming (Pokémon), and non-sports (Star Wars, etc.) `[Certain]` — [[bgs-grading-overview]].

## Label hierarchy — Black, Gold, Silver

`[Certain]` — [[bgs-grading-scale]], [[bgs-grading-overview]]:

| Label | Issued when |
|---|---|
| **Black** | All four subgrades = 10. Perfect Pristine. Top of the BGS hierarchy. |
| **Gold** | Pristine 10 or Gem Mint 9.5. Three subgrades = 10, one = 9.5 (any combination) qualifies for Pristine 10 Gold. |
| **Silver** | All other grades (everything below Gem Mint 9.5). |

The Black/Gold distinction has no PSA or SGC equivalent. Silver is the default label for the vast majority of graded cards.

## Label security features

`[Certain]` — [[bgs-grading-overview]]. New Beckett labels include:
- Holographic metallic material
- Hidden UV pattern
- Anti-counterfeit light reactive badge
- QR code linking to cert verification at beckett.com

## BGS-specific terminology

`[Certain]` — [[bgs-grading-scale]]:

- **Diamond cutting** — a centering-defect term for cards cut at a non-rectangular angle. BGS tolerates "very slight" at grade 7, "slight" at 6, "moderate" at 4, "noticeable" at 2, and "heavy" at 1. PSA has no published equivalent term.
- **Back centering systematically looser than front** — across the scale, BGS back-centering tolerances are markedly more permissive than front (e.g., grade 9.5 = 55/45 front but 60/40 back; grade 7 = 65/35 front but 90/10 back). This is grade-design philosophy, not a defect category.

## Self-described market position

Not captured in the current source set — BGS's "about" / "history" copy lives on `beckett.com/grading/about`, not yet ingested.

## Service tiers / pricing

`[Certain]` — [[bgs-grading-overview]]. BGS offers four turnaround tiers (all prices per card; specific dollar amounts not captured — dynamic pricing table):

| Tier | Turnaround |
|---|---|
| Base | 75+ business days |
| Standard | 45 business days |
| Express | 15 business days |
| Priority | 5 business days |

Available add-ons: Autograph Card (+$5), Oversized Card (+$8), Relabel (from $9.95), Graded Card Review (+$0), Recase BGS only (from $9.95). Turnaround times are estimated and subject to change `[Certain]` — [[bgs-grading-overview]].

See [[grading-service-tiers]] for cross-service tier comparison.

## Population Report

BGS maintains a publicly accessible pop report at `beckett.com/grading/pop-report`, searchable by card `[Certain]` — [[sources/goingtwice-graded-pop-reports]]. BGS grades using half-point increments and four subgrades, so its pop report data is structured differently than PSA's. See [[concepts/population-report]] for cross-grader grade rate comparisons.

## Adjacent products

Not yet ingested. Beckett's broader ecosystem (Beckett Registry, BVG, BCCG sibling services, price guide, marketplace) is mentioned in linked Beckett URLs but not in this source set.

## See also

- [[card-grading]] — grading as a general concept, BGS as one of multiple services.
- [[bgs-subgrades]] — the four-subgrade evaluation model.
- [[grading-scales]] — the 1–10 grade scale; BGS section reproduces grade-by-grade subgrade tolerances.
- [[grading-service-tiers]] — cross-service tier comparison; BGS's four-tier structure (no declared-value axis).
- [[population-report]] — cross-grader grade rate comparisons; BGS pop report URL.
- [[psa]] — counterpart entity; key differences: BGS publishes subgrades, has Pristine label variants, defines half-points as interpolations.
- [[sgc]] — counterpart entity; key differences: SGC uses single overall grade (no subgrades), bases its PRI/GM distinction on top-level criteria rather than subgrade composition, publishes front-centering only.
- [[cgc]] — counterpart entity; 20-grade scale, single overall grade (no subgrades), Pristine 10 / Gem Mint 10 two-tier top.
