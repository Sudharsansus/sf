import { logger } from './logger'

const APP_ID = process.env.INSTAGRAM_APP_ID!
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`

export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'instagram_basic,instagram_content_publish,instagram_manage_insights',
    response_type: 'code',
    state
  })
  return `https://www.facebook.com/v19.0/dialog/oauth?${params}`
}

export async function exchangeCode(code: string): Promise<{ accessToken: string; userId: string }> {
  const res = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: APP_ID, client_secret: APP_SECRET,
      redirect_uri: REDIRECT_URI, code
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Instagram OAuth error: ${data.error?.message}`)

  // Get Instagram user ID
  const userRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${data.access_token}`
  )
  const userData = await userRes.json()
  const page = userData?.data?.[0]
  if (!page) throw new Error('No Instagram Business page found')

  const igRes = await fetch(
    `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
  )
  const igData = await igRes.json()
  const igUserId = igData?.instagram_business_account?.id
  if (!igUserId) throw new Error('No Instagram Business account linked')

  return { accessToken: page.access_token, userId: igUserId }
}

export async function createReelContainer(params: {
  accessToken: string
  userId: string
  videoUrl: string
  caption: string
}): Promise<string> {
  logger.info('Creating Instagram Reel container')
  const res = await fetch(`https://graph.facebook.com/v19.0/${params.userId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'REELS',
      video_url: params.videoUrl,
      caption: params.caption,
      access_token: params.accessToken
    })
  })
  const data = await res.json()
  if (!res.ok || !data.id) throw new Error(`Instagram container error: ${JSON.stringify(data)}`)
  return data.id
}

export async function publishReel(params: {
  accessToken: string
  userId: string
  containerId: string
}): Promise<string> {
  logger.info('Publishing Instagram Reel')
  const res = await fetch(`https://graph.facebook.com/v19.0/${params.userId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: params.containerId,
      access_token: params.accessToken
    })
  })
  const data = await res.json()
  if (!res.ok || !data.id) throw new Error(`Instagram publish error: ${JSON.stringify(data)}`)
  return data.id
}
