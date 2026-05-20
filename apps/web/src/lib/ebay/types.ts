export interface EbayListing {
  itemId: string
  title: string
  salePrice: number
  currency: string
  saleDate: string  // ISO 8601
  ebayUrl: string
}

// Raw shape of one item from eBay Finding API JSON response
export interface EbayRawItem {
  itemId: [string]
  title: [string]
  viewItemURL: [string]
  sellingStatus: [
    {
      currentPrice: [{ __value__: string; '@currencyId': string }]
      sellingState: [string]
    }
  ]
  listingInfo: [{ endTime: [string] }]
}

export interface EbayFindResponse {
  findCompletedItemsResponse: [
    {
      ack: [string]
      searchResult: [{ '@count': string; item?: EbayRawItem[] }]
    }
  ]
}
