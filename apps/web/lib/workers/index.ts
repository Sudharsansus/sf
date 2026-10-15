// ── DISTRIBUTED WORKER REGISTRY ───────────────────────────────────────────────
// Each worker is a separate concern. No worker knows about another.
// Deploy independently on Railway/Fly.io when scale demands it.
//
// ACTIVATE: npm install @trigger.dev/sdk @trigger.dev/nextjs
// Set TRIGGER_API_KEY in env — workers auto-register on first request.

export { aiWorker }     from './ai.worker'
export { audioWorker }  from './audio.worker'
export { thumbWorker }  from './thumb.worker'
export { uploadWorker } from './upload.worker'
export { seoWorker }    from './seo.worker'
