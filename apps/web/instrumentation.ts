// Runs once per server instance: wire AI usage into the database log.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { getGateway } = await import('@isaii/ai-gateway')
  const { getDb, insertAIUsage } = await import('@isaii/db')
  getGateway().addSink(r => insertAIUsage(getDb(), {
    task: r.task, provider: r.provider, model: r.model, tokens: r.usage.inputTokens + r.usage.outputTokens,
    latencyMs: r.latencyMs, costUsd: r.costUsd, success: r.success, episodeId: r.ctx?.episodeId, userId: r.ctx?.userId,
  }))
}
