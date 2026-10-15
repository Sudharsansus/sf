'use client'
import { useState, useRef, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { Nav } from '@/components/ui/Nav'

function UploadPageInner() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'audio' ? 'audio' : 'script'
  const [dark, setDark] = useState(true)
  const [tab, setTab] = useState<'script' | 'audio'>(initialTab)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')
  const scriptRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLInputElement>(null)

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

  const scriptTypes = '.txt,.pdf,.docx,.doc'
  const audioTypes = '.mp3,.wav,.m4a,.ogg,.webm'
  const acceptTypes = tab === 'script' ? scriptTypes : audioTypes

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError('')
    setProgress(tab === 'audio' ? 'Uploading and transcribing… this may take a minute' : 'Parsing script…')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const endpoint = tab === 'script' ? '/api/upload/script' : '/api/upload/audio'
      const res = await fetch(endpoint, { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        if (data.upgrade) {
          setError(data.error)
        } else {
          setError(data.error || 'Upload failed')
        }
        return
      }

      router.push(`/editor/${data.episodeId}`)
    } catch (e: any) {
      setError(e.message || 'Upload failed')
    } finally {
      setUploading(false)
      setProgress('')
    }
  }

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; outline: none; }
      `}</style>

      <Nav c={c} dark={dark} setDark={setDark} activePath="/upload" />

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '104px 24px 80px' }}>
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>Upload</p>
          <h1 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, letterSpacing: -.6, marginBottom: 10 }}>Upload your content</h1>
          <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.7 }}>Upload a script or audio file to edit and produce a studio-quality episode.</p>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 4, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, padding: 4, marginBottom: 28 }}>
          {(['script', 'audio'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setFile(null); setError('') }}
              style={{ flex: 1, padding: '10px', borderRadius: 7, border: 'none', background: tab === t ? c.accent : 'transparent', color: tab === t ? c.accentFg : c.muted, fontSize: 13, fontWeight: 500, transition: 'all .2s', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {t === 'script' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              )}
              {t === 'script' ? 'Script file' : 'Audio file'}
            </button>
          ))}
        </div>

        {/* DROP ZONE */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => tab === 'script' ? scriptRef.current?.click() : audioRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#f97316' : file ? '#4ade80' : c.border}`,
            borderRadius: 16,
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all .2s',
            background: dragging ? 'rgba(249,115,22,0.04)' : file ? 'rgba(74,222,128,0.04)' : 'transparent',
            marginBottom: 20,
          }}>
          <input ref={scriptRef} type="file" accept={scriptTypes} style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
          <input ref={audioRef} type="file" accept={audioTypes} style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />

          {file ? (
            <div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 500, color: c.text, marginBottom: 4 }}>{file.name}</p>
              <p style={{ fontSize: 12, color: c.muted }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button onClick={e => { e.stopPropagation(); setFile(null) }}
                style={{ marginTop: 12, fontSize: 12, color: c.muted, background: 'transparent', border: `1px solid ${c.border}`, padding: '4px 12px', borderRadius: 6, cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: c.surface, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 500, color: c.text, marginBottom: 6 }}>
                Drop your {tab === 'script' ? 'script' : 'audio'} here
              </p>
              <p style={{ fontSize: 13, color: c.muted, marginBottom: 4 }}>
                or click to browse
              </p>
              <p style={{ fontSize: 11, color: c.subtle }}>
                {tab === 'script' ? '.txt, .pdf, .docx — max 5MB' : '.mp3, .wav, .m4a — max 25MB'}
              </p>
            </div>
          )}
        </div>

        {/* INFO BOXES */}
        {tab === 'script' && (
          <div style={{ border: `1px solid ${c.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <p style={{ fontSize: 12, color: c.muted, lineHeight: 1.7 }}>
                Format your script with <strong style={{ color: c.text }}>A: </strong> and <strong style={{ color: c.text }}>B: </strong> prefixes for speaker assignment. Otherwise speakers will be auto-assigned alternately.
              </p>
              <p style={{ fontSize: 11, color: c.subtle, marginTop: 6, fontFamily: 'monospace' }}>
                A: Welcome to the show...<br/>
                B: Thanks for having me...
              </p>
            </div>
          </div>
        )}

        {tab === 'audio' && (
          <div style={{ border: `1px solid ${c.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style={{ fontSize: 12, color: c.muted, lineHeight: 1.7 }}>
              Your audio will be transcribed using <strong style={{ color: c.text }}>Groq Whisper</strong> — the fastest AI transcription model. Results are editable in the script editor. Costs 1 credit.
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span>{error}</span>
            {error.includes('Upgrade') && (
              <a href="/dashboard" style={{ fontSize: 12, fontWeight: 600, color: '#f97316', border: '1px solid rgba(249,115,22,0.4)', padding: '4px 12px', borderRadius: 6, whiteSpace: 'nowrap' }}>Upgrade →</a>
            )}
          </div>
        )}

        {/* PROGRESS */}
        {progress && (
          <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block', animation: 'pulse 1s ease-in-out infinite', flexShrink: 0 }} />
            {progress}
          </div>
        )}

        {/* UPLOAD BUTTON */}
        <button onClick={handleUpload} disabled={!file || uploading}
          style={{ width: '100%', padding: '14px', fontSize: 14, fontWeight: 500, borderRadius: 10, border: 'none', background: file && !uploading ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : c.surface2, color: file && !uploading ? '#fff' : c.subtle, cursor: file && !uploading ? 'pointer' : 'default', transition: 'all .2s', boxShadow: file && !uploading ? '0 4px 16px rgba(249,115,22,0.4)' : 'none' }}>
          {uploading ? 'Processing…' : `Upload ${tab === 'script' ? 'script' : 'audio'} →`}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: c.subtle, marginTop: 16 }}>
          Free users: 1 upload. Pro users: unlimited with credits.
        </p>
      </main>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0a0a0a', minHeight: '100vh' }} />}>
      <UploadPageInner />
    </Suspense>
  )
}
