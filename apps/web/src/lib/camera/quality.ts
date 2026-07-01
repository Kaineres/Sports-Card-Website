// apps/web/src/lib/camera/quality.ts
import {
  toGrayscale,
  sharpnessScore,
  lightingMetrics,
  frameDifference,
  type RgbaFrame,
} from './metrics'

export interface QualityThresholds {
  minSharpness: number      // variance-of-Laplacian floor
  minLuminance: number      // too dark below this (0-255)
  maxLuminance: number      // too bright above this (0-255)
  maxGlareRatio: number     // fraction of blown-out pixels allowed (whole frame, >=250)
  maxCellGlareRatio: number // max per-cell fraction of clipped (>=250) pixels before flagging a specular hotspot
  maxDarkRatio: number      // fraction of crushed-black pixels allowed
  maxMotion: number         // mean abs frame diff allowed for "stable"
  minLongEdge: number       // min capture long-edge (px) for enough detail
}

// STARTING-POINT thresholds — MUST be calibrated on-device against real card
// photos (see Task 7). Treat as a first guess, not final values.
export const DEFAULT_THRESHOLDS: QualityThresholds = {
  minSharpness: 120,
  minLuminance: 90,
  maxLuminance: 235,
  maxGlareRatio: 0.02,
  maxCellGlareRatio: 0.20,
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
    maxCellGlareRatio: number
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
            || light.maxCellGlareRatio > thresholds.maxCellGlareRatio
  const crushed = light.darkRatio > thresholds.maxDarkRatio
  const lit = !tooDark && !tooBright && !glary && !crushed
  const stable = motion === null ? false : motion <= thresholds.maxMotion

  const messages: string[] = []
  if (tooDark) messages.push('Too dark — move to brighter, even light (near a window works)')
  else if (tooBright) messages.push('Too bright — back away from the light')
  if (glary) messages.push('Glare on card — tilt card or try a different angle')
  if (crushed) messages.push('Uneven shadows — try a flat, even light source')
  if (!sharp) messages.push('Blurry — hold the camera still')
  if (motion !== null && !stable) messages.push('Moving — hold the camera steady')

  return {
    sharp, lit, stable,
    pass: sharp && lit && stable,
    metrics: {
      sharpness,
      meanLuminance: light.meanLuminance,
      glareRatio: light.glareRatio,
      maxCellGlareRatio: light.maxCellGlareRatio,
      darkRatio: light.darkRatio,
      motion,
    },
    messages,
  }
}
