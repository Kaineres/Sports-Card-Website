export interface SnapshotResult {
  median: number
  avg: number
  low: number
  high: number
}

export function computeSnapshot(prices: number[]): SnapshotResult {
  if (prices.length === 0) throw new Error('Cannot compute snapshot from empty price list')

  const sorted = [...prices].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)

  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]

  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length

  return {
    median: Math.round(median * 100) / 100,
    avg: Math.round(avg * 100) / 100,
    low: sorted[0],
    high: sorted[sorted.length - 1],
  }
}
