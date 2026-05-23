---
type: entity
tags: [grading-service, company, sgc]
updated: 2026-05-18
sources: [[sgc-grading-scale]]
certainty: Certain
---

# SGC

## For future Claude
SGC is a third-party trading card grading company using a 20-step scale (half-grades at every step) with a single overall grade and no subgrades — the simplest output format among the four major graders.
Relevant when: answering questions about SGC's grade scale, the 10 PRI vs 10 GM distinction, SGC-specific defect terminology (diamond cut, refractor lines, spider crease, pinhole), or comparing SGC to PSA/BGS/CGC.
Key fact: SGC issues two distinct "10" labels — Pristine 10 (50/50 centering, no wear under magnification) and Gem Mint 10 (55/45, slight print spot allowed) — based on stricter top-level criteria, not subgrade composition like BGS; SGC publishes only front-centering tolerances and has no documented qualifier system or authentication N-codes.

## TL;DR

SGC is a third-party trading card grading company. They grade cards on a 1–10 scale with **half-grades at every step plus a Pristine 10 above the Gem 10**, producing a 20-step scale `[Certain]` — [[sgc-grading-scale]]. Unlike BGS, SGC publishes a **single overall grade** with no subgrades. Unlike both PSA and BGS, SGC publishes only one centering tolerance per grade (no separate back-centering figure).

## What SGC does

- **Grading on a 20-step scale** — final grades issued from 1 (POOR) through 10 PRI (Pristine), with half-grades at every step `[Certain]` — [[sgc-grading-scale]].
- **Single overall grade** — no subgrades published. The card receives one number `[Certain]` — [[sgc-grading-scale]].

## 10 PRI vs 10 GM

`[Certain]` — [[sgc-grading-scale]]. SGC issues two distinct grade labels at the top of the scale:

| Label | Centering | Wear under magnification | Print spots |
|---|---|---|---|
| **10 PRI (Pristine)** | 50/50 | **No visible wear under magnification** | None |
| **10 GM (GEM)** | 55/45 or better | No visible wear | A slight print spot allowed under close scrutiny if non-detracting |

This is conceptually similar to BGS's Black-vs-Gold Pristine distinction but works differently in mechanism: BGS bases the distinction on **subgrade composition** (four 10s vs three 10s + one 9.5), whereas SGC bases it on **stricter top-level criteria** (PRI's "no visible wear under magnification" + 50/50 centering vs GM's 55/45 + close-scrutiny allowance). PSA has no equivalent.

## Half-grade philosophy

`[Certain]` — [[sgc-grading-scale]]. SGC's intro copy claims the scale "eliminates the grades known as 'tweeners.'" Their own grade definitions partially contradict this:

- **Half-grades with their own criteria** — **8.5 NM/MT+** (own centering, four sharp corners) and **7.5 NM+** (own centering tolerance) function as genuine grade levels.
- **"+" tier half-grades** — 6.5, 5.5, 4.5, 3.5, 2.5 are defined verbatim as "An [X] card that exhibits high-end overall quality and eye appeal." These are the top tier within a parent grade bucket — i.e., tweeners.
- **9.5 MINT+** is intermediate: relationally defined ("appears Gem Mint at first glance" with "tiny flaws") without its own centering or corner tolerance.

The marketing claim and the published grade definitions are not fully consistent. Worth surfacing in any consumer-facing comparison content.

## SGC-specific terminology

`[Certain]` — [[sgc-grading-scale]]:

- **Diamond cut** — slightly-skewed factory cut, named at grade 7. Matches BGS's "diamond cutting." PSA's standards don't use this term.
- **Refractor lines** — named surface-defect category at grades 7–9, parallel to print lines. Parallels BGS's "metallic print lines." PSA's standards don't name this defect.
- **Spider crease** — used at grade 5 ("one VERY slight surface or 'spider' crease"). Distinctive SGC terminology.
- **Pinhole** — named defect at grades 1–2. Distinctive SGC terminology.

## What SGC does *not* publish (on this page)

- **Back-centering tolerances.** SGC publishes one centering figure per grade. PSA and BGS both publish front + back. `[Certain — by omission]` — [[sgc-grading-scale]].
- **Subgrades.** No four-axis breakdown like BGS.
- **A separate ungradable / no-grade taxonomy.** Not on the scale page; may exist elsewhere on `gosgc.com`.
- **A qualifier system.** Not on the scale page.
- **Authentication-only encapsulation labels.** Not on the scale page.

## Service tiers / pricing

Not captured in the current source set. Pricing parallel to [[grading-service-tiers]] would require a separate clip from SGC submission pages.

## See also

- [[card-grading]] — grading as a general concept; SGC is one of multiple services.
- [[grading-scales]] — the 1–10 numeric scale; SGC section reproduces every grade.
- [[grading-service-tiers]] — service tier comparison; SGC's tiers not yet ingested.
- [[population-report]] — SGC maintains a pop report; cross-grader grade-rate differences are documented there.
- [[concepts/grading-services-landscape]] — synthesis: side-by-side comparison of all four grading services.
- [[psa]] — counterpart entity. Key differences: SGC has half-grades at every step (PSA has only 1.5 and 8.5); SGC has no qualifier system or N-codes documented; SGC publishes front-centering only.
- [[bgs]] — counterpart entity. Key differences: BGS publishes four subgrades, SGC publishes a single overall; BGS bases its Pristine label hierarchy on subgrade composition, SGC bases its 10 PRI/GM distinction on stricter top-level criteria; BGS publishes back-centering, SGC does not.
- [[cgc]] — counterpart entity. Both use 20-step scales with Pristine 10 / Gem Mint 10 split; both publish single overall grades (no subgrades).
