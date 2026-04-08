export interface TokenDataPoint {
  timestamp: number
  priceUsd: number
  volumeUsd: number
  marketCapUsd: number
}

export class TokenDataFetcher {
  constructor(private apiBase: string) {}

  /**
   * Fetches an array of TokenDataPoint for the given token symbol.
   * Expects endpoint: `${apiBase}/tokens/${symbol}/history`
   */
  async fetchHistory(symbol: string): Promise<TokenDataPoint[]> {
    const res = await fetch(
      `${this.apiBase}/tokens/${encodeURIComponent(symbol)}/history`
    )
    if (!res.ok) {
      throw new Error(
        `Failed to fetch history for ${symbol}: ${res.status}`
      )
    }
    const raw = (await res.json()) as any[]
    return raw.map(r => ({
      timestamp: r.time * 1000,
      priceUsd: Number(r.priceUsd),
      volumeUsd: Number(r.volumeUsd),
      marketCapUsd: Number(r.marketCapUsd),
    }))
  }

  /**
   * Fetch latest token data point.
   */
  async fetchLatest(symbol: string): Promise<TokenDataPoint | null> {
    const history = await this.fetchHistory(symbol)
    if (!history.length) return null
    return history[history.length - 1]
  }

  /**
   * Fetch token data within a time range.
   */
  async fetchRange(
    symbol: string,
    from: number,
    to: number
  ): Promise<TokenDataPoint[]> {
    const history = await this.fetchHistory(symbol)
    return history.filter(p => p.timestamp >= from && p.timestamp <= to)
  }

  /**
   * Calculate average price over history or time range.
   */
  async averagePrice(
    symbol: string,
    from?: number,
    to?: number
  ): Promise<number> {
    const history = await this.fetchHistory(symbol)
    const filtered = from && to
      ? history.filter(p => p.timestamp >= from && p.timestamp <= to)
      : history
    if (!filtered.length) return 0
    const total = filtered.reduce((sum, p) => sum + p.priceUsd, 0)
    return Math.round((total / filtered.length) * 100) / 100
  }
}
