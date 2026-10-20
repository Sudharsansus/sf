export type YouTubeConfig = { clientId: string; clientSecret: string; redirectUri: string }

const AUTH = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN = 'https://oauth2.googleapis.com/token'

export function youtubeAuthUrl(cfg: YouTubeConfig, state: string) {
  const params = new URLSearchParams({
    client_id: cfg.clientId, redirect_uri: cfg.redirectUri, response_type: 'code', access_type: 'offline', prompt: 'consent', state,
    scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
  })
  return `${AUTH}?${params}`
}

export async function youtubeExchangeCode(cfg: YouTubeConfig, code: string, fetchImpl: typeof fetch = fetch) {
  const res = await fetchImpl(TOKEN, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: cfg.clientId, client_secret: cfg.clientSecret, redirect_uri: cfg.redirectUri, grant_type: 'authorization_code' }),
  })
  const data = await res.json() as { access_token?: string; refresh_token?: string; error?: string }
  if (!res.ok || !data.access_token) throw new Error(`YouTube OAuth error: ${data.error ?? res.status}`)
  return { accessToken: data.access_token, refreshToken: data.refresh_token ?? null }
}

export async function youtubeRefresh(cfg: YouTubeConfig, refreshToken: string, fetchImpl: typeof fetch = fetch) {
  const res = await fetchImpl(TOKEN, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ refresh_token: refreshToken, client_id: cfg.clientId, client_secret: cfg.clientSecret, grant_type: 'refresh_token' }),
  })
  const data = await res.json() as { access_token?: string; error?: string }
  if (!res.ok || !data.access_token) throw new Error(`Token refresh failed: ${data.error ?? res.status}`)
  return data.access_token
}

/** Upload an MP4 (rendered by worker-media). Uploads as private by default — the creator publishes in YouTube Studio or via `privacy`. */
export async function youtubeUploadVideo(p: {
  accessToken: string; video: Uint8Array; title: string; description: string; tags: string[]
  privacy?: 'private' | 'unlisted' | 'public'; language?: string
}, fetchImpl: typeof fetch = fetch) {
  const metadata = {
    snippet: { title: p.title.slice(0, 100), description: p.description.slice(0, 5000), tags: p.tags.slice(0, 20), categoryId: '22', defaultLanguage: p.language, defaultAudioLanguage: p.language },
    status: { privacyStatus: p.privacy ?? 'private', selfDeclaredMadeForKids: false },
  }
  const boundary = `isaii-${Date.now()}`
  const head = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: video/mp4\r\n\r\n`
  const tail = `\r\n--${boundary}--`
  const body = Buffer.concat([Buffer.from(head), Buffer.from(p.video), Buffer.from(tail)])
  const res = await fetchImpl('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status', {
    method: 'POST', headers: { Authorization: `Bearer ${p.accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` }, body,
  })
  if (!res.ok) throw new Error(`YouTube upload failed ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json() as { id: string }
  return { videoId: data.id, videoUrl: `https://www.youtube.com/watch?v=${data.id}` }
}
