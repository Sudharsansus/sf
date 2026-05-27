// ── AI WORKER ─────────────────────────────────────────────────────────────────
// Handles: research, script generation, evaluation, refinement
// Runs as background job — no 60s Vercel ceiling

import { runResearchAgent, runScriptAgent, runEvaluateAgent, runRefineAgent } from '@/lib/claude'
import { db, episodes } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { logger } from '@/lib/logger'
import { emitEvent } from '@/lib/events'

export const aiWorker = {
  id: 'ai-worker',

  async research(episodeId: string, topic: string) {
    logger.info('AI Worker: research', { episodeId, topic })
    await db.update(episodes).set({ agentStep: 'research', status: 'researching' }).where(eq(episodes.id, episodeId))
    await emitEvent('workflow.research.started', { episodeId })
    try {
      const data = await runResearchAgent(topic)
      await db.update(episodes).set({ researchData: data, agentStep: 'research_done' }).where(eq(episodes.id, episodeId))
      await emitEvent('workflow.research.completed', { episodeId, data })
      return data
    } catch (e: any) {
      logger.warn('Research failed, using stub', { episodeId, error: e.message })
      const stub = { summary: topic, key_facts: [], angles: [], hook: topic }
      await db.update(episodes).set({ researchData: stub }).where(eq(episodes.id, episodeId))
      return stub
    }
  },

  async generateScripts(episodeId: string, topic: string, research: any) {
    logger.info('AI Worker: scripts', { episodeId })
    await db.update(episodes).set({ agentStep: 'scripts', status: 'scripting' }).where(eq(episodes.id, episodeId))
    await emitEvent('workflow.scripts.started', { episodeId })
    const scripts = await runScriptAgent(topic, research)
    await db.update(episodes).set({ allScripts: scripts as any, agentStep: 'scripts_done' }).where(eq(episodes.id, episodeId))
    await emitEvent('workflow.scripts.completed', { episodeId, count: scripts.scripts.length })
    return scripts
  },

  async evaluate(episodeId: string, scripts: any) {
    logger.info('AI Worker: evaluate', { episodeId })
    await db.update(episodes).set({ agentStep: 'evaluate', status: 'evaluating' }).where(eq(episodes.id, episodeId))
    await emitEvent('workflow.evaluate.started', { episodeId })
    const evaluations = await runEvaluateAgent(scripts)
    await db.update(episodes).set({ evaluations, agentStep: 'evaluate_done' }).where(eq(episodes.id, episodeId))
    await emitEvent('workflow.evaluate.completed', { episodeId, winner: evaluations.winner })
    return evaluations
  },

  async refine(episodeId: string, script: any, topic: string, selectedSpeaker: string = 'both') {
    logger.info('AI Worker: refine', { episodeId, selectedSpeaker })
    await emitEvent('workflow.refine.started', { episodeId })
    const refined = await runRefineAgent(script, topic, selectedSpeaker)
    await emitEvent('workflow.refine.completed', { episodeId })
    return refined
  }
}
