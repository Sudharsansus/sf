import * as z from 'zod'
import { AppError, ErrorCode } from '@isaii/core'
import { ScriptLine } from '@isaii/contracts'
import { getDb, getOwnedEpisode, updateEpisode } from '@isaii/db'
import { json, readJson, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'

const Body = z.object({ lines: z.array(ScriptLine).min(1).max(2000), title: z.string().max(200).optional() })

/** Save an edited script from the editor. */
export const PATCH = route(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params
  const user = await requireUser()
  const ep = await getOwnedEpisode(getDb(), id, user.id)
  if (!ep) throw new AppError(ErrorCode.NOT_FOUND, 'Not found')
  const body = await readJson(req, v => Body.parse(v))
  const lines = body.lines.map(l => ({ speaker: l.speaker, text: l.text.trim().slice(0, 1000) })).filter(l => l.text)
  const prev = (ep.script ?? {}) as { lines?: { speaker: string }[]; voices?: unknown; clipsStale?: boolean }
  // Per-line clips only line up while lines keep their positions and speakers.
  const structureChanged = !prev.lines || prev.lines.length !== lines.length || prev.lines.some((l, i) => l.speaker !== lines[i]!.speaker)
  const script = { lines, voices: prev.voices, clipsStale: !!prev.clipsStale || structureChanged }
  // A produced episode stays produced; re-voice lines or produce again to hear the edits.
  const status = ep.audioUrl ? ep.status : 'awaiting_selection'
  await updateEpisode(getDb(), id, { script, title: body.title || ep.title, status, agentStep: 'script_edited' })
  return json({ ok: true, lines: lines.length })
})
