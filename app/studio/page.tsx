'use client'
import { useEffect, useState } from 'react'

export default function StudioPage() {
  const [episodes, setEpisodes] = useState<any[]>([])
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/jobs').then(r=>r.json()).then(d=>setEpisodes(d.data||[])),
      fetch('/api/credits').then(r=>r.json()).then(d=>setCredits(d.credits??null))
    ]).finally(()=>setLoading(false))
  }, [])

  return (
    <div style={{ background:'#0c0c0c', minHeight:'100vh', fontFamily:"'Instrument Sans',sans-serif", color:'#f0f0f0', padding:'60px 40px' }}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:48 }}>
          <div>
            <a href="/" style={{ fontSize:11, color:'#444', fontFamily:'monospace', letterSpacing:0.5, display:'block', marginBottom:16 }}>← HOME</a>
            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:48, fontStyle:'italic', letterSpacing:-2, color:'#f0f0f0' }}>Your Studio</h1>
          </div>
          {credits !== null && (
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:36, letterSpacing:-1, color:'#f0f0f0' }}>{credits}</div>
              <div style={{ fontSize:12, color:'#555' }}>credits remaining</div>
            </div>
          )}
        </div>

        {loading && <p style={{ color:'#444', fontSize:13 }}>Loading…</p>}

        <div style={{ display:'grid', gap:1, background:'#1a1a1a', borderRadius:14, overflow:'hidden' }}>
          {!loading && episodes.length === 0 && (
            <div style={{ background:'#0c0c0c', padding:'48px 28px', textAlign:'center', color:'#444', fontSize:14 }}>
              No episodes yet.{' '}
              <a href="/" style={{ color:'#888', borderBottom:'1px solid #333' }}>Generate your first →</a>
            </div>
          )}
          {episodes.map((ep: any) => (
            <div key={ep.id} style={{ background:'#0c0c0c', padding:'20px 24px', display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:20, transition:'background .15s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='#111')}
              onMouseLeave={e=>(e.currentTarget.style.background='#0c0c0c')}>
              <div>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, fontStyle:'italic', color:'#f0f0f0', marginBottom:4, letterSpacing:-0.5 }}>{ep.title||ep.topic}</div>
                <div style={{ display:'flex', gap:14, fontSize:11, color:'#444', fontFamily:'monospace' }}>
                  <span>{new Date(ep.createdAt).toLocaleDateString()}</span>
                  <span style={{ color: ep.status==='complete'?'#888':ep.status==='failed'?'#ef4444':'#555' }}>
                    {ep.status==='complete'?'● READY':ep.status==='failed'?'✕ FAILED':'◌ '+ep.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                {ep.audioUrl && <audio controls src={ep.audioUrl} style={{ height:30, width:180, opacity:0.7 }} />}
                <a href={`/share/${ep.shareId}`} target="_blank" style={{ fontSize:12, color:'#555', border:'1px solid #222', padding:'5px 12px', borderRadius:6, whiteSpace:'nowrap' }}>Share ↗</a>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500&display=swap');`}</style>
    </div>
  )
}
