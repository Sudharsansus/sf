'use client'
import { useEffect, useState } from 'react'
import { Section, glass, ORANGE, type LandingProps } from './Section'
import { useInView, useReducedMotion } from './useReveal'
import { Waveform } from './Waveform'

const CASES = [
  {
    tab: 'Podcasters',
    items: [
      ['Weekly shows', 'A researched two-host episode every week, without the research week.'],
      ['Guest prep', 'Briefs, questions and counter-points before you hit record.'],
      ['Show notes', 'Chapters, timestamps and quotes, written for you.'],
    ],
    episode: 'Ep. 42 — The quiet economics of remote work',
    lines: [['A', 'Remote work didn’t kill the office. It repriced it.'], ['B', 'Repriced how? Rents are still sky high in most cities.']],
    meta: '18 min · 2 speakers · English',
    grad: '#8b5cf6,#3b82f6',
  },
  {
    tab: 'YouTubers',
    items: [
      ['Explainers', 'Script, voice-over and thumbnail for faceless channels.'],
      ['Shorts', '60-second cuts with a hook in the first three seconds.'],
      ['SEO that ranks', 'Titles, descriptions and tags written for search.'],
    ],
    episode: 'Why every phone looks the same now',
    lines: [['A', 'Open your pocket. Odds are it’s a black glass rectangle.'], ['B', 'And there’s a very boring reason for that.']],
    meta: '8 min · voice-over · 3 thumbnails',
    grad: '#f97316,#ec4899',
  },
  {
    tab: 'Educators',
    items: [
      ['Lesson audio', 'Turn a syllabus topic into a conversational lesson.'],
      ['Any language', 'Teach in English, Hindi, Tamil, Spanish and more.'],
      ['Beginner mode', 'Pick the Beginner angle for zero-jargon explanations.'],
    ],
    episode: 'Photosynthesis, explained like a story',
    lines: [['A', 'Every leaf is a tiny solar-powered sugar factory.'], ['B', 'So where does the sugar actually go?']],
    meta: '12 min · Beginner angle · Tamil + English',
    grad: '#22c55e,#0ea5e9',
  },
  {
    tab: 'Agencies',
    items: [
      ['Client podcasts', 'Branded shows for every client from one workspace.'],
      ['Bulk production', 'Up to 2,000 minutes a month on the Agency plan.'],
      ['Review flow', 'Nothing publishes until you approve it.'],
    ],
    episode: 'Acme Fintech — Monthly market minute',
    lines: [['A', 'Rates held this month. Here’s what that means for you.'], ['B', 'Short version: refinance math just changed.']],
    meta: '5 min · branded intro · client-ready',
    grad: '#eab308,#f97316',
  },
  {
    tab: 'Writers',
    items: [
      ['Audio editions', 'Upload your newsletter or script and hear it voiced.'],
      ['Speaker split', 'Assign lines to two voices in the script editor.'],
      ['Repurpose', 'One essay becomes a podcast, a video and social posts.'],
    ],
    episode: 'The Sunday Letter — audio edition',
    lines: [['A', 'This week I want to talk about boredom.'], ['B', 'Which is, ironically, the least boring topic there is.']],
    meta: 'Uploaded .docx · 9 min · 2 voices',
    grad: '#ec4899,#8b5cf6',
  },
]

export function UseCaseTabs({ c, dark }: LandingProps) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [ref, inView] = useInView<HTMLDivElement>(0.3)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!inView || paused || reduced) return
    const t = setInterval(() => setActive(a => (a + 1) % CASES.length), 5000)
    return () => clearInterval(t)
  }, [inView, paused, reduced])

  const cur = CASES[active]!
  return (
    <Section c={c} dark={dark} eyebrow="Use cases" center title="Built for whatever you make."
      subtitle="Same studio, tuned for how you publish.">
      <div ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="l-tabs stagger" role="tablist" style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <div style={{ ...glass(dark), display: 'flex', gap: 4, padding: 5, borderRadius: 999 }}>
            {CASES.map((cs, i) => (
              <button key={cs.tab} role="tab" aria-selected={i === active} onClick={() => setActive(i)} className="tab-pill"
                style={{ padding: '9px 18px', borderRadius: 999, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
                  background: i === active ? c.accent : 'transparent', color: i === active ? c.accentFg : (dark ? '#bbb' : c.muted) }}>
                {cs.tab}
              </button>
            ))}
          </div>
        </div>

        <div className="l-split stagger" style={{ ['--d' as string]: 1, display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 24, alignItems: 'stretch' }}>
          <div key={`l${active}`} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cur.items.map(([t, d], i) => (
              <div key={t} className="pop-in lift" style={{ animationDelay: `${i * 90}ms`, ...glass(dark, false), boxShadow: 'none', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 14 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 0 ? ORANGE : c.surface2, color: i === 0 ? '#fff' : c.text, fontSize: 13, fontWeight: 600 }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t}</div>
                  <div style={{ fontSize: 13, color: dark ? '#a8a8a8' : c.muted, lineHeight: 1.6 }}>{d}</div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {CASES.map((_, i) => (
                <span key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: c.border, overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', background: ORANGE, width: i < active ? '100%' : i === active ? '100%' : '0%',
                    transition: i === active && !paused && !reduced ? 'width 5s linear' : 'none', opacity: i <= active ? 1 : 0 }} />
                </span>
              ))}
            </div>
          </div>

          <div key={`r${active}`} className="pop-in" style={{ ...glass(dark), borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ aspectRatio: '16/8', background: `linear-gradient(135deg, ${cur.grad})`, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 18 }}>
              <span style={{ position: 'absolute', top: 14, left: 14, fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '4px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.35)', color: '#fff' }}>{cur.tab.toUpperCase()}</span>
              <span className="float-y" style={{ position: 'absolute', right: 18, top: 18, width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#111"><polygon points="7 4 20 12 7 20 7 4" /></svg>
              </span>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 'clamp(16px,2vw,22px)', lineHeight: 1.2, textShadow: '0 2px 12px rgba(0,0,0,.3)', maxWidth: '85%' }}>{cur.episode}</div>
            </div>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {cur.lines.map(([who, txt], i) => (
                <div key={i} className="pop-in" style={{ animationDelay: `${300 + i * 350}ms`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: who === 'A' ? ORANGE : '#8b5cf6', color: '#fff' }}>{who}</span>
                  <span style={{ fontSize: 13, lineHeight: 1.6, color: dark ? '#d4d4d4' : c.text }}>{txt}</span>
                </div>
              ))}
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <Waveform bars={28} height={22} color={dark ? '#e5e5e5' : '#333'} />
                <span style={{ fontSize: 11, color: c.subtle }}>{cur.meta}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
