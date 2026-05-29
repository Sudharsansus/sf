'use client'
import { useState } from 'react'
import { Nav } from '@/components/ui/Nav'

export default function PrivacyPage() {
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

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, fontFamily: "'Inter', -apple-system, sans-serif", transition: 'background .3s, color .3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; outline: none; }
        .nav-link { font-size: 13px; color: ${dark ? c.muted : c.text}; padding: 6px 12px; border-radius: 6px; transition: color .15s, background .15s; }
        .nav-link:hover { color: ${c.text}; background: ${dark ? 'transparent' : c.surface}; }
      `}</style>

      {/* NAV */}
      <Nav c={c} dark={dark} setDark={setDark} activePath="/privacy" />

      {/* PROSE */}
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px 100px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16 }}>Legal</p>
        <h1 style={{ fontSize: 'clamp(26px,3vw,40px)', fontWeight: 600, letterSpacing: -.6, lineHeight: 1.15, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: c.muted, marginBottom: 48 }}>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        {[
          ['What we collect', [
            'When you sign in with Google, we collect your email address, name, and profile image. We use this only to identify your account and personalise your experience.',
            'When you generate episodes, we store the topic, script, audio file URL, thumbnail URLs, and SEO content associated with your account.',
          ]],
          ['Where data is stored', [
            'Database: Neon Postgres — hosted on AWS (US East). Contains user profiles, episode metadata, and credits ledger.',
            'Audio & Images: Cloudflare R2 — global CDN. Generated audio files and thumbnails.',
            'Cache: Upstash Redis — ephemeral session and rate limit data only.',
          ]],
          ['Third-party services', [
            'We send your episode scripts to Anthropic (Claude API) and ElevenLabs for audio generation. We send thumbnail prompts to Replicate. None of these services retain your data beyond the request.',
            'If you connect YouTube or Instagram, we store OAuth tokens encrypted in our database to enable publishing on your behalf.',
          ]],
          ['Your rights', [
            'You can delete your account and all associated data at any time from Settings. We will permanently delete all your data within 30 days of request.',
            'We do not sell your data. We do not use your data for advertising. We do not share your data with third parties except as described above.',
          ]],
          ['Contact', ['Questions? Email us at privacy@sus.ai']],
        ].map(([heading, paras]) => (
          <div key={String(heading)} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: -.2, marginBottom: 14, color: c.text }}>{heading}</h2>
            {(paras as string[]).map((p, i) => (
              <p key={i} style={{ fontSize: 14, color: c.muted, lineHeight: 1.75, marginBottom: 10 }}>{p}</p>
            ))}
          </div>
        ))}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '18px 24px', maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 18, height: 18, borderRadius: 5, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Sus</span>
        </div>
        <div style={{ display: 'flex' }}>
          {[['Terms','/terms'],['Privacy','/privacy'],['GitHub','https://github.com/Sudharsansus/sf']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: c.muted, padding: '4px 10px', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = c.text)}
              onMouseLeave={e => (e.currentTarget.style.color = c.muted)}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 11, color: c.muted }}>© 2025 Sus</span>
      </footer>
    </div>
  )
}
