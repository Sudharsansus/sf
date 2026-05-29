import { db, episodes } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const [ep] = await db.select().from(episodes).where(eq(episodes.shareId, params.id)).limit(1)
  if (!ep) return { title: 'Episode not found' }
  return {
    title: `${ep.title} — SUS`,
    description: ep.topic,
    openGraph: { title: ep.title, description: ep.topic, type: 'website' },
    twitter: { card: 'summary_large_image', title: ep.title, description: ep.topic }
  }
}

export default async function SharePage({ params }: { params: { id: string } }) {
  const [ep] = await db.select().from(episodes)
    .where(and(eq(episodes.shareId, params.id), eq(episodes.isPublic, true)))
    .limit(1)
  if (!ep) notFound()
  const script = ep.script as any
  const thumbs = (ep.thumbnailUrls as string[]) || []
  const seo = ep.seoData as any

  const c = {
    bg: '#0a0a0a', surface: '#141414', surface2: '#1a1a1a',
    border: '#1e1e1e', border2: '#2a2a2a',
    text: '#f5f5f5', muted: '#888', subtle: '#444',
  }

  return (
    <div style={{ background: c.bg, minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", color: c.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        @media (max-width: 768px) {
          .share-grid { grid-template-columns: 1fr !important; }
          .share-pad { padding: 40px 20px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${c.border}`, padding: '0 24px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1080, margin: '0 auto' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: -.3 }}>SUS</span>
        </a>
        <a href="/login" style={{ fontSize: 13, fontWeight: 500, background: c.text, color: c.bg, padding: '7px 16px', borderRadius: 7 }}>Make your own →</a>
      </nav>

      {/* HERO */}
      <div className="share-pad" style={{ maxWidth: 1080, margin: '0 auto', padding: '88px 24px 0' }}>

        {/* THUMBNAIL + META */}
        <div className="share-grid" style={{ display: 'grid', gridTemplateColumns: thumbs.length > 0 ? '280px 1fr' : '1fr', gap: 40, marginBottom: 40, alignItems: 'start' }}>
          {thumbs.length > 0 && (
            <img src={thumbs[0]} alt={ep.title} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12, border: `1px solid ${c.border}` }} />
          )}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
              {new Date(ep.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h1 style={{ fontSize: 'clamp(22px,3vw,42px)', fontWeight: 600, letterSpacing: -.8, lineHeight: 1.15, marginBottom: 16 }}>{ep.title}</h1>
            <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.7, marginBottom: 24, maxWidth: 480 }}>{ep.topic}</p>

            {ep.status !== 'complete' && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: c.muted, background: c.surface, border: `1px solid ${c.border}`, padding: '8px 14px', borderRadius: 8, marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fb923c', display: 'inline-block' }} />
                Audio rendering… refresh in a moment
              </div>
            )}

            {ep.audioUrl && (
              <div style={{ marginBottom: 20 }}>
                <audio controls src={ep.audioUrl} style={{ width: '100%', maxWidth: 480 }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ep.audioUrl && (
                <a href={ep.audioUrl} download="episode.mp3" style={{ fontSize: 12, fontWeight: 500, color: c.text, border: `1px solid ${c.border}`, padding: '8px 16px', borderRadius: 7, display: 'inline-flex', alignItems: 'center', gap: 6 }}>↓ Download MP3</a>
              )}
              {ep.youtubeUrl && (
                <a href={ep.youtubeUrl} target="_blank" style={{ fontSize: 12, fontWeight: 500, color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', padding: '8px 16px', borderRadius: 7, display: 'inline-flex', alignItems: 'center', gap: 6 }}>▶ YouTube</a>
              )}
              <a href="/" style={{ fontSize: 12, fontWeight: 500, color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', padding: '8px 16px', borderRadius: 7, display: 'inline-flex', alignItems: 'center', gap: 6 }}>+ Make your own</a>
            </div>
          </div>
        </div>

        {/* THUMBNAILS ROW */}
        {thumbs.length > 1 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 40, overflowX: 'auto' }}>
            {thumbs.map((url: string, i: number) => (
              <img key={i} src={url} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: `1px solid ${c.border}`, flexShrink: 0 }} />
            ))}
          </div>
        )}

        {/* SEO PREVIEW */}
        {seo?.youtube?.title && (
          <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, padding: '20px 24px', marginBottom: 32, background: c.surface }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: c.subtle, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>YouTube title</p>
            <p style={{ fontSize: 15, fontWeight: 500, color: c.text, marginBottom: 8 }}>{seo.youtube.title}</p>
            {seo.youtube.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {seo.youtube.tags.slice(0, 8).map((tag: string) => (
                  <span key={tag} style={{ fontSize: 10, color: c.muted, border: `1px solid ${c.border}`, padding: '2px 8px', borderRadius: 4 }}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRANSCRIPT */}
        {script?.lines && (
          <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 48 }}>
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1, textTransform: 'uppercase' }}>Transcript</p>
              <span style={{ fontSize: 11, color: c.subtle }}>{script.lines.length} lines</span>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 480, overflowY: 'auto' }}>
              {script.lines.map((line: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: line.speaker === 'A' ? '#60a5fa' : '#a78bfa', flexShrink: 0, width: 16, paddingTop: 2 }}>{line.speaker}</span>
                  <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.7, margin: 0 }}>{line.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '48px 0 80px', borderTop: `1px solid ${c.border}` }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: -.4, marginBottom: 10 }}>Make your own episode</h2>
          <p style={{ fontSize: 14, color: c.muted, marginBottom: 24 }}>3 free episodes. No card required.</p>
          <a href="/login" style={{ fontSize: 14, fontWeight: 500, background: c.text, color: c.bg, padding: '12px 32px', borderRadius: 8, display: 'inline-block' }}>Start for free →</a>
        </div>
      </div>
    </div>
  )
}
