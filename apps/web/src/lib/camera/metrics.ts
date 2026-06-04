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
  glareRatio: number        // fraction of near-white (>=250) pixels, whole frame
  darkRatio: number         // fraction of near-black (<=10) pixels
  maxCellGlareRatio: number // highest per-cell fraction of pixels >=220 in an 8×8 grid
}

/** Brightness + glare + darkness metrics from the grayscale histogram. */
export function lightingMetrics(frame: RgbaFrame): LightingMetrics {
  const { width, height } = frame
  const gray = toGrayscale(frame)
  let sum = 0, glare = 0, dark = 0
  for (let p = 0; p < gray.length; p++) {
    const v = gray[p]
    sum += v
    if (v >= 250) glare++
    if (v <= 10) dark++
  }
  const n = gray.length || 1

  // 8×8 grid hotspot detection — catches concentrated bright regions
  // that the whole-frame ratio misses due to dark-background dilution.
  // Uses a lower threshold (>=220) than the global check (>=250) because
  // real-world camera hotspots typically peak at 220-245, not fully clipped.
  const GRID = 8
  const cellW = Math.max(1, Math.floor(width / GRID))
  const cellH = Math.max(1, Math.floor(height / GRID))
  let maxCellGlareRatio = 0
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      let cellGlare = 0, cellTotal = 0
      const yStart = row * cellH
      const yEnd = Math.min(yStart + cellH, height)
      const xStart = col * cellW
      const xEnd = Math.min(xStart + cellW, width)
      for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
          const v = gray[y * width + x]
          cellTotal++
          if (v >= 220) cellGlare++
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
