import { designThumbnails, refineScript, writeSEO, type AgentDeps, type Script, type ScriptLine } from '@isaii/agents'
import { completeWorkflowLock, getEpisode, updateEpisode, type Database } from '@isaii/db'
import { renderThumbnail } from '@isaii/media'
import { storageKeys, type BlobStore } from '@isaii/storage'
import { DEFAULT_VOICES, concat, renderLineClips, type TTSProvider } from '@isaii/voice'
import { logger } from '@isaii/logger'

export const LINES_PER_AUDIO_STEP = 12

export type ProduceDeps = { db: Database; store: BlobStore; tts: TTSProvider; agent?: AgentDeps; fetchImpl?: typeof fetch }

export type ChosenScript = { title: string; topic: string; language: string; lines: ScriptLine[]; seconds: number }

export async function refineStep(d: ProduceDeps, e: { episodeId: string; selectedAngle: string; durationLabel: string; selectedSpeaker: string; useExistingScript?: boolean; keepWords?: boolean }): Promise<ChosenScript> {
  const ep = await getEpisode(d.db, e.episodeId)
  if (!ep) throw new Error('Episode not found')
  const all = ep.allScripts as { scripts?: Script[]; language?: string } | null
  const language = ep.language || all?.language || 'en'
  const saved = ep.script as { lines?: ScriptLine[] } | null
  const selected: Script | undefined = e.useExistingScript && saved?.lines?.length
    ? { ...(all?.scripts?.[0] ?? { angle: 'uploaded', hook: '', speakers: [] }), angle: 'uploaded', title: ep.title || ep.topic, lines: saved.lines, duration_estimate_seconds: saved.lines.length * 15 } as Script
    : all?.scripts?.find(s => s.angle === e.selectedAngle)
  if (!selected) throw new Error('Selected script not found')

  await updateEpisode(d.db, e.episodeId, { status: 'producing', agentStep: 'refine' })
  let chosen: Script = selected
  if (!e.useExistingScript && !e.keepWords) {
    try {
      const mode = (['a', 'b', 'both'].includes(e.selectedSpeaker) ? e.selectedSpeaker : 'both') as 'a' | 'b' | 'both'
      chosen = { ...selected, ...(await refineScript(selected, ep.topic, e.durationLabel, mode, language, d.agent)) }
    } catch (err) {
      logger.warn('refine failed, using the selected script', { episodeId: e.episodeId, error: (err as Error).message })
    }
  }
  await updateEpisode(d.db, e.episodeId, { selectedScript: chosen, script: chosen, title: chosen.title, agentStep: 'refined' })
  return { title: chosen.title || ep.topic, topic: ep.topic, language, lines: chosen.lines.map(l => ({ speaker: l.speaker, text: l.text })), seconds: chosen.duration_estimate_seconds }
}

export async function audioPartStep(d: ProduceDeps, e: { episodeId: string; script: ChosenScript; part: number; voices?: { A?: string; B?: string } }) {
  const offset = e.part * LINES_PER_AUDIO_STEP
  const clips = await renderLineClips(d.tts, {
    lines: e.script.lines, offset, count: LINES_PER_AUDIO_STEP,
    voices: { A: e.voices?.A || DEFAULT_VOICES.A, B: e.voices?.B || DEFAULT_VOICES.B }, language: e.script.language,
  })
  // Keep each line's clip so one line can be re-voiced later without re-rendering the episode.
  await Promise.all(clips.map((clip, i) => d.store.put(storageKeys.episodeLine(e.episodeId, offset + i), clip, { contentType: 'audio/mpeg' })))
  await d.store.put(storageKeys.episodeAudioPart(e.episodeId, e.part), concat(clips), { contentType: 'audio/mpeg' })
  return storageKeys.episodeAudioPart(e.episodeId, e.part)
}

export async function audioMergeStep(d: ProduceDeps, e: { episodeId: string; partKeys: string[]; voices?: { A?: string; B?: string } }) {
  const parts = await Promise.all(e.partKeys.map(async k => {
    const p = await d.store.get(k)
    if (!p) throw new Error(`Missing audio part ${k}`)
    return p
  }))
  const url = await d.store.put(storageKeys.episodeAudio(e.episodeId), concat(parts), { contentType: 'audio/mpeg' })
  // Remember the voices so a single line can be re-voiced to match.
  const ep = await getEpisode(d.db, e.episodeId)
  const voices = { A: e.voices?.A || DEFAULT_VOICES.A, B: e.voices?.B || DEFAULT_VOICES.B }
  await updateEpisode(d.db, e.episodeId, { audioUrl: url, script: { ...((ep?.script as object | null) ?? {}), voices } })
  await Promise.all(e.partKeys.map(k => d.store.delete(k).catch(() => undefined)))
  return url
}

export async function thumbnailsStep(d: ProduceDeps, e: { episodeId: string; script: ChosenScript }) {
  const designs = await designThumbnails(e.script.title, e.script.topic, d.agent)
  const urls = await Promise.all(designs.map(async (v, i) => d.store.put(storageKeys.thumbnail(e.episodeId, i), await renderThumbnail(v), { contentType: 'image/png' })))
  await updateEpisode(d.db, e.episodeId, { thumbnailUrls: urls })
  return urls
}

export async function seoStep(d: ProduceDeps, e: { episodeId: string; script: ChosenScript }) {
  const data = await writeSEO(e.script.lines, e.script.topic, e.script.title, e.script.language, d.agent)
  await updateEpisode(d.db, e.episodeId, { seoData: data })
  return data
}

export async function finalizeStep(d: ProduceDeps, e: { episodeId: string; lockKey: string; seconds: number; audioUrl: string; thumbnailUrls: string[]; seo: unknown; partial: boolean }) {
  const status = e.partial ? 'partial_failure' : 'complete'
  await updateEpisode(d.db, e.episodeId, { status, agentStep: 'complete', duration: e.seconds || 90 })
  const ep = await getEpisode(d.db, e.episodeId)
  const result = { episodeId: e.episodeId, shareId: ep?.shareId, title: ep?.title, status, audioUrl: e.audioUrl, thumbnailUrls: e.thumbnailUrls, seoData: e.seo ?? {}, script: ep?.script }
  await completeWorkflowLock(d.db, e.lockKey, result)
  return { episodeId: e.episodeId, status }
}

export const audioPartCount = (lines: number) => Math.max(1, Math.ceil(lines / LINES_PER_AUDIO_STEP))
