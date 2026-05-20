import { describe, it, expect } from 'vitest'
import { buildEbayQuery } from '../query-builder'

describe('buildEbayQuery', () => {
  it('formats a standard card into a quoted keyword search', () => {
    const result = buildEbayQuery({
      player_name: 'Caleb Williams',
      set_name: 'Panini Mosaic',
      grading_service: 'PSA',
      grade: 10,
      year: 2024,
    })
    expect(result).toBe('"Caleb Williams" "Panini Mosaic" "PSA 10" 2024 rookie')
  })

  it('handles decimal grades correctly', () => {
    const result = buildEbayQuery({
      player_name: 'Victor Wembanyama',
      set_name: 'Prizm',
      grading_service: 'BGS',
      grade: 9.5,
      year: 2023,
    })
    expect(result).toBe('"Victor Wembanyama" "Prizm" "BGS 9.5" 2023 rookie')
  })

  it('preserves spaces in player name and set name', () => {
    const result = buildEbayQuery({
      player_name: 'Marvin Harrison Jr',
      set_name: 'Topps Chrome Update Series',
      grading_service: 'SGC',
      grade: 10,
      year: 2024,
    })
    expect(result).toBe('"Marvin Harrison Jr" "Topps Chrome Update Series" "SGC 10" 2024 rookie')
  })
})
