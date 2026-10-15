'use client'
import { Section, glass, ORANGE, type LandingProps } from './Section'
import { useInView } from './useReveal'
import { Waveform } from './Waveform'

export function UploadFlow({ c, dark }: LandingProps) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3)
  const muted = dark ? '#a8a8a8' : c.muted

  const cards = [
    {
      tag: 'Upload audio',
      title: 'Already recorded? Bring it.',
      body: 'Drop an MP3 or WAV up to 25MB. Whisper transcribes it into an editable two-speaker script in seconds.',
      color: '#3b82f6',
      demo: (
        <>
          <File name="interview.mp3" sub="18.4 MB" color="#3b82f6" />
          <div style={{ marginTop: 10 }}><Waveform bars={30} height={22} color="#3b82f6" active={inView} /></div>
          <Typed text="A: So how did it start? B: Frustration." show={inView} muted={muted} />
        </>
      ),
    },
    {
      tag: 'Upload script',
      title: 'Have a script? Voice it.',
      body: 'Upload .txt, .pdf or .docx. SUS splits it into lines and assigns speakers you can change line by line.',
      color: '#22c55e',
      demo: (
        <>
          <File name="newsletter.docx" sub="3 pages" color="#22c55e" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {[['A', 'This week, a story about failure.'], ['B', 'The good kind?'], ['A', 'The expensive kind.']].map(([s, t], i) => (
              <div key={i} className={inView ? 'pop-in' : ''} style={{ animationDelay: `${600 + i * 250}ms`, opacity: inView ? undefined : 0, display: 'flex', gap: 8, fontSize: 12, color: muted }}>
                <b style={{ color: s === 'A' ? ORANGE : '#8b5cf6' }}>{s}</b>{t}
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      tag: 'Edit & produce',
      title: 'Fine-tune, then render.',
      body: 'Rewrite any line, swap speakers, pick voices and length. Nothing is generated until you say go.',
      color: ORANGE,
      demo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['Rewrite line 4 — punchier', 'Swap speaker on line 7', 'Length: 10 min'].map((t, i) => (
            <div key={t} className={inView ? 'pop-in' : ''} style={{ animationDelay: `${300 + i * 300}ms`, opacity: inView ? undefined : 0, fontSize: 12, padding: '8px 10px', borderRadius: 8, border: `1px solid ${c.border2}`, color: muted, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: ORANGE }} />{t}
            </div>
          ))}
          <div style={{ marginTop: 4, fontSize: 12, fontWeight: 600, padding: '9px 12px', borderRadius: 8, background: ORANGE, color: '#fff', textAlign: 'center' }}>Produce episode</div>
        </div>
      ),
    },
  ]

  return (
    <Section c={c} dark={dark} eyebrow="Bring your own" center
      title="Start from a topic, a recording or a script."
      subtitle="SUS isn’t only for new ideas. Turn what you already have into a produced episode.">
      <div ref={ref} className="l-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {cards.map((cd, i) => (
          <div key={cd.tag} className="stagger lift" style={{ ['--d' as string]: i, ...glass(dark, false), boxShadow: 'none', borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
            borderColor: `${cd.color}55`, boxSizing: 'border-box' }}>
            <span style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, color: cd.color, border: `1px solid ${cd.color}66` }}>{cd.tag}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{cd.title}</div>
              <div style={{ fontSize: 13, color: muted, lineHeight: 1.6 }}>{cd.body}</div>
            </div>
            <div style={{ marginTop: 'auto', borderRadius: 12, padding: 14, background: dark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)', minHeight: 150 }}>{cd.demo}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function File({ name, sub, color }: { name: string; sub: string; color: string }) {
  return (
    <div className="drop-in" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 32, height: 38, borderRadius: 6, background: `${color}22`, border: `1px solid ${color}88`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
      </span>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{name}</div>
        <div style={{ fontSize: 11, opacity: .6 }}>{sub}</div>
      </div>
    </div>
  )
}

function Typed({ text, show, muted }: { text: string; show: boolean; muted: string }) {
  return (
    <div style={{ marginTop: 10, fontSize: 12, color: muted, lineHeight: 1.6, overflow: 'hidden', whiteSpace: 'nowrap',
      maxWidth: show ? '100%' : 0, transition: 'max-width 2.4s steps(40) .8s' }}>
      {text}
    </div>
  )
}
