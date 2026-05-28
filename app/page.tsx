'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Nav } from '@/components/ui/Nav'
import { useGenerate } from '@/hooks/useGenerate'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import { ScriptPicker } from '@/components/studio/ScriptPicker'
import { EpisodeResult } from '@/components/studio/EpisodeResult'
import { ChatBox } from '@/components/studio/ChatBox'
import { AuthPopup } from '@/components/ui/AuthPopup'

const ROTATING_WORDS = ['podcasts', 'YouTube videos', 'newsletters', 'scripts', 'narrations', 'episodes']

const VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel',    gender: 'F', accent: 'American' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi',      gender: 'F', accent: 'American' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella',     gender: 'F', accent: 'American' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni',    gender: 'M', accent: 'American' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli',      gender: 'F', accent: 'American' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh',      gender: 'M', accent: 'American' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold',    gender: 'M', accent: 'American' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam',      gender: 'M', accent: 'American' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam',       gender: 'M', accent: 'American' },
  { id: 'jBpfuIE2acCO8z3wKNLl', name: 'Gigi',      gender: 'F', accent: 'American' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel',    gender: 'M', accent: 'British' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum',    gender: 'M', accent: 'British' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'F', accent: 'British' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice',     gender: 'F', accent: 'British' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris',     gender: 'M', accent: 'American' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian',     gender: 'M', accent: 'American' },
]

const LANGUAGES = [
  { code: 'en', name: 'English',    flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi',      flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil',      flag: '🇮🇳' },
  { code: 'es', name: 'Spanish',    flag: '🇪🇸' },
  { code: 'fr', name: 'French',     flag: '🇫🇷' },
  { code: 'de', name: 'German',     flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ja', name: 'Japanese',   flag: '🇯🇵' },
  { code: 'ko', name: 'Korean',     flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic',     flag: '🇸🇦' },
  { code: 'it', name: 'Italian',    flag: '🇮🇹' },
  { code: 'zh', name: 'Chinese',    flag: '🇨🇳' },
]

export default function Home() {
  const g = useGenerate()
  const { data: session } = useSession()
  const [dark, setDark] = useState(true)
  const [wordIndex, setWordIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(true)
  const [previewAudio, setPreviewAudio] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState<'A' | 'B' | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [voiceA, setVoiceA] = useState('21m00Tcm4TlvDq8ikWAM')
  const [voiceB, setVoiceB] = useState('AZnzlk1XvdvUeBnXmlld')
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null)
  const [language, setLanguage] = useState('en')
  const [yearly, setYearly] = useState(false)

  useEffect(() => {
    if (session) {
      fetch('/api/credits').then(r => r.json()).then(d => setCredits(d.credits ?? null))
    }
  }, [session])

  async function playVoicePreview(voice: 'A' | 'B') {
    setPreviewLoading(voice)
    setPreviewAudio(null)
    try {
      const res = await fetch('/api/voice-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice })
      })
      const data = await res.json()
      if (data.audio) {
        const audioUrl = `data:audio/mpeg;base64,${data.audio}`
        setPreviewAudio(audioUrl)
        const audio = new Audio(audioUrl)
        audio.play()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setPreviewLoading(null)
    }
  }

  async function playVoicePreviewById(voiceId: string, slot: 'A' | 'B') {
    setPreviewingVoice(voiceId)
    setPreviewAudio(null)
    try {
      const res = await fetch('/api/voice-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceId })
      })
      const data = await res.json()
      if (data.audio) {
        const audioUrl = `data:audio/mpeg;base64,${data.audio}`
        setPreviewAudio(audioUrl)
        const audio = new Audio(audioUrl)
        audio.play()
      }
    } catch (e) { console.error(e) }
    finally { setPreviewingVoice(null) }
  }

  const isConfiguring = g.step === 'configuring'
  const isWorking     = g.step === 'working' || g.step === 'producing'
  const isPicking     = g.step === 'picking'
  const isComplete    = g.step === 'complete'
  const isFailed      = g.step === 'failed'

  // Typewriter effect
  useEffect(() => {
    const word = ROTATING_WORDS[wordIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (typing) {
      if (displayed.length < word.length) {
        timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 60)
      } else {
        timeout = setTimeout(() => setTyping(false), 1800)
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35)
      } else {
        setWordIndex(i => (i + 1) % ROTATING_WORDS.length)
        setTyping(true)
      }
    }
    return () => clearTimeout(timeout)
  }, [displayed, typing, wordIndex])

  const c = dark ? {
    bg: '#0a0a0a', nav: 'rgba(10,10,10,0.92)', surface: '#141414',
    surface2: '#1a1a1a', border: '#222', border2: '#2a2a2a',
    text: '#f5f5f5', muted: '#aaa', subtle: '#777',
    accent: '#f5f5f5', accentFg: '#0a0a0a',
  } : {
    bg: '#ffffff', nav: 'rgba(255,255,255,0.92)', surface: '#f0f0f0',
    surface2: '#efefef', border: '#d0d0d0', border2: '#bbb',
    text: '#0a0a0a', muted: '#444', subtle: '#666',
    accent: '#0a0a0a', accentFg: '#ffffff',
  }

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, fontFamily: "'Inter', -apple-system, sans-serif", transition: 'background .3s, color .3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; outline: none; }
        textarea { font-family: inherit; outline: none; }
        textarea::placeholder { color: ${c.subtle}; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.08); }
          66% { transform: translate(-30px, 30px) scale(0.94); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-50px, 40px) scale(1.1); }
          66% { transform: translate(35px, -45px) scale(0.92); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, 50px) scale(1.12); }
        }

        .f0 { animation: fadeUp .5s ease .0s both; }
        .f1 { animation: fadeUp .5s ease .06s both; }
        .f2 { animation: fadeUp .5s ease .12s both; }
        .f3 { animation: fadeUp .5s ease .18s both; }

        .nav-link { font-size: 13px; color: ${dark ? c.muted : c.text}; padding: 6px 12px; border-radius: 6px; transition: color .15s, background .15s; }
        .nav-link:hover { color: ${c.text}; background: ${dark ? 'transparent' : c.surface}; }

        .card { background: ${c.surface}; border: 1px solid ${c.border}; border-radius: 12px; transition: border-color .2s; }
        .card:hover { border-color: ${c.border2}; }

        .row-item { transition: background .15s; }
        .row-item:hover { background: ${c.surface} !important; }

        .feat-card { background: ${c.bg}; transition: background .15s; position: relative; overflow: hidden; }
        .feat-card:hover { background: ${c.surface} !important; }
        .feat-card:hover .feat-line { opacity: 1 !important; }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${c.border2}; border-radius: 2px; }

        @media (max-width: 768px) {
          .hero-title { font-size: 36px !important; }
          .console-wrap { max-width: 100% !important; }
          .numbers-grid { grid-template-columns: repeat(2,1fr) !important; }
          .workflow-grid { grid-template-columns: 40px 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr 1fr !important; }
          .cta-grid { grid-template-columns: 1fr !important; padding: 36px 28px !important; }
          .cta-buttons { flex-direction: row !important; }
          .footer-inner { flex-wrap: wrap !important; gap: 12px !important; }
        }
        @media (max-width: 480px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
          .numbers-grid { grid-template-columns: 1fr 1fr !important; }
          .voice-grid { grid-template-columns: repeat(3,1fr) !important; }
          .lang-grid { grid-template-columns: repeat(3,1fr) !important; }
        }
      `}</style>

      {/* ANIMATED BACKGROUND */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '100vh', zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>

        {/* Blob 1 — big purple top left */}
        <div style={{
          position: 'absolute',
          top: '-200px',
          left: '-200px',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.10) 30%, transparent 65%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(139,92,246,0.15) 30%, transparent 65%)',
          animation: 'float1 10s ease-in-out infinite',
          filter: 'blur(8px)',
          mixBlendMode: dark ? 'screen' : 'multiply',
        }} />

        {/* Blob 2 — orange top right */}
        <div style={{
          position: 'absolute',
          top: '-150px',
          right: '-150px',
          width: 750,
          height: 750,
          borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle, rgba(249,115,22,0.20) 0%, rgba(249,115,22,0.08) 30%, transparent 65%)'
            : 'radial-gradient(circle, rgba(249,115,22,0.30) 0%, rgba(249,115,22,0.12) 30%, transparent 65%)',
          animation: 'float2 13s ease-in-out infinite',
          filter: 'blur(8px)',
          mixBlendMode: dark ? 'screen' : 'multiply',
        }} />

        {/* Blob 3 — blue center bottom */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '35%',
          width: 650,
          height: 650,
          borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.07) 30%, transparent 65%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0.10) 30%, transparent 65%)',
          animation: 'float3 16s ease-in-out infinite',
          filter: 'blur(8px)',
          mixBlendMode: dark ? 'screen' : 'multiply',
        }} />

        {/* Blob 4 — pink bottom left */}
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          left: '10%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle, rgba(236,72,153,0.18) 0%, rgba(236,72,153,0.07) 30%, transparent 65%)'
            : 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, rgba(236,72,153,0.10) 30%, transparent 65%)',
          animation: 'float1 14s ease-in-out infinite reverse',
          filter: 'blur(8px)',
          mixBlendMode: dark ? 'screen' : 'multiply',
        }} />

        {/* Dark overlay to keep bg dark in dark mode */}
        {dark && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10,10,10,0.72)',
          }} />
        )}

        {/* Light overlay to keep bg light in light mode */}
        {!dark && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.50)',
          }} />
        )}
      </div>

      {/* NAV */}
      <Nav c={c} dark={dark} setDark={setDark} activePath="/" />

      {/* HERO */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '120px 24px 64px', textAlign: 'center' }}>

        <h1 className="f0 hero-title" style={{ fontSize: 'clamp(38px, 6vw, 68px)', fontWeight: 600, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 }}>
          Create studio-quality<br />
          <span suppressHydrationWarning={true} style={{ color: dark ? c.muted : c.text }}>
            {displayed}
            <span style={{ animation: 'blink 1s step-end infinite', borderRight: `2px solid ${c.text}`, marginLeft: 2 }}>&nbsp;</span>
          </span>
        </h1>

        <p className="f1" style={{ fontSize: 16, color: c.muted, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 40px', fontWeight: 400 }}>
          Research, scripts, voice, visuals, and SEO — one workflow, fully in your control.
        </p>

        {/* CONSOLE */}
        <div className="f2" style={{ maxWidth: 620, margin: '0 auto' }}>
          <div className="card" style={{ borderColor: isWorking ? c.text : c.border }}>

            {(g.step === 'idle' || isFailed) && <>
              <div style={{ padding: '16px 18px 10px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: c.muted, fontSize: 16, marginTop: 2, flexShrink: 0 }}>›</span>
                <textarea
                  value={g.topic}
                  onChange={e => g.setTopic(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); g.generate() } }}
                  rows={2}
                  placeholder="What's your episode about?"
                  style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, color: c.text, lineHeight: 1.6, resize: 'none', fontWeight: 400 }}
                />
              </div>
              <div style={{ padding: '0 18px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: c.subtle }}>
                  💡 After writing your topic, you'll choose voice, speakers, and duration before generation starts.
                </span>
              </div>
              {credits === 0 && g.step === 'idle' && (
                <div style={{ padding: '10px 14px', background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 14px 14px' }}>
                  <span style={{ fontSize: 12, color: '#fb923c' }}>⚡ No credits remaining</span>
                  <a href="/dashboard" style={{ fontSize: 12, fontWeight: 600, color: '#fb923c', border: '1px solid rgba(251,146,60,0.4)', padding: '4px 12px', borderRadius: 6 }}>Buy credits →</a>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 14px', borderTop: `1px solid ${c.border}` }}>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {['Research', 'Scripts ×5', 'Voice', 'Visuals', 'SEO'].map(tag => (
                    <span key={tag} style={{ fontSize: 10, color: c.subtle, padding: '2px 8px', borderRadius: 4, border: `1px solid ${c.border}`, fontWeight: 500, letterSpacing: .2 }}>{tag}</span>
                  ))}
                </div>
                <button onClick={g.generate} disabled={!g.topic.trim() || credits === 0}
                  style={{ fontSize: 13, fontWeight: 500, padding: '7px 18px', borderRadius: 7, background: g.topic.trim() && credits !== 0 ? c.accent : c.surface2, color: g.topic.trim() && credits !== 0 ? c.accentFg : c.subtle, transition: 'all .15s' }}
                  onMouseEnter={e => { if (g.topic.trim() && credits !== 0) e.currentTarget.style.opacity = '.85' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
                  Create episode →
                </button>
              </div>
              {isFailed && g.error && <p style={{ padding: '0 18px 12px', fontSize: 12, color: '#f87171' }}>{g.error}</p>}
            </>}

            {isConfiguring && <div style={{ padding: '14px 18px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <button onClick={g.reset} style={{ fontSize: 11, color: c.muted, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = c.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = c.muted)}>← Back</button>
                <span style={{ fontSize: 12, color: c.muted, fontWeight: 500 }}>Configure your episode</span>
              </div>

              {/* VOICE SELECTOR */}
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 11, color: c.muted, marginBottom: 10, fontWeight: 500 }}>Voice A (Speaker 1)</p>
                <div className="voice-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 8 }}>
                  {VOICES.map(v => (
                    <button key={v.id} onClick={() => setVoiceA(v.id)}
                      style={{ padding: '7px 6px', borderRadius: 7, border: `1px solid ${voiceA === v.id ? c.text : c.border}`, background: voiceA === v.id ? c.surface2 : 'transparent', color: voiceA === v.id ? c.text : c.muted, cursor: 'pointer', fontSize: 10, fontWeight: voiceA === v.id ? 600 : 400, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: c.subtle, marginBottom: 1 }}>{v.gender} · {v.accent}</div>
                      {v.name}
                      <button onClick={(e) => { e.stopPropagation(); playVoicePreviewById(v.id, 'A') }}
                        style={{ display: 'block', width: '100%', marginTop: 3, fontSize: 9, color: c.subtle, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                        {previewingVoice === v.id ? '◌' : '▶'}
                      </button>
                    </button>
                  ))}
                </div>

                <p style={{ fontSize: 11, color: c.muted, marginBottom: 10, fontWeight: 500, marginTop: 12 }}>Voice B (Speaker 2)</p>
                <div className="voice-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 8 }}>
                  {VOICES.map(v => (
                    <button key={v.id} onClick={() => setVoiceB(v.id)}
                      style={{ padding: '7px 6px', borderRadius: 7, border: `1px solid ${voiceB === v.id ? c.text : c.border}`, background: voiceB === v.id ? c.surface2 : 'transparent', color: voiceB === v.id ? c.text : c.muted, cursor: 'pointer', fontSize: 10, fontWeight: voiceB === v.id ? 600 : 400, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: c.subtle, marginBottom: 1 }}>{v.gender} · {v.accent}</div>
                      {v.name}
                      <button onClick={(e) => { e.stopPropagation(); playVoicePreviewById(v.id, 'B') }}
                        style={{ display: 'block', width: '100%', marginTop: 3, fontSize: 9, color: c.subtle, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                        {previewingVoice === v.id ? '◌' : '▶'}
                      </button>
                    </button>
                  ))}
                </div>

                {previewAudio && (
                  <audio controls src={previewAudio} style={{ width: '100%', height: 28, marginTop: 6 }} />
                )}
              </div>

              {/* LANGUAGE */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: c.muted, marginBottom: 8, fontWeight: 500 }}>Language</p>
                <div className="lang-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                  {LANGUAGES.map(lang => (
                    <button key={lang.code} onClick={() => setLanguage(lang.code)}
                      style={{ padding: '7px 6px', borderRadius: 7, border: `1px solid ${language === lang.code ? c.text : c.border}`, background: language === lang.code ? c.surface2 : 'transparent', color: language === lang.code ? c.text : c.muted, cursor: 'pointer', fontSize: 10, fontWeight: language === lang.code ? 600 : 400, textAlign: 'center' }}>
                      <div style={{ fontSize: 14, marginBottom: 2 }}>{lang.flag}</div>
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* SPEAKER FORMAT */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: c.muted, marginBottom: 10, fontWeight: 500 }}>Speaker Format</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {([['both', '💬', 'A + B Conversation'], ['a', '🎙', 'Solo A'], ['b', '🎙', 'Solo B']] as const).map(([val, icon, label]) => (
                    <button key={val} onClick={() => g.setSelectedSpeaker(val)}
                      style={{ padding: '10px 8px', borderRadius: 8, border: `1px solid ${g.selectedSpeaker === val ? c.text : c.border}`, background: g.selectedSpeaker === val ? c.surface2 : 'transparent', color: g.selectedSpeaker === val ? c.text : c.muted, cursor: 'pointer', transition: 'all .15s', fontSize: 11, fontWeight: g.selectedSpeaker === val ? 600 : 400, textAlign: 'center', lineHeight: 1.5 }}>
                      <div style={{ fontSize: 16, marginBottom: 3 }}>{icon}</div>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* DURATION */}
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 11, color: c.muted, marginBottom: 8, fontWeight: 500 }}>Duration</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {['30sec', '1min', '2min', '5min', '10min', '15min', '20min', '30min', '45min', '60min'].map(d => (
                    <button key={d} onClick={() => g.setSelectedDuration(d)}
                      style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, border: `1px solid ${g.selectedDuration === d ? c.text : c.border}`, background: g.selectedDuration === d ? c.surface2 : 'transparent', color: g.selectedDuration === d ? c.text : c.muted, cursor: 'pointer', transition: 'all .15s' }}>
                      {d}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type custom duration: e.g. 3min, 90sec"
                  value={g.selectedDuration}
                  onChange={e => g.setSelectedDuration(e.target.value)}
                  style={{ width: '100%', fontSize: 12, padding: '7px 12px', borderRadius: 6, border: `1px solid ${c.border}`, background: c.surface, color: c.text, fontFamily: 'inherit', outline: 'none' }}
                />
              </div>

              <button onClick={() => g.startGeneration(voiceA, voiceB, language)}
                style={{ width: '100%', padding: '12px', fontSize: 13, fontWeight: 500, background: c.accent, color: c.accentFg, border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'opacity .15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                Start Generation →
              </button>
            </div>}

            {isWorking && <div style={{ padding: '14px 18px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: c.muted, fontWeight: 500 }}>{g.step === 'working' ? 'Researching + writing...' : 'Producing...'}</span>
                <span style={{ fontSize: 11, color: c.subtle }}>{g.completedStages.length} / 6</span>
              </div>
              <WorkflowTimeline activeStage={g.activeStage} completedStages={g.completedStages} failedStages={g.failedStages} />
            </div>}

            {isPicking && g.scripts.length > 0 && <div style={{ padding: '14px 18px 18px' }}>
              <p style={{ fontSize: 12, color: c.muted, fontWeight: 500, marginBottom: 12 }}>Choose your angle</p>
              <ScriptPicker scripts={g.scripts} evaluations={g.evaluations} winner={g.winner} selectedAngle={g.selectedAngle} onSelectAngle={g.setSelectedAngle} onProduce={g.produce} />
            </div>}

            {isComplete && g.result && <EpisodeResult result={g.result} onReset={g.reset} />}
          </div>

          {g.step === 'idle' && <p className="f3" style={{ marginTop: 12, fontSize: 11, color: c.muted, textAlign: 'center', letterSpacing: .3 }}>
            No auto-posting · You own every episode · Claude · ElevenLabs · Replicate
          </p>}
        </div>
      </section>

      {/* NUMBERS */}
      <div style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
        <div className="numbers-grid" style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[['1 session','Weeks of work compressed'],['5 scripts','Written + scored per topic'],['Your call','You review before publishing'],['Studio grade','ElevenLabs + AI visuals']].map(([v,l],i,a) => (
            <div key={v} style={{ padding: '28px 24px', textAlign: 'center', borderRight: i < a.length-1 ? `1px solid ${c.border}` : 'none' }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{v}</div>
              <div style={{ fontSize: 12, color: dark ? c.muted : c.text }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TICKER */}
      <div style={{ overflow: 'hidden', borderBottom: `1px solid ${c.border}`, padding: '11px 0', background: c.surface }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 22s linear infinite' }}>
          {[...Array(2)].flatMap(() => ['Research Agent','Script × 5','Claude Sonnet 4','ElevenLabs','Replicate','SEO Package','Human in the loop','Zero auto-post','Multi-provider AI','Studio quality']).map((s,i) => (
            <span key={i} style={{ fontSize: 11, color: dark ? '#bbb' : c.muted, padding: '0 22px', borderRight: `1px solid ${c.border}`, whiteSpace: 'nowrap', fontWeight: 500, letterSpacing: .3 }}>{s}</span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, gap: 24, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Workflow</p>
            <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 600, letterSpacing: -.6, lineHeight: 1.2 }}>From brief to broadcast-ready.</h2>
          </div>
          <p style={{ fontSize: 13, color: c.muted, lineHeight: 1.65, maxWidth: 280 }}>Six stages, one session. You make the only decision that matters.</p>
        </div>

        <div style={{ border: `1px solid ${c.border}`, borderRadius: 10, overflow: 'hidden' }}>
          {[
            ['01','Research','Deep topic analysis — facts, angles, hooks — before a word of script is written.'],
            ['02','Script × 5','Five angles scored on 10 quality metrics. Technical, Story, Investment, Beginner, Contrarian.'],
            ['03','You choose','Pick the angle and length. 20, 30, or 45 minutes. The only decision in the workflow.'],
            ['04','Narration','ElevenLabs renders two distinct speaker voices at broadcast quality. A real conversation.'],
            ['05','Visuals','Three AI cover art variations for YouTube, podcasts, and social.'],
            ['06','Packaging','YouTube, Instagram, Twitter, LinkedIn, blog, newsletter — all written and ready.'],
          ].map(([n,name,desc],i,arr) => (
            <div key={n} className="row-item" style={{ display: 'grid', gridTemplateColumns: '52px 148px 1fr', borderBottom: i < arr.length-1 ? `1px solid ${c.border}` : 'none' }}>
              <div style={{ padding: '18px 0 18px 18px', fontSize: 10, color: dark ? '#888' : c.subtle, fontWeight: 600, letterSpacing: .5 }}>{n}</div>
              <div style={{ padding: '18px 14px', fontSize: 13, fontWeight: 600, color: c.text, borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}` }}>{name}</div>
              <div style={{ padding: '18px 22px', fontSize: 13, color: c.muted, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px 0' }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Why SceneForge</p>
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 600, letterSpacing: -.6, lineHeight: 1.2 }}>Not a generator. A production system.</h2>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: c.border, borderRadius: 10, overflow: 'hidden' }}>
          {[
            ['You stay in control','No auto-posting. No spam. You decide what goes live and when — every time.'],
            ['Quality over quantity','Five scripts, scored on 10 metrics. You pick the best angle, not the first one.'],
            ['Real voices','ElevenLabs renders two speakers with natural pacing and emotion. Not TTS.'],
            ['Your IP, your brand','Every episode is yours. Download everything. No lock-in, no revenue share.'],
            ['Multi-provider AI','Claude → OpenAI → Groq. Three providers on standby. Zero downtime.'],
            ['Scales with you','One episode or fifty — same quality, same workflow, every time.'],
          ].map(([name, body]) => (
            <div key={name} className="feat-card" style={{ background: c.bg, padding: '26px 22px' }}>
              <div className="feat-line" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: c.text, opacity: 0, transition: 'opacity .2s' }} />
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: c.text }}>{name}</div>
              <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(22px,3vw,38px)', fontWeight: 600, letterSpacing: -.6, marginBottom: 16 }}>A perfect fit for everyone</h2>
          <p style={{ fontSize: 14, color: c.muted, marginBottom: 28 }}>Start free. No card required. Upgrade when you're ready.</p>

          {/* MONTHLY / YEARLY TOGGLE */}
          <div style={{ display: 'inline-flex', alignItems: 'center', background: dark ? 'rgba(255,255,255,0.06)' : c.surface, border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : c.border}`, borderRadius: 10, padding: 4, gap: 2 }}>
            <button onClick={() => setYearly(false)}
              style={{ fontSize: 13, fontWeight: 500, padding: '7px 20px', borderRadius: 7, border: 'none', background: !yearly ? c.accent : 'transparent', color: !yearly ? c.accentFg : (dark ? '#aaa' : c.muted), cursor: 'pointer', transition: 'all .2s' }}>
              Monthly
            </button>
            <button onClick={() => setYearly(true)}
              style={{ fontSize: 13, fontWeight: 500, padding: '7px 20px', borderRadius: 7, border: 'none', background: yearly ? c.accent : 'transparent', color: yearly ? c.accentFg : (dark ? '#aaa' : c.muted), cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 6 }}>
              Yearly
              <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', padding: '1px 6px', borderRadius: 4 }}>-20%</span>
            </button>
          </div>
        </div>

        {/* PLAN CARDS */}
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { id: 'free',    name: 'Free',    monthly: '$0',  yearly: '$0',  credits: 3,    perEp: '',          desc: 'Best for Rookies',     badge: '' },
            { id: 'starter', name: 'Starter', monthly: '$19', yearly: '$15', credits: 30,   perEp: '$0.63/ep',  desc: 'Best for Creators',    badge: '' },
            { id: 'pro',     name: 'Pro',     monthly: '$29', yearly: '$23', credits: 100,  perEp: '$0.29/ep',  desc: 'Best for SMEs',        badge: 'POPULAR' },
            { id: 'studio',  name: 'Studio',  monthly: '$79', yearly: '$63', credits: 400,  perEp: '$0.20/ep',  desc: 'Best for Enterprises', badge: '' },
          ].map(p => (
            <div key={p.id} style={{ border: `1px solid ${p.badge ? '#f97316' : c.border}`, borderRadius: 14, padding: '24px 20px', position: 'relative', background: p.badge ? (dark ? 'rgba(249,115,22,0.05)' : 'rgba(249,115,22,0.03)') : 'transparent', transition: 'border-color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = p.badge ? '#f97316' : c.border2)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = p.badge ? '#f97316' : c.border)}>
              {p.badge && (
                <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 700, letterSpacing: .8, color: '#f97316', background: dark ? '#0a0a0a' : '#fff', border: '1px solid rgba(249,115,22,0.5)', padding: '2px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>{p.desc}</div>
              )}
              {!p.badge && (
                <div style={{ fontSize: 10, fontWeight: 600, color: dark ? '#aaa' : c.subtle, marginBottom: 10, letterSpacing: .3 }}>{p.desc}</div>
              )}
              {p.badge && <div style={{ marginBottom: 10 }} />}
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: dark ? '#fff' : c.text }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, color: dark ? '#fff' : c.text }}>{yearly ? p.yearly : p.monthly}</span>
                {p.id !== 'free' && <span style={{ fontSize: 12, color: c.muted }}>/month</span>}
              </div>
              <div style={{ fontSize: 11, color: dark ? '#888' : c.subtle, marginBottom: 20 }}>
                {p.id === 'free' ? 'Forever free' : `${p.credits} credits · ${p.perEp}`}
              </div>
              <a href="/login" style={{ display: 'block', textAlign: 'center', fontSize: 13, fontWeight: 500, padding: '10px', borderRadius: 8, border: `1px solid ${p.badge ? '#f97316' : c.border}`, background: p.badge ? '#f97316' : 'transparent', color: p.badge ? '#fff' : c.text, transition: 'opacity .15s', boxSizing: 'border-box' as const }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                {p.id === 'free' ? 'Get Started Free' : `Get ${p.name}`}
              </a>
            </div>
          ))}
        </div>

        {/* COMPARISON TABLE */}
        <div style={{ border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : c.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 40, background: dark ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', background: dark ? 'rgba(255,255,255,0.06)' : c.surface, borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : c.border}` }}>
            <div style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: dark ? '#fff' : c.muted }}>Features</div>
            {['Free','Starter','Pro','Studio'].map(name => (
              <div key={name} style={{ padding: '14px 12px', fontSize: 13, fontWeight: 700, color: dark ? '#ffffff' : c.text, textAlign: 'center', borderLeft: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : c.border}` }}>{name}</div>
            ))}
          </div>
          {[
            ['Research agent',          true,  true,  true,  true],
            ['Script × 5 variations',   true,  true,  true,  true],
            ['AI script evaluation',    true,  true,  true,  true],
            ['16 voice options',        true,  true,  true,  true],
            ['12 languages',            true,  true,  true,  true],
            ['Audio rendering',         true,  true,  true,  true],
            ['AI thumbnails',           false, true,  true,  true],
            ['SEO package',             false, true,  true,  true],
            ['YouTube auto-upload',     false, true,  true,  true],
            ['Instagram scheduling',    false, false, true,  true],
            ['Priority support',        false, false, true,  true],
            ['Team access',             false, false, false, true],
          ].map(([feature, ...vals], i, arr) => (
            <div key={String(feature)} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', borderBottom: i < arr.length - 1 ? `1px solid ${dark ? 'rgba(255,255,255,0.08)' : c.border}` : 'none', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.04)' : c.surface)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div style={{ padding: '13px 20px', fontSize: 13, color: dark ? '#d0d0d0' : c.text, fontWeight: 400 }}>{String(feature)}</div>
              {(vals as boolean[]).map((v, vi) => (
                <div key={vi} style={{ padding: '13px 12px', textAlign: 'center', borderLeft: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : c.border}` }}>
                  {v ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.5)' }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  ) : (
                    <span style={{ color: dark ? 'rgba(255,255,255,0.2)' : c.subtle, fontSize: 14 }}>—</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE */}
      <section style={{ maxWidth: 640, margin: '80px auto 0', padding: '0 24px' }}>
        <div className="card" style={{ padding: '32px 36px' }}>
          <p style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.65, marginBottom: 16, color: c.text }}>
            "The research alone saves me three hours per episode. The script evaluation is the feature I didn't know I needed."
          </p>
          <p style={{ fontSize: 12, color: c.subtle }}>Early access creator · Scripted tech podcast</p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1080, margin: '80px auto 0', padding: '0 24px 100px' }}>
        <div className="card cta-grid" style={{ padding: '60px 52px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 48 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 }}>Begin production</p>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 600, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 14 }}>
              Your brief. Studio output.
            </h2>
            <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.7, maxWidth: 360 }}>10 free credits on sign up. No card required. Research, scripts, voice, visuals, and SEO — done.</p>
          </div>
          <div className="cta-buttons" style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <a href="/login" style={{ fontWeight: 500, fontSize: 14, color: c.accentFg, background: c.accent, padding: '12px 32px', borderRadius: 8, textAlign: 'center', whiteSpace: 'nowrap', transition: 'opacity .15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              Start producing →
            </a>
            <a href="/studio" style={{ fontSize: 13, color: c.muted, border: `1px solid ${c.border}`, padding: '11px 32px', borderRadius: 8, textAlign: 'center', transition: 'border-color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = c.text)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}>
              See the Studio
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-inner" style={{ borderTop: `1px solid ${c.border}`, padding: '18px 24px', maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 18, height: 18, borderRadius: 5, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 13 }}>SceneForge</span>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {[['Terms','/terms'],['Privacy','/privacy'],['Changelog','/changelog'],['GitHub','https://github.com/Sudharsansus/sf']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: dark ? '#aaa' : c.muted, padding: '4px 10px', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = c.text)}
              onMouseLeave={e => (e.currentTarget.style.color = dark ? '#aaa' : c.muted)}>{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/onboarding" style={{ fontSize: 11, color: dark ? '#888' : c.subtle, transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = c.text)}
            onMouseLeave={e => (e.currentTarget.style.color = dark ? '#888' : c.subtle)}>Quick start guide</a>
          <span style={{ fontSize: 11, color: dark ? '#aaa' : c.muted }}>© 2025 SceneForge</span>
        </div>
      </footer>

      <ChatBox />
      <AuthPopup c={c} dark={dark} />
    </div>
  )
}