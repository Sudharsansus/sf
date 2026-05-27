'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  return (
    <div style={{ background:'#09090b', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');`}</style>
      <div style={{ width:'100%', maxWidth:380, padding:32 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:40, height:40, borderRadius:10, background:'#6366f1', marginBottom:16 }}>
            <svg width="18" height="18" viewBox="0 0 12 12" fill="none"><path d="M2 10 L6 2 L10 10" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 style={{ fontSize:22, fontWeight:600, color:'#fafafa', marginBottom:6, letterSpacing:-.4 }}>SceneForge</h1>
          <p style={{ fontSize:13, color:'#71717a' }}>AI creator production studio</p>
        </div>

        <div style={{ background:'#18181b', border:'1px solid #27272a', borderRadius:12, padding:24 }}>
          <p style={{ fontSize:13, color:'#a1a1aa', textAlign:'center', marginBottom:20 }}>Sign in to your account</p>
          <button
            onClick={async () => { setLoading(true); await signIn('google', { callbackUrl:'/' }) }}
            disabled={loading}
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontSize:14, fontWeight:500, color:'#fafafa', background:loading ? '#27272a' : '#27272a', border:'1px solid #3f3f46', padding:'11px 20px', borderRadius:8, cursor: loading ? 'default' : 'pointer', transition:'all .15s' }}
            onMouseEnter={e=>{ if(!loading) e.currentTarget.style.borderColor='#6366f1' }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='#3f3f46' }}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:12, color:'#52525b', marginTop:20 }}>10 free credits on sign up · No card required</p>
        <p style={{ textAlign:'center', fontSize:11, color:'#3f3f46', marginTop:8 }}>
          By signing in you agree to our <a href="/terms" style={{ color:'#71717a' }}>Terms</a> and <a href="/privacy" style={{ color:'#71717a' }}>Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}