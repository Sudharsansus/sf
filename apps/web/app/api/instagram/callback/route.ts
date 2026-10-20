import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { keys, kv } from '@isaii/cache'
import { getDb, users } from '@isaii/db'
import { audit, sealToken } from '@isaii/domain-identity'
import { instagramExchangeCode } from '@isaii/domain-publishing'
import { logger } from '@isaii/logger'
import { appUrl } from '@/server/http'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const base = appUrl(req)
  const back = (q: string) => NextResponse.redirect(`${base}/dashboard?${q}`)
  const url = new URL(req.url)
  const code = url.searchParams.get('code'), state = url.searchParams.get('state')
  if (!code || !state) return back('error=oauth_failed')
  const stateKey = keys.oauthState('instagram', state)
  const userId = await kv().get<string>(stateKey)
  if (!userId) return back('error=state_invalid')
  await kv().del(stateKey)
  try {
    const t = await instagramExchangeCode({ appId: process.env.INSTAGRAM_APP_ID ?? '', appSecret: process.env.INSTAGRAM_APP_SECRET ?? '', redirectUri: `${base}/api/instagram/callback` }, code)
    await getDb().update(users).set({ instagramAccessToken: sealToken(t.accessToken), instagramUserId: t.userId, updatedAt: new Date() }).where(eq(users.id, userId))
    await audit(getDb(), { userId, action: 'instagram.connected' })
    return back('instagram=connected')
  } catch (e) {
    logger.error('instagram oauth failed', { error: (e as Error).message })
    return back('error=oauth_failed')
  }
}
