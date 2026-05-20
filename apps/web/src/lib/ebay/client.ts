import type { EbayFindResponse, EbayListing, EbayRawItem } from './types'

const EBAY_BASE_URL = 'https://svcs.ebay.com/services/search/FindingService/v1'

export async function findCompletedItems(
  query: string,
  opts: { daysBack?: number } = {}
): Promise<EbayListing[]> {
  const appId = process.env.EBAY_APP_ID
  if (!appId) throw new Error('EBAY_APP_ID not set')

  const params = new URLSearchParams({
    'OPERATION-NAME': 'findCompletedItems',
    'SERVICE-VERSION': '1.13.0',
    'SECURITY-APPNAME': appId,
    'RESPONSE-DATA-FORMAT': 'JSON',
    keywords: query,
    categoryId: '213',
    'itemFilter(0).name': 'SoldItemsOnly',
    'itemFilter(0).value': 'true',
    'sortOrder': 'EndTimeSoonest',
    'paginationInput.entriesPerPage': '20',
  })

  if (opts.daysBack) {
    const since = new Date(Date.now() - opts.daysBack * 24 * 60 * 60 * 1000)
    params.set('itemFilter(1).name', 'EndTimeFrom')
    params.set('itemFilter(1).value', since.toISOString())
  }

  const res = await fetch(`${EBAY_BASE_URL}?${params}`)
  if (!res.ok) throw new Error(`eBay API error: ${res.status}`)

  const data: EbayFindResponse = await res.json()
  const response = data.findCompletedItemsResponse?.[0]

  if (response?.ack?.[0] !== 'Success') {
    throw new Error(`eBay API returned: ${response?.ack?.[0]}`)
  }

  const items: EbayRawItem[] = response.searchResult?.[0]?.item ?? []

  return items.map((item) => ({
    itemId: item.itemId[0],
    title: item.title[0],
    salePrice: parseFloat(item.sellingStatus[0].currentPrice[0].__value__),
    currency: item.sellingStatus[0].currentPrice[0]['@currencyId'],
    saleDate: item.listingInfo[0].endTime[0],
    ebayUrl: item.viewItemURL[0],
  }))
}
