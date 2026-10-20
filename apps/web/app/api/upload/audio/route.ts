import { AppError, ErrorCode } from '@isaii/core'
import { getDb } from '@isaii/db'
import { uploadAudio } from '@isaii/domain-episodes'
import { isSupported } from '@isaii/i18n'
import { getStore } from '@isaii/storage'
import { ElevenLabsSTT } from '@isaii/voice'
import { json, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export const POST = route(async (req: Request) => {
  const user = await requireUser()
  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) throw new AppError(ErrorCode.BAD_REQUEST, 'No file uploaded')
  const lang = form.get('language')
  const language = typeof lang === 'string' && isSupported(lang) ? lang : undefined
  const r = await uploadAudio({ db: getDb(), store: getStore(), stt: new ElevenLabsSTT() }, user, { name: file.name, type: file.type, bytes: new Uint8Array(await file.arrayBuffer()) }, language)
  return json({ ...r, lineCount: r.lines.length })
})
