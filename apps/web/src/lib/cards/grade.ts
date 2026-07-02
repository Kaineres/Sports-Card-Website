import type { GradingService } from '../supabase/types'

const SERVICES: readonly GradingService[] = ['PSA', 'BGS', 'SGC', 'CGC']

// Turns a UI grade label ("PSA 10", "BGS 9.5", "Raw") into the split
// service + numeric grade we store. Anything unrecognized is treated as Raw.
export function parseGradeLabel(
  label: string
): { grading_service: GradingService | null; grade: number | null } {
  const [rawService, rawGrade] = label.trim().split(/\s+/)
  const service = SERVICES.find((s) => s === rawService)
  const grade = Number(rawGrade)
  if (!service || !Number.isFinite(grade)) {
    return { grading_service: null, grade: null }
  }
  return { grading_service: service, grade }
}

// Inverse of parseGradeLabel, for display.
export function formatGradeLabel(
  service: GradingService | null,
  grade: number | null
): string {
  if (!service || grade == null) return 'Raw'
  return `${service} ${grade}`
}
