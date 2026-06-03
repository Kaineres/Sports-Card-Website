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
