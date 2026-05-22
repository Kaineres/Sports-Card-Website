---
type: synthesis
tags: [grading-service, comparison, landscape]
updated: 2026-05-22
sources: [[entities/psa]], [[entities/bgs]], [[entities/sgc]], [[entities/cgc]]
certainty: Certain
---

# Grading Services Landscape

## For future Claude
This synthesis covers all four major third-party grading services — PSA, BGS, SGC, and CGC — side-by-side in one place. Use it when answering cross-service comparison questions, building grading-cost estimators, or writing consumer-facing content that contrasts services; it is faster than reading all four entity pages individually. The single most differentiating fact: BGS is the only service that publishes four subgrades (centering, corners, edges, surface) directly on the slab label — the other three each issue a single overall grade.

## TL;DR

PSA dominates by volume with a 14-tier pricing menu and the most widely cited pop report; BGS is the only service with published four-subgrade labels and a Black/Gold Pristine hierarchy; SGC and CGC both use 20-step scales (half-grades at every step) with a Pristine 10 / Gem Mint 10 split at the top and single overall grades. CGC is uniquely distinguished by publishing separate grading criteria for TCG cards alongside sports and non-sports cards.

## Grade Scales at a Glance

| Service | Scale | Half-grades | Subgrades | Top label |
|---|---|---|---|---|
| [[entities/psa\|PSA]] | 1–10 integer; half-grades at 1.5 and 8.5 only | At 1.5 and 8.5 only | No | PSA 10 Gem Mint |
| [[entities/bgs\|BGS]] | 1–10 with half-points at every step | At every step | Yes (4: centering, corners, edges, surface) | BGS 10 Pristine Black Label |
| [[entities/sgc\|SGC]] | 1–10 with half-grades at every step plus Pristine 10 above Gem 10 (20-step scale) | At every step | No | SGC 10 PRI (Pristine) |
| [[entities/cgc\|CGC]] | Poor 1 → Pristine 10; half-grades at every step (20-step scale) | At every step | No | CGC Pristine 10 |

`[Certain]` — [[entities/psa]], [[entities/bgs]], [[entities/sgc]], [[entities/cgc]]

## Subgrade Systems

BGS is the only major grader that publishes four subgrades per card directly on the slab label `[Certain]` — [[entities/bgs]], [[concepts/bgs-subgrades]]. The four dimensions are **centering**, **corners**, **edges**, and **surface**; each receives a grade on the same 1–10 half-point scale as the overall grade, and all four are printed on the label alongside the composite overall.

Back-centering tolerances are systematically looser than front across the BGS scale (e.g., 9.5 = 55/45 front, 60/40 back; 7 = 65/35 front, 90/10 back) `[Certain]` — [[concepts/bgs-subgrades]]. This is grade-design philosophy, not a defect.

The four subgrades directly determine BGS's Black/Gold label hierarchy at Pristine 10: all four subgrades = 10 earns a **Black Label** (with 50/50 front centering required); three subgrades = 10 plus one = 9.5 earns a **Gold Label** `[Certain]` — [[concepts/bgs-subgrades]]. This Black/Gold distinction has no PSA, SGC, or CGC equivalent and carries strong market value implications; Silver is the default label for all grades below Gem Mint 9.5.

PSA, SGC, and CGC each issue a single overall grade with no subgrade breakdown on the slab `[Certain]` — [[entities/psa]], [[entities/sgc]], [[entities/cgc]].

## Service Tiers and Pricing

### PSA

PSA offers **14 service tiers** scaling on two independent axes: **declared card value** (which sets the insured-value cap during handling) and **desired turnaround speed** `[Certain]` — [[concepts/grading-service-tiers]]. This creates a pricing curve that spans more than 400× from cheapest to most expensive:

- **Cheapest/slowest** — "Value Bulk": $24.99/card, $500 insured cap, 140–160 business day turnaround. Gated to Collectors Club members; 50-card minimum per era `[Certain]` — [[concepts/grading-service-tiers]].
- **Fastest cheapest** — "Walk-Through": $599/card, $10,000 insured cap, 5–7 business day turnaround `[Certain]` — [[concepts/grading-service-tiers]].
- **Most expensive/fastest** — "Premium 10": $9,999+/card, $250,001+ insured cap, 5–7 business day turnaround. Includes Premium Imaging, fitted sleeve protector, and Grader Notes `[Certain]` — [[concepts/grading-service-tiers]].

A $5,000 card cannot legally use a $500-cap tier — the declared-value axis enforces minimum tier selection for high-value cards `[Certain]` — [[concepts/grading-service-tiers]].

### BGS

BGS uses **turnaround speed only** as the pricing axis — no declared-value tiers have been captured in the current source set `[Certain]` — [[concepts/grading-service-tiers]]. Four tiers:

| Tier | Turnaround |
|---|---|
| Base | 75+ business days |
| Standard | 45 business days |
| Express | 15 business days |
| Priority | 5 business days |

Available add-ons: Autograph Card (+$5), Oversized Card (+$8), Relabel (from $9.95), Graded Card Review (+$0), Recase BGS only (from $9.95) `[Certain]` — [[concepts/grading-service-tiers]]. Specific per-tier prices were not captured (dynamic pricing table). Whether BGS uses a declared-value axis not shown on the main grading page is `[Likely yes, unverified]`.

### SGC and CGC

SGC's tier structure and pricing have not yet been ingested into this vault `[Certain — by omission]` — [[entities/sgc]]. CGC's tier structure and pricing have also not yet been ingested `[Certain — by omission]` — [[entities/cgc]]. For the full cross-service picture, see [[concepts/grading-service-tiers]].

## Population Reports

All three major grading companies that have been researched publish free, publicly accessible pop reports `[Certain]` — [[concepts/population-report]]:

| Service | Pop Report URL | Update frequency |
|---|---|---|
| PSA | psacard.com/pop (by player/set); psacard.com/cert (by cert number) | Daily |
| BGS | beckett.com/grading/pop-report | Not captured |
| CGC | cgccards.com/population-report | Not captured |

SGC maintains a pop report `[Certain]` — [[entities/sgc]], but the URL and structure are not yet ingested.

PSA's report is the most widely cited in the hobby `[Certain]` — [[entities/psa]]. Each entry shows a **Population** count at each grade and a **Population Higher** count above each grade `[Certain]` — [[concepts/population-report]].

BGS's pop report data is structured differently than PSA's because BGS uses half-point increments and four subgrades — the BGS Pristine 10 Black Label and Gold Label appear as distinct categories `[Certain]` — [[entities/bgs]], [[concepts/bgs-subgrades]].

**Parallel breakdowns:** None of the entity pages document whether pop reports break down by parallel variant. This is an open gap in the current source set.

For grade-rate comparisons across services, distortion factors (crack-and-resubmit, cross-grading, submission inactivity), and value implications of pop data, see [[concepts/population-report]].

## Best Used For

- **PSA** — highest volume, most liquid resale market, most widely cited pop report; best default choice when collector demand and secondary-market comparables are the priority `[Certain]` — [[entities/psa]].
- **BGS** — the only service publishing four subgrades on the label; best when the buyer cares about the specific condition breakdown (centering, corners, edges, surface) or when a Black Label Pristine 10 premium is the goal `[Certain]` — [[entities/bgs]], [[concepts/bgs-subgrades]].
- **SGC** — single overall grade on a 20-step scale; appropriate when a more granular half-grade step is wanted without the complexity of subgrades; the PRI/GM distinction at the top is criterion-based rather than subgrade-composition-based `[Certain]` — [[entities/sgc]].
- **CGC** — best for TCG cards (Pokémon, Magic: The Gathering) where CGC's separately published TCG grading criteria provide additional specificity not found at PSA or BGS; also covers sports and non-sports `[Certain]` — [[entities/cgc]].

## Known Gaps as of 2026-05-22

- **PSA 8.5 definition** — PSA issues a half-grade at 8.5 but the specific criteria distinguishing a PSA 8.5 from a clean PSA 8 or borderline PSA 9 are not captured in the current source set `[Certain — by omission]` — [[entities/psa]].
- **SGC qualifier system** — SGC has no documented qualifier system or authentication N-codes in the ingested sources; whether one exists elsewhere on gosgc.com is unknown `[Certain — by omission]` — [[entities/sgc]].
- **SGC back-centering tolerances** — SGC publishes only one centering figure per grade (front only); back-centering tolerances are not published on the scale page `[Certain — by omission]` — [[entities/sgc]].
- **BGS no-grade taxonomy** — BGS performs an authenticity check before grading but no equivalent of PSA's N-code taxonomy has been ingested for BGS `[Certain — by omission]` — [[entities/bgs]].
- **CGC pricing and tiers** — CGC's service tier structure and per-tier pricing have not been ingested `[Certain — by omission]` — [[entities/cgc]], [[concepts/grading-service-tiers]].
- **SGC pricing and tiers** — SGC's service tier structure and per-tier pricing have not been ingested `[Certain — by omission]` — [[entities/sgc]], [[concepts/grading-service-tiers]].
- **CGC qualifier system** — Whether CGC uses a qualifier suffix system (like PSA's MK, ST, etc.) has not been ingested `[Certain — by omission]` — [[entities/cgc]].
- **Pop report parallel breakdowns** — None of the entity pages document whether any service's pop report breaks down counts by parallel variant.

## See also
- [[entities/psa]] — PSA detail page
- [[entities/bgs]] — BGS detail page
- [[entities/sgc]] — SGC detail page
- [[entities/cgc]] — CGC detail page
- [[concepts/grading-scales]] — grade scale definitions
- [[concepts/grading-service-tiers]] — tier/pricing detail
- [[concepts/bgs-subgrades]] — BGS subgrade system detail
- [[concepts/population-report]] — pop report concept
