export interface PricePoint {
  timestamp: number
  priceUsd: number
}

export interface TrendResult {
  startTime: number
  endTime: number
  trend: "upward" | "downward" | "neutral"
  changePct: number
  length: number
}

/**
 * Analyze a series of price points to determine overall trend segments.
 */
export function analyzePriceTrends(
  points: PricePoint[],
  minSegmentLength: number = 5
): TrendResult[] {
  const results: TrendResult[] = []
  if (points.length < minSegmentLength) return results

  let segStart = 0
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].priceUsd
    const curr = points[i].priceUsd
    const direction = curr > prev ? 1 : curr < prev ? -1 : 0

    // check if direction changes or segment length reached
    if (
      i - segStart >= minSegmentLength &&
      (i === points.length - 1 ||
        (direction === 1 && points[i + 1].priceUsd < curr) ||
        (direction === -1 && points[i + 1].priceUsd > curr))
    ) {
      const start = points[segStart]
      const end = points[i]
      const changePct = ((end.priceUsd - start.priceUsd) / start.priceUsd) * 100
      results.push({
        startTime: start.timestamp,
        endTime: end.timestamp,
        trend: changePct > 0 ? "upward" : changePct < 0 ? "downward" : "neutral",
        changePct: Math.round(changePct * 100) / 100,
        length: i - segStart + 1,
      })
      segStart = i
    }
  }
  return results
}

/**
 * Find the strongest trend segment by absolute percentage change.
 */
export function strongestTrend(results: TrendResult[]): TrendResult | null {
  if (results.length === 0) return null
  return results.reduce((max, r) =>
    Math.abs(r.changePct) > Math.abs(max.changePct) ? r : max
  )
}

/**
 * Compute average percentage change across all segments.
 */
export function averageTrendChange(results: TrendResult[]): number {
  if (results.length === 0) return 0
  const total = results.reduce((sum, r) => sum + r.changePct, 0)
  return Math.round((total / results.length) * 100) / 100
}
