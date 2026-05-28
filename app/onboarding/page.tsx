'use client'
import { useState, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>,
    title: 'Welcome to SceneForge',
    desc: 'You have 3 free credits to start. Each credit = 1 full episode with research, scripts, audio, visuals and SEO.',
    cta: 'Next →'
  },
  {
    icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    title: 'Type any topic',
    desc: 'SceneForge researches it, writes 5 script variations scored on 10 metrics, and lets you pick the best angle.',
    cta: 'Next →'
  },
  {
    icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
    title: 'Choose your voice',
    desc: 'Pick from 16 ElevenLabs voices for Speaker A and B. Preview them before generating. Select your language.',
    cta: 'Next →'
  },
  {
    icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>,
    title: "You're ready",
    desc: 'Your episode will be ready in under 2 minutes. Audio, thumbnails, YouTube title, Instagram caption — all done.',
    cta: 'Start creating →'
  },
]

export default function OnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(0)

  const c = {
    bg: '#0a0a0a', surface: '#141414', surface2: '#1a1a1a',
    border: '#222', border2: '#2a2a2a',
    text: '#f5f5f5', muted: '#888', subtle: '#444',
    accent: '#f5f5f5', accentFg: '#0a0a0a',
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1)
    else router.push('/')
  }

  const current = STEPS[step]

  return (
    <div style={{ background: c.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', -apple-system, sans-serif", color: c.text, padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } a { color: inherit; text-decoration: none; } button { font-family: inherit; cursor: pointer; }`}</style>

      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 48 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>SceneForge</span>
        </div>

        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ color: c.text, display: 'flex', justifyContent: 'center', marginBottom: 24 }}>{current.icon}</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -.4, marginBottom: 12 }}>{current.title}</h1>
          <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.75, marginBottom: 36 }}>{current.desc}</p>

          <button onClick={next} style={{ width: '100%', fontSize: 14, fontWeight: 500, background: c.accent, color: c.accentFg, border: 'none', padding: '12px', borderRadius: 8 }}>
            {current.cta}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? c.text : c.subtle, transition: 'all .2s', cursor: 'pointer' }} />
          ))}
        </div>

        {session && (
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: c.subtle }}>
            Signed in as {session.user?.email}
          </p>
        )}
      </div>
    </div>
  )
}
