// ── EVENT-DRIVEN WORKFLOW SYSTEM ──────────────────────────────────────────────
// Every significant state change emits a typed event.
// Events enable: observability, replayability, analytics, debugging, automation.

export type WorkflowEvent =
  | 'workflow.created'
  | 'workflow.started'
  | 'workflow.research.started'   | 'workflow.research.completed'
  | 'workflow.scripts.started'    | 'workflow.scripts.completed'
  | 'workflow.evaluate.started'   | 'workflow.evaluate.completed'
  | 'workflow.refine.started'     | 'workflow.refine.completed'
  | 'workflow.audio.started'      | 'workflow.audio.completed'    | 'workflow.audio.failed'
  | 'workflow.thumbnails.started' | 'workflow.thumbnails.completed' | 'workflow.thumbnails.failed'
  | 'workflow.seo.started'        | 'workflow.seo.completed'      | 'workflow.seo.failed'
  | 'workflow.upload.started'     | 'workflow.upload.completed'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'workflow.resumed'
  | 'provider.fallback'
  | 'credit.deducted'
  | 'credit.refunded'

export interface EventPayload {
  event:     WorkflowEvent
  episodeId?: string
  userId?:   string
  data?:     Record<string, any>
  ts:        number
}

// In-memory event bus (per-instance)
// For cross-instance events: swap with Redis pub/sub or Trigger.dev events
const handlers: Map<string, ((payload: EventPayload) => void)[]> = new Map()

export async function emitEvent(event: WorkflowEvent, data?: Record<string, any>) {
  const payload: EventPayload = { event, ...data, ts: Date.now() }

  // Persist to DB (fire-and-forget)
  persistEvent(payload).catch(() => {})

  // Call any registered handlers
  const fns = handlers.get(event) || []
  fns.forEach(fn => { try { fn(payload) } catch {} })
}

export function onEvent(event: WorkflowEvent, fn: (payload: EventPayload) => void) {
  const existing = handlers.get(event) || []
  handlers.set(event, [...existing, fn])
}

async function persistEvent(payload: EventPayload) {
  try {
    const { db, workflowRuns } = await import('../db')
    // Store as workflow_runs metadata record
    await db.insert(workflowRuns).values({
      episodeId:    payload.episodeId || null,
      workflowType: payload.event,
      status:       'event',
      metadata:     payload.data || null
    })
  } catch {}
}
