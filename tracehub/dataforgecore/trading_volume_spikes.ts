export interface VolumePoint {
  timestamp: number
  volumeUsd: number
}

export interface SpikeEvent {
  timestamp: number
  volume: number
  spikeRatio: number
  windowAverage: number
  windowSize: number
}

/**
 * Detects spikes in trading volume compared to a rolling average window.
 */
export function detectVolumeSpikes(
  points: VolumePoint[],
  windowSize: number = 10,
  spikeThreshold: number = 2.0
): SpikeEvent[] {
  const events: SpikeEvent[] = []
  const volumes = points.map(p => p.volumeUsd)

  for (let i = windowSize; i < volumes.length; i++) {
    const window = volumes.slice(i - windowSize, i)
    const avg = window.reduce((sum, v) => sum + v, 0) / (window.length || 1)
    const curr = volumes[i]
    const ratio = avg > 0 ? curr / avg : Infinity

    if (ratio >= spikeThreshold) {
      events.push({
        timestamp: points[i].timestamp,
        volume: curr,
        spikeRatio: Math.round(ratio * 100) / 100,
        windowAverage: Math.round(avg * 100) / 100,
        windowSize,
      })
    }
  }

  return events
}

/**
 * Get the largest spike event by ratio.
 */
export function getLargestSpike(events: SpikeEvent[]): SpikeEvent | null {
  if (events.length === 0) return null
  return events.reduce((max, e) => (e.spikeRatio > max.spikeRatio ? e : max))
}

/**
 * Count how many spikes exceeded a certain multiple of the threshold.
 */
export function countSevereSpikes(
  events: SpikeEvent[],
  severityMultiplier: number = 3
): number {
  return events.filter(e => e.spikeRatio >= severityMultiplier).length
}
