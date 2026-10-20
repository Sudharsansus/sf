import { getGateway, type AIGateway, type AICtx } from '@isaii/ai-gateway'

export type AgentDeps = { gateway?: AIGateway; ctx?: AICtx; env?: Record<string, string | undefined> }
export const gw = (d?: AgentDeps) => d?.gateway ?? getGateway()
