export const SOLANA_KNOWLEDGE_AGENT_ID = "solana-knowledge-agent" as const

export const SOLANA_KNOWLEDGE_AGENT_VERSION = "1.0.0" as const

export const SOLANA_KNOWLEDGE_AGENT_DESCRIPTION =
  "Agent specialized in answering Solana-related questions about protocols, tokens, wallets, staking, validators, RPCs, and ecosystem updates." as const

export const SOLANA_KNOWLEDGE_AGENT_METADATA = {
  id: SOLANA_KNOWLEDGE_AGENT_ID,
  version: SOLANA_KNOWLEDGE_AGENT_VERSION,
  description: SOLANA_KNOWLEDGE_AGENT_DESCRIPTION,
  category: "knowledge",
  network: "solana",
}
