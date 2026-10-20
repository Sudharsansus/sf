import { evaluateScripts, research, writeScripts, type AgentDeps, type Research, type Scripts } from '@isaii/agents'
import { updateEpisode, type Database } from '@isaii/db'
import { logger } from '@isaii/logger'

export type StepDeps = { db: Database; agent?: AgentDeps }

/** Research is helpful but optional — scripts can still be written from the topic alone. */
export async function researchStep(d: StepDeps, e: { episodeId: string; topic: string; language: string }): Promise<Research | { summary: string; key_facts: string[]; angles: never[]; hook: string }> {
  await updateEpisode(d.db, e.episodeId, { status: 'researching', agentStep: 'research' })
  try {
    const data = await research(e.topic, e.language, d.agent)
    await updateEpisode(d.db, e.episodeId, { researchData: data, agentStep: 'research_done' })
    return data
  } catch (err) {
    logger.warn('research failed, continuing without it', { episodeId: e.episodeId, error: (err as Error).message })
    return { summary: e.topic, key_facts: [], angles: [], hook: e.topic }
  }
}

export async function scriptsStep(d: StepDeps, e: { episodeId: string; topic: string; language: string; research: unknown }): Promise<Scripts> {
  await updateEpisode(d.db, e.episodeId, { status: 'scripting', agentStep: 'scripts' })
  const data = await writeScripts(e.topic, e.research, e.language, d.agent)
  await updateEpisode(d.db, e.episodeId, { allScripts: { ...data, language: e.language }, agentStep: 'scripts_done' })
  return data
}

export async function evaluateStep(d: StepDeps, e: { episodeId: string; scripts: Scripts }) {
  await updateEpisode(d.db, e.episodeId, { status: 'evaluating', agentStep: 'evaluate' })
  try {
    const data = await evaluateScripts(e.scripts, d.agent)
    await updateEpisode(d.db, e.episodeId, { evaluations: data, agentStep: 'evaluate_done' })
    return data
  } catch (err) {
    logger.warn('scoring failed, using script order', { episodeId: e.episodeId, error: (err as Error).message })
    return { scores: [], winner: e.scripts.scripts[0]?.angle ?? '', runner_up: e.scripts.scripts[1]?.angle ?? '' }
  }
}

export async function readyStep(d: StepDeps, e: { episodeId: string; topic: string; scripts: Scripts; winner: string }) {
  const winner = e.scripts.scripts.find(s => s.angle === e.winner) ?? e.scripts.scripts[0]
  await updateEpisode(d.db, e.episodeId, { status: 'awaiting_selection', agentStep: 'awaiting_selection', title: winner?.title || e.topic })
}
