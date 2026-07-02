import { describe, it, expect } from 'vitest'
import { parseGradeLabel, formatGradeLabel } from '../grade'

describe('parseGradeLabel', () => {
  it('parses a PSA integer grade', () => {
    expect(parseGradeLabel('PSA 10')).toEqual({ grading_service: 'PSA', grade: 10 })
  })
  it('parses a BGS half grade', () => {
    expect(parseGradeLabel('BGS 9.5')).toEqual({ grading_service: 'BGS', grade: 9.5 })
  })
  it('treats "Raw" as ungraded', () => {
    expect(parseGradeLabel('Raw')).toEqual({ grading_service: null, grade: null })
  })
  it('treats an unknown service as ungraded', () => {
    expect(parseGradeLabel('FOO 9')).toEqual({ grading_service: null, grade: null })
  })
})

describe('formatGradeLabel', () => {
  it('formats a graded card', () => {
    expect(formatGradeLabel('PSA', 10)).toBe('PSA 10')
  })
  it('formats a half grade without a trailing zero', () => {
    expect(formatGradeLabel('BGS', 9.5)).toBe('BGS 9.5')
  })
  it('formats ungraded as "Raw"', () => {
    expect(formatGradeLabel(null, null)).toBe('Raw')
  })
})
