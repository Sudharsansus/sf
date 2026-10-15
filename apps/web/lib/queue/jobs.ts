// ── QUEUE SCAFFOLD ────────────────────────────────────────────────────────────
// Current: request-bound workflows (works up to ~100 concurrent users)
// Next: migrate heavy agents here when you hit Vercel 60s limits at scale
//
// Recommended provider: Trigger.dev (https://trigger.dev)
// npm install @trigger.dev/sdk
//
// How to activate:
// 1. npm install @trigger.dev/sdk @trigger.dev/nextjs
// 2. Replace the inline logic in /api/agents/refine with triggerClient.sendEvent()
// 3. Add TRIGGER_API_KEY and TRIGGER_API_URL to env vars
// 4. Each job below becomes a background worker with automatic retries, logs, traces

// ── JOB TYPES ─────────────────────────────────────────────────────────────────
export type JobType =
  | 'generate.research'      // Groq web research
  | 'generate.scripts'       // Claude 5-variation scripts
  | 'generate.evaluate'      // GPT-4o-mini evaluation
  | 'produce.refine'         // Claude script refinement
  | 'produce.audio'          // ElevenLabs rendering
  | 'produce.thumbnails'     // Replicate image generation
  | 'produce.seo'            // Groq SEO package
  | 'distribute.youtube'     // YouTube upload
  | 'distribute.instagram'   // Instagram Reel

export interface JobPayload {
  jobType:   JobType
  episodeId: string
  userId:    string
  data:      Record<string, any>
  idemKey:   string
}

export interface JobResult {
  jobType:   JobType
  episodeId: string
  success:   boolean
  output?:   any
  error?:    string
  durationMs: number
}

// ── STUB: enqueueJob ──────────────────────────────────────────────────────────
// Drop-in replacement — currently runs inline, queue-ready interface
// When you're ready to migrate: replace body with triggerClient.sendEvent()
export async function enqueueJob(payload: JobPayload): Promise<{ jobId: string }> {
  // TODO: replace with:
  // const { id } = await triggerClient.sendEvent({ name: payload.jobType, payload })
  // return { jobId: id }
  return { jobId: `inline-${Date.now()}` }
}

// ── STUB: getJobStatus ────────────────────────────────────────────────────────
export async function getJobStatus(jobId: string): Promise<{ status: string; result?: any }> {
  // TODO: replace with:
  // const run = await triggerClient.getRun(jobId)
  // return { status: run.status, result: run.output }
  return { status: 'unknown' }
}

// ── MIGRATION GUIDE ───────────────────────────────────────────────────────────
/*
  STEP 1: Install Trigger.dev
    npm install @trigger.dev/sdk @trigger.dev/nextjs

  STEP 2: Create trigger.config.ts
    import { TriggerClient } from "@trigger.dev/sdk"
    export const triggerClient = new TriggerClient({
      id: "sus",
      apiKey: process.env.TRIGGER_API_KEY!,
      apiUrl: process.env.TRIGGER_API_URL,
    })

  STEP 3: Create app/api/trigger/route.ts
    import { createPageRoute } from "@trigger.dev/nextjs"
    import { triggerClient } from "@/lib/queue/trigger"
    const { handler } = createPageRoute(triggerClient)
    export { handler as GET, handler as POST }

  STEP 4: Create jobs in jobs/ folder
    export const refineJob = triggerClient.defineJob({
      id: "produce.refine",
      name: "Refine Script + Audio + Thumbnails + SEO",
      version: "1.0.0",
      run: async (payload: JobPayload, io) => {
        const { episodeId, userId, data } = payload
        await io.runTask("refine-script", async () => runRefineAgent(data.script, data.topic))
        const [audio, thumbs, seo] = await Promise.allSettled([...])
        // Each step logged, retried, and visible in Trigger.dev dashboard
      }
    })

  STEP 5: Replace inline execution in /api/agents/refine/route.ts
    // Before: await runRefineAgent(...)
    // After:  await enqueueJob({ jobType: 'produce.refine', episodeId, ... })
    //         return { status: 'queued', episodeId }

  WHY: Vercel functions timeout at 60s. Trigger.dev jobs run for minutes.
  Dashboard: https://cloud.trigger.dev — full traces, retries, logs per run.
*/
