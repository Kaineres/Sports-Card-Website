// Device-tilt ("level") gate for the card scanner. A straight-on shot means the
// phone's sensor plane is parallel to the card plane — i.e. the phone is held
// FLAT/level above a card lying flat. We read that from the device's gravity
// vector (accelerationIncludingGravity) instead of analyzing the image, which is
// cheap and robust. This is the fix for perspective/keystone distortion that
// corrupts the centering grade.
//
// NOTE: assumes the card lies on a horizontal surface (coach the user to "lay it
// flat"). thresholds here are STARTING points — calibrate on-device with the
// grader, same as the quality thresholds.

export interface Gravity {
  x: number
  y: number
  z: number
}

export interface TiltThresholds {
  maxTiltDeg: number // max deviation from level before we block auto-capture
}

export const DEFAULT_TILT_THRESHOLDS: TiltThresholds = {
  maxTiltDeg: 7,
}

/**
 * Angle (degrees) between the device's screen-normal (z axis) and the gravity
 * vector. 0° = phone perfectly flat/level over a horizontal card; 90° = phone
 * held vertical. Uses the horizontal component (x,y) vs the vertical (z), so it
 * is orientation-agnostic within the plane (portrait/landscape don't matter).
 */
export function tiltAngleDeg(g: Gravity): number {
  const horizontal = Math.hypot(g.x, g.y)
  const vertical = Math.abs(g.z)
  if (horizontal === 0 && vertical === 0) return 0 // no reading — treat as level
  return (Math.atan2(horizontal, vertical) * 180) / Math.PI
}

export interface LevelResult {
  level: boolean
  tiltDeg: number
  message: string | null // coaching to show when NOT level
}

/**
 * Evaluate whether the phone is level enough for a straight-on shot. `g` is the
 * latest gravity reading, or null when we have no sensor data (no permission,
 * unsupported device, desktop) — in which case we DO NOT block: `level: true`
 * with no message, so the scanner still works without the level gate.
 */
export function evaluateLevel(
  g: Gravity | null,
  thresholds: TiltThresholds = DEFAULT_TILT_THRESHOLDS,
): LevelResult {
  if (g === null) return { level: true, tiltDeg: 0, message: null }
  const tiltDeg = tiltAngleDeg(g)
  const level = tiltDeg <= thresholds.maxTiltDeg
  return {
    level,
    tiltDeg,
    message: level ? null : 'Hold phone flat and level over the card',
  }
}
