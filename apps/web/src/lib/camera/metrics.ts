// Pure image-quality metrics. No DOM — operate on raw RGBA pixel data so they are
// deterministically unit-testable and portable to React Native (expo-camera) later.

export interface RgbaFrame {
  /** RGBA bytes, length = width * height * 4 */
  data: Uint8ClampedArray
  width: number
  height: number
}

/** Convert an RGBA frame to a grayscale luminance array (length = width*height). */
export function toGrayscale(frame: RgbaFrame): Uint8ClampedArray {
  const { data } = frame
  const gray = new Uint8ClampedArray(data.length / 4)
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    // Rec. 601 luma
    gray[p] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0
  }
  return gray
}

/**
 * Sharpness via variance of the Laplacian. Higher = sharper / more in focus.
 * Applies a 4-neighbour Laplacian kernel to the grayscale image and returns the
 * variance of the response. Blurry images produce a low-variance response.
 */
export function sharpnessScore(frame: RgbaFrame): number {
  const { width, height } = frame
  if (width < 3 || height < 3) return 0
  const gray = toGrayscale(frame)
  const lap: number[] = []
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x
      const v = -4 * gray[i] + gray[i - 1] + gray[i + 1] + gray[i - width] + gray[i + width]
      lap.push(v)
    }
  }
  let mean = 0
  for (const v of lap) mean += v
  mean /= lap.length
  let varSum = 0
  for (const v of lap) varSum += (v - mean) * (v - mean)
  return varSum / lap.length
}

export interface LightingMetrics {
  meanLuminance: number     // 0-255
  glareRatio: number        // fraction of clipped (>=250) pixels, whole frame
  darkRatio: number         // fraction of near-black (<=10) pixels
  maxCellGlareRatio: number // highest per-cell fraction of clipped (>=250) pixels in an 8×8 grid
}

// A pixel is "glare" only when it is essentially CLIPPED to white (>= this luma).
// The per-cell hotspot check previously used 220, but that flags cards that are
// merely bright *by design* — silver/chrome/foil (e.g. Prizm) borders read
// ~220-245 under even light with all detail intact. A real specular hotspot blows
// out to pure white (clips at 255) and destroys the detail underneath; that is the
// only thing worth rejecting. Empirical (2026-07-01, well-lit Prizm): 72.5% of
// cells exceeded 220 yet only 0.21% of pixels actually clipped (>=250). So both the
// whole-frame ratio and the per-cell hotspot key on clipping, not brightness.
const CLIPPED_LUMA = 250

/** Brightness + glare + darkness metrics from the grayscale histogram. */
export function lightingMetrics(frame: RgbaFrame): LightingMetrics {
  const { width, height } = frame
  const gray = toGrayscale(frame)
  let sum = 0, glare = 0, dark = 0
  for (let p = 0; p < gray.length; p++) {
    const v = gray[p]
    sum += v
    if (v >= CLIPPED_LUMA) glare++
    if (v <= 10) dark++
  }
  const n = gray.length || 1

  // 8×8 grid hotspot detection — catches a concentrated blown-out region that the
  // whole-frame ratio misses because a dark background (or a large card) dilutes it.
  // Keyed on CLIPPED_LUMA so a bright-but-detailed chrome card does not read as a
  // hotspot; only a genuinely blown, detail-destroying specular does.
  //
  // Cell boundaries are derived from proportional cuts (row*height/GRID) rather than
  // a fixed floor(size/GRID) step. The old floor step left a remainder strip on the
  // right/bottom edge (e.g. width=70 → cellW=8, columns only covered 0..64, so the
  // 64..70 strip went unmeasured and a specular there was missed). Proportional cuts
  // make the last row/column extend exactly to the edge, so the whole frame is
  // covered with no gaps or overlaps. Cells may vary by ±1 px; that is harmless.
  const GRID = 8
  let maxCellGlareRatio = 0
  for (let row = 0; row < GRID; row++) {
    const yStart = Math.floor((row * height) / GRID)
    const yEnd = Math.floor(((row + 1) * height) / GRID)
    for (let col = 0; col < GRID; col++) {
      const xStart = Math.floor((col * width) / GRID)
      const xEnd = Math.floor(((col + 1) * width) / GRID)
      let cellGlare = 0, cellTotal = 0
      for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
          const v = gray[y * width + x]
          cellTotal++
          if (v >= CLIPPED_LUMA) cellGlare++
        }
      }
      if (cellTotal > 0) {
        const ratio = cellGlare / cellTotal
        if (ratio > maxCellGlareRatio) maxCellGlareRatio = ratio
      }
    }
  }

  return { meanLuminance: sum / n, glareRatio: glare / n, darkRatio: dark / n, maxCellGlareRatio }
}

/**
 * Mean absolute difference between two grayscale buffers (0-255).
 * Used for stability/motion: ~0 = still, large = moving. Buffers must match length.
 */
export function frameDifference(prev: Uint8ClampedArray, curr: Uint8ClampedArray): number {
  if (prev.length !== curr.length) {
    throw new Error('frameDifference: frames must be the same length')
  }
  if (prev.length === 0) return 0
  let sum = 0
  for (let p = 0; p < prev.length; p++) sum += Math.abs(prev[p] - curr[p])
  return sum / prev.length
}
