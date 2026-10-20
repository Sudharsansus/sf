import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { AppError, ErrorCode } from '@isaii/core'
import { createEpisode, episodes, type Database } from '@isaii/db'
import { planLimits, withCharge } from '@isaii/domain-billing'
import { safeFilename } from '@isaii/security'
import { storageKeys, type BlobStore } from '@isaii/storage'
import { wordsToLines, type STTProvider } from '@isaii/voice'
import { extractText, parseScriptLines } from './parse'

export const LIMITS = { scriptBytes: 5 * 1024 * 1024, audioBytes: 25 * 1024 * 1024 }
const AUDIO_EXT = /\.(mp3|wav|m4a|ogg|webm|aac|flac)$/i

type User = { id: string; plan: string }
type UploadFile = { name: string; type: string; bytes: Uint8Array }

/** Free plans get one upload of each kind; paid plans pay 1 credit (refunded if anything fails). */
async function chargeOrFreeOnce<T>(db: Database, user: User, step: 'script_uploaded' | 'audio_uploaded', work: () => Promise<T>): Promise<T> {
  if (planLimits(user.plan).freeUploads) {
    const [used] = await db.select({ id: episodes.id }).from(episodes).where(and(eq(episodes.userId, user.id), eq(episodes.agentStep, step))).limit(1)
    if (used) throw new AppError(ErrorCode.PAYMENT_REQUIRED, 'Free accounts can upload once. Upgrade for unlimited uploads.', { details: { upgrade: true } })
    return work()
  }
  return withCharge(db, user.id, 1, step === 'script_uploaded' ? 'script_upload' : 'audio_upload', work)
}

const titleFrom = (name: string) => safeFilename(name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')) || 'Untitled'

export async function uploadScript(deps: { db: Database }, user: User, file: UploadFile, language = 'en') {
  if (file.bytes.length > LIMITS.scriptBytes) throw new AppError(ErrorCode.BAD_REQUEST, 'File too large. Max 5MB.')
  const text = (await extractText(file.bytes, file.name)).trim()
  if (text.length < 10) throw new AppError(ErrorCode.UNPROCESSABLE, 'Could not read any text from that file.')
  const lines = parseScriptLines(text)
  if (!lines.length) throw new AppError(ErrorCode.UNPROCESSABLE, 'No script lines found in that file.')

  return chargeOrFreeOnce(deps.db, user, 'script_uploaded', async () => {
    const title = titleFrom(file.name)
    const ep = await createEpisode(deps.db, {
      userId: user.id, topic: title, title, language, shareId: randomUUID().replace(/-/g, ''),
      status: 'awaiting_selection', agentStep: 'script_uploaded', script: { lines },
      allScripts: { language, scripts: [{ angle: 'uploaded', title, hook: lines[0]?.text ?? '', lines, speakers: [], duration_estimate_seconds: lines.length * 15 }] },
      idempotencyKey: randomUUID(),
    })
    return { episodeId: ep.id, shareId: ep.shareId, title, lines }
  })
}

export async function uploadAudio(deps: { db: Database; store: BlobStore; stt: STTProvider }, user: User, file: UploadFile, language?: string) {
  if (file.bytes.length > LIMITS.audioBytes) throw new AppError(ErrorCode.BAD_REQUEST, 'File too large. Max 25MB.')
  if (!file.type.startsWith('audio/') && !AUDIO_EXT.test(file.name)) throw new AppError(ErrorCode.BAD_REQUEST, 'Upload an audio file (.mp3, .wav, .m4a).')

  return chargeOrFreeOnce(deps.db, user, 'audio_uploaded', async () => {
    const episodeId = randomUUID()
    const ext = file.name.split('.').pop() || 'mp3'
    const audioUrl = await deps.store.put(storageKeys.upload(user.id, episodeId, ext), file.bytes, { contentType: file.type || 'audio/mpeg' })
    const { text, words } = await deps.stt.transcribe({ audio: file.bytes, mimeType: file.type || 'audio/mpeg', language })
    const lines = wordsToLines(words, text)
    if (!lines.length) throw new AppError(ErrorCode.UNPROCESSABLE, 'No speech was found in that recording.')
    const title = titleFrom(file.name)
    const ep = await createEpisode(deps.db, {
      id: episodeId, userId: user.id, topic: title, title, language: language ?? 'en', shareId: randomUUID().replace(/-/g, ''),
      status: 'awaiting_selection', agentStep: 'audio_uploaded', audioUrl, script: { lines },
      allScripts: { language, scripts: [{ angle: 'uploaded', title, hook: lines[0]?.text ?? '', lines, speakers: [], duration_estimate_seconds: lines.length * 15 }] },
      idempotencyKey: randomUUID(),
    })
    return { episodeId: ep.id, shareId: ep.shareId, title, audioUrl, lines }
  })
}
