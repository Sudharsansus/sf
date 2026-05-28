'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Nav } from '@/components/ui/Nav'

interface ScriptLine {
  speaker: 'A' | 'B'
  text: string
}

export default function EditorPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const episodeId = params.id as string

  const [dark, setDark] = useState(true)
  const [lines, setLines] = useState<ScriptLine[]>([])
  const [title, setTitle] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [producing, setProducing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [selectedVoiceA, setSelectedVoiceA] = useState('21m00Tcm4TlvDq8ikWAM')
  const [selectedVoiceB, setSelectedVoiceB] = useState('AZnzlk1XvdvUeBnXmlld')
  const [showVoices, setShowVoices] = useState(false)

  const VOICES = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'F' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'F' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'F' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'M' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'F' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'M' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'M' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'M' },
  ]

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

  useEffect(() => {
    fetch(`/api/jobs?episodeId=${episodeId}`)
      .then(r => r.json())
      .then(ep => {
        if (ep.script?.lines) setLines(ep.script.lines)
        if (ep.title) setTitle(ep.title)
        if (ep.audioUrl) setAudioUrl(ep.audioUrl)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [episodeId])

  function updateLine(index: number, field: 'speaker' | 'text', value: string) {
    setLines(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } : l))
    setSaved(false)
  }

  function addLine(index: number) {
    const newLine: ScriptLine = { speaker: 'A', text: '' }
    setLines(prev => [...prev.slice(0, index + 1), newLine, ...prev.slice(index + 1)])
    setSaved(false)
  }

  function deleteLine(index: number) {
    if (lines.length <= 1) return
    setLines(prev => prev.filter((_, i) => i !== index))
    setSaved(false)
  }

  function swapSpeaker(index: number) {
    updateLine(index, 'speaker', lines[index].speaker === 'A' ? 'B' : 'A')
  }

  function swapAllSpeakers() {
    setLines(prev => prev.map(l => ({ ...l, speaker: l.speaker === 'A' ? 'B' : 'A' })))
    setSaved(false)
  }

  async function saveScript() {
    setSaving(true)
    try {
      const res = await fetch(`/api/episodes/${episodeId}/script`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines, title })
      })
      if (res.ok) setSaved(true)
      else setError('Save failed')
    } catch { setError('Save failed') }
    finally { setSaving(false) }
  }

  async function produceEpisode() {
    setProducing(true)
    setError('')
    try {
      await saveScript()
      const res = await fetch('/api/agents/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId,
          selectedAngle: 'uploaded',
          durationLabel: 'custom',
          selectedSpeaker: 'both',
          voiceA: selectedVoiceA,
          voiceB: selectedVoiceB,
          useExistingScript: true,
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Production failed'); return }
      router.push(`/share/${data.shareId}`)
    } catch (e: any) {
      setError(e.message || 'Production failed')
    } finally { setProducing(false) }
  }

  if (loading) return (
    <div style={{ background: c.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.muted, fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
      Loading editor…
    </div>
  )

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; outline: none; }
        textarea { font-family: inherit; outline: none; resize: none; }
        .line-row:hover .line-actions { opacity: 1 !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      <Nav c={c} dark={dark} setDark={setDark} activePath="/editor" />

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '88px 24px 120px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Script Editor</p>
            <input
              value={title}
              onChange={e => { setTitle(e.target.value); setSaved(false) }}
              style={{ fontSize: 'clamp(18px,2.5vw,28px)', fontWeight: 600, letterSpacing: -.4, background: 'transparent', border: 'none', color: c.text, width: '100%', padding: 0 }}
              placeholder="Episode title"
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            <button onClick={swapAllSpeakers}
              style={{ fontSize: 12, color: c.muted, border: `1px solid ${c.border}`, padding: '8px 14px', borderRadius: 7, background: 'transparent', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = c.border2; e.currentTarget.style.color = c.text }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.muted }}>
              Swap A↔B
            </button>
            <button onClick={saveScript} disabled={saving}
              style={{ fontSize: 12, fontWeight: 500, color: saved ? '#4ade80' : c.text, border: `1px solid ${saved ? 'rgba(74,222,128,0.4)' : c.border}`, padding: '8px 16px', borderRadius: 7, background: 'transparent', transition: 'all .15s', opacity: saving ? .6 : 1 }}>
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* AUDIO PREVIEW if exists */}
        {audioUrl && (
          <div style={{ border: `1px solid ${c.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
            <audio controls src={audioUrl} style={{ flex: 1, height: 28 }} />
            <span style={{ fontSize: 11, color: c.subtle }}>Original audio</span>
          </div>
        )}

        {/* STATS BAR */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, padding: '10px 0', borderBottom: `1px solid ${c.border}` }}>
          {[
            [`${lines.length}`, 'lines'],
            [`${lines.filter(l => l.speaker === 'A').length}`, 'Speaker A'],
            [`${lines.filter(l => l.speaker === 'B').length}`, 'Speaker B'],
            [`~${Math.ceil(lines.length * 15 / 60)}`, 'min estimated'],
          ].map(([val, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{val}</span>
              <span style={{ fontSize: 11, color: c.subtle }}>{label}</span>
            </div>
          ))}
        </div>

        {/* SCRIPT LINES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
          {lines.map((line, i) => (
            <div key={i} className="line-row"
              style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>

              {/* SPEAKER TOGGLE */}
              <button onClick={() => swapSpeaker(i)}
                style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${line.speaker === 'A' ? 'rgba(99,102,241,0.5)' : 'rgba(236,72,153,0.5)'}`, background: line.speaker === 'A' ? 'rgba(99,102,241,0.1)' : 'rgba(236,72,153,0.1)', color: line.speaker === 'A' ? '#818cf8' : '#f472b6', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {line.speaker}
              </button>

              {/* TEXT */}
              <textarea
                value={line.text}
                onChange={e => updateLine(i, 'text', e.target.value)}
                rows={Math.max(1, Math.ceil(line.text.length / 80))}
                style={{ background: 'transparent', border: 'none', fontSize: 14, color: c.text, lineHeight: 1.65, padding: '6px 0', width: '100%', fontFamily: 'inherit' }}
                placeholder="Line text..."
              />

              {/* ACTIONS */}
              <div className="line-actions" style={{ display: 'flex', gap: 4, opacity: 0, transition: 'opacity .15s', paddingTop: 6 }}>
                <button onClick={() => addLine(i)} title="Add line below"
                  style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${c.border}`, background: 'transparent', color: c.muted, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                <button onClick={() => deleteLine(i)} title="Delete line"
                  style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid rgba(248,113,113,0.3)', background: 'transparent', color: '#f87171', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>×</button>
              </div>
            </div>
          ))}

          {/* ADD LINE BUTTON */}
          <button onClick={() => addLine(lines.length - 1)}
            style={{ marginTop: 8, padding: '10px', borderRadius: 8, border: `1px dashed ${c.border}`, background: 'transparent', color: c.muted, fontSize: 13, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.border2; e.currentTarget.style.color = c.text }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.muted }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add line
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* PRODUCE PANEL */}
        <div style={{ border: `1px solid ${c.border}`, borderRadius: 14, padding: '24px', background: c.surface, position: 'sticky', bottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Ready to produce?</p>
              <p style={{ fontSize: 12, color: c.muted }}>Renders audio with ElevenLabs · costs 1 credit</p>
            </div>
            <button onClick={() => setShowVoices(!showVoices)}
              style={{ fontSize: 12, color: c.muted, border: `1px solid ${c.border}`, padding: '7px 14px', borderRadius: 7, background: 'transparent', cursor: 'pointer' }}>
              {showVoices ? 'Hide voices' : 'Choose voices'}
            </button>
          </div>

          {showVoices && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[{ label: 'Voice A', value: selectedVoiceA, setter: setSelectedVoiceA }, { label: 'Voice B', value: selectedVoiceB, setter: setSelectedVoiceB }].map(({ label, value, setter }) => (
                <div key={label}>
                  <p style={{ fontSize: 11, color: c.muted, marginBottom: 8, fontWeight: 500 }}>{label}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
                    {VOICES.map(v => (
                      <button key={v.id} onClick={() => setter(v.id)}
                        style={{ padding: '6px 4px', borderRadius: 6, border: `1px solid ${value === v.id ? c.text : c.border}`, background: value === v.id ? c.surface2 : 'transparent', color: value === v.id ? c.text : c.muted, fontSize: 10, fontWeight: value === v.id ? 600 : 400, cursor: 'pointer', textAlign: 'center' }}>
                        <div style={{ fontSize: 9, opacity: 0.6 }}>{v.gender}</div>
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={produceEpisode} disabled={producing || lines.length === 0}
            style={{ width: '100%', padding: '14px', fontSize: 14, fontWeight: 500, borderRadius: 10, border: 'none', background: producing || lines.length === 0 ? c.surface2 : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: producing || lines.length === 0 ? c.subtle : '#fff', cursor: producing || lines.length === 0 ? 'default' : 'pointer', transition: 'all .2s', boxShadow: producing || lines.length === 0 ? 'none' : '0 4px 16px rgba(249,115,22,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {producing ? (
              <>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse 1s ease-in-out infinite' }} />
                Producing episode…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Produce episode
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
