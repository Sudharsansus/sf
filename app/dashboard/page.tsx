'use client'
import { useState, useEffect } from 'react'

const PLANS = [
  { id:'starter', name:'Starter', credits:50, price:'$9', desc:'Perfect for testing' },
  { id:'pro', name:'Pro', credits:200, price:'$29', desc:'For regular creators' },
  { id:'enterprise', name:'Enterprise', credits:1000, price:'$99', desc:'Unlimited production' }
]

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [episodes, setEpisodes] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/credits').then(r=>r.json()),
      fetch('/api/analytics').then(r=>r.json())
    ]).then(([cred, analytics]) => {
      setData({ ...cred, connected: analytics?.connected || {} })
      setEpisodes(analytics?.episodes?.slice(0,5) || [])
    })
  }, [])

  return (
    <div style={{ background:'#0c0c0c', minHeight:'100vh', fontFamily:"'Instrument Sans',sans-serif", color:'#f0f0f0', padding:'60px 40px' }}>
      <div style={{ maxWidth:960, margin:'0 auto' }}>
        <a href="/" style={{ fontSize:11, color:'#444', fontFamily:'monospace', letterSpacing:0.5, display:'block', marginBottom:16 }}>← HOME</a>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:44, fontStyle:'italic', letterSpacing:-2, marginBottom:40 }}>Dashboard</h1>

        {/* STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'#1a1a1a', borderRadius:14, overflow:'hidden', marginBottom:32 }}>
          {[[String(data?.credits ?? '—'),'Credits remaining'],[String(episodes.length),'Episodes generated'],[data?.plan?.toUpperCase()||'—','Current plan']].map(([v,l]) => (
            <div key={l} style={{ background:'#0c0c0c', padding:'28px 24px' }}>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:44, letterSpacing:-2, lineHeight:1, marginBottom:6 }}>{v}</div>
              <div style={{ fontSize:13, color:'#555' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* CONNECT PLATFORMS */}
        <div style={{ marginBottom:32 }}>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, fontStyle:'italic', letterSpacing:-1, marginBottom:16 }}>Connect platforms</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:12, padding:'20px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>▶ YouTube</div>
                <div style={{ fontSize:12, color: data?.connected?.youtube?'#4ade80':'#555' }}>{data?.connected?.youtube ? '● Connected' : 'Not connected'}</div>
              </div>
              {!data?.connected?.youtube && (
                <a href="/api/youtube" style={{ fontSize:12, fontWeight:500, color:'#0c0c0c', background:'#f0f0f0', padding:'8px 16px', borderRadius:7, textDecoration:'none' }}>Connect</a>
              )}
            </div>
            <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:12, padding:'20px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>📸 Instagram</div>
                <div style={{ fontSize:12, color: data?.connected?.instagram?'#4ade80':'#555' }}>{data?.connected?.instagram ? '● Connected' : 'Not connected'}</div>
              </div>
              {!data?.connected?.instagram && (
                <a href="/api/instagram" style={{ fontSize:12, fontWeight:500, color:'#0c0c0c', background:'#f0f0f0', padding:'8px 16px', borderRadius:7, textDecoration:'none' }}>Connect</a>
              )}
            </div>
          </div>
        </div>

        {/* UPGRADE */}
        <div style={{ marginBottom:32 }}>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, fontStyle:'italic', letterSpacing:-1, marginBottom:16 }}>Get more credits</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {PLANS.map(p => (
              <div key={p.id} style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:12, padding:'24px 22px' }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{p.name}</div>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:38, letterSpacing:-1, marginBottom:4 }}>{p.price}</div>
                <div style={{ fontSize:12, color:'#555', marginBottom:6 }}>{p.credits} credits</div>
                <div style={{ fontSize:11, color:'#444', marginBottom:18 }}>{p.desc}</div>
                <button style={{ width:'100%', fontSize:13, fontWeight:500, color:'#0c0c0c', background:'#f0f0f0', border:'none', padding:'10px', borderRadius:8, cursor:'pointer' }}>Buy {p.name}</button>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT */}
        {episodes.length > 0 && (
          <div>
            <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, fontStyle:'italic', letterSpacing:-1, marginBottom:16 }}>Recent episodes</h2>
            {episodes.map((ep:any) => (
              <div key={ep.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid #1a1a1a' }}>
                <div>
                  <div style={{ fontSize:14, marginBottom:2 }}>{ep.title||ep.topic}</div>
                  <div style={{ fontSize:11, color:'#444', fontFamily:'monospace' }}>
                    {new Date(ep.createdAt).toLocaleDateString()} · {ep.status}
                    {ep.youtubeUrl && <a href={ep.youtubeUrl} target="_blank" style={{ color:'#555', marginLeft:10 }}>YouTube ↗</a>}
                  </div>
                </div>
                <a href={`/share/${ep.shareId}`} style={{ fontSize:12, color:'#555', borderBottom:'1px solid #2a2a2a' }}>View →</a>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500&display=swap');`}</style>
    </div>
  )
}
