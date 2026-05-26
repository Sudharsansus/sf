export default function TermsPage() {
  const S = { h1: { fontFamily:"'DM Serif Display',serif", fontSize:44, fontStyle:'italic', letterSpacing:-1.5, marginBottom:8 } as any,
    h2: { fontFamily:"'DM Serif Display',serif", fontSize:24, fontStyle:'italic', letterSpacing:-0.5, margin:'32px 0 12px' } as any,
    p: { fontSize:14, color:'#888', lineHeight:1.75, marginBottom:12 } as any }
  return (
    <div style={{ background:'#0c0c0c', minHeight:'100vh', fontFamily:"'Instrument Sans',sans-serif", color:'#f0f0f0', padding:'80px 32px' }}>
      <div style={{ maxWidth:680, margin:'0 auto' }}>
        <a href="/" style={{ fontSize:11, color:'#444', fontFamily:'monospace', letterSpacing:0.5, display:'block', marginBottom:32 }}>← SCENEFORGE</a>
        <h1 style={S.h1}>Terms of Service</h1>
        <p style={{ ...S.p, marginBottom:32 }}>Last updated: {new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</p>
        <h2 style={S.h2}>Content ownership</h2>
        <p style={S.p}>You own all episodes you generate with SceneForge. The scripts, audio, and thumbnails are yours. We claim no ownership over your content.</p>
        <h2 style={S.h2}>Credits system</h2>
        <p style={S.p}>Credits are consumed when you generate an episode. 1 credit = 1 full episode (research + scripts + audio + thumbnails). Credits are non-refundable once an episode is successfully generated.</p>
        <p style={S.p}>If generation fails due to a platform error, credits are automatically refunded to your account.</p>
        <h2 style={S.h2}>Acceptable use</h2>
        <p style={S.p}>You may not use SceneForge to generate content that is illegal, hateful, sexually explicit, or designed to deceive. We reserve the right to terminate accounts that violate these rules.</p>
        <h2 style={S.h2}>Service availability</h2>
        <p style={S.p}>We aim for high availability but cannot guarantee 100% uptime. We are not liable for losses caused by service interruptions.</p>
        <h2 style={S.h2}>Contact</h2>
        <p style={S.p}>Questions? Email us at hello@sceneforge.ai</p>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500&display=swap');`}</style>
    </div>
  )
}
