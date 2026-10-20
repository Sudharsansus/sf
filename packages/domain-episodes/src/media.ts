import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getEpisode, updateEpisode, type Database } from '@isaii/db'
import { buildCues, toSRT } from '@isaii/media'
import { episodeVideoArgs, runFfmpeg, shortArgs } from '@isaii/media/ffmpeg'
import { storageKeys, type BlobStore } from '@isaii/storage'

export type MediaDeps = { db: Database; store: BlobStore; ffmpeg?: (args: string[]) => Promise<unknown>; fetchImpl?: typeof fetch }

const download = async (f: typeof fetch, url: string) => {
  const res = await f(url)
  if (!res.ok) throw new Error(`download failed ${res.status}: ${url}`)
  return new Uint8Array(await res.arrayBuffer())
}

/** 16:9 MP4: cover + waveform + burnt-in captions (Noto fonts in the worker image shape Indic scripts correctly). */
export async function renderEpisodeVideo(d: MediaDeps, episodeId: string): Promise<string> {
  const ep = await getEpisode(d.db, episodeId)
  if (!ep?.audioUrl) throw new Error('Episode has no audio yet')
  const cover = (ep.thumbnailUrls as string[] | null)?.[0]
  if (!cover) throw new Error('Episode has no thumbnail yet')
  const f = d.fetchImpl ?? fetch
  const ff = d.ffmpeg ?? runFfmpeg
  const dir = await mkdtemp(join(tmpdir(), `isaii-${episodeId}-`))
  try {
    const [audio, image] = await Promise.all([download(f, ep.audioUrl), download(f, cover)])
    await writeFile(join(dir, 'audio.mp3'), audio)
    await writeFile(join(dir, 'cover.png'), image)
    const lines = ((ep.script as { lines?: { text: string }[] } | null)?.lines ?? []).map(l => ({ text: l.text }))
    let subtitles: string | undefined
    if (lines.length) { subtitles = join(dir, 'captions.srt'); await writeFile(subtitles, toSRT(buildCues(lines))) }
    const out = join(dir, 'episode.mp4')
    await ff(episodeVideoArgs({ cover: join(dir, 'cover.png'), audio: join(dir, 'audio.mp3'), out, subtitles }))
    const url = await d.store.put(storageKeys.episodeVideo(episodeId), await readFile(out), { contentType: 'video/mp4' })
    await updateEpisode(d.db, episodeId, { videoUrl: url })
    return url
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

/** 9:16 Short from the first clip the SEO step suggested (or the opening 45s). */
export async function renderShort(d: MediaDeps, episodeId: string): Promise<string> {
  const ep = await getEpisode(d.db, episodeId)
  if (!ep?.videoUrl) throw new Error('Render the episode video first')
  const clip = (ep.seoData as { clip_timestamps?: { start_line: number; duration_seconds: number }[] } | null)?.clip_timestamps?.[0]
  const start = clip ? Math.max(0, clip.start_line * 15 - 1) : 0
  const duration = Math.min(60, Math.max(15, clip?.duration_seconds ?? 45))
  const f = d.fetchImpl ?? fetch
  const ff = d.ffmpeg ?? runFfmpeg
  const dir = await mkdtemp(join(tmpdir(), `isaii-short-${episodeId}-`))
  try {
    await writeFile(join(dir, 'episode.mp4'), await download(f, ep.videoUrl))
    const out = join(dir, 'short.mp4')
    await ff(shortArgs({ video: join(dir, 'episode.mp4'), start, duration, out }))
    const url = await d.store.put(storageKeys.short(episodeId, 0), await readFile(out), { contentType: 'video/mp4' })
    await updateEpisode(d.db, episodeId, { shortUrls: [url] })
    return url
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
