# Scan-tip example photos

These are the good/avoid example images shown in the **"How to get the best scan"**
section on the grading page (`src/app/grading/page.tsx`).

Drop real photos here with these exact names. They appear automatically — no code
change needed. Until a file exists, the UI shows a labeled placeholder.

| File                     | Show this                                              |
|--------------------------|-------------------------------------------------------|
| `lighting-good.jpg`      | Card under even, soft light — no hotspot              |
| `lighting-avoid.jpg`     | Same card with a bright glare hotspot from a hard beam |
| `framing-good.jpg`       | Card filling the box, square/straight-on              |
| `framing-avoid.jpg`      | Card tilted and/or small in the frame                 |
| `background-good.jpg`    | Card border clearly contrasting the surface           |
| `background-avoid.jpg`   | Card border blending into a same-tone surface         |
| `holder-good.jpg`        | Bare card (out of any holder)                         |
| `holder-avoid.jpg`       | Card inside a toploader/slab with plastic glare       |

## Specs

- **Format:** JPG
- **Aspect ratio:** ~4:3 landscape (the slot is `aspect-ratio: 4 / 3`, `object-fit: cover`)
- **Size:** ~800×600px is plenty; keep each file under ~150 KB (these are thumbnails)
- Shoot the good/avoid pair with the **same card** so the only visible difference is
  the thing the tip is teaching.
