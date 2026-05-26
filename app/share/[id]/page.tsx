import { db, episodes } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const [ep] = await db.select().from(episodes).where(eq(episodes.shareId, params.id)).limit(1)
  if (!ep) return { title: 'Episode not found' }
  return { title: `${ep.title} — SceneForge`, description: ep.topic }
}

export default async function SharePage({ params }: { params: { id: string } }) {
  const [ep] = await db.select().from(episodes).where(eq(episodes.shareId, params.id)).limit(1)
  if (!ep || !ep.isPublic) notFound()
  const script = ep.script as any

  return (
    <div style={{ background:'#0c0c0c', minHeight:'100vh', fontFamily:"'Instrument Sans',sans-serif", color:'#f0f0f0', padding:'60px 24px' }}>
      <div style={{ maxWidth:680, margin:'0 auto' }}>
        <a href="/" style={{ fontSize:12, color:'#444', fontFamily:'monospace', letterSpacing:0.5, display:'inline-block', marginBottom:40 }}>← SCENEFORGE</a>
        <div style={{ marginBottom:8, fontFamily:'monospace', fontSize:10, color:'#444', letterSpacing:1 }}>
          {new Date(ep.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}
        </div>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:'clamp(28px,6vw,52px)', fontStyle:'italic', letterSpacing:-1.5, lineHeight:1.05, color:'#f0f0f0', marginBottom:32 }}>{ep.title}</h1>

        {ep.audioUrl && (
          <div style={{ marginBottom:32, background:'#111', border:'1px solid #1a1a1a', borderRadius:12, padding:'20px 24px' }}>
            <div style={{ fontFamily:'monospace', fontSize:10, color:'#444', letterSpacing:1, marginBottom:12 }}>AUDIO</div>
            <audio controls src={ep.audioUrl} style={{ width:'100%' }} />
          </div>
        )}

        {ep.status !== 'complete' && (
          <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:10, padding:'14px 20px', marginBottom:24, fontSize:13, color:'#555' }}>
            ◌ Audio is rendering… refresh in a moment.
          </div>
        )}

        {script?.lines && (
          <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:14, padding:'28px' }}>
            <div style={{ fontFamily:'monospace', fontSize:10, color:'#444', letterSpacing:1, marginBottom:24 }}>TRANSCRIPT</div>
            {script.lines.map((line: any, i: number) => (
              <div key={i} style={{ display:'flex', gap:16, marginBottom:16 }}>
                <span style={{ fontFamily:'monospace', fontSize:11, color:'#333', marginTop:2, flexShrink:0, width:14 }}>{line.speaker}</span>
                <p style={{ fontSize:14, color:'#888', lineHeight:1.68, margin:0 }}>{line.text}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop:40, textAlign:'center' }}>
          <a href="/" style={{ fontSize:13, color:'#555', borderBottom:'1px solid #2a2a2a', paddingBottom:2 }}>Make your own episode with SceneForge →</a>
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500&display=swap');`}</style>
    </div>
  )
}
