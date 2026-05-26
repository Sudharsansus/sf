'use client'
import { useState, useEffect } from 'react'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/analytics').then(r=>r.json()).then(setData)
  }, [])

  const episodes = data?.episodes || []
  const channelStats = data?.channelStats || {}

  return (
    <div style={{ background:'#0c0c0c', minHeight:'100vh', fontFamily:"'Instrument Sans',sans-serif", color:'#f0f0f0', padding:'60px 40px' }}>
      <div style={{ maxWidth:960, margin:'0 auto' }}>
        <a href="/" style={{ fontSize:11, color:'#444', fontFamily:'monospace', letterSpacing:0.5, display:'block', marginBottom:16 }}>← HOME</a>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:44, fontStyle:'italic', letterSpacing:-2, marginBottom:40 }}>Analytics</h1>

        {/* CHANNEL STATS */}
        {channelStats.viewCount && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'#1a1a1a', borderRadius:14, overflow:'hidden', marginBottom:32 }}>
            {[
              [Number(channelStats.viewCount).toLocaleString(), 'Total YouTube views'],
              [Number(channelStats.subscriberCount).toLocaleString(), 'Subscribers'],
              [Number(channelStats.videoCount).toLocaleString(), 'Videos uploaded'],
              [episodes.length, 'Episodes generated']
            ].map(([v,l]) => (
              <div key={String(l)} style={{ background:'#0c0c0c', padding:'24px 22px' }}>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:36, letterSpacing:-2, lineHeight:1, marginBottom:6 }}>{v}</div>
                <div style={{ fontSize:12, color:'#555' }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* EPISODES TABLE */}
        <div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, fontStyle:'italic', letterSpacing:-1, marginBottom:16 }}>Episodes</h2>
          <div style={{ display:'grid', gap:1, background:'#1a1a1a', borderRadius:12, overflow:'hidden' }}>
            {episodes.length === 0 && (
              <div style={{ background:'#0c0c0c', padding:'32px', textAlign:'center', color:'#444', fontSize:13 }}>
                No episodes yet. <a href="/" style={{ color:'#888', borderBottom:'1px solid #333' }}>Generate your first →</a>
              </div>
            )}
            {episodes.map((ep:any) => (
              <div key={ep.id} style={{ background:'#0c0c0c', padding:'18px 22px', display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:16, transition:'background .15s' }}
                onMouseEnter={e=>(e.currentTarget.style.background='#111')} onMouseLeave={e=>(e.currentTarget.style.background='#0c0c0c')}>
                <div>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:16, fontStyle:'italic', marginBottom:4 }}>{ep.title||ep.topic}</div>
                  <div style={{ display:'flex', gap:12, fontSize:11, color:'#444', fontFamily:'monospace' }}>
                    <span>{new Date(ep.createdAt).toLocaleDateString()}</span>
                    <span style={{ color: ep.status==='complete'?'#4ade80':ep.status==='failed'?'#ef4444':'#666' }}>
                      {ep.status==='complete'?'● READY':ep.status==='failed'?'✕ FAILED':'◌ '+ep.status}
                    </span>
                    {ep.youtubeUrl && <a href={ep.youtubeUrl} target="_blank" style={{ color:'#555' }}>YouTube ↗</a>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  {ep.audioUrl && <audio controls src={ep.audioUrl} style={{ height:28, width:160, opacity:0.6 }} />}
                  <a href={`/share/${ep.shareId}`} target="_blank" style={{ fontSize:12, color:'#555', border:'1px solid #222', padding:'5px 12px', borderRadius:6, whiteSpace:'nowrap', textDecoration:'none' }}>Share ↗</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500&display=swap');`}</style>
    </div>
  )
}
