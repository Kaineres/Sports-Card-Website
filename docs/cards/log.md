# Cards wiki — log

Chronological, append-only.

## [2026-05-18] init | cards wiki seeded

- created `index.md`, `log.md`
- empty directories: `raw/`, `raw/assets/`, `wiki/entities/`, `wiki/concepts/`, `wiki/sources/`, `wiki/synthesis/`

## [2026-05-18] ingest | Official Trading Card Grading Service (PSA)

- source: [[psa-grading-service]]
- raw: `cards/raw/Official Trading Card Grading Service.md`
- new pages: [[psa]], [[card-grading]], [[grading-service-tiers]]
- updated pages: `index.md` refreshed (first ingest, no prior wiki pages to update)
- contradictions flagged: none
- notes: full 14-tier PSA price table intentionally not memorialized — only endpoints captured, with pointer back to raw source. Tier-table volatility flagged on the page.

## [2026-05-18] ingest | PSA Grading Standards (partial capture)

- source: [[psa-grading-standards]]
- raw: `cards/raw/PSA Grading Standards.md`
- new pages: [[grading-scales]], [[grading-qualifiers]], [[no-grade-outcomes]]
- updated pages: [[card-grading]], [[psa]], `index.md`
- contradictions flagged: none
- capture quality: **partial**. PSA 10 text definition captured; grades 9, 8.5, 8, 7, 6, 5, 4, 3, 2, 1.5, 1 referenced via image filenames only — text definitions did not survive page save. One qualifier (MK) fully defined; other qualifier categories referenced via filenames without code letters. Re-ingest after a clean page capture (every accordion expanded) would close the gap on [[grading-scales]] and [[grading-qualifiers]].
- well-captured: 9 N-codes (N1–N9), hand-cut / sheet-cut policy, pin/coin grading framework, eye-appeal subjectivity acknowledgment.

## [2026-05-18] re-ingest | PSA Grading Standards (grade-by-grade clip)

- source: [[psa-grading-standards]]
- raw: 10 additional files captured by clipping each grade tab separately — `cards/raw/PSA Grading Standards 1.md` through `PSA Grading Standards 10.md`. File numbering reflects clip order, not grade number (mapping table on the source page).
- new pages: none
- updated pages: [[grading-scales]] (11 of 12 numeric grades now fully defined — PSA 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10), [[psa-grading-standards]] (TL;DR + key claims + raw-file mapping table), `index.md` (certainty annotations updated).
- still missing: PSA 8.5 text definition (half-grade tab between 8 and 9 wasn't clipped); qualifier code letters and definitions for miscut / off-center / staining / print defect / out-of-focus.
- contradictions flagged: none.
- notes: 11 raw files now correspond to one source URL. Strict reading of schema ("every raw file gets exactly one page in sources/") would yield 11 source pages — kept as one logical source page instead, with the raw-file mapping table inline. Worth ratifying or revising this in `docs/CLAUDE.md` if multi-clip captures become common.

## [2026-05-18] re-ingest | PSA Grading Standards (supplementary clips 11+12)

- source: [[psa-grading-standards]]
- raw: 2 additional clip files — `cards/raw/PSA Grading Standards 11.md` (botched fragment) and `cards/raw/PSA Grading Standards 12.md` (re-clip of the page's trailing sections).
- new pages: none
- updated pages: [[psa-grading-standards]] (raw-files list extended; TL;DR + mapping table reflect 13 total raw files and the botched-clip status of file 11; added a "Top-level ungradable rule" claim and a "Pages updated" note for [[psa]]), [[psa]] (added an "Ungradable cards" section quoting PSA's explicit rejection rule), `index.md`.
- still missing: PSA 8.5 text definition (still uncaptured after the supplementary pass); qualifier code letters and definitions for miscut / off-center / staining / print defect / out-of-focus.
- contradictions flagged: none. File 12's content matches the prior ingest verbatim.
- notes: file 11 is a single-line mid-word fragment of the N1 trimming definition — likely a viewport-bottom capture. Logged as a raw file for completeness but yields no usable claims. File 12 is a clean re-clip of the page's trailing sections (Ungradable Cards / hand-cut / pins-coins / N1–N9 / MG / Koufax subjectivity essay); the only previously-unextracted content was PSA's top-level ungradable-card rejection summary, now landed on [[psa]].

## [2026-05-18] ingest | BGS Grading Scale (grade-by-grade clip)

- source: [[bgs-grading-scale]]
- raw: 12 files captured by clipping each grade tab on `beckett.com/grading` separately — `cards/raw/Back Button.md` through `Back Button 11.md`. File naming reflects the Web Clipper's misidentification of a "Back Button" element as the page title, not the grade contained. Mapping table on the source page.
- new pages: [[bgs]] (entity), [[bgs-subgrades]] (concept), [[bgs-grading-scale]] (source).
- updated pages: [[grading-scales]] (BGS section added — integer grades 1–9 + 9.5 + Pristine 10 Black/Gold variants, each with the four subgrade tolerances; cross-grade observations vs PSA), [[card-grading]] (scale section now references BGS alongside PSA; multi-service framing reinforced), `index.md`.
- contradictions flagged: none. PSA and BGS publish different standards on different scales; no factual contradictions surfaced between sources. The single source-internal mismatch — `Back Button 11.md` claims "1: Poor" in copy but references `1.5-card.png` in the image asset URL — was logged on the source page as a Beckett asset-naming inconsistency, not a wiki claim conflict.
- capture status: **integer grades 1–9 + 9.5 + Pristine 10 (Black and Gold labels) all fully captured**. BGS half-points (8.5, 7.5, …, 1.5) are not separately defined by BGS — explicitly described in source as interpolations sharing characteristics of adjacent integer grades; this is not a missing-clip gap.
- not captured (would need additional clips): BGS pricing / service-tier structure, BGS qualifier system (if any), BGS no-grade / ungradable taxonomy, BGS authentication-only encapsulation labels, BGS company-background copy (`beckett.com/grading/about`).
- notes: the four-subgrade model is BGS-distinctive and warranted a dedicated [[bgs-subgrades]] concept page rather than folding into [[grading-scales]]. The Pristine 10 Black/Gold label distinction has no PSA equivalent and is published explicitly by BGS — not market folklore. "Diamond cutting" and "metallic print lines" are BGS-specific named defect categories; PSA's published standards do not appear to use these terms.

## [2026-05-19] ingest | PSA Population Report (5 sources)

- sources: [[packz-psa-population-report-guide]], [[goingtwice-graded-pop-reports]], [[sundocards-psa-bgs-pop-reports]], [[yahoo-population-count-explained]], [[psa-market-report-population-perspective]]
- raw: 5 files — `cards/raw/How to Use the PSA Population Report to Invest.md`, `cards/raw/Graded Pop Reports - What do they mean.md`, `cards/raw/How to Use PSA and BGS Pop Reports to Your Advantage.md`, `cards/raw/Sports Card Investing Population Count Explained and What it Means to You.md`, `cards/raw/Market Report Population Perspective.md`
- new pages: [[population-report]] (concept), [[packz-psa-population-report-guide]] (source), [[goingtwice-graded-pop-reports]] (source), [[sundocards-psa-bgs-pop-reports]] (source), [[yahoo-population-count-explained]] (source), [[psa-market-report-population-perspective]] (source)
- updated pages: [[psa]] (Population Report section added, adjacent products updated), [[bgs]] (Population Report section with URL added), [[card-grading]] (See also link), [[grading-scales]] (See also link), `index.md`
- contradictions flagged: none across the five sources; all sources consistent on core claims.
- raw file notes:
  - `sundocards` file contained two articles on one page — pop report article extracted; embedded print-lines article excluded.
  - `yahoo` file captured a live sports page; only first ~80 lines cover pop counts; remainder is a Knicks-Cavs playoff preview, excluded.
- capture quality: good across all five. One claim flagged `[Likely]` — grading difficulty thresholds (PSA 10 rate < 10% / < 5%) stated in packz source without a PSA primary citation; consistent with market convention but not verified against a PSA document.

## [2026-05-19] ingest | BGS Grading Overview (beckett.com/grading)

- source: [[bgs-grading-overview]]
- raw: `cards/raw/card-grading-sports-gaming-non-sports-cards-beckett-202605192240.md`
- capture method: Obsidian Site Crawler (n8n + Firecrawl crawl workflow); Claude Haiku filtered Beckett site URLs → single relevant page selected and scraped automatically.
- new pages: [[bgs-grading-overview]] (source)
- updated pages: [[bgs]] (Silver label added; service tiers section added; security features added; card scope expanded to gaming/non-sports), [[bgs-subgrades]] (Pristine 10 Black centering tolerance 50/50 front / 55/45 back confirmed; half-points confirmed as applying to subgrades), [[grading-service-tiers]] (BGS 4-tier section added; open question on BGS tiers closed), `index.md`
- contradictions flagged: none. New content is additive; no conflicts with [[bgs-grading-scale]] data.
- notes: Silver label (all grades below Gem Mint 9.5) was not present in the prior grade-by-grade clip ingest — those clips focused on grade criteria, not label branding. Specific dollar prices for BGS tiers not captured (dynamic pricing table). BGS tier structure uses turnaround speed only as pricing axis; no declared-value component found (contrast with PSA's 14-tier value × speed matrix).

## [2026-05-18] ingest | SGC Grading Scale (grade-by-grade clip)

- source: [[sgc-grading-scale]]
- raw: 21 files captured by clipping each grade tab on `gosgc.com/card-grading/scale` separately — `cards/raw/SGC Grading Scale.md` (intro) plus `SGC Grading Scale 1.md` through `SGC Grading Scale 20.md`. Cleanest grade-tab capture of the three grading-service ingests so far — every tab clipped successfully.
- new pages: [[sgc]] (entity), [[sgc-grading-scale]] (source).
- updated pages: [[grading-scales]] (added a full SGC section with every grade from 1 → 10 PRI plus an SGC half-grade-pattern note; replaced the old BGS↔PSA cross-grade section with a 3-service cross-service observations section), [[card-grading]] (multi-service framing now names SGC alongside PSA and BGS; added a "Vocabulary divide across services" subsection noting BGS+SGC vs PSA terminology splits), `index.md`.
- contradictions flagged: none across sources. One source-internal inconsistency surfaced and is documented on the source page and the [[sgc]] entity page — SGC's intro claims its scale "eliminates the grades known as 'tweeners'" but most of its half-grades (6.5, 5.5, 4.5, 3.5, 2.5) are defined only as "high-end overall quality and eye appeal" of the parent grade, which are textbook tweeners.
- capture status: **all 20 SGC grade levels captured** (1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10 GM, 10 PRI). Front centering, corner, surface, and crease criteria documented per-grade.
- not captured (would need additional clips): SGC pricing / service-tier structure, SGC qualifier system (if any), SGC no-grade / ungradable taxonomy, SGC authentication-only encapsulation labels, SGC company background.
- notes: SGC publishes **no back-centering tolerances** (only one centering figure per grade — front-implied) — a meaningful asymmetry vs both PSA and BGS. SGC publishes **no subgrades** (single overall grade only) — unlike BGS. SGC's 10 PRI vs 10 GM distinction parallels BGS's Black/Gold Pristine concept but operates on stricter top-level criteria rather than subgrade composition. Vocabulary observations: SGC shares "diamond cut" and "refractor lines" with BGS but not with PSA; SGC uniquely names "spider crease" and "pinhole" as defect categories. SGC's half-grade structure splits into two kinds — criterion-defined (8.5, 7.5, and partially 9.5) vs "+" tier (6.5, 5.5, 4.5, 3.5, 2.5).

## [2026-05-19] assess | junk / no-content files (4 files)

- raw: `cards/raw/example-domain-202605192206.md`, `cards/raw/verify-card-certification-look-up-a-cgc-certification-number-202605200056.md`, `cards/raw/psa-grading-standards-202605192207.md`, `cards/raw/psa-grading-standards-202605192304.md`
- assessment: `example-domain` is a test artifact (example.com placeholder from n8n pipeline initialization). CGC cert-lookup file contains only a rate-limit error banner and a single cert result for a Pokémon Fossil Golduck CGC 8.5 — not representative grading methodology content, product of CGC's anti-scraping throttle. Both PSA crawl files are identical full-page dumps of psacard.com/gradingstandards — PSA 10 text and N1–N9 definitions are present in text (already ingested 2026-05-18); all other grade definitions (9 down to 1.5) and qualifier codes (OC/MC/ST/PD/OF) are image-carousel only, same gap as the original clip ingest. No new extractable claims in any of these files.
- new pages: none
- updated pages: none
- notes: PSA 8.5 text definition and qualifier code letters (MC/OC/ST/PD/OF) remain missing from all sources — the page uses JavaScript accordion tabs that a full-page crawl cannot expand. Requires per-tab clips using the manual bookmarklet.

## [2026-05-19] assess | CGC cert-lookup retry files (2 files)

- raw: `cards/raw/verify-card-certification-look-up-a-cgc-certification-number-202605200100.md`, `cards/raw/verify-card-certification-look-up-a-cgc-certification-number-202605200114.md`
- assessment: identical content to the previously logged CGC cert-lookup file (202605200056) — same URL (cgccards.com/certlookup/6031819005), same rate-limit error banner, same Golduck Fossil 8.5 cert data. n8n workflow retried the same blocked page twice more after the initial crawl. No new content.
- new pages: none
- updated pages: none

## [2026-05-19] ingest | 2024 Panini Mosaic Football Checklist (Beckett)

- source: [[beckett-2024-panini-mosaic-football]]
- raw: `cards/raw/2024-panini-mosaic-football-checklist-team-sets-hobby-box-in-202605200037.md`
- new pages: [[panini]] (entity), [[2024-panini-mosaic-football]] (entity), [[card-parallels]] (concept), [[beckett-2024-panini-mosaic-football]] (source)
- updated pages: `index.md`
- contradictions flagged: none
- notes: first card-set and manufacturer entity in the wiki.

## [2026-05-19] ingest | CGC Grading Scale (cgccards.com/card-grading/grading-scale/)

- source: [[cgc-grading-scale]]
- raw: `cards/raw/Grading Scale.md`
- new pages: [[cgc]] (entity), [[cgc-grading-scale]] (source)
- updated pages: [[grading-scales]] (CGC section added — all 20 grades; cross-service observations section updated for 4-service coverage), `index.md`
- contradictions flagged: none across sources. One label-history note on [[cgc]]: CGC previously labeled what is now "Gem Mint 10" as "Gem Mint 9.5" — those slabs now display as "Gem Mint 10." Old "Gem Mint 10" is now "Pristine 10." This is not a contradiction with the current published standards but is a known caveat for evaluating older CGC slabs.
- capture status: **all 20 CGC grade levels captured** (Poor 1, Fair 1.5, Good 2, Good+ 2.5, Very Good 3, Very Good+ 3.5, VG/Ex 4, VG/Ex+ 4.5, Excellent 5, Excellent+ 5.5, Ex/NM 6, Ex/NM+ 6.5, Near Mint 7, Near Mint+ 7.5, NM/Mint 8, NM/Mint+ 8.5, Mint 9, Mint+ 9.5, Gem Mint 10, Pristine 10).
- not captured: CGC service tiers / pricing, CGC qualifier system (if any), CGC no-grade taxonomy, CGC authentication-only labels.
- notes: source page is a clean single-scroll page — no accordion tabs. All 20 grades captured in one clip. One gap: CGC 8.5 centering for sports/non-sports cards is not stated in the source (only TCG distinction separates 8.5 from 8). Grading-scales cross-service observations section updated to cover all four services. Raw file is a 5-tab Beckett News article dumped sequentially by the crawler (16,615 lines); same per-card player list appears 2–3× across tab sections. Structural data captured: set specs, 38 base parallel variants with print runs, named subsets, all 16 key rookies, Hall of Fame subset, autograph set roster, short-print insert names. Full insert checklist tab not extracted in this pass — named short-prints (Money, Micro Mosaic, Stained Glass) captured from article header only. 100-card rookie subset fully enumerated on [[2024-panini-mosaic-football]] entity page.
