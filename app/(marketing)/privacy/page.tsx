export default function PrivacyPage() {
  const S = { h1: { fontFamily:"'DM Serif Display',serif", fontSize:44, fontStyle:'italic', letterSpacing:-1.5, marginBottom:8 } as any,
    h2: { fontFamily:"'DM Serif Display',serif", fontSize:24, fontStyle:'italic', letterSpacing:-0.5, margin:'32px 0 12px' } as any,
    p: { fontSize:14, color:'#888', lineHeight:1.75, marginBottom:12 } as any }
  return (
    <div style={{ background:'#0c0c0c', minHeight:'100vh', fontFamily:"'Instrument Sans',sans-serif", color:'#f0f0f0', padding:'80px 32px' }}>
      <div style={{ maxWidth:680, margin:'0 auto' }}>
        <a href="/" style={{ fontSize:11, color:'#444', fontFamily:'monospace', letterSpacing:0.5, display:'block', marginBottom:32 }}>← SCENEFORGE</a>
        <h1 style={S.h1}>Privacy Policy</h1>
        <p style={{ ...S.p, marginBottom:32 }}>Last updated: {new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</p>
        <h2 style={S.h2}>What we collect</h2>
        <p style={S.p}>When you sign in with Google, we collect your email address, name, and profile image. We use this only to identify your account and personalise your experience.</p>
        <p style={S.p}>When you generate episodes, we store the topic, script, audio file URL, thumbnail URLs, and SEO content associated with your account.</p>
        <h2 style={S.h2}>Where data is stored</h2>
        <p style={S.p}><strong style={{ color:'#f0f0f0' }}>Database:</strong> Neon Postgres — hosted on AWS (US East). Contains user profiles, episode metadata, and credits ledger.</p>
        <p style={S.p}><strong style={{ color:'#f0f0f0' }}>Audio &amp; Images:</strong> Cloudflare R2 — global CDN. Generated audio files and thumbnails.</p>
        <p style={S.p}><strong style={{ color:'#f0f0f0' }}>Cache:</strong> Upstash Redis — ephemeral session and rate limit data only.</p>
        <h2 style={S.h2}>Third-party services</h2>
        <p style={S.p}>We send your episode scripts to Anthropic (Claude API) and ElevenLabs for audio generation. We send thumbnail prompts to Replicate. None of these services retain your data beyond the request.</p>
        <p style={S.p}>If you connect YouTube or Instagram, we store OAuth tokens encrypted in our database to enable publishing on your behalf.</p>
        <h2 style={S.h2}>Your rights</h2>
        <p style={S.p}>You can delete your account and all associated data at any time from Settings. We will permanently delete all your data within 30 days of request.</p>
        <p style={S.p}>We do not sell your data. We do not use your data for advertising. We do not share your data with third parties except as described above.</p>
        <h2 style={S.h2}>Contact</h2>
        <p style={S.p}>Questions? Email us at privacy@sceneforge.ai</p>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500&display=swap');`}</style>
    </div>
  )
}
