'use client'
import { Section, glass, ORANGE, type LandingProps } from './Section'

const ITEMS: [string, string, string][] = [
  ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'You own everything', 'Scripts, audio and artwork are yours to download and publish anywhere. No revenue share, no lock-in.'],
  ['M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11', 'Human approval, always', 'Nothing renders without your pick, and nothing posts without your click. Zero auto-posting.'],
  ['M3 11h18v11H3zM7 11V7a5 5 0 0 1 10 0v4', 'Secure by default', 'Google sign-in, signed payment webhooks, abuse detection and per-user rate limits.'],
  ['M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', 'Pay per minute', 'One credit is one minute of finished audio. If a generation fails, your credits come back.'],
  ['M4 4h16v16H4zM4 9h16M9 20V9', 'Every format you need', 'MP3 audio, 16:9 and square thumbnails, show notes, chapters and social copy — ready to upload.'],
  ['M22 12h-4l-3 9L9 3l-3 9H2', 'Built to finish', 'Every step runs in the background with automatic retries, so a hiccup never loses your episode — or your credits.'],
]

export function TrustGrid({ c, dark }: LandingProps) {
  return (
    <Section c={c} dark={dark} eyebrow="Peace of mind" center title="The confidence behind every episode."
      subtitle="Built for creators who publish under their own name.">
      <div className="l-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {ITEMS.map(([d, t, b], i) => (
          <div key={t} className="stagger lift" style={{ ['--d' as string]: i, ...glass(dark, false), boxShadow: 'none', borderRadius: 16, padding: 22 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              background: dark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.10)', color: ORANGE }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
            </span>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t}</div>
            <div style={{ fontSize: 13, color: dark ? '#a8a8a8' : c.muted, lineHeight: 1.65 }}>{b}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}
