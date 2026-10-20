export type InstagramConfig = { appId: string; appSecret: string; redirectUri: string }
const GRAPH = 'https://graph.facebook.com/v19.0'

export function instagramAuthUrl(cfg: InstagramConfig, state: string) {
  const params = new URLSearchParams({ client_id: cfg.appId, redirect_uri: cfg.redirectUri, response_type: 'code', state, scope: 'instagram_basic,instagram_content_publish,instagram_manage_insights' })
  return `https://www.facebook.com/v19.0/dialog/oauth?${params}`
}

export async function instagramExchangeCode(cfg: InstagramConfig, code: string, fetchImpl: typeof fetch = fetch) {
  const res = await fetchImpl(`${GRAPH}/oauth/access_token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: cfg.appId, client_secret: cfg.appSecret, redirect_uri: cfg.redirectUri, code }),
  })
  const data = await res.json() as { access_token?: string; error?: { message?: string } }
  if (!res.ok || !data.access_token) throw new Error(`Instagram OAuth error: ${data.error?.message ?? res.status}`)
  const pages = await (await fetchImpl(`${GRAPH}/me/accounts?access_token=${data.access_token}`)).json() as { data?: { id: string; access_token: string }[] }
  const page = pages.data?.[0]
  if (!page) throw new Error('No Facebook Page linked to an Instagram Business account')
  const ig = await (await fetchImpl(`${GRAPH}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`)).json() as { instagram_business_account?: { id: string } }
  if (!ig.instagram_business_account?.id) throw new Error('No Instagram Business account linked')
  return { accessToken: page.access_token, userId: ig.instagram_business_account.id }
}

/** Publish a Reel from a public MP4 URL (a 9:16 Short rendered by worker-media). */
export async function instagramPublishReel(p: { accessToken: string; userId: string; videoUrl: string; caption: string; pollMs?: number; maxPolls?: number }, fetchImpl: typeof fetch = fetch) {
  const create = await fetchImpl(`${GRAPH}/${p.userId}/media`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_type: 'REELS', video_url: p.videoUrl, caption: p.caption, access_token: p.accessToken }),
  })
  const container = await create.json() as { id?: string }
  if (!create.ok || !container.id) throw new Error(`Instagram container error: ${JSON.stringify(container).slice(0, 200)}`)
  for (let i = 0; i < (p.maxPolls ?? 30); i++) {
    const s = await (await fetchImpl(`${GRAPH}/${container.id}?fields=status_code&access_token=${p.accessToken}`)).json() as { status_code?: string }
    if (s.status_code === 'FINISHED') break
    if (s.status_code === 'ERROR') throw new Error('Instagram could not process the video')
    await new Promise(r => setTimeout(r, p.pollMs ?? 5000))
  }
  const pub = await fetchImpl(`${GRAPH}/${p.userId}/media_publish`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ creation_id: container.id, access_token: p.accessToken }),
  })
  const done = await pub.json() as { id?: string }
  if (!pub.ok || !done.id) throw new Error(`Instagram publish error: ${JSON.stringify(done).slice(0, 200)}`)
  return { postId: done.id }
}

export function reelCaption(caption: string, hashtags: string[]) {
  const tags = hashtags.slice(0, 25).map(h => `#${h.replace(/^#/, '').replace(/\s+/g, '')}`).join(' ')
  return `${caption}\n\n${tags}`.trim().slice(0, 2200)
}
