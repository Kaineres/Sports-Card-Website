// apps/web/src/lib/camera/quality.ts
import {
  toGrayscale,
  sharpnessScore,
  lightingMetrics,
  frameDifference,
  type RgbaFrame,
} from './metrics'

export interface QualityThresholds {
  minSharpness: number  // variance-of-Laplacian floor
  minLuminance: number  // too dark below this (0-255)
  maxLuminance: number  // too bright above this (0-255)
  maxGlareRatio: number // fraction of blown-out pixels allowed
  maxDarkRatio: number  // fraction of crushed-black pixels allowed
  maxMotion: number     // mean abs frame diff allowed for "stable"
  minLongEdge: number   // min capture long-edge (px) for enough detail
}

// STARTING-POINT thresholds — MUST be calibrated on-device against real card
// photos (see Task 7). Treat as a first guess, not final values.
export const DEFAULT_THRESHOLDS: QualityThresholds = {
  minSharpness: 80,
  minLuminance: 60,
  maxLuminance: 235,
  maxGlareRatio: 0.02,
  maxDarkRatio: 0.25,
  maxMotion: 6,
  minLongEdge: 1000,
}

export interface QualityResult {
  sharp: boolean
  lit: boolean
  stable: boolean
  pass: boolean
  metrics: {
    sharpness: number
    meanLuminance: number
    glareRatio: number
    darkRatio: number
    motion: number | null // null when there is no previous frame
  }
  messages: string[] // coaching, highest priority first
}

/** True when the camera's capture long-edge is large enough for fine detail. */
export function meetsResolution(width: number, height: number, minLongEdge = DEFAULT_THRESHOLDS.minLongEdge): boolean {
  return Math.max(width, height) >= minLongEdge
}

/**
 * Evaluate one frame against the thresholds. `prevGray` is the previous frame's
 * grayscale buffer for motion detection (pass null on the first frame).
 */
export function evaluateQuality(
  frame: RgbaFrame,
  prevGray: Uint8ClampedArray | null,
  thresholds: QualityThresholds = DEFAULT_THRESHOLDS,
): QualityResult {
  const sharpness = sharpnessScore(frame)
  const light = lightingMetrics(frame)
  const currGray = toGrayscale(frame)
  const motion = prevGray && prevGray.length === currGray.length
    ? frameDifference(prevGray, currGray)
    : null

  const sharp = sharpness >= thresholds.minSharpness
  const tooDark = light.meanLuminance < thresholds.minLuminance
  const tooBright = light.meanLuminance > thresholds.maxLuminance
  const glary = light.glareRatio > thresholds.maxGlareRatio
  const crushed = light.darkRatio > thresholds.maxDarkRatio
  const lit = !tooDark && !tooBright && !glary && !crushed
  const stable = motion === null ? false : motion <= thresholds.maxMotion

  const messages: string[] = []
  if (tooDark) messages.push('Too dark — find brighter light')
  else if (tooBright) messages.push('Too bright — reduce direct light')
  if (glary) messages.push('Glare detected — tilt the card or move the light')
  if (crushed) messages.push('Shadows too deep — even out the lighting')
  if (!sharp) messages.push('Hold steady to focus')
  if (motion !== null && !stable) messages.push('Hold still')

  return {
    sharp, lit, stable,
    pass: sharp && lit && stable,
    metrics: {
      sharpness,
      meanLuminance: light.meanLuminance,
      glareRatio: light.glareRatio,
      darkRatio: light.darkRatio,
      motion,
    },
    messages,
  }
}
