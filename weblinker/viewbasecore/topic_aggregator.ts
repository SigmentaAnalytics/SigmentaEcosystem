import type { SightCoreMessage } from "./WebSocketClient"

export interface AggregatedSignal {
  topic: string
  count: number
  lastPayload: any
  lastTimestamp: number
  firstTimestamp?: number
}

export class SignalAggregator {
  private counts: Record<string, AggregatedSignal> = {}

  processMessage(msg: SightCoreMessage): AggregatedSignal {
    const { topic, payload, timestamp } = msg
    const entry =
      this.counts[topic] || {
        topic,
        count: 0,
        lastPayload: null,
        lastTimestamp: 0,
        firstTimestamp: timestamp,
      }
    entry.count += 1
    entry.lastPayload = payload
    entry.lastTimestamp = timestamp
    this.counts[topic] = entry
    return entry
  }

  getAggregated(topic: string): AggregatedSignal | undefined {
    return this.counts[topic]
  }

  getAllAggregated(): AggregatedSignal[] {
    return Object.values(this.counts)
  }

  reset(): void {
    this.counts = {}
  }

  /**
   * Return the most active topic based on message count.
   */
  getTopTopic(): AggregatedSignal | undefined {
    return Object.values(this.counts).reduce((top, current) =>
      !top || current.count > top.count ? current : top,
      undefined as AggregatedSignal | undefined
    )
  }

  /**
   * Filter topics that exceed a minimum number of messages.
   */
  filterByCount(minCount: number): AggregatedSignal[] {
    return Object.values(this.counts).filter(entry => entry.count >= minCount)
  }
}
