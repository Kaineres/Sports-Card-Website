# Graph Report - C:\Users\kaink\OneDrive\Documents\GitHub\Sports-Card-Website\docs  (2026-05-22)

## Corpus Check
- 108 files · ~139,269 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 219 nodes · 348 edges · 15 communities (12 shown, 3 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.84)
- Token cost: 18,000 input · 5,300 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Grading Concepts & Taxonomy|Grading Concepts & Taxonomy]]
- [[_COMMUNITY_CGC Certification & Pop Strategy|CGC Certification & Pop Strategy]]
- [[_COMMUNITY_Card Grading Services & Market|Card Grading Services & Market]]
- [[_COMMUNITY_Business Plan & Engineering|Business Plan & Engineering]]
- [[_COMMUNITY_PSA Grading Scale|PSA Grading Scale]]
- [[_COMMUNITY_Pop Report Analysis & Distortions|Pop Report Analysis & Distortions]]
- [[_COMMUNITY_Wiki Infrastructure & Operations|Wiki Infrastructure & Operations]]
- [[_COMMUNITY_Investment Signals & Pop Intelligence|Investment Signals & Pop Intelligence]]
- [[_COMMUNITY_Panini Mosaic & Card Parallels|Panini Mosaic & Card Parallels]]
- [[_COMMUNITY_Frontend Scaffold Plans|Frontend Scaffold Plans]]
- [[_COMMUNITY_LLM Wiki Plans|LLM Wiki Plans]]
- [[_COMMUNITY_Junk  Artifacts|Junk / Artifacts]]
- [[_COMMUNITY_PSA Ingest Log|PSA Ingest Log]]
- [[_COMMUNITY_SGC Ingest Log|SGC Ingest Log]]

## God Nodes (most connected - your core abstractions)
1. `SGC (Sportscard Guaranty Corporation)` - 23 edges
2. `Grading Scales` - 18 edges
3. `PSA (Professional Sports Authenticator)` - 18 edges
4. `PSA 10-Point Grading Scale` - 17 edges
5. `Card Grading` - 16 edges
6. `Population Report` - 15 edges
7. `BGS (Beckett Grading Services)` - 14 edges
8. `SlabMetrics Business Plan v0.1` - 14 edges
9. `Grading Scales (1-10 Numeric Scale Across Services)` - 13 edges
10. `SGC (Sportscard Guaranty Corporation)` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Crawl Site to Obsidian Bookmarklet` --conceptually_related_to--> `Ingest Operation Protocol`  [INFERRED]
  docs/bookmarklets/crawl-obsidian.js → docs/CLAUDE.md
- `PSA Eye Appeal and Subjectivity in Grading` --semantically_similar_to--> `Population Report Rarity Assessment`  [INFERRED] [semantically similar]
  docs/cards/raw/PSA Grading Standards.md → docs/cards/raw/How to Use PSA and BGS Pop Reports to Your Advantage.md
- `SGC (Sportscard Guaranty Corporation)` --semantically_similar_to--> `PSA (Professional Sports Authenticator)`  [INFERRED] [semantically similar]
  docs/cards/raw/SGC Grading Scale.md → docs/cards/raw/Sports Card Investing Population Count Explained and What it Means to You.md
- `Cards Wiki Log (Append-Only Ingest History)` --implements--> `Wiki Ownership Model (raw=human, wiki=LLM, log=append-only)`  [INFERRED]
  docs/cards/log.md → docs/CLAUDE.md
- `Population Report Value Mechanics (Rarity + Grade Distribution)` --conceptually_related_to--> `Grading Scales (1-10 Numeric Scale Across Services)`  [INFERRED]
  docs/cards/raw/Graded Pop Reports - What do they mean.md → docs/cards/index.md

## Hyperedges (group relationships)
- **Third-Party Grading Service Ecosystem (PSA / BGS / SGC / CGC)** — cards_index_entity_psa, cards_index_entity_bgs, cards_index_entity_sgc, cards_index_entity_cgc, cards_index_concept_card_grading, cards_index_concept_grading_scales [EXTRACTED 1.00]
- **BGS Grade-by-Grade Clip Corpus (12 Back Button files -> bgs-grading-scale source)** — raw_bgs_scale_back_button, raw_bgs_scale_back_button_1, raw_bgs_scale_back_button_2, raw_bgs_scale_back_button_11, cards_log_bgs_scale_ingest, cards_index_concept_grading_scales [EXTRACTED 1.00]
- **Wiki Ingest Pipeline (Crawl -> Raw -> Source Summary -> Wiki Page -> Log)** — crawl_obsidian_bookmarklet, docs_claude_ingest_operation, docs_claude_source_summary_pages, docs_claude_ownership_model, cards_log [INFERRED 0.95]
- **Grading Company Triads: Scale + Pop Report + Market Valuation** — psa_grading_scale, psa_population_report, pop_report_market_demand_intersection [INFERRED 0.90]
- **Pop Report Accuracy: Crack-Resubmit + Cross-Grading + Unsubmitted Cards** — pop_report_crack_resubmit, cross_grading, pop_report_context_limitation [EXTRACTED 1.00]
- **PSA Process: Authentication → Grading → Encapsulation** — psa_authentication_process, psa_grading_scale, psa_certification_number [EXTRACTED 1.00]
- **Grading Company Population Report Systems (PSA, CGC, SGC)** — pop_count_psa_population_report, cgc_certlookup_cgc_population_report, pop_count_pop_count_concept [INFERRED 0.85]
- **SGC Full Grading Scale (Grades 1–10)** — sgc_grading_scale_sgc, sgc_grading_scale_2_grade_10_gem, sgc_grading_scale_20_grade_1_poor [EXTRACTED 1.00]
- **Card Investment Strategy via POP Count Analysis** — pop_count_pop_count_concept, pop_count_high_pop_strategy, pop_count_low_pop_strategy [EXTRACTED 1.00]
- **Four Major Grading Services Share the Card Grading Ecosystem** — psa_psa, bgs_bgs, sgc_sgc, cgc_cgc, card-grading_card_grading, grading-scales_grading_scales, population-report_population_report [EXTRACTED 1.00]
- **Population Report Distortion Factors (Crack-Resubmit, Cross-Grading, Submission Rate)** — concept_crack_resubmit, concept_cross_grading, population-report_population_report [EXTRACTED 1.00]
- **Panini Parallel Rarity and Investment Value Chain (Print Run + Grade + Pop Report)** — card-parallels_card_parallels, concept_print_run, population-report_population_report, grading-scales_grading_scales, panini_panini [INFERRED 0.85]
- **Three Pop Report Knowledge Sources Collectively Define Population Report Concept** — psa_market_report_population_perspective, sundocards_pop_reports, yahoo_pop_count_explained [INFERRED 0.95]
- **Design Spec, Plan, and Engineering Topic Together Define the eBay Pricing Pipeline Implementation** — spec_ebay_pricing_pipeline, plan_ebay_pricing_pipeline, pricing_pipeline_topic [INFERRED 0.85]
- **Business Plan and Founders Agreement Together Form SlabMetrics Founding Framework** — business_plan, founder_agreement, company_index [EXTRACTED 1.00]

## Communities (15 total, 3 thin omitted)

### Community 0 - "Grading Concepts & Taxonomy"
Cohesion: 0.08
Nodes (37): BGS Subgrades (Centering/Corners/Edges/Surface), Card Grading (Concept), Grading Qualifiers (Defect Suffixes), Grading Scales (1-10 Numeric Scale Across Services), Grading Service Tiers (Pricing by Speed/Value), No-Grade Outcomes (N1-N9, Authentic Labels), Population Report (Grade-Distribution Database), BGS (Beckett Grading Services) (+29 more)

### Community 1 - "CGC Certification & Pop Strategy"
Cohesion: 0.07
Nodes (34): CGC Cert Lookup: Golduck Fossil 35/62 (Cert #6031819005), CGC (Certified Guaranty Company) Cards, CGC Card Certification Verification, CGC Guarantee, CGC Population Report, Connor Bedard Young Guns Rookie Card (2023-24 Upper Deck), High POP Count Investment Strategy, Low POP Count Investment Strategy (+26 more)

### Community 2 - "Card Grading Services & Market"
Cohesion: 0.22
Nodes (32): 2024 Panini Mosaic Football, BGS Subgrades, BGS (Beckett Grading Services), Card Grading, Card Parallels, CGC (Certified Guaranty Company Cards), Crack and Resubmit (Pop Report Distortion), Cross-Grading (Pop Report Distortion) (+24 more)

### Community 3 - "Business Plan & Engineering"
Cohesion: 0.13
Nodes (27): ADR 0000 — Template (Architecture Decision Record Template), Architecture (Engineering Topic Stub), SlabMetrics Business Plan v0.1, Carson Froy (Co-Founder, Card Market/Brand), Competitive Landscape (Card Ladder, Market Movers, CollX, Alt, 130point), Decision Intelligence Platform Framing, 90-Day Decision-Logging Experiment, Kain Kim (Co-Founder, Engineering/Product) (+19 more)

### Community 4 - "PSA Grading Scale"
Cohesion: 0.09
Nodes (24): Print Lines (Card Defect), PSA Eye Appeal and Subjectivity in Grading, PSA 1 – PR, PSA 10 – Gem Mint, PSA 1.5 – FR, PSA 2 – GOOD, PSA 3 – VG, PSA 4 – VG-EX (+16 more)

### Community 5 - "Pop Report Analysis & Distortions"
Cohesion: 0.14
Nodes (19): BGS (Beckett Grading Services), BGS Population Report, Cross-Grading (BGS to PSA or vice versa), Junk Wax Era (Late 1980s-Early 1990s), Market Report: Population Perspective (PSA Article by Joe Orlando), Official Trading Card Grading Service (PSA Services Page), Population Report Contextual Limitations, Crack and Resubmit (Pop Report Inflation) (+11 more)

### Community 6 - "Wiki Infrastructure & Operations"
Cohesion: 0.19
Nodes (14): Crawl Site to Obsidian Bookmarklet, n8n Crawl Webhook Endpoint, Research Focus Criteria (Card Values / Player / Grading / Investment), Sport Context Filter (NFL/NBA/MLB/NHL/Soccer/Golf/Tennis), Ingest Operation Protocol, Lint Operation Protocol, Wiki Ownership Model (raw=human, wiki=LLM, log=append-only), Wiki Page YAML Frontmatter Convention (+6 more)

### Community 7 - "Investment Signals & Pop Intelligence"
Cohesion: 0.21
Nodes (13): Five Candidate Wedge Signals (Prediction Markets, Injury, Season Phase, Pop Report, Sale Velocity), PSA Pop Report Exclusions (Rejected/Altered Cards), Pop Report Misreading Warning (Low Pop ≠ Rare), PSA Population Report Definition, PSA Market Report: Population Perspective, Cross-Grading Pop Count Inflation, Pop Report Generation Pipeline (Submit→Evaluate→Log→Publish), How to Use PSA and BGS Pop Reports (Sundo Cards) (+5 more)

### Community 8 - "Panini Mosaic & Card Parallels"
Cohesion: 0.47
Nodes (6): Card Parallels (Color/Pattern Variants with Print Runs), 2024 Panini Mosaic Football (Card Set), Panini (Card Manufacturer), 2024 Panini Mosaic Football Ingest (2026-05-19), 2024 Mosaic Parallel Rainbow (38 Base Parallels, Mosaic Pattern), 2024 Panini Mosaic Football Checklist (Beckett News)

### Community 10 - "Frontend Scaffold Plans"
Cohesion: 1.00
Nodes (3): Turborepo Monorepo with Two-Zone Vercel Isolation, Frontend Framework Scaffold Implementation Plan, Frontend Framework Scaffold Design Spec

### Community 11 - "LLM Wiki Plans"
Cohesion: 1.00
Nodes (3): LLM-Maintained Obsidian Vault Pattern (Human owns raw, LLM owns wiki), LLM Wiki Implementation Plan, LLM Wiki Design Spec

## Knowledge Gaps
- **33 isolated node(s):** `Example Domain (Test Artifact)`, `BGS Grading Scale - Pristine 10 Gold Label (Back Button 1.md)`, `BGS Grading Scale - 9.5 Gem Mint (Back Button 2.md)`, `BGS Grading Scale Clip 3 (Back Button 3.md)`, `BGS Grading Scale Clip 4 (Back Button 4.md)` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PSA 10-Point Grading Scale` connect `PSA Grading Scale` to `Pop Report Analysis & Distortions`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `Cards Wiki Log (Append-Only Ingest History)` connect `Grading Concepts & Taxonomy` to `Wiki Infrastructure & Operations`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `SlabMetrics Business Plan v0.1` connect `Business Plan & Engineering` to `Investment Signals & Pop Intelligence`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `SGC (Sportscard Guaranty Corporation)` (e.g. with `PSA (Professional Sports Authenticator)` and `CGC (Certified Guaranty Company) Cards`) actually correct?**
  _`SGC (Sportscard Guaranty Corporation)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `n8n Crawl Webhook Endpoint`, `Sport Context Filter (NFL/NBA/MLB/NHL/Soccer/Golf/Tennis)`, `Research Focus Criteria (Card Values / Player / Grading / Investment)` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Grading Concepts & Taxonomy` be split into smaller, more focused modules?**
  _Cohesion score 0.07807807807807808 - nodes in this community are weakly interconnected._
- **Should `CGC Certification & Pop Strategy` be split into smaller, more focused modules?**
  _Cohesion score 0.0677361853832442 - nodes in this community are weakly interconnected._