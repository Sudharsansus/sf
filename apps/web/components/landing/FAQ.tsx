'use client'
import { useState } from 'react'
import { Section, glass, ORANGE, type LandingProps } from './Section'

const QA: [string, string][] = [
  ['What is SUS?', 'SUS is an AI production studio for creators. Give it a topic, a recording or a script and it researches, writes five scored scripts, voices the one you pick with studio voices, and designs thumbnails plus a full SEO and social package.'],
  ['How do credits work?', 'One credit equals one minute of finished audio. A 10-minute episode uses 10 credits. Credits are only deducted when you generate, and they are refunded automatically if a generation fails.'],
  ['Is there a free plan?', 'Yes. Every new account gets free credits to produce real episodes — no card required. Upgrade when you need longer episodes or more minutes each month.'],
  ['Which languages are supported?', 'English, Hindi, Tamil, Spanish, French, German, Portuguese, Japanese, Korean, Arabic, Italian and Chinese — for research, scripts and voices.'],
  ['Can I use my own recording or script?', 'Yes. Upload audio (MP3/WAV up to 25MB) to get an editable transcript, or upload a .txt, .pdf or .docx script. You can reassign speakers and rewrite any line before producing.'],
  ['Does SUS post anything automatically?', 'Never. You review everything first. Publishing to YouTube or Instagram only happens when you connect your account and click publish.'],
  ['Who owns the content?', 'You do. Download your audio, scripts and artwork and use them commercially anywhere. We take no revenue share.'],
  ['Which AI powers SUS?', 'Claude for writing, OpenAI and Groq for research and scoring, ElevenLabs for voices and Replicate for artwork — with automatic failover between providers.'],
]

export function FAQ({ c, dark }: LandingProps) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <Section c={c} dark={dark} id="faq" eyebrow="FAQ" center title="Frequently asked questions.">
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {QA.map(([q, a], i) => {
          const on = open === i
          return (
            <div key={q} className="stagger" style={{ ['--d' as string]: i, ...glass(dark, false), boxShadow: 'none', borderRadius: 14, ...(on ? { borderColor: `${ORANGE}88` } : {}), transition: 'border-color .25s' }}>
              <button onClick={() => setOpen(on ? null : i)} aria-expanded={on}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '18px 20px', background: 'transparent', color: c.text, fontSize: 15, fontWeight: 500, textAlign: 'left' }}>
                {q}
                <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', border: `1px solid ${c.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: on ? 'rotate(45deg)' : 'none', transition: 'transform .3s', color: on ? ORANGE : c.subtle }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </span>
              </button>
              <div className={`faq-body ${on ? 'open' : ''}`}>
                <div><p style={{ padding: '0 20px 18px', fontSize: 14, lineHeight: 1.7, color: dark ? '#b0b0b0' : c.muted }}>{a}</p></div>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
