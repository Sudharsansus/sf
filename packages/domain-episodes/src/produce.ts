import { AppError, ErrorCode } from '@isaii/core'
import { acquireWorkflowLock, getOwnedEpisode, updateEpisode } from '@isaii/db'
import { sendEvent } from '@isaii/queue'
import type { EpisodeDeps } from './deps'

export type StartProductionInput = {
  userId: string
  episodeId: string
  selectedAngle: string
  durationLabel?: string
  selectedSpeaker?: 'a' | 'b' | 'both'
  voiceA?: string
  voiceB?: string
  useExistingScript?: boolean
  keepWords?: boolean
}

const STALE_MS = 30 * 60_000

/** Lock + queue production. Repeated clicks return the running/finished state instead of double work. */
export async function startProduction(deps: EpisodeDeps, input: StartProductionInput) {
  const ep = await getOwnedEpisode(deps.db, input.episodeId, input.userId)
  if (!ep) throw new AppError(ErrorCode.NOT_FOUND, 'Episode not found')
  const durationLabel = input.durationLabel ?? '5min'
  const scripts = (ep.allScripts as { scripts?: { angle: string }[] } | null)?.scripts ?? []
  if (!input.useExistingScript && !scripts.some(s => s.angle === input.selectedAngle)) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Script angle not found')
  }

  const lockKey = `refine:${ep.id}:${input.selectedAngle}:${durationLabel}${input.keepWords ? ':exact' : ''}`
  const lock = await acquireWorkflowLock(deps.db, { key: lockKey, episodeId: ep.id, step: 'produce', staleMs: STALE_MS, now: deps.now?.() })
  if (lock.state === 'complete') return { episodeId: ep.id, shareId: ep.shareId, status: 'complete' as const, result: lock.result }
  if (lock.state === 'running') return { episodeId: ep.id, shareId: ep.shareId, status: 'producing' as const }

  await updateEpisode(deps.db, ep.id, { status: 'producing', agentStep: 'queued' })
  await sendEvent('episode/produce.requested', {
    episodeId: ep.id, userId: input.userId, selectedAngle: input.selectedAngle, durationLabel,
    selectedSpeaker: input.selectedSpeaker ?? 'both', lockKey, voiceA: input.voiceA, voiceB: input.voiceB, useExistingScript: input.useExistingScript, keepWords: input.keepWords,
  }, deps.send)
  return { episodeId: ep.id, shareId: ep.shareId, status: 'producing' as const }
}
