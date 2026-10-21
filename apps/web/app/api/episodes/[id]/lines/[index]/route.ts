import * as z from 'zod'
import { AppError, ErrorCode } from '@isaii/core'
import { getDb } from '@isaii/db'
import { revoiceLine } from '@isaii/domain-episodes'
import { getStore } from '@isaii/storage'
import { ElevenLabsTTS } from '@isaii/voice'
import { limit } from '@/server/deps'
import { json, readJson, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const Body = z.object({ text: z.string().max(2000).optional(), voiceId: z.string().optional() })

/** Re-voice one line of a produced episode (new words and/or voice) without re-rendering the rest. */
export const POST = route(async (req: Request, ctx: { params: Promise<{ id: string; index: string }> }) => {
  const user = await requireUser()
  const { id, index } = await ctx.params
  const { success } = await limit('revoice', 60, '1 h').limit(user.id)
  if (!success) throw new AppError(ErrorCode.RATE_LIMITED, 'Too many line re-voices this hour.')
  const body = await readJson(req, v => Body.parse(v))
  const r = await revoiceLine({ db: getDb(), store: getStore(), tts: new ElevenLabsTTS() }, user.id, id, { index: Number(index), ...body })
  return json(r)
})
