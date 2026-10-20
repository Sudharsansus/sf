import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { keys, kv } from '@isaii/cache'
import { getDb, users } from '@isaii/db'
import { audit, sealToken } from '@isaii/domain-identity'
import { youtubeExchangeCode } from '@isaii/domain-publishing'
import { logger } from '@isaii/logger'
import { appUrl } from '@/server/http'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const base = appUrl(req)
  const back = (q: string) => NextResponse.redirect(`${base}/dashboard?${q}`)
  const url = new URL(req.url)
  const code = url.searchParams.get('code'), state = url.searchParams.get('state')
  if (!code || !state) return back('error=oauth_failed')
  const stateKey = keys.oauthState('youtube', state)
  const userId = await kv().get<string>(stateKey)
  if (!userId) return back('error=state_invalid')
  await kv().del(stateKey)
  try {
    const t = await youtubeExchangeCode({ clientId: process.env.YOUTUBE_CLIENT_ID ?? '', clientSecret: process.env.YOUTUBE_CLIENT_SECRET ?? '', redirectUri: `${base}/api/youtube/callback` }, code)
    await getDb().update(users).set({ youtubeAccessToken: sealToken(t.accessToken), youtubeRefreshToken: sealToken(t.refreshToken), updatedAt: new Date() }).where(eq(users.id, userId))
    await audit(getDb(), { userId, action: 'youtube.connected' })
    return back('youtube=connected')
  } catch (e) {
    logger.error('youtube oauth failed', { error: (e as Error).message })
    return back('error=oauth_failed')
  }
}
