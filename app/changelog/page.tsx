'use client'
import { useState } from 'react'

const CHANGES = [
  {
    version: 'v7.0',
    date: 'May 2025',
    tag: 'Major',
    items: [
      'Voice selector — choose from 16 ElevenLabs voices for Speaker A and B',
      'Language support — generate scripts in 12 languages including Hindi, Tamil, Spanish, Japanese',
      'Configuration step before generation — set voice, language, duration, speaker format',
      'Profile dropdown menu with credits bar and quick navigation',
      'Buy credits prompt when credits run out',
      'Unified design system across all pages',
    ]
  },
  {
    version: 'v6.0',
    date: 'April 2025',
    tag: 'Major',
    items: [
      'Multi-provider AI — Claude → OpenAI → Groq fallback chain',
      'Circuit breakers and adaptive routing',
      'Semantic cache for research and SEO tasks',
      'ElevenLabs 2-speaker audio rendering',
      'Replicate thumbnail generation',
      'YouTube auto-upload and Instagram Reel scheduling',
    ]
  },
  {
    version: 'v5.0',
    date: 'March 2025',
    tag: 'Launch',
    items: [
      'Script × 5 generation with 10-metric evaluation',
      'Human-in-the-loop script selection',
      'SEO package — YouTube, Instagram, Twitter, LinkedIn, newsletter',
      'Credit system with Dodo Payments',
      'Google OAuth authentication',
    ]
  },
]

export default function ChangelogPage() {
  const [dark, setDark] = useState(true)

  const c = dark ? {
    bg: '#0a0a0a', nav: 'rgba(10,10,10,0.92)', surface: '#141414',
    surface2: '#1a1a1a', border: '#222', border2: '#2a2a2a',
    text: '#f5f5f5', muted: '#888', subtle: '#444',
    accent: '#f5f5f5', accentFg: '#0a0a0a',
  } : {
    bg: '#ffffff', nav: 'rgba(255,255,255,0.92)', surface: '#f0f0f0',
    surface2: '#efefef', border: '#d0d0d0', border2: '#bbb',
    text: '#0a0a0a', muted: '#444', subtle: '#666',
    accent: '#0a0a0a', accentFg: '#ffffff',
  }

  const tagColor = (tag: string) =>
    tag === 'Major' ? { bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa' } :
    tag === 'Launch' ? { bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)', text: '#4ade80' } :
    { bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)', text: '#60a5fa' }

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, fontFamily: "'Inter', -apple-system, sans-serif", transition: 'background .3s, color .3s' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } a { color: inherit; text-decoration: none; } button { font-family: inherit; cursor: pointer; border: none; }`}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${c.border}`, backdropFilter: 'blur(16px)', background: c.nav }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: -.3 }}>SceneForge</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setDark(!dark)} style={{ width: 30, height: 30, borderRadius: 6, background: 'transparent', border: `1px solid ${c.border}`, color: c.muted, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {dark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
            </button>
            <a href="/login" style={{ fontSize: 13, fontWeight: 500, background: c.accent, color: c.accentFg, padding: '7px 16px', borderRadius: 7 }}>Get started</a>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px 100px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16 }}>Updates</p>
        <h1 style={{ fontSize: 'clamp(26px,3vw,40px)', fontWeight: 600, letterSpacing: -.6, lineHeight: 1.15, marginBottom: 48 }}>Changelog</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {CHANGES.map((release, ri) => {
            const tag = tagColor(release.tag)
            return (
              <div key={release.version} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 32, paddingBottom: 48, borderBottom: ri < CHANGES.length - 1 ? `1px solid ${c.border}` : 'none', marginBottom: 48 }}>
                <div style={{ paddingTop: 2 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{release.version}</div>
                  <div style={{ fontSize: 11, color: c.muted, marginBottom: 10 }}>{release.date}</div>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: .5, padding: '3px 8px', borderRadius: 4, background: tag.bg, border: `1px solid ${tag.border}`, color: tag.text }}>{release.tag}</span>
                </div>
                <div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {release.items.map((item, ii) => (
                      <li key={ii} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: c.muted, lineHeight: 1.6 }}>
                        <span style={{ color: c.subtle, flexShrink: 0, marginTop: 2, fontSize: 10 }}>◆</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '18px 24px', maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>SceneForge</span>
        <div style={{ display: 'flex' }}>
          {[['Terms','/terms'],['Privacy','/privacy'],['GitHub','https://github.com/Sudharsansus/sf']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: c.muted, padding: '4px 10px' }}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 11, color: c.muted }}>© 2025 SceneForge</span>
      </footer>
    </div>
  )
}
