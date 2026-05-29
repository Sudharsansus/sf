'use client'
import { useState, useEffect, useRef } from 'react'
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

const SUGGESTIONS = [
  {
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="12" y1="15" x2="12" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg>,
    text: 'The future of AI agents',
  },
  {
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    text: 'How to build wealth in your 20s',
  },
  {
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A6.5 6.5 0 0 1 16 8.5c0 3.58-2.92 6.5-6.5 6.5A6.5 6.5 0 0 1 3 8.5 6.5 6.5 0 0 1 9.5 2z"/><path d="M21.5 22l-4-4"/><path d="M9.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>,
    text: 'Why sleep is your superpower',
  },
  {
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/><path d="M12 21a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2z"/></svg>,
    text: 'India startup ecosystem 2025',
  },
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
  const [plan, setPlan] = useState('free')
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (session) {
      fetch('/api/credits').then(r => r.json()).then(d => {
        setCredits(d.credits ?? null)
        setPlan(d.plan ?? 'free')
      })
    }
  }, [session])

  useEffect(() => {
    const supported = typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    setSpeechSupported(supported)
  }, [])

  function startVoiceInput() {
    // Toggle off if already listening
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition
      || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Voice input not supported. Please use Chrome or Edge browser.')
      return
    }

    // Request mic permission before constructing recognition
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition

        recognition.continuous = false
        recognition.interimResults = true
        recognition.maxAlternatives = 1
        recognition.lang = 'en-US'

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onresult = (event: any) => {
          let interim = ''
          let final = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript
            if (event.results[i].isFinal) final += t
            else interim += t
          }
          g.setTopic(final || interim)
        }

        recognition.onspeechend = () => {
          recognition.stop()
        }

        recognition.onerror = (event: any) => {
          setIsListening(false)
          if (event.error === 'not-allowed') {
            alert('Microphone blocked. Go to browser settings → Site settings → Microphone → Allow for this site.')
          } else if (event.error === 'no-speech') {
            // silently ignore
          } else {
            console.error('Speech error:', event.error)
          }
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.start()
      })
      .catch((err: any) => {
        setIsListening(false)
        if (err.name === 'NotAllowedError') {
          alert('Microphone permission denied. Click the lock icon in your browser address bar and allow microphone access.')
        } else if (err.name === 'NotFoundError') {
          alert('No microphone found. Please connect a microphone and try again.')
        } else {
          alert('Could not access microphone: ' + err.message)
        }
      })
  }

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
    text: '#ffffff', muted: '#c0c0c0', subtle: '#999',
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
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes moveBlob1 {
          0%   { transform: translate(0px, 0px); }
          20%  { transform: translate(300px, 150px); }
          40%  { transform: translate(500px, -100px); }
          60%  { transform: translate(200px, 300px); }
          80%  { transform: translate(-100px, 200px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes moveBlob2 {
          0%   { transform: translate(0px, 0px); }
          20%  { transform: translate(-200px, 200px); }
          40%  { transform: translate(-400px, -150px); }
          60%  { transform: translate(-100px, -300px); }
          80%  { transform: translate(150px, -100px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes moveBlob3 {
          0%   { transform: translate(0px, 0px); }
          25%  { transform: translate(200px, -200px); }
          50%  { transform: translate(-300px, -100px); }
          75%  { transform: translate(-100px, 250px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes moveBlob4 {
          0%   { transform: translate(0px, 0px); }
          33%  { transform: translate(-250px, -200px); }
          66%  { transform: translate(300px, -150px); }
          100% { transform: translate(0px, 0px); }
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

      {/* ANIMATED MOVING BLOBS */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>

        {/* Blob 1 — purple — starts top left, travels across */}
        <div style={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle, rgba(139,92,246,0.55) 0%, rgba(139,92,246,0.25) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.10) 40%, transparent 70%)',
          animation: 'moveBlob1 20s ease-in-out infinite',
          filter: 'blur(15px)',
          willChange: 'transform',
        }} />

        {/* Blob 2 — orange — starts top right, travels left */}
        <div style={{
          position: 'absolute',
          top: '0%',
          right: '5%',
          width: 550,
          height: 550,
          borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle, rgba(249,115,22,0.50) 0%, rgba(249,115,22,0.22) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(249,115,22,0.08) 40%, transparent 70%)',
          animation: 'moveBlob2 25s ease-in-out infinite',
          filter: 'blur(15px)',
          willChange: 'transform',
        }} />

        {/* Blob 3 — blue — starts center, moves diagonally */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '40%',
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle, rgba(59,130,246,0.45) 0%, rgba(59,130,246,0.20) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.20) 0%, rgba(59,130,246,0.08) 40%, transparent 70%)',
          animation: 'moveBlob3 18s ease-in-out infinite',
          filter: 'blur(15px)',
          willChange: 'transform',
        }} />

        {/* Blob 4 — pink — starts bottom, moves up */}
        <div style={{
          position: 'absolute',
          bottom: '5%',
          left: '30%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle, rgba(236,72,153,0.45) 0%, rgba(236,72,153,0.20) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(236,72,153,0.20) 0%, rgba(236,72,153,0.08) 40%, transparent 70%)',
          animation: 'moveBlob4 22s ease-in-out infinite',
          filter: 'blur(15px)',
          willChange: 'transform',
        }} />

        {/* Blob 5 — green — extra movement bottom right */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle, rgba(74,222,128,0.35) 0%, rgba(74,222,128,0.15) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(74,222,128,0.15) 0%, rgba(74,222,128,0.06) 40%, transparent 70%)',
          animation: 'moveBlob1 28s ease-in-out infinite reverse',
          filter: 'blur(15px)',
          willChange: 'transform',
        }} />

        {/* Dark scrim to keep text readable */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: dark
            ? 'rgba(8,8,8,0.50)'
            : 'rgba(255,255,255,0.55)',
        }} />
      </div>

      {/* NAV */}
      <Nav c={c} dark={dark} setDark={setDark} activePath="/" />

      {/* HERO */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '120px 24px 64px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        <h1 className="f0 hero-title" style={{ fontSize: 'clamp(38px, 6vw, 68px)', fontWeight: 600, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 }}>
          Create studio-quality<br />
          <span suppressHydrationWarning={true} style={{ color: dark ? c.muted : c.text }}>
            {displayed}
            <span style={{ animation: 'blink 1s step-end infinite', borderRight: `2px solid ${c.text}`, marginLeft: 2 }}>&nbsp;</span>
          </span>
        </h1>

        <p className="f1" style={{ fontSize: 16, color: c.muted, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 40px', fontWeight: 500 }}>
          Research, scripts, voice, visuals, and SEO — one workflow, fully in your control.
        </p>

        {/* CONSOLE */}
        <div className="f2 console-wrap" style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{
              borderRadius: 16,
              border: `1px solid ${isWorking ? 'rgba(249,115,22,0.6)' : dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)'}`,
              background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.70)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: dark
                ? '0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.4)'
                : '0 0 0 1px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.08)',
              transition: 'border-color .3s, box-shadow .3s',
            }}>

            {(g.step === 'idle' || isFailed) && <>
              <div style={{ padding: '16px 18px 10px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: dark ? 'rgba(255,255,255,0.3)' : c.subtle, display: 'flex', alignItems: 'center', marginTop: 3, flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                    <line x1="8" y1="22" x2="16" y2="22"/>
                  </svg>
                </span>
                <textarea
                  value={g.topic}
                  onChange={e => g.setTopic(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); g.generate() } }}
                  rows={3}
                  placeholder="What's your episode about?"
                  style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 16, color: c.text, lineHeight: 1.6, resize: 'none', fontWeight: 500, letterSpacing: -0.2 }}
                />
                <button
                  onClick={() => startVoiceInput()}
                  title={isListening ? 'Click to stop listening' : 'Click to speak your topic'}
                  style={{
                    background: isListening ? 'rgba(249,115,22,0.15)' : 'transparent',
                    border: `1px solid ${isListening ? '#f97316' : dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: 8,
                    padding: '6px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all .2s',
                    marginTop: 2,
                    position: 'relative' as const,
                    outline: isListening ? '2px solid rgba(249,115,22,0.3)' : 'none',
                    outlineOffset: 2,
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isListening ? '#f97316' : dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                    <line x1="8" y1="22" x2="16" y2="22"/>
                  </svg>
                </button>
              </div>
              {isListening && (
                <div style={{ padding: '0 18px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', display: 'inline-block', animation: 'pulse 1s ease-in-out infinite' }} />
                  <span style={{ fontSize: 11, color: '#f97316' }}>Listening… speak now. Click mic to stop.</span>
                </div>
              )}
              <div style={{ padding: '0 18px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: c.subtle, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1, opacity: 0.5 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  After writing your topic, you'll choose voice, speakers, and duration before generation starts.
                </span>
              </div>
              {credits === 0 && g.step === 'idle' && (
                <div style={{ padding: '10px 14px', background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 14px 14px' }}>
                  <span style={{ fontSize: 12, color: '#fb923c', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    No credits remaining
                  </span>
                  <a href="/dashboard" style={{ fontSize: 12, fontWeight: 600, color: '#fb923c', border: '1px solid rgba(251,146,60,0.4)', padding: '4px 12px', borderRadius: 6 }}>Buy credits →</a>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 14px', borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                  {['Research', 'Scripts ×5', 'Voice', 'Visuals', 'SEO'].map(tag => (
                    <span key={tag} style={{ fontSize: 10, color: dark ? 'rgba(255,255,255,0.4)' : c.subtle, padding: '2px 8px', borderRadius: 4, border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`, fontWeight: 500, letterSpacing: .2 }}>{tag}</span>
                  ))}
                  <span style={{ fontSize: 11, color: g.topic.length > 180 ? '#f87171' : c.subtle, marginLeft: 4 }}>
                    {g.topic.length}/200
                  </span>
                </div>
                <button onClick={g.generate} disabled={!g.topic.trim() || credits === 0}
                  style={{
                    fontSize: 13, fontWeight: 500, padding: '8px 18px', borderRadius: 8,
                    background: g.topic.trim() && credits !== 0
                      ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                      : dark ? 'rgba(255,255,255,0.06)' : c.surface2,
                    color: g.topic.trim() && credits !== 0 ? '#fff' : c.subtle,
                    border: 'none',
                    boxShadow: g.topic.trim() && credits !== 0 ? '0 4px 16px rgba(249,115,22,0.4)' : 'none',
                    transition: 'all .2s',
                    cursor: g.topic.trim() && credits !== 0 ? 'pointer' : 'default',
                  }}
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
              {credits !== null && credits <= 10 && plan === 'free' ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <p style={{ fontSize: 11, color: c.muted, fontWeight: 500 }}>Language</p>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#f97316', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', padding: '2px 8px', borderRadius: 4 }}>PRO FEATURE</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, opacity: 0.3, pointerEvents: 'none', filter: 'blur(1px)' }}>
                      {LANGUAGES.map(lang => (
                        <div key={lang.code} style={{ padding: '7px 6px', borderRadius: 7, border: `1px solid ${c.border}`, textAlign: 'center', fontSize: 10 }}>
                          <div style={{ fontSize: 14, marginBottom: 2 }}>{lang.flag}</div>
                          {lang.name}
                        </div>
                      ))}
                    </div>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <p style={{ fontSize: 12, color: c.muted, textAlign: 'center' }}>Available on Pro plan</p>
                      <a href="/dashboard" style={{ fontSize: 11, fontWeight: 600, color: '#f97316', border: '1px solid rgba(249,115,22,0.4)', padding: '4px 12px', borderRadius: 6 }}>Upgrade →</a>
                    </div>
                  </div>
                </div>
              ) : (
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
              )}

              {/* SPEAKER FORMAT */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: c.muted, marginBottom: 10, fontWeight: 500 }}>Speaker Format</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {([
                    { val: 'both', label: 'A + B Conversation', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                    { val: 'a',    label: 'Solo A',             icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg> },
                    { val: 'b',    label: 'Solo B',             icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg> },
                  ] as const).map(({ val, label, icon }) => (
                    <button key={val} onClick={() => g.setSelectedSpeaker(val)}
                      style={{ padding: '10px 8px', borderRadius: 8, border: `1px solid ${g.selectedSpeaker === val ? c.text : c.border}`, background: g.selectedSpeaker === val ? c.surface2 : 'transparent', color: g.selectedSpeaker === val ? c.text : c.muted, cursor: 'pointer', transition: 'all .15s', fontSize: 11, fontWeight: g.selectedSpeaker === val ? 600 : 400, textAlign: 'center', lineHeight: 1.5 }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>{icon}</div>
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

          {(g.step === 'idle' || g.step === 'failed') && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <div style={{ flex: 1, height: 1, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', maxWidth: 120 }} />
              <span style={{ fontSize: 11, color: c.subtle }}>or</span>
              <div style={{ flex: 1, height: 1, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', maxWidth: 120 }} />
            </div>
          )}

          {(g.step === 'idle' || g.step === 'failed') && (
            <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/upload?tab=script"
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: '#c4b5fd', background: 'rgba(139,92,246,0.08)', border: '1.5px solid rgba(139,92,246,0.6)', padding: '10px 20px', borderRadius: 10, backdropFilter: 'blur(10px)', transition: 'all .2s', textDecoration: 'none', boxShadow: '0 0 16px rgba(139,92,246,0.2), inset 0 0 16px rgba(139,92,246,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.18)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.9)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(139,92,246,0.45), inset 0 0 20px rgba(139,92,246,0.1)'; e.currentTarget.style.color = '#ddd6fe' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(139,92,246,0.2), inset 0 0 16px rgba(139,92,246,0.05)'; e.currentTarget.style.color = '#c4b5fd' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Upload script
              </a>
              <a href="/upload?tab=audio"
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: '#fdba74', background: 'rgba(249,115,22,0.08)', border: '1.5px solid rgba(249,115,22,0.6)', padding: '10px 20px', borderRadius: 10, backdropFilter: 'blur(10px)', transition: 'all .2s', textDecoration: 'none', boxShadow: '0 0 16px rgba(249,115,22,0.2), inset 0 0 16px rgba(249,115,22,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.18)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.9)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(249,115,22,0.45), inset 0 0 20px rgba(249,115,22,0.1)'; e.currentTarget.style.color = '#fed7aa' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.08)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.6)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(249,115,22,0.2), inset 0 0 16px rgba(249,115,22,0.05)'; e.currentTarget.style.color = '#fdba74' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
                  <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                </svg>
                Upload audio
              </a>
              <a href="/upload"
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: '#f9a8d4', background: 'rgba(236,72,153,0.08)', border: '1.5px solid rgba(236,72,153,0.6)', padding: '10px 20px', borderRadius: 10, backdropFilter: 'blur(10px)', transition: 'all .2s', textDecoration: 'none', boxShadow: '0 0 16px rgba(236,72,153,0.2), inset 0 0 16px rgba(236,72,153,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(236,72,153,0.18)'; e.currentTarget.style.borderColor = 'rgba(236,72,153,0.9)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(236,72,153,0.45), inset 0 0 20px rgba(236,72,153,0.1)'; e.currentTarget.style.color = '#fbcfe8' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(236,72,153,0.08)'; e.currentTarget.style.borderColor = 'rgba(236,72,153,0.6)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(236,72,153,0.2), inset 0 0 16px rgba(236,72,153,0.05)'; e.currentTarget.style.color = '#f9a8d4' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                Edit existing script
              </a>
            </div>
          )}

          {g.step === 'idle' && !session && (
            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <p style={{ width: '100%', textAlign: 'center', fontSize: 11, color: c.muted, marginBottom: 4 }}>Try these topics</p>
              {SUGGESTIONS.map(s => (
                <button key={s.text} onClick={() => g.setTopic(s.text)}
                  style={{ fontSize: 12, color: c.muted, background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, padding: '6px 14px', borderRadius: 20, cursor: 'pointer', transition: 'all .15s', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 6 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'; e.currentTarget.style.color = c.text }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = c.muted }}>
                  <span style={{ opacity: 0.6, display: 'flex', alignItems: 'center' }}>{s.icon}</span>
                  {s.text}
                </button>
              ))}
            </div>
          )}

          {g.step === 'idle' && <p className="f3" style={{ marginTop: 12, fontSize: 11, color: c.muted, textAlign: 'center', letterSpacing: .3 }}>
            No auto-posting · You own every episode · Claude · ElevenLabs · Replicate
          </p>}
        </div>
      </section>

      {/* NUMBERS */}
      <div style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`, position: 'relative', zIndex: 1 }}>
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
      <div style={{ overflow: 'hidden', borderBottom: `1px solid ${c.border}`, padding: '11px 0', background: c.surface, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 22s linear infinite' }}>
          {[...Array(2)].flatMap(() => ['Research Agent','Script × 5','Claude Sonnet 4','ElevenLabs','Replicate','SEO Package','Human in the loop','Zero auto-post','Multi-provider AI','Studio quality']).map((s,i) => (
            <span key={i} style={{ fontSize: 11, color: dark ? '#b0b0b0' : c.muted, padding: '0 22px', borderRight: `1px solid ${c.border}`, whiteSpace: 'nowrap', fontWeight: 500, letterSpacing: .3 }}>{s}</span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px 0', position: 'relative', zIndex: 1 }}>
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
              <div style={{ padding: '18px 22px', fontSize: 13, color: dark ? '#b0b0b0' : c.muted, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Why Sus</p>
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
              <div style={{ fontSize: 12, color: dark ? '#b0b0b0' : c.muted, lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px 0', position: 'relative', zIndex: 1 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', background: dark ? 'rgba(255,255,255,0.05)' : c.surface, borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : c.border}` }}>
            <div style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: dark ? '#ffffff' : c.text }}>Features</div>
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
              <div style={{ padding: '13px 20px', fontSize: 13, color: dark ? '#d0d0d0' : c.text, fontWeight: 500 }}>{String(feature)}</div>
              {(vals as boolean[]).map((v, vi) => (
                <div key={vi} style={{ padding: '13px 12px', textAlign: 'center', borderLeft: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : c.border}` }}>
                  {v ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: 'rgba(74,222,128,0.3)', border: '1px solid #4ade80' }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  ) : (
                    <span style={{ color: dark ? 'rgba(255,255,255,0.25)' : c.subtle, fontSize: 14 }}>—</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE */}
      <section style={{ maxWidth: 640, margin: '80px auto 0', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div className="card" style={{ padding: '32px 36px' }}>
          <p style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.65, marginBottom: 16, color: c.text }}>
            "The research alone saves me three hours per episode. The script evaluation is the feature I didn't know I needed."
          </p>
          <p style={{ fontSize: 12, color: c.subtle }}>Early access creator · Scripted tech podcast</p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1080, margin: '80px auto 0', padding: '0 24px 100px', position: 'relative', zIndex: 1 }}>
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
      <footer className="footer-inner" style={{ borderTop: `1px solid ${c.border}`, padding: '18px 24px', maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 18, height: 18, borderRadius: 5, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Sus</span>
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
          <span style={{ fontSize: 11, color: dark ? '#aaa' : c.muted }}>© 2025 Sus</span>
        </div>
      </footer>

      <ChatBox />
      <AuthPopup c={c} dark={dark} />
    </div>
  )
}