# AI Card Grading Engine — Design Spec

- **Date:** 2026-06-03
- **Status:** Approved design, pending implementation plan
- **Owner:** Kain Kim
- **Replaces:** the mock `MOCK_RESULT` in `apps/web/src/app/grading/page.tsx`

---

## 1. Purpose

Build the real engine behind the existing AI Card Grading page (currently a UI
mockup returning a hardcoded result). The engine produces an **AI pre-grading
estimate**: a directional condition assessment a user gets *before* sending a
card to a real grading house (PSA/BGS). It is explicitly **not** an official or
authoritative grade.

This positioning is deliberate and drives every decision below: it is the most
honest framing, carries the least liability, and matches the disclaimer already
on the page.

---

## 2. Scope & phasing

The work splits into phases so the grading engine can ship and be validated via
file-upload first, with the mobile camera experience layered on top.

**Phase 1 — Grading engine (this spec's core):**
- Vision-LLM grading agent (Claude) driven by a hand-authored JSON rubric.
- Two grading houses via a user toggle: **PSA** and **BGS**.
- Four assessed factors: **centering, corners, edges, surface**.
- A curated **reference-image set** (visual anchors) included in the prompt.
- Output: overall grade + grade **range** + per-factor scores/ranges/reasoning
  + confidence + photo-quality signal.
- `POST /api/grade` route with Turnstile + Upstash rate limiting.
- Wiring the existing page (upload → loading → results) to the real API.

**Phase 2 — Mobile camera capture & quality gate (§11):**
- Live, in-browser quality gating (sharpness, lighting, framing, stability,
  perspective, corner-visibility, resolution) with auto-capture.
- Optional Haiku semantic confirmation on the captured still.

**Phase 3 — Measured centering CV:** geometric border measurement replaces the
LLM's centering eyeball.

**Later phases:** value linkage to the price pipeline; SGC/CGC rubrics; grading
history; admin rubric editor. See §16.

**Out of scope entirely for now:** card identification/pricing linkage,
persisting uploads, SGC/CGC, admin UI for rubrics (edit JSON directly).

---

## 3. Key decisions (from brainstorming)

| Decision | Choice | Rationale |
|---|---|---|
| Positioning | Pre-grading estimate | Honest, low-liability, fits existing disclaimer |
| Grading standard | PSA + BGS toggle | Broadest usefulness; one analysis maps to both |
| Engine | Vision LLM + rubric | Fast to build, no training data, leverages Claude |
| Rubric authoring | Structured JSON, hand-authored from official sites | Authoritative, versioned, validatable |
| Uncertainty | Grade range + per-factor reasoning + confidence | Builds trust, flags low-confidence cases |
| Reference examples | Curated visual anchor set in Phase 1 | Biggest accuracy lever for subjective factors |
| Centering | LLM-eye in Phase 1, measured CV in Phase 3 | Ship a working agent fast; CV later |
| Default model | `claude-sonnet-4-6` | Strong vision, ~5× cheaper than Opus |
| Triage model | `claude-haiku-4-5` (optional) | Cheap semantic pre-check on captured stills |
| Capture | Mobile-only, auto-capture on stable hold | Matches "hover over card"; avoids shutter blur |
| Quality gate | Strict, with upload fallback after ~15s | Forces good inputs; never traps the user |

---

## 4. Architecture & data flow

```
User uploads/captures front (+ optional back), picks house (PSA/BGS)
        │
        ▼
POST /api/grade  ──►  Turnstile verify  ──►  Upstash rate-limit
        │
        ▼
Validate images (type, size)
        │
        ▼
[optional] Haiku semantic confirmation ("is this really a card, in frame?")
        │
        ▼
Load rubric JSON + reference-image set for selected house  (cached)
        │
        ▼
Grading Agent  (Claude vision, temperature 0, structured output)
   • system prompt = grading instructions + rubric JSON + reference anchors
   • user input    = card image(s)
   • output        = structured JSON, Zod-validated
        │
        ▼
Guardrail mapping → overall grade reconciled to house's rule
        │
        ▼
Return { house, overall, overallRange, confidence, photoQuality,
         factors[], summary }  →  UI
```

---

## 5. The rubric (hand-authored — the heart of the system)

One JSON file per house. For each **factor** × each **grade level**, the criteria
are filled in directly from official PSA/BGS sources. A validator script confirms
completeness (no missing grade levels) before use.

```jsonc
// apps/web/src/lib/grading/rubrics/psa.json
{
  "house": "PSA",
  "scale": [10, 9, 8, 7, 6, 5, 4, 3, 2, 1.5, 1],
  "overallRule": "PSA assigns ONE overall grade. A single low factor caps the overall — encode PSA's exact rule here from their site.",
  "criteria": {
    "centering": {
      "10": { "front": "55/45-60/40", "back": "75/25", "text": "..." },
      "9":  { "front": "60/40",        "back": "90/10", "text": "..." }
      // ...every grade level
    },
    "corners": { "10": { "text": "Four sharp, clean corners..." } /* ... */ },
    "edges":   { /* ... */ },
    "surface": { /* ... */ }
  }
}
```

`bgs.json` has the same shape; its `overallRule` encodes BGS's subgrade→overall
logic (BGS publishes 4 subgrades and the overall is **not** a simple average).

---

## 6. Reference-image set (visual anchors)

A curated set of confirmed-grade example images, included in the prompt to
calibrate the model's *subjective* judgment. Rubric = the words; reference set =
the pictures. Together they are far stronger than either alone, and the reference
set is the single biggest lever for grading faithfulness on corners/edges/surface.

```
apps/web/src/lib/grading/rubrics/
  psa.json
  bgs.json
  references/
    corners/    psa9-sharp.jpg, psa8-scratched.jpg, psa5-rounded.jpg ...
    edges/      ...
    surface/    psa10-clean.jpg, psa8-print-line.jpg ...
    centering/  ...
  references.json   # maps each image → { factor, grade, whatToNotice }
```

Principles:
- **Small and high-signal.** A handful of well-chosen anchors per factor beats
  hundreds of mediocre ones; too many also dilutes attention and bloats the prompt.
- **Genuine examples.** Sourced from confirmed-grade photos (slab listings, PSA's
  own images, etc.). Curation is a manual, one-time-ish effort.
- **Static → cached.** The set is identical on every call, so it is sent under
  Anthropic prompt caching (see §13).

---

## 7. Agent output contract (Zod-validated)

```jsonc
{
  "house": "PSA",
  "overall": 8.5,
  "overallRange": [8, 9],
  "confidence": "medium",          // high | medium | low
  "photoQuality": "good",          // good | marginal | poor
  "factors": [
    { "name": "centering", "score": 9.0, "range": [8.5, 9.5],
      "reasoning": "Left/right borders near-even; slight top-heavy shift." },
    { "name": "corners",   "score": 8.0, "range": [7.5, 8.5],
      "reasoning": "Minor softening upper-left vs. the PSA 8 corner anchor." }
    // edges, surface...
  ],
  "summary": "Strong NM-MT card; centering and surface carry it, corners hold it back from a 9."
}
```

**Overall derivation:** the agent proposes factor scores *and* a house-appropriate
overall, with the rubric's `overallRule` in its prompt and instructions to cite
which grade-level it matched. Deterministic **guardrail code** then reconciles the
overall against the written rule (e.g. enforces a low-factor cap) so the final
number always respects the rubric's structural rules — judgment lives in the LLM,
the hard rules live in code.

---

## 8. API route — `POST /api/grade`

Location: `apps/web/src/app/api/grade/route.ts` (mirrors existing `prices/`
routes). Server-side only; business logic stays off the frontend.

**Request:** `multipart/form-data` — `front` (required), `back` (optional),
`house` (`"PSA" | "BGS"`), Turnstile token.

**Handler pipeline:**
1. **Turnstile verify** — public form gating (server-side `fetch` to Cloudflare).
2. **Upstash rate-limit** — keyed by IP (+ Clerk user ID if signed in). Mandatory:
   grading calls a paid vision API. Suggested anon limits: ~5/min, ~20/day.
3. **Validate images** — jpg/png only, ~10MB cap, reject non-images.
4. **[optional] Haiku confirmation** — cheap semantic check before spending Sonnet.
5. **Load rubric + reference set** for the house (validated/cached at module load).
6. **Call the grading agent** (§9).
7. **Guardrail-reconcile** the overall against the rubric rule.
8. **Return** the Zod-validated result.

Images are sent to Claude as base64 and **not persisted** by default (cheaper,
less liability). Grading history would add Supabase Storage later — out of scope.

---

## 9. Module layout — `apps/web/src/lib/grading/`

```
lib/grading/
  agent.ts        # builds prompt, calls Claude, parses + validates output
  rubric.ts       # loads + validates rubric JSON + reference set; types
  mapping.ts      # overall-grade guardrail/reconciliation per house
  triage.ts       # optional Haiku semantic pre-check
  schema.ts       # Zod schemas (request + agent output)
  rubrics/
    psa.json      # ← hand-authored
    bgs.json      # ← hand-authored
    references/   # ← curated images + references.json
```

Each file has one job so the agent logic, rubric loading, and grade rules can be
understood and unit-tested independently. `agent.ts` builds a system prompt of
**grading instructions + rubric JSON + reference anchors + output contract**,
sends the card image(s), and runs at **temperature 0** with **structured/tool-based
output** for maximum reproducibility. Uses `@anthropic-ai/sdk` with prompt caching.

---

## 10. UI changes (existing `grading/page.tsx`)

The mockup already has upload → loading → results. Changes:

- **House toggle (PSA / BGS)** on the upload screen — sets the request and which
  results layout renders.
- **Capture entry points:** "Scan with camera" (mobile, Phase 2) as the primary
  mobile path; file-upload remains as fallback and the Phase 1 path.
- **Wire `startGrading`** to `POST /api/grade` (replace the fake `setInterval`;
  keep the loading-message animation during the real request).
- **Results additions:**
  - Overall grade **with its range** beneath ("8.5", "range 8–9").
  - **Per-factor reasoning** line under each factor score (schema provides it).
  - **Confidence + photo-quality badge** ("Medium confidence · photo: good").
  - If `photoQuality: poor`, a prominent "retake photo for a reliable estimate"
    warning.
  - **PSA:** show one overall grade; show the 4 factor assessments as labeled
    "factor analysis" (not "PSA subgrades," which PSA doesn't publish).
  - **BGS:** show the 4 subgrades + overall, as the mockup does.
- **Turnstile widget** added to the page.
- "Add to Collection" stays as-is (separate feature).

---

## 11. Camera capture & quality gate (Phase 2, mobile-only)

A mobile-only live-camera experience that forces a high-quality photo *at capture
time*. **Better inputs improve grading accuracy more reliably than any model
upgrade**, and they cut wasted spend on ungradeable images. Designed mobile-first
because that's how users photograph cards, and with a future **React Native +
Expo** port in mind.

### 11.1 Flow (front, then back)
1. "Scan with camera" → request rear camera (`getUserMedia`, `facingMode:
   'environment'`).
2. Live viewfinder with a **card-shaped overlay** (~5:7 ratio) + coaching HUD.
3. User hovers; when all gates pass and the phone is steady ~1s → **auto-capture
   front**.
4. "✓ Front captured" → repeat for **back**.
5. Both stills → grading pipeline.

### 11.2 Live quality engine (100% in-browser, $0 API)
Each video frame is drawn to a hidden `<canvas>` and scored locally — **no model,
no network calls.** (Per-frame API calls would be financially catastrophic; this
must be client-side.)

**Hard gates (block capture):**
| Signal | Method |
|---|---|
| Focus / sharpness | Variance-of-Laplacian on a downscaled frame |
| Lighting | Mean luminance + clipped-highlight (glare) ratio + dark-pixel ratio |
| Framing | Card fills the overlay box, not cut off |
| Stability | Frame-to-frame pixel difference (low motion), held ~1s |
| **Perspective / flat-on** | Device orientation (phone parallel to a flat card) + card-rectangle squareness. Blocks keystone distortion that wrecks centering. |
| **Corner visibility / occlusion** | All four corners in-frame and unobstructed (no fingers, no cut-off) |
| **Resolution / detail** | Enough effective pixels on the card; **digital zoom blocked** (coach "move closer" instead) |

**Soft coaching (guidance, non-blocking):**
- Background contrast ("place on a plain, contrasting surface").
- Shadows / uneven lighting across the card.

### 11.3 Coaching HUD
A small ✓/✗ checklist (Sharp · Lighting · Framing · Angle · Corners) plus **one
prominent instruction at a time** (highest-priority current problem) so the user
isn't overwhelmed. Priority + samples:
1. Framing — "Fit the card inside the box" / "Move closer"
2. Angle — "Hold phone flat over the card"
3. Lighting — "Too dark — find brighter light" · **"Glare detected — tilt the
   card or move the light"** (glare is the #1 killer on slabs/glossy cards) ·
   "Lighting uneven"
4. Corners — "Keep all four corners in view"
5. Focus/stability — "Hold steady"

All pass → "✓ Looks great — hold steady…" → countdown ring → auto-snap.

### 11.4 Auto-capture
Fires when **all hard gates pass for ~1s continuously** (N consecutive good
frames). The hold confirms stability and eliminates shutter-tap motion blur.

### 11.5 Escape hatch
After ~15s of continuous failure, show **"Having trouble? Upload a photo
instead"** → routes to the file-upload path. Strict by default; never traps anyone.
The downstream photo-quality signal still warns on poor uploads.

### 11.6 Engineering defaults (always on)
- **Full-resolution stills** via the `ImageCapture` API `takePhoto()` where
  supported — video preview frames are often far lower-res than photo mode.
- **Continuous autofocus + tap-to-focus**; **lock exposure** once framed.
- Request **max camera resolution**; keep capture JPEG compression light.

### 11.7 Architecture & Expo portability
- New client module `lib/camera/quality.ts` — **pure functions**: `frame →
  {sharpness, lighting, framing, stable, perspective, cornersVisible, resolution}`.
  Dependency-free (hand-rolled metrics; OpenCV.js — ~8MB WASM — only if we later
  want robust card-edge detection; skip for v1).
- `<CameraCapture>` client component: viewfinder, overlay, HUD, auto-capture,
  permissions, fallback.
- **Expo portability:** the metric functions are plain math, so the *logic* ports
  to React Native later; only the frame source (`expo-camera` frame processor)
  changes. Isolating metrics in pure functions now is what makes that port cheap.

---

## 12. Accuracy, consistency & cost safeguards

- **Temperature 0 + structured output** — maximize reproducibility.
- **Rubric + reference anchors in every call** — the agent grades against authored
  criteria and real examples, never from memory.
- **Guardrail code** — overall always respects the written house rule.
- **Confidence + photo-quality** — the agent must hedge on poor inputs rather than
  fake precision.
- **Capture-time quality gate (Phase 2)** — the strongest accuracy lever: forces
  sharp, well-lit, flat-on, fully-visible cards before grading.
- **Prompt caching (essential, not optional)** — the rubric (~4K tokens) and
  reference set (~20K+ tokens) are static. Cached input bills at ~10% on hits, so
  the anchors cost ~0.6¢ instead of ~6.5¢ after the first call. Build it in from
  day one.
- **Client-side image downscaling** (~1000px long edge) for the *grading* call —
  fewer image tokens. (Distinct from capturing full-res; downscale happens before
  the API call, not at capture.)
- **Upstash rate limit** — hard ceiling against runaway cost/abuse.

---

## 13. Cost estimate

> Rates: Anthropic standard Sonnet ($3/M input, $15/M output), Opus
> ($15/M input, $75/M output), Haiku (~$1/M input, ~$5/M output). Confirm live
> rates at anthropic.com/pricing.

**Per-grade token budget (excluding cached reference set):**

| Component | Tokens (est.) |
|---|---|
| Front image | ~1.5K–2K |
| Back image (optional) | ~1.5K–2K |
| Rubric JSON + instructions | ~4K (static → cached) |
| Output JSON | ~1K |
| Reference set | ~20K+ (static → cached at ~10%) |

**Per-grade cost (with caching + downscaling):**

| Model | Per grade |
|---|---|
| **Sonnet** (`claude-sonnet-4-6`) — default | **~2–4¢** |
| **Opus** (`claude-opus-4-8`) — optional "deep grade" | ~15–20¢ |
| **Haiku** (`claude-haiku-4-5`) — triage only | ~0.2–0.3¢ per check |

**Important distinction:** the reference set *increases* accuracy and *increases*
cost (more tokens); **prompt caching** is what reduces the cost *of* the reference
set — it does not make grading cheaper than no examples. Net: slightly more than
text-only, much more accurate, and caching keeps the increase to a rounding error.

**The live camera quality gate costs $0 in API spend** — it is pure in-browser
computation. The optional Haiku confirmation (~0.2¢) *saves* money by preventing
wasted Sonnet grades on bad inputs.

**Monthly at scale (Sonnet):** ~$40 @ 1k grades, ~$400 @ 10k, ~$4k @ 100k.
Opus ≈ 5×. The Free vs Pro tier (existing vault doc) gates heavy usage.

**Levers, most→least impactful:** model choice (5×) → prompt caching → image
downscaling → back-image optional → rate limits.

---

## 14. What "follows the rubric" really means (critical limitation)

An LLM **reads and interprets** the rubric; it does not *execute* it like code. It
follows the criteria closely — far better than grading from memory — but with two
inherent limits:

1. **Numeric thresholds (centering) — the real weak spot.** The model eyeballs
   ratios like 55/45 from a photo and cannot reliably distinguish 55/45 from 60/40.
   It follows the *spirit* of the rule, not the *measurement*. → Addressed by
   centering reference anchors + the perspective gate (no keystone) in Phase 2, and
   **measured-centering CV in Phase 3**.
2. **Subjective descriptors (corners/edges/surface) — followed well, with variance.**
   The model applies the authored wording and reference anchors well, but it is
   judgment: borderline cards can vary run-to-run. Temperature 0 + reference images
   tighten this substantially but do not make it identical every time.

**Net:** the model handles judgment faithfully, the guardrail code enforces the
hard rules exactly, reference images calibrate subjective factors, the capture gate
guarantees good inputs, and Phase-3 CV will handle the one factor neither does well.
That combination is as close to "by the book" as this technology gets — but it is
an **estimate**, and the UI must keep saying so. Opus improves instruction-adherence
marginally but is still probabilistic; it is not a fix for the measurement limit.

---

## 15. Tech stack

**New dependency (only one):**
- **Anthropic API** — `@anthropic-ai/sdk` + an `ANTHROPIC_API_KEY` from the
  Anthropic Console (billed separately from any Claude Code subscription).
  Models: `claude-sonnet-4-6` (grading default), `claude-opus-4-8` (optional deep
  grade), `claude-haiku-4-5` (optional triage).

**Reused (already installed):** Next.js 16, Zod 4, `@upstash/ratelimit` +
`@upstash/redis` (env already configured), `@clerk/nextjs`, shadcn/radix/Tailwind/
lucide, Vitest (tests).

**Small additions:** Cloudflare Turnstile (client widget script + server verify
`fetch` — no SDK). Client request is a plain `fetch` (no TanStack Query needed
for one call).

**Browser APIs (Phase 2 camera):** `getUserMedia`, `<canvas>` frame processing,
`ImageCapture` (`takePhoto`), `DeviceOrientation`. No new npm dependency for v1
camera (OpenCV.js only if robust card-edge detection is later required).

**Not needed in v1:** n8n, Pinecone, Supabase Storage.

**New env vars:**
```
ANTHROPIC_API_KEY=sk-ant-...
GRADING_MODEL=claude-sonnet-4-6
TRIAGE_MODEL=claude-haiku-4-5          # optional
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
```

---

## 16. Future phases

- **Phase 3 — measured centering:** geometric border-width measurement replaces
  the LLM's centering eyeball; the most accurate single upgrade (the perspective
  gate from Phase 2 is a prerequisite for it to work well).
- **Phase 4 — value linkage:** map estimated grade to the existing eBay/price
  pipeline ("at PSA 9 this is worth ~$X").
- **Phase 5 — more houses:** SGC, CGC rubrics (structure already supports them).
- **Later:** grading history (Supabase Storage), admin rubric editor, Pinecone
  "similar graded cards," n8n batch grading, Expo mobile-app port.

---

## 17. Testing strategy

- **Unit (Vitest):** rubric loader/validator (rejects incomplete rubrics),
  guardrail/mapping logic (overall reconciliation per house), Zod schema parsing,
  and the camera **quality-metric pure functions** (known-good/known-bad frames →
  expected pass/fail).
- **Integration:** `/api/grade` happy path + failure modes (bad image, rate-limit,
  Turnstile fail) with the Anthropic call mocked.
- **Calibration (manual):** a holdout set of known-graded cards to sanity-check
  agent estimates against true grades; tune rubric wording and reference anchors.
  Run the *same* holdout through **Sonnet vs Haiku** to settle the grading-model
  choice with data rather than assumption.
