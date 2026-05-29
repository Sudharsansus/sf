// ── OBSERVABILITY ─────────────────────────────────────────────────────────────
// Zero external imports — nothing bundled at build time.

export async function captureError(
  error: Error,
  ctx?: { userId?: string; episodeId?: string; step?: string; provider?: string }
) {
  console.error('[Sus Error]', error.message, ctx ?? '')
}

export async function track(
  event: string,
  userId: string,
  properties?: Record<string, any>
) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Sus Track]', event, { userId, ...properties })
  }
}

export const events = {
  workflowStarted:  (userId: string, topic: string)                      => track('workflow_started',  userId, { topic }),
  scriptsPicked:    (userId: string, angle: string, score: number)        => track('scripts_picked',    userId, { angle, score }),
  audioRendered:    (userId: string, durationMs: number)                  => track('audio_rendered',    userId, { duration_ms: durationMs }),
  workflowComplete: (userId: string, episodeId: string, costUsd: number)  => track('workflow_complete', userId, { episode_id: episodeId, cost_usd: costUsd }),
  workflowFailed:   (userId: string, step: string, error: string)         => track('workflow_failed',   userId, { step, error }),
  providerFallback: (userId: string, from: string, to: string)            => track('provider_fallback', userId, { from, to }),
}