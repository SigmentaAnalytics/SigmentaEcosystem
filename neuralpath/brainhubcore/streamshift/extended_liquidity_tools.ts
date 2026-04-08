import { toolkitBuilder } from "@/ai/core"
import { FETCH_POOL_DATA_KEY } from "@/ai/modules/liquidity/pool-fetcher/key"
import { ANALYZE_POOL_HEALTH_KEY } from "@/ai/modules/liquidity/health-checker/key"
import { FetchPoolDataAction } from "@/ai/modules/liquidity/pool-fetcher/action"
import { AnalyzePoolHealthAction } from "@/ai/modules/liquidity/health-checker/action"

type Toolkit = ReturnType<typeof toolkitBuilder>

/**
 * Extended toolkit for liquidity analysis.
 * Includes:
 * – fetching raw pool data
 * – analyzing health / risks
 * – registry utilities
 */
export const EXTENDED_LIQUIDITY_TOOLS: Record<string, Toolkit> = Object.freeze({
  [`liquidityscan-${FETCH_POOL_DATA_KEY}`]: toolkitBuilder(new FetchPoolDataAction()),
  [`poolhealth-${ANALYZE_POOL_HEALTH_KEY}`]: toolkitBuilder(new AnalyzePoolHealthAction()),
})

/**
 * Get a specific extended liquidity tool by key.
 */
export function getExtendedLiquidityTool(key: string): Toolkit | undefined {
  return EXTENDED_LIQUIDITY_TOOLS[key]
}

/**
 * List all available extended liquidity tools.
 */
export function listExtendedLiquidityTools(): string[] {
  return Object.keys(EXTENDED_LIQUIDITY_TOOLS)
}

/**
 * Validate if a tool exists in the extended liquidity toolkit.
 */
export function hasExtendedLiquidityTool(key: string): boolean {
  return key in EXTENDED_LIQUIDITY_TOOLS
}
