import { db } from '@isaii/db'
import { showFeed } from '@isaii/domain-shows'
import { isEnabled } from '@isaii/flags'
import { appUrl } from '@/server/http'

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  if (!isEnabled('rssHosting')) return new Response('Not found', { status: 404 })
  const { slug } = await ctx.params
  const xml = await showFeed(db, decodeURIComponent(slug), appUrl(req))
  if (!xml) return new Response('Show not found', { status: 404 })
  return new Response(xml, { headers: { 'content-type': 'application/rss+xml; charset=utf-8', 'cache-control': 'public, s-maxage=600, stale-while-revalidate=3600' } })
}
