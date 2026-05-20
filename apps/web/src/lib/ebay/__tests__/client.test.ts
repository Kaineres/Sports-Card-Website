import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findCompletedItems } from '../client'

const mockItem = {
  itemId: ['123456789'],
  title: ['Caleb Williams 2024 Panini Mosaic PSA 10 Rookie'],
  viewItemURL: ['https://www.ebay.com/itm/123456789'],
  sellingStatus: [
    {
      currentPrice: [{ __value__: '150.00', '@currencyId': 'USD' }],
      sellingState: ['EndedWithSales'],
    },
  ],
  listingInfo: [{ endTime: ['2024-11-15T18:00:00.000Z'] }],
}

const mockResponse = {
  findCompletedItemsResponse: [
    {
      ack: ['Success'],
      searchResult: [{ '@count': '1', item: [mockItem] }],
    },
  ],
}

beforeEach(() => {
  vi.stubEnv('EBAY_APP_ID', 'TestApp-1234')
})

describe('findCompletedItems', () => {
  it('returns mapped listings on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }))

    const result = await findCompletedItems('"Caleb Williams" "Panini Mosaic" "PSA 10" 2024 rookie')

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      itemId: '123456789',
      title: 'Caleb Williams 2024 Panini Mosaic PSA 10 Rookie',
      salePrice: 150,
      currency: 'USD',
      saleDate: '2024-11-15T18:00:00.000Z',
      ebayUrl: 'https://www.ebay.com/itm/123456789',
    })
  })

  it('returns empty array when searchResult has no items', async () => {
    const emptyResponse = {
      findCompletedItemsResponse: [
        {
          ack: ['Success'],
          searchResult: [{ '@count': '0' }],
        },
      ],
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => emptyResponse,
    }))

    const result = await findCompletedItems('no results query')
    expect(result).toHaveLength(0)
  })

  it('throws when fetch returns a non-ok status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    await expect(findCompletedItems('test')).rejects.toThrow('eBay API error: 503')
  })

  it('throws when eBay ack is not Success', async () => {
    const failResponse = {
      findCompletedItemsResponse: [{ ack: ['Failure'], searchResult: [] }],
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => failResponse,
    }))
    await expect(findCompletedItems('test')).rejects.toThrow('eBay API returned: Failure')
  })
})
