import { logger } from './logger'

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/youtube/callback`

export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
    access_type: 'offline',
    prompt: 'consent',
    state
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeCode(code: string): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI, grant_type: 'authorization_code'
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`YouTube OAuth error: ${data.error}`)
  return { accessToken: data.access_token, refreshToken: data.refresh_token }
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken, client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET, grant_type: 'refresh_token'
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Token refresh failed: ${data.error}`)
  return data.access_token
}

export async function uploadVideo(params: {
  accessToken: string
  audioBuffer: Buffer
  title: string
  description: string
  tags: string[]
  thumbnailUrl?: string
}): Promise<{ videoId: string; videoUrl: string }> {
  logger.info('Uploading to YouTube', { title: params.title })

  const metadata = {
    snippet: {
      title: params.title.slice(0, 100),
      description: params.description,
      tags: params.tags.slice(0, 20),
      categoryId: '22' // People & Blogs
    },
    status: { privacyStatus: 'public', selfDeclaredMadeForKids: false }
  }

  const boundary = '-------314159265358979323846'
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelim = `\r\n--${boundary}--`
  const metaPart = delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata)
  const audioPart = '\r\n--' + boundary + '\r\nContent-Type: audio/mpeg\r\n\r\n'
  const body = Buffer.concat([
    Buffer.from(metaPart + audioPart),
    params.audioBuffer,
    Buffer.from(closeDelim)
  ])

  const res = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': `multipart/related; boundary="${boundary}"`,
      'Content-Length': String(body.length)
    },
    body
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`YouTube upload failed ${res.status}: ${err}`)
  }

  const data = await res.json()
  return {
    videoId: data.id,
    videoUrl: `https://www.youtube.com/watch?v=${data.id}`
  }
}

export async function getChannelStats(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  const data = await res.json()
  return data?.items?.[0]?.statistics || {}
}
