'use client'
import { useState } from 'react'
import { ProfileMenu } from './ProfileMenu'

interface NavProps {
  c: any
  dark: boolean
  setDark: (v: boolean) => void
  activePath?: string
}

export function Nav({ c, dark, setDark, activePath }: NavProps) {
  return (
    <nav style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 50, width: 'calc(100% - 48px)', maxWidth: 980, background: dark ? 'rgba(14,14,14,0.85)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1px solid ${c.border}`, borderRadius: 16, transition: 'background .3s, border-color .3s', boxShadow: dark ? '0 4px 32px rgba(0,0,0,0.4)' : '0 4px 32px rgba(0,0,0,0.08)' }}>
      <style>{`
        .nav-pill-link { font-size: 13px; color: ${c.muted}; padding: 6px 12px; border-radius: 6px; transition: color .15s, background .15s; text-decoration: none; }
        .nav-pill-link:hover { color: ${c.text}; background: ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}; }
        .nav-pill-link.active { color: ${c.text}; font-weight: 500; }
        @media (max-width: 600px) { .nav-center-links { display: none !important; } }
      `}</style>
      <div style={{ padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: -.3 }}>Sus</span>
        </a>

        <div className="nav-center-links" style={{ display: 'flex', alignItems: 'center' }}>
          {[
            ['Home', '/'],
            ['Studio', '/studio'],
            ['Upload', '/upload'],
            ['Work', '/episodes'],
            ['Dashboard', '/dashboard'],
            ['Pricing', '/#pricing'],
            ['Changelog', '/changelog'],
          ].map(([label, href]) => (
            <a key={label} href={href} className={`nav-pill-link${activePath === href ? ' active' : ''}`}>{label}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button onClick={() => setDark(!dark)}
            style={{ width: 30, height: 30, borderRadius: 6, background: 'transparent', border: `1px solid ${c.border}`, color: c.muted, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.text; e.currentTarget.style.color = c.text }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.muted }}>
            {dark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
          </button>
          <ProfileMenu c={c} />
        </div>
      </div>
    </nav>
  )
}
