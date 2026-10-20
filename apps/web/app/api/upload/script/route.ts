import { AppError, ErrorCode } from '@isaii/core'
import { getDb } from '@isaii/db'
import { uploadScript } from '@isaii/domain-episodes'
import { isSupported } from '@isaii/i18n'
import { json, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export const POST = route(async (req: Request) => {
  const user = await requireUser()
  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) throw new AppError(ErrorCode.BAD_REQUEST, 'No file uploaded')
  const language = String(form.get('language') ?? 'en')
  const r = await uploadScript({ db: getDb() }, user, { name: file.name, type: file.type, bytes: new Uint8Array(await file.arrayBuffer()) }, isSupported(language) ? language : 'en')
  return json({ ...r, lineCount: r.lines.length })
})
