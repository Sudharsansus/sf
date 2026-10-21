import { AppError, ErrorCode } from '@isaii/core'
import { getOwnedEpisode, updateEpisode } from '@isaii/db'
import { sanitizeText } from '@isaii/security'
import { storageKeys } from '@isaii/storage'
import { DEFAULT_VOICES, concat, isKnownVoice } from '@isaii/voice'
import type { ScriptLine } from '@isaii/agents'
import type { ProduceDeps } from './pipeline/produce-steps'

type StoredScript = { lines?: ScriptLine[]; voices?: { A?: string; B?: string }; clipsStale?: boolean } & Record<string, unknown>

/**
 * Re-voice one line of a produced episode — optionally with new words or a different voice — then
 * rebuild the episode audio from the stored per-line clips. Only that line is sent to TTS.
 */
export async function revoiceLine(
  d: Pick<ProduceDeps, 'db' | 'store' | 'tts'>,
  userId: string,
  episodeId: string,
  input: { index: number; text?: string; voiceId?: string },
): Promise<{ audioUrl: string; line: ScriptLine }> {
  const ep = await getOwnedEpisode(d.db, episodeId, userId)
  if (!ep) throw new AppError(ErrorCode.NOT_FOUND, 'Episode not found')
  const script = (ep.script ?? {}) as StoredScript
  const lines = script.lines ?? []
  if (!ep.audioUrl || !lines.length) throw new AppError(ErrorCode.CONFLICT, 'Produce the episode first')
  const old = lines[input.index]
  if (!Number.isInteger(input.index) || !old) throw new AppError(ErrorCode.BAD_REQUEST, 'Line not found')
  if (script.clipsStale) throw new AppError(ErrorCode.CONFLICT, 'Lines were added, removed or swapped since the audio was made — produce the episode again')
  if (input.voiceId && !isKnownVoice(input.voiceId)) throw new AppError(ErrorCode.BAD_REQUEST, 'Unknown voice')

  // Every clip must exist (episodes produced before per-line clips were stored cannot be patched).
  const clips = await Promise.all(lines.map((_, i) => d.store.get(storageKeys.episodeLine(episodeId, i))))
  if (clips.some(c => !c)) throw new AppError(ErrorCode.CONFLICT, 'This episode was produced before line editing existed — produce it again to enable it')

  const text = input.text === undefined ? old.text : sanitizeText(input.text, 2000)
  if (!text) throw new AppError(ErrorCode.BAD_REQUEST, 'Line text is empty')
  const voices = { A: script.voices?.A || DEFAULT_VOICES.A, B: script.voices?.B || DEFAULT_VOICES.B }
  const clip = await d.tts.synthesize({
    text, voiceId: input.voiceId ?? (old.speaker === 'B' ? voices.B : voices.A), language: ep.language || 'en',
    previous: lines[input.index - 1]?.text, next: lines[input.index + 1]?.text,
  })
  await d.store.put(storageKeys.episodeLine(episodeId, input.index), clip, { contentType: 'audio/mpeg' })
  clips[input.index] = clip

  const line = { ...old, text }
  const url = await d.store.put(storageKeys.episodeAudio(episodeId), concat(clips as Uint8Array[]), { contentType: 'audio/mpeg' })
  // Same object key, so bust caches for players that already loaded the old file.
  const audioUrl = `${url.split('?')[0]}?v=${Date.now()}`
  await updateEpisode(d.db, episodeId, { audioUrl, script: { ...script, lines: lines.map((l, i) => (i === input.index ? line : l)) } })
  return { audioUrl, line }
}
