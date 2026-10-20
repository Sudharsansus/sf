import { AIGateway } from './gateway'
import { AnthropicProvider } from './providers/anthropic'

export { AIGateway } from './gateway'
export type { GatewayOptions } from './gateway'
export { AnthropicProvider } from './providers/anthropic'
export { taskConfig, DEFAULT_TASKS, DEFAULT_MODEL } from './registry'
export type { TaskConfig } from './registry'
export { costUsd, PRICES } from './pricing'
export { SpendGuard } from './budget'
export { AIRefusalError, AIOutputError, AIBudgetError } from './errors'
export type * from './types'

let gateway: AIGateway | null = null
/** Process-wide gateway (Anthropic). Hosts add usage sinks at startup. */
export const getGateway = (): AIGateway => (gateway ??= new AIGateway({ provider: new AnthropicProvider() }))
export const setGateway = (g: AIGateway | null) => { gateway = g }
