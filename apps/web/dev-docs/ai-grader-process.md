# AI Grader — Process & Criteria

Stage 2 of the two-stage system. Once the quality scanner (Stage 1) has captured a good,
straight-on, card-present frame, the grader assigns a PSA grade. This is the "Analyze Card"
action.

**Source of truth (code):**
- `apps/web/src/app/api/grade/route.ts` — HTTP endpoint (auth, rate limit, size guards)
- `apps/web/src/lib/grading/agent.ts` — vision-LLM call + forced structured output
- `apps/web/src/lib/grading/schema.ts` — Zod contract (request + output)
- `apps/web/src/lib/grading/mapping.ts` — deterministic reconciliation guardrail
- `apps/web/src/lib/grading/rubrics/psa.json` — hand-authored PSA rubric (verified 2026-07-01)

**Design principle:** the model *reads the card*; it does **not** get the final word on the
number. The model is good at seeing flaws but bad at PSA's arithmetic rules, so a pure,
deterministic guardrail (`mapping.ts`) re-derives the overall grade from the sub-scores. Same
input always produces the same grade — no randomness in the final number.

**House:** PSA only. BGS is defined in the schema but every submission is forced to PSA.

---

## Pipeline

```
POST /api/grade  (front image, optional back, lighting hint)
  1. Auth + rate limit + size guards         (route.ts)
  2. Vision LLM grades the card              (agent.ts → claude-sonnet-5, forced tool call)
  3. Schema validation                       (AgentOutputSchema)
  4. Deterministic reconciliation guardrail  (mapping.ts)
  5. Return GradeResult JSON
```

---

## 1. Endpoint guards (`route.ts`)

Runs on the Node runtime (the Anthropic SDK needs it).

- **Auth:** Clerk `auth()`. No `userId` → **401**. Login is required to grade.
- **Rate limit:** mandatory, **fail-closed**. Upstash sliding window **10 requests / minute**,
  keyed on the Clerk `userId` (not a spoofable IP header). Backend missing/unreachable → **503**
  (never silently allowed through). Over limit → **429**.
- **Size guards (413):** `Content-Length > 22MB` rejected up front; combined front+back string
  length > 20MB rejected after parse (defense in depth behind the schema's per-image 10MB cap).
- **Validation:** `GradeRequestSchema`. Invalid → terse **400** `{error:'Invalid request'}`
  (does not leak the Zod contract).
- **Any downstream throw:** blanket **500** `{error:'Grading failed'}`.

**Request shape** (`GradeRequestSchema`):
| Field | Type | Notes |
|---|---|---|
| `house` | `'PSA' \| 'BGS'` | defaults `PSA`; always forced to PSA regardless |
| `front` | base64/data-URL string | required, ≤ 10MB |
| `back` | base64/data-URL string | optional, ≤ 10MB |
| `lighting` | `'even' \| 'raking' \| 'unknown'` | defaults `unknown`; drives surface honesty (see below) |

---

## 2. Vision grading (`agent.ts`)

- Model **`claude-sonnet-5`**. `max_tokens: 1500`. 30s request timeout.
  - **NOTE:** `temperature` is DEPRECATED for `claude-sonnet-5` and returns a 400 if passed.
    It is intentionally omitted.
- The full PSA rubric (`psa.json`) is serialized into a **cached system prompt**
  (`cache_control: ephemeral`).
- Output is forced via **tool use**: the model MUST call `submit_grade` exactly once
  (`tool_choice: { type:'tool', name:'submit_grade' }`). We never regex-parse free text.

**What the model assesses — the four PSA attributes**, each on the PSA 1–10 scale:
`centering`, `corners`, `edges`, `surface`. For each it returns a `score`, a plausible
`[low, high]` range, and `reasoning` (specific visual evidence). It also proposes an
`overall`, an `overallRange`, `confidence` (high/medium/low), `photoQuality`
(good/marginal/poor), a `summary`, plus `qualifiers` and `notGraded` (below).

**Grading scale (PSA):** whole grades 1–10 plus half-grades 1.5–8.5. **There is NO 9.5**
(PSA jumps 9 → 10). Named grades: 10 GEM-MT, 9 MINT, 8 NM-MT, 7 NM, 6 EX-MT, 5 EX, 4 VG-EX,
3 VG, 2 GOOD, 1 PR (with `+` half-grades between).

### Rules baked into the system prompt

- **Surface ceiling rule.** Under flat/even light you cannot reliably see fine scratches,
  print lines, or gloss defects. The model must NOT claim a clean surface it can't verify:
  cap the surface score, lower its confidence, and say so in the surface reasoning. A
  raking-light frame is required to justify a high surface grade. Behavior keys off the
  `lighting` field.
- **No-grade rule (Option A).** When — and ONLY when — the model actually SEES evidence of an
  alteration/authenticity problem, it sets `notGraded` with an N-code + reason. It still fills
  `overall` with the best-guess pre-alteration grade; the app hides the number and shows the
  code + reason instead. No visible evidence → `notGraded` must be null. (Codes: N0 authentic-only,
  N1 trimming, N2 restoration, N3 recoloring, N4 questionable authenticity, N5 altered stock,
  N6 undersize, N7 cleaning, N8 miscut, N9 don't-grade.)
- **Qualifiers.** When the card IS numerically gradable but has a single honest flaw, the model
  attaches an advisory tag (does NOT no-grade it): OC off-center, ST staining, PD print defect,
  OF out of focus, MK marks (always when writing/ink present), MC miscut (always when present).
  Empty array `[]` when clean. Qualifiers annotate the grade; they never suppress the number.
- **PSA-holistic overall.** The overall is holistic, NOT the strict minimum of the four
  attributes. A single minor flaw does not sink the card (a MINT 9 is allowed exactly one minor
  flaw). Only when two-or-more attributes lag does the weakest cap the overall hard. (The
  deterministic version of this rule is enforced in `mapping.ts` — see Rule 2.)

### Validation

The tool payload is parsed with `AgentOutputSchema` (= `GradeResultSchema` minus `notes`).
Malformed output → thrown error → 500. Requires exactly **four distinct** factors.

---

## 3–4. Reconciliation guardrail (`mapping.ts`)

Pure, deterministic post-processing. Same input → same output. The model's `overall` is a
*proposal*; these six rules produce the final grade the user sees.

**PSA ladder:** `[10, 9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1]`
(no 9.5). `snapDown(n)` = largest ladder value ≤ n (e.g. 9.5 → 9, 7.8 → 7.5), clamped to [1, 10].

- **Rule 1 — Snap factors.** Every sub-score is snapped down onto the ladder, so the UI and
  downstream math only ever see valid PSA grades.
- **Rule 2 — PSA-holistic cap** (the core rule; replaces a naive `min()`). Sort the four
  sub-scores ascending: `s0` (weakest), `s1` (runner-up).
  - If `s1 > s0` → only ONE attribute lags → **forgive it**: `holisticCap = min(s1, s0 + 1)`
    (held to one grade above the lone weak attribute, but never above the runner-up).
  - Else (two-or-more tie at the bottom) → **hard cap** at the weakest: `holisticCap = s0`.
  - `finalOverall = snapDown(min(modelOverall, holisticCap))` — the guardrail never *raises*
    the model's proposal, only caps it.
  - A "capped" note is added ONLY when the holistic rule actually pulled the grade below the
    model's proposal (not when the number merely moved via ladder-snapping).
  - *Example:* corners 8, others 10 → single flaw → cap `min(10, 8+1)=9` → overall **9**.
- **Rule 3 — Surface ceiling.** When there is no raking-light frame, a disclosure note is
  always added, and if the model claimed surface ≥ 9 at high confidence, confidence is
  softened to medium.
- **Rule 4 — Thin-evidence confidence cap.** No raking-light frame OR missing surface read →
  confidence capped at medium (can't justify high certainty).
- **Rule 5 — Range clamp.** Both ends of `overallRange` snapped onto the ladder; the high end
  capped by `finalOverall`; `finalOverall` kept inside the band.
- **Rule 6 — Assemble.** `qualifiers` and `notGraded` flow through untouched. When the card
  was no-graded, factors are still snapped and notes kept, but the no-grade state is honored:
  the UI hides the number and shows the code + reason.

---

## Output shape (`GradeResult`)

| Field | Meaning |
|---|---|
| `house` | Always `PSA` |
| `overall` | Final reconciled grade (PSA ladder value) |
| `overallRange` | `[low, high]` plausibility band, clamped to the reconciled overall |
| `confidence` | high / medium / low (post guardrail caps) |
| `photoQuality` | good / marginal / poor (model's read of the input image) |
| `factors[4]` | centering, corners, edges, surface — each `{score, range, reasoning}` |
| `qualifiers[]` | Advisory tags (OC/ST/PD/OF/MK/MC); empty when clean |
| `notGraded` | `{code, reason}` when altered/fake/unfit; else null → UI hides number |
| `summary` | One-paragraph user-facing summary |
| `notes[]` | Guardrail explanations (caps applied, surface ceiling, confidence caps) |

---

## Known limitations

- **Surface under flat light is a ceiling, not a verdict** — fine scratches/print lines are
  invisible without a raking/grazing-light frame. The `lighting` field is currently sent as
  `unknown` from Stage 1; per-frame lighting is a Phase 2 (multi-capture) item.
- Rubric grades 5-and-below and the weakest-attribute cap rule are secondary-source `[L]`, not
  stated verbatim by PSA — flagged in `psa.json` for future verification.
- BGS is unsupported; all grades are PSA.

---

## Decisions & discoveries (captured 2026-07-01)

Working notes so future work on the grader doesn't rediscover these the hard way.

### Locked product decisions
- **PSA-holistic capping** — forgive one lagging attribute, hard-cap on two-or-more. Implemented
  deterministically in `mapping.ts` Rule 2 (NOT a strict `min()`).
- **Altered/fake = Option A** — a `notGraded` N-code SUPPRESSES the number (UI shows code + reason);
  qualifiers (OC/ST/PD/OF/MK/MC) are advisory tags that NEVER suppress the number.
- **Login required to grade** — Clerk `auth()` gate on `/api/grade`.

### Gotchas (do not relearn these)
- **`temperature` is DEPRECATED for `claude-sonnet-5`** — passing it returns HTTP **400
  invalid_request_error**. This was the root cause of a production 500 on "Analyze Card".
  `agent.ts` intentionally omits it. **Do not reintroduce it.**
- **No local `ANTHROPIC_API_KEY`** — the key lives only in Vercel env, so the grader **cannot run
  locally**. Verify grader changes with `tsc` + build + unit tests locally, then test on
  production (no real users yet — safe to test there).
- **Structured output is non-negotiable** — the model MUST call `submit_grade` (forced
  `tool_choice`); we never parse free text. Malformed tool payload → schema error → 500.
- **The guardrail owns the final number, not the model** — `mapping.ts` re-derives `overall` from
  the sub-scores. The model's `overall` is only a proposal and is never allowed to be *raised*.

### Real-world validation so far
- A test card returned a reasonable, **conservative 7.5** with sensible sub-grades and ranges.
- Biggest identified error source = **camera tilt corrupting the centering read** → this drove the
  Stage-1 device level gate (≤ 7°). Straight-on capture is a prerequisite for trustworthy centering.

### Deferred — when I return to the grader
- **Per-frame lighting** — populate `lighting` (raking vs even) via guided multi-capture so surface
  can be graded with confidence instead of ceiling-capped. Currently always sent as `unknown`.
- **Rubric verification** — confirm grades ≤5 and the weakest-attribute cap rule against PSA
  verbatim (currently secondary-source `[L]` in `psa.json`).
- **Calibration** — compare engine output against known PSA-slabbed cards to tune the rubric/caps.
- **BGS support** — schema already allows it; currently forced to PSA.
