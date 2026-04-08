/**
 * Detect volume‐based patterns in a series of activity amounts.
 */
export interface PatternMatch {
  index: number
  window: number
  average: number
  max?: number
  min?: number
  trend?: "increasing" | "decreasing" | "mixed"
}

export function detectVolumePatterns(
  volumes: number[],
  windowSize: number,
  threshold: number
): PatternMatch[] {
  const matches: PatternMatch[] = []

  for (let i = 0; i + windowSize <= volumes.length; i++) {
    const slice = volumes.slice(i, i + windowSize)
    const avg = slice.reduce((a, b) => a + b, 0) / windowSize
    if (avg >= threshold) {
      const max = Math.max(...slice)
      const min = Math.min(...slice)
      let trend: "increasing" | "decreasing" | "mixed" = "mixed"

      if (slice.every((v, idx) => idx === 0 || v >= slice[idx - 1])) {
        trend = "increasing"
      } else if (slice.every((v, idx) => idx === 0 || v <= slice[idx - 1])) {
        trend = "decreasing"
      }

      matches.push({ index: i, window: windowSize, average: avg, max, min, trend })
    }
  }

  return matches
}

/**
 * Utility to calculate moving average for a given window size.
 */
export function movingAverage(volumes: number[], windowSize: number): number[] {
  const result: number[] = []
  for (let i = 0; i + windowSize <= volumes.length; i++) {
    const slice = volumes.slice(i, i + windowSize)
    const avg = slice.reduce((a, b) => a + b, 0) / windowSize
    result.push(avg)
  }
  return result
}
