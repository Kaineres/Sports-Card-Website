# Quality Scanner — Capture Criteria

**Calibration status: UNCALIBRATED.** All numeric thresholds below are starting-point
guesses. They must be tuned on-device against real card photos before they are trusted.

**Source of truth (code):**
- `apps/web/src/lib/camera/metrics.ts` — pure pixel metrics
- `apps/web/src/lib/camera/quality.ts` — thresholds + pass/fail logic
- `apps/web/src/lib/camera/tilt.ts` — device level gate
- `apps/web/src/components/grading/card-scanner-modal.tsx` — live loop + AI gate

---

## Purpose

Stage 1 of the two-stage grading system. The scanner runs live on the camera feed and
only auto-captures a frame that is worth grading: sharp, well-lit, still, shot straight-on,
and confirmed by AI to actually contain a card. This keeps garbage frames out of the
(expensive, slower) Stage 2 grader.

## How it measures

- Runs every animation frame (~60fps).
- Metrics are computed on a **320px-wide crop of just the CardBox region** (the on-screen
  guide box), NOT the whole camera frame — a dark background never skews the numbers.
  The crop back-maps the on-screen box into source pixels through the `object-fit: cover`
  transform (9-arg `drawImage`).
- All metrics run on grayscale (Rec. 601 luma).
- Camera is requested rear-facing at **1920×1080 ideal**. Final capture is saved as
  JPEG quality **0.92** at full video resolution.

A frame is captured only after clearing **four gates in sequence**.

---

## Gate 1 — On-device image quality (per frame)

A frame **passes** only if `sharp && lit && stable`. Thresholds (`DEFAULT_THRESHOLDS`):

| Check | Metric | Threshold | Fails when | Coaching shown |
|---|---|---|---|---|
| **Sharp** | Variance of Laplacian | `≥ 120` | below → blurry | "Blurry — hold the camera still" |
| **Not too dark** | Mean luminance (0–255) | `≥ 90` | below | "Too dark — move to brighter, even light (near a window works)" |
| **Not too bright** | Mean luminance | `≤ 235` | above | "Too bright — back away from the light" |
| **No glare (whole frame)** | Ratio of clipped pixels (luma ≥ 250) | `≤ 0.02` (2%) | above | "Glare on card — tilt card or try a different angle" |
| **No glare (hotspot)** | Max clipped-pixel ratio in any cell of an 8×8 grid | `≤ 0.20` (20%) | above | (same glare message) |
| **No crushed shadows** | Ratio of near-black pixels (luma ≤ 10) | `≤ 0.25` (25%) | above | "Uneven shadows — try a flat, even light source" |
| **Stable** | Mean abs frame-to-frame pixel diff | `≤ 6` | above → moving | "Moving — hold the camera steady" |

**Metric definitions**
- **Sharpness** — variance of a 4-neighbour Laplacian response. Blur flattens edges → low
  variance. Higher = sharper.
- **Mean luminance** — average grayscale value across the crop.
- **Glare** — keyed on *clipping* (luma ≥ 250 = blown to pure white), **not** mere
  brightness. This is deliberate: silver/chrome/foil (e.g. Prizm) borders read ~220–245 with
  all detail intact and must NOT be rejected. Only a genuine, detail-destroying specular
  (which clips at 255) is flagged. Verified 2026-07-01 on a well-lit Prizm: 72.5% of cells
  exceeded 220, yet only 0.21% of pixels actually clipped ≥ 250.
- **8×8 hotspot grid** — catches a concentrated blown-out region the whole-frame ratio
  misses (a large card or dark background dilutes the frame-wide ratio). Cell boundaries are
  proportional cuts (`row*height/8`), so the last row/column extends exactly to the edge and
  no strip goes unmeasured.
- **Motion** — mean absolute per-pixel difference vs. the previous frame. `null` on the
  first frame (no prior frame), which counts as NOT stable.

**Known gap:** `minLongEdge: 1000` (minimum capture resolution) exists as the helper
`meetsResolution()` but is **not currently wired into the live gate**. Capture resolution is
effectively whatever the camera delivers (1920×1080 ideal). Wire this in if low-res devices
become a problem.

---

## Gate 2 — Device level / straight-on (`tilt.ts`)

Enforces a straight-on (non-tilted) shot so perspective/keystone distortion doesn't corrupt
the centering grade.

- Reads the device gravity vector (`accelerationIncludingGravity`).
- Tilt angle = `atan2(hypot(x, y), |z|)` in degrees. `0°` = phone perfectly flat/level over a
  card lying flat; `90°` = phone held vertical.
- Passes when tilt **`≤ 7°`** (`DEFAULT_TILT_THRESHOLDS.maxTiltDeg`).
- **Degrades gracefully:** if there is no motion sensor, permission is denied, or on desktop,
  the gate returns `level: true` and is silently skipped — it NEVER hard-blocks capture.
- **iOS** requires a one-time `DeviceMotionEvent.requestPermission()` from a user tap
  ("Enable level guide" button). **Android / sensor browsers** attach with no prompt.
- A live bubble-level HUD centers and turns green when level (yellow when tilted). Bubble
  axis-sign direction is tuned for portrait and may need on-device calibration.

**Assumption:** the card lies on a horizontal surface (users are coached to "lay it flat").

---

## Gate 3 — Cadence (timing guards)

Constants in `card-scanner-modal.tsx`:

| Constant | Value | Purpose |
|---|---|---|
| `PASS_FRAMES_REQUIRED` | 4 | Consecutive passing + level frames required before firing the AI check |
| `MSG_STABLE_FRAMES` | 12 (~200ms) | A coaching message must hold this long before it displays (prevents flicker) |
| `HAIKU_COOLDOWN_MS` | 2500 | Minimum gap between AI checks |
| `MOTION_ABORT_THRESHOLD` | 14 | If frame diff exceeds this during an in-flight AI check, the check is aborted and it drops back to "Hold steady…" |

---

## Gate 4 — AI card-present confirmation (Haiku)

- Route: `POST /api/grading/quality-check`. Model `claude-haiku-4-5`.
- Prompt asks: is a **physical sports/trading card clearly visible and filling most of the
  frame**? A wallet, phone, hand, or table is explicitly NOT a card. Replies strict JSON
  `{"cardVisible": true|false}`.
- **8s timeout.** On timeout it does **NOT** blindly accept — a timeout is not a card-present
  confirmation. It captures only if the *live* local gate still passes (`lastGatePassRef`),
  otherwise keeps scanning.
- On `cardVisible: true` → flash + capture the full-res frame → hand off to Stage 2.
- On `cardVisible: false` → reset and coach "Card not recognized — make sure the full card
  fills the frame".

---

## Full accept path

```
local quality pass (Gate 1)  AND  level ≤ 7° (Gate 2)
   → held for 4 consecutive frames (Gate 3)
   → Haiku confirms a card is present (Gate 4)
   → capture
```

## Calibration TODO

- Tune all Gate 1 thresholds against real card photos (sharpness floor and glare ratios most
  likely to need adjustment across devices).
- Confirm `maxTiltDeg = 7°` feels right on-device; verify bubble axis-sign direction.
- Decide whether to wire in `minLongEdge` for low-resolution devices.
