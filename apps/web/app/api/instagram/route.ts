import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { keys, kv } from '@isaii/cache'
import { instagramAuthUrl } from '@isaii/domain-publishing'
import { appUrl, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'

/** Start the instagram OAuth flow. The state ties the callback to this user for 10 minutes. */
export const GET = route(async (req: Request) => {
  const user = await requireUser()
  const base = appUrl(req)
  const state = randomUUID()
  await kv().set(keys.oauthState('instagram', state), user.id, { ex: 600 })
  return NextResponse.redirect(instagramAuthUrl({ appId: process.env.INSTAGRAM_APP_ID ?? '', appSecret: process.env.INSTAGRAM_APP_SECRET ?? '', redirectUri: `${base}/api/instagram/callback` }, state))
})
