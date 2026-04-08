/**
 * Analyze on‐chain token activity: fetches recent activity and summarizes transfers.
 */
export interface ActivityRecord {
  timestamp: number
  signature: string
  source: string
  destination: string
  amount: number
  slot?: number
  fee?: number
}

export class TokenActivityAnalyzer {
  constructor(private rpcEndpoint: string) {}

  async fetchRecentSignatures(mint: string, limit = 100): Promise<string[]> {
    const url = `${this.rpcEndpoint}/getSignaturesForAddress/${mint}?limit=${limit}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch signatures: ${res.status}`)
    const json = await res.json()
    return json.map((e: any) => e.signature)
  }

  private parseTransaction(tx: any, sig: string): ActivityRecord[] {
    const pre = tx.meta?.preTokenBalances || []
    const post = tx.meta?.postTokenBalances || []
    const blockTime = tx.blockTime ? tx.blockTime * 1000 : Date.now()
    const slot = tx.slot ?? undefined
    const fee = tx.meta?.fee ?? undefined
    const out: ActivityRecord[] = []

    for (let i = 0; i < post.length; i++) {
      const p = post[i]
      const q = pre[i] || { uiTokenAmount: { uiAmount: 0 }, owner: null }
      const delta =
        (p.uiTokenAmount?.uiAmount || 0) - (q.uiTokenAmount?.uiAmount || 0)
      if (delta !== 0) {
        out.push({
          timestamp: blockTime,
          signature: sig,
          source: q.owner || "unknown",
          destination: p.owner || "unknown",
          amount: Math.abs(delta),
          slot,
          fee,
        })
      }
    }

    return out
  }

  async analyzeActivity(mint: string, limit = 50): Promise<ActivityRecord[]> {
    const sigs = await this.fetchRecentSignatures(mint, limit)
    const out: ActivityRecord[] = []

    for (const sig of sigs) {
      try {
        const txRes = await fetch(`${this.rpcEndpoint}/getTransaction/${sig}`)
        if (!txRes.ok) continue
        const tx = await txRes.json()
        const records = this.parseTransaction(tx, sig)
        out.push(...records)
      } catch (err) {
        // Skip malformed or missing transactions
        continue
      }
    }

    return out
  }

  /**
   * Aggregate activity records by wallet address.
   */
  summarizeByAddress(records: ActivityRecord[]): Record<string, number> {
    return records.reduce((acc, rec) => {
      acc[rec.destination] = (acc[rec.destination] || 0) + rec.amount
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * Get total transferred amount across all records.
   */
  totalTransferred(records: ActivityRecord[]): number {
    return records.reduce((sum, rec) => sum + rec.amount, 0)
  }
}
