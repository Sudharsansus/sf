'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  return (
    <div style={{ background:'#0c0c0c', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Instrument Sans',sans-serif" }}>
      <div style={{ textAlign:'center', padding:32 }}>
        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:48, fontStyle:'italic', color:'#f0f0f0', marginBottom:8, letterSpacing:-2 }}>SceneForge</div>
        <p style={{ fontSize:14, color:'#555', marginBottom:48 }}>AI Podcast Studio · Claude + Wubble</p>
        <button
          onClick={async () => { setLoading(true); await signIn('google', { callbackUrl:'/' }) }}
          disabled={loading}
          style={{ display:'inline-flex', alignItems:'center', gap:10, fontSize:14, fontWeight:500, color:'#0c0c0c', background:'#f0f0f0', border:'none', padding:'13px 28px', borderRadius:10, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>
        <p style={{ marginTop:20, fontSize:11, color:'#333' }}>10 free credits on sign up. No card required.</p>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500&display=swap');`}</style>
    </div>
  )
}
