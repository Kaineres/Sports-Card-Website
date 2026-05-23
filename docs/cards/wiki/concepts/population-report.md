---
type: concept
tags: [population, rarity, grading, market-data, psa, bgs, cgc]
updated: 2026-05-19
sources: [[sources/packz-psa-population-report-guide]], [[sources/goingtwice-graded-pop-reports]], [[sources/sundocards-psa-bgs-pop-reports]], [[sources/yahoo-population-count-explained]], [[sources/psa-market-report-population-perspective]]
certainty: Certain
---

# Population Report

## For future Claude
This page explains what a grading company's population ("pop") report is, what distorts its counts, and how to interpret it correctly for rarity and value assessment across PSA, BGS, and CGC.
Relevant when: evaluating whether a card is genuinely scarce at a given grade, understanding why the same card shows wildly different grade distributions at different services, or building pricing or rarity-scoring features.
Key fact: grade distribution matters more than total population — a card with 20,000 total graded copies but only 50 PSA 10s has genuinely scarce Gem Mints; pop counts are also distorted by crack-and-resubmit, cross-grading between services, and submission inactivity on low-demand cards.

## TL;DR

A population report ("pop report") is a publicly searchable database maintained by each grading company counting how many copies of a specific card have been graded at each grade level. Grade distribution matters more than total population; low pop alone does not guarantee rarity or value.

## What it is

A pop report is a tally of every card a grading company has authenticated and encapsulated, broken down by set, player, and grade `[Certain]` — [[sources/psa-market-report-population-perspective]]. Any specific card entry shows how many copies received each grade level, giving a picture of that card's grade distribution within the graded market.

All three major grading companies publish free, publicly accessible pop reports `[Certain]` — [[sources/goingtwice-graded-pop-reports]]:

| Company | Pop Report URL |
|---|---|
| PSA | psacard.com/pop |
| BGS | beckett.com/grading/pop-report |
| CGC | cgccards.com/population-report |

PSA's report is also accessible per-card via certification number at psacard.com/cert `[Certain]` — [[sources/yahoo-population-count-explained]]. PSA updates daily `[Certain]` — [[sources/packz-psa-population-report-guide]].

## What the data shows

Each pop report entry surfaces two key figures per grade `[Certain]` — [[sources/yahoo-population-count-explained]]:

- **Population** — count of cards graded at that specific grade level.
- **Population Higher** — count of cards graded above that grade level.

PSA does not issue half-grades at 9 or above — only integer steps at the top of the scale `[Certain]` — [[sources/yahoo-population-count-explained]]. See [[grading-scales]] for the full PSA half-grade structure (1.5 and 8.5 only).

## Grade distribution > total population

The most common mistake is focusing on total graded population rather than grade distribution `[Certain]` — [[sources/packz-psa-population-report-guide]], [[sources/psa-market-report-population-perspective]]. A card with 20,000 total graded copies but only 50 PSA 10s has genuinely scarce Gem Mints — the aggregate number misleads.

Always examine the count at the specific grade you're evaluating. The PSA 10 population is typically the most value-relevant figure.

## What distorts population counts

### Submission rate

Low pop can mean the card is rare — or it can mean nobody submitted it. PSA's own article (Joe Orlando) gives a direct example: a "Pop 4 Mint 9" card sold for ~$500 when its actual value was ~$10, because its low population reflected submission inactivity, not scarcity `[Certain]` — [[sources/psa-market-report-population-perspective]].

Modern in-demand cards accumulate pop rapidly — Connor Bedard Young Guns averaged ~75 new PSA 9/10 copies per day in its first 80 days after release `[Certain]` — [[sources/yahoo-population-count-explained]]. Obscure or low-value cards may go years with minimal submissions.

### Crack and resubmit

A collector can crack a card out of its slab and resubmit to PSA hoping for a higher grade. This can cause one physical card to be counted multiple times under different certification numbers `[Certain]` — [[sources/packz-psa-population-report-guide]].

### Cross-grading

A card graded at PSA and then submitted to BGS appears in both companies' population reports as separate entries, even though only one physical card exists `[Certain]` — [[sources/sundocards-psa-bgs-pop-reports]].

### Print runs and card age

Vintage cards (1950s–60s) had smaller print runs and decades of wear — naturally lower high-grade populations `[Certain]` — [[sources/packz-psa-population-report-guide]]. Junk wax era cards (late 1980s – early 1990s) were printed in massive quantities; high total populations expected `[Certain]` — [[sources/packz-psa-population-report-guide]].

### Rejected cards not counted

PSA population numbers exclude cards rejected for evidence of alteration, restoration, or questionable authenticity `[Certain]` — [[sources/psa-market-report-population-perspective]].

### Vintage pop skews high-grade

Most people don't submit low-condition vintage cards, so pop reports skew toward high grades. If all vintage cards were graded, lower-grade population counts would be far larger `[Certain]` — [[sources/psa-market-report-population-perspective]].

## Grading difficulty thresholds

The fraction of submissions that receive a PSA 10 signals how hard a card is to grade `[Likely — stated in one source without a PSA primary citation]` — [[sources/packz-psa-population-report-guide]]:

- PSA 10 rate below 10% → hard to grade
- PSA 10 rate below 5% → extreme grading difficulty; potential value premiums

## Cross-grader grade rates differ significantly

The same card shows very different grade distributions across companies. Umbreon VMAX Alt Art (Pokémon Evolving Skies) example `[Certain]` — [[sources/goingtwice-graded-pop-reports]]:

| Company | % hitting top grade |
|---|---|
| PSA | 80% received PSA 10 |
| BGS | 31% received Pristine 10 or Black Label |
| CGC | 13% received Pristine/Perfect 10 |

Two implications: (1) PSA 10 is easier to achieve at PSA; (2) the abundance of PSA 10s on the market may suppress individual PSA 10 value, making a BGS Pristine or CGC Pristine scarcer and potentially more premium.

## Value implications

### Low pop + high demand = value potential

Low population creates scarcity potential, but demand must also be present `[Certain]` — [[sources/packz-psa-population-report-guide]]. A pop-1 card of an unknown player with no collector demand has minimal value regardless of rarity.

### High pop ≠ low value for blue-chip cards

For iconic cards (Jordan rookie, first-edition Charizard), demand can outpace supply even with large populations `[Certain]` — [[sources/packz-psa-population-report-guide]]. Historical significance and collector depth sustain value despite wide availability.

### Pricing power and liquidity

High-POP cards are liquid: many comparable sales make pricing straightforward; seller competition may push prices to 80–90% of recent comps `[Certain]` — [[sources/yahoo-population-count-explained]].

Low-POP cards give sellers pricing power: fewer comps, fewer competing sellers — "Yesterday's price is not today's price" `[Certain]` — [[sources/yahoo-population-count-explained]].

## Limitations

- Reports are snapshots of what's been graded, not a census of all cards in existence `[Certain]`.
- Within-grade quality varies (centering, surface) but pop reports don't capture this distinction `[Certain]` — [[sources/sundocards-psa-bgs-pop-reports]].
- Grade distribution reveals print quality trends (manufacturing issues cause low-grade clustering), but the report alone doesn't explain why — market context required `[Certain]` — [[sources/goingtwice-graded-pop-reports]].

## See also

- [[grading-scales]] — grade levels that define each row in a pop report.
- [[card-grading]] — the grading process that generates each pop count entry.
- [[psa]] — PSA's pop report is the most commonly cited.
- [[bgs]] — BGS pop report at beckett.com/grading/pop-report.
- [[company/business-plan]] — pop report changes (PSA population shifts) are listed as candidate signal #4 in the Buy/Hold/Sell Recommendation Engine wedge.
- [[vendors/card-ladder]] — competitor that already integrates PSA, BGS, SGC, CGC pop reports into card detail views
- [[vendors/market-movers]] — competitor that ingests PSA, SGC, Beckett, CGC pop data
- [[topics/pricing-pipeline]] — the engineering pipeline that will ingest pop report data as candidate signal #4
