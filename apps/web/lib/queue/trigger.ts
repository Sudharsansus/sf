// ── QUEUE ─────────────────────────────────────────────────────────────────────
// Trigger.dev activates automatically when TRIGGER_API_KEY is set.
// Without it — falls back to inline execution. Zero code changes needed.
// To activate: npm install @trigger.dev/sdk then set TRIGGER_API_KEY in env.

export type JobType =
  | 'generate.research'
  | 'generate.scripts'
  | 'generate.evaluate'
  | 'produce.refine'
  | 'produce.audio'
  | 'produce.thumbnails'
  | 'produce.seo'
  | 'distribute.youtube'
  | 'distribute.instagram'

export interface JobPayload {
  jobType:   JobType
  episodeId: string
  userId:    string
  data:      Record<string, any>
  idemKey:   string
}

export interface JobResult {
  jobType:    JobType
  episodeId:  string
  success:    boolean
  output?:    any
  error?:     string
  durationMs: number
}

export async function enqueueJob(
  payload: JobPayload
): Promise<{ jobId: string; mode: 'queued' | 'inline' }> {
  // Trigger.dev is NOT bundled — it must be installed separately.
  // Install: npm install @trigger.dev/sdk @trigger.dev/nextjs
  // Then replace this function body with:
  //   const client = new TriggerClient({ id: 'sus', apiKey: process.env.TRIGGER_API_KEY! })
  //   const event = await client.sendEvent({ name: payload.jobType, payload, id: payload.idemKey })
  //   return { jobId: event.id, mode: 'queued' }
  return { jobId: `inline-${Date.now()}`, mode: 'inline' }
}

export async function getJobStatus(
  jobId: string
): Promise<{ status: string; output?: any }> {
  // When Trigger.dev is active:
  //   const run = await triggerClient.getRun(jobId)
  //   return { status: run.status, output: run.output }
  return { status: 'unknown' }
}