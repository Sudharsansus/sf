import { getDb } from '@isaii/db'
import { createShow, listShowsWithCounts, ShowInput } from '@isaii/domain-shows'
import { AppError, ErrorCode } from '@isaii/core'
import { isEnabled } from '@isaii/flags'
import { json, readJson, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'

const guard = () => { if (!isEnabled('shows')) throw new AppError(ErrorCode.NOT_FOUND, 'Not found') }

export const GET = route(async () => {
  guard()
  const user = await requireUser()
  return json(await listShowsWithCounts(getDb(), user.id))
})

export const POST = route(async (req: Request) => {
  guard()
  const user = await requireUser()
  const body = await readJson(req, v => ShowInput.parse(v))
  return json(await createShow(getDb(), user.id, body), 201)
})
