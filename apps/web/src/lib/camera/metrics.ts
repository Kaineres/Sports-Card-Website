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
