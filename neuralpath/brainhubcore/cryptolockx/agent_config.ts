export interface AgentCapabilities {
  canAnswerProtocolQuestions: boolean
  canAnswerTokenQuestions: boolean
  canDescribeTooling: boolean
  canReportEcosystemNews: boolean
  canAnalyzeWallets?: boolean
  canTrackWhales?: boolean
}

export interface AgentFlags {
  requiresExactInvocation: boolean
  noAdditionalCommentary: boolean
  strictOutputFormat?: boolean
  debugMode?: boolean
}

export const SOLANA_AGENT_CAPABILITIES: AgentCapabilities = {
  canAnswerProtocolQuestions: true,
  canAnswerTokenQuestions: true,
  canDescribeTooling: true,
  canReportEcosystemNews: true,
  canAnalyzeWallets: true,
  canTrackWhales: true,
}

export const SOLANA_AGENT_FLAGS: AgentFlags = {
  requiresExactInvocation: true,
  noAdditionalCommentary: true,
  strictOutputFormat: false,
  debugMode: false,
}

/**
 * Utility function to check if the agent supports a given capability.
 */
export function hasCapability(
  capability: keyof AgentCapabilities,
  agent: AgentCapabilities = SOLANA_AGENT_CAPABILITIES
): boolean {
  return agent[capability] === true
}

/**
 * Utility function to validate if flags require strict formatting.
 */
export function requiresStrictOutput(flags: AgentFlags = SOLANA_AGENT_FLAGS): boolean {
  return flags.strictOutputFormat === true
}
