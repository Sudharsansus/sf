import { getPrompt } from '@isaii/prompts'
import type { ChatMessage } from '@isaii/ai-gateway'
import { gw, type AgentDeps } from './context'

export function chat(messages: ChatMessage[], onText: (t: string) => void, deps?: AgentDeps) {
  const safe = messages.slice(-20).map(m => ({ role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: String(m.content).slice(0, 2000) }))
  return gw(deps).streamChat(getPrompt('chat', deps?.env).text, safe, onText, deps?.ctx)
}
