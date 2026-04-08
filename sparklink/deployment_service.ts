export interface LaunchConfig {
  contractName: string
  parameters: Record<string, any>
  deployEndpoint: string
  apiKey?: string
  retries?: number
  timeoutMs?: number
}

export interface LaunchResult {
  success: boolean
  address?: string
  transactionHash?: string
  error?: string
  attemptedAt: number
  durationMs?: number
}

export class LaunchNode {
  constructor(private config: LaunchConfig) {}

  async deploy(): Promise<LaunchResult> {
    const { deployEndpoint, apiKey, contractName, parameters, retries = 0, timeoutMs } = this.config
    const start = Date.now()
    let lastError: string | undefined

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = timeoutMs ? new AbortController() : undefined
        const timeout = timeoutMs
          ? setTimeout(() => controller?.abort(), timeoutMs)
          : undefined

        const res = await fetch(deployEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify({ contractName, parameters }),
          signal: controller?.signal,
        })

        if (timeout) clearTimeout(timeout)

        if (!res.ok) {
          const text = await res.text()
          lastError = `HTTP ${res.status}: ${text}`
          continue
        }

        const json = await res.json()
        return {
          success: true,
          address: json.contractAddress,
          transactionHash: json.txHash,
          attemptedAt: start,
          durationMs: Date.now() - start,
        }
      } catch (err: any) {
        lastError = err.message
      }
    }

    return {
      success: false,
      error: lastError,
      attemptedAt: start,
      durationMs: Date.now() - start,
    }
  }
}
