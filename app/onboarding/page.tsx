'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    icon: '🎙',
    title: 'Welcome to SceneForge',
    desc: 'You have 3 free credits to start. Each credit = 1 full episode with research, scripts, audio, visuals and SEO.',
    cta: 'Next →'
  },
  {
    icon: '✍',
    title: 'Type any topic',
    desc: 'SceneForge researches it, writes 5 script variations scored on 10 metrics, and lets you pick the best angle.',
    cta: 'Next →'
  },
  {
    icon: '🎧',
    title: 'Choose your voice',
    desc: 'Pick from 16 ElevenLabs voices for Speaker A and B. Preview them before generating. Select your language.',
    cta: 'Next →'
  },
  {
    icon: '🚀',
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
          <div style={{ fontSize: 48, marginBottom: 24 }}>{current.icon}</div>
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
