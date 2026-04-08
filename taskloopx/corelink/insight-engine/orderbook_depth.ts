/**
 * Analyze on‐chain orderbook depth for a given market.
 */
export interface Order {
  price: number
  size: number
}

export interface DepthMetrics {
  averageBidDepth: number
  averageAskDepth: number
  spread: number
  totalBidVolume: number
  totalAskVolume: number
  midPrice?: number
}

export class TokenDepthAnalyzer {
  constructor(private rpcEndpoint: string, private marketId: string) {}

  async fetchOrderbook(depth = 50): Promise<{ bids: Order[]; asks: Order[] }> {
    const url = `${this.rpcEndpoint}/orderbook/${this.marketId}?depth=${depth}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Orderbook fetch failed: ${res.status}`)
    return await res.json()
  }

  private average(arr: Order[]): number {
    if (arr.length === 0) return 0
    return arr.reduce((s, o) => s + o.size, 0) / arr.length
  }

  private total(arr: Order[]): number {
    return arr.reduce((s, o) => s + o.size, 0)
  }

  async analyze(depth = 50): Promise<DepthMetrics> {
    const { bids, asks } = await this.fetchOrderbook(depth)
    const bestBid = bids[0]?.price ?? 0
    const bestAsk = asks[0]?.price ?? 0
    const spread = bestAsk && bestBid ? bestAsk - bestBid : 0
    const midPrice = bestAsk && bestBid ? (bestAsk + bestBid) / 2 : undefined

    return {
      averageBidDepth: this.average(bids),
      averageAskDepth: this.average(asks),
      spread,
      totalBidVolume: this.total(bids),
      totalAskVolume: this.total(asks),
      midPrice,
    }
  }

  /**
   * Compute orderbook imbalance between bids and asks.
   */
  async computeImbalance(depth = 50): Promise<number> {
    const { bids, asks } = await this.fetchOrderbook(depth)
    const totalBids = this.total(bids)
    const totalAsks = this.total(asks)
    if (totalBids + totalAsks === 0) return 0
    return (totalBids - totalAsks) / (totalBids + totalAsks)
  }
}
