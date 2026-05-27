'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useGenerate } from '@/hooks/useGenerate'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import { ScriptPicker } from '@/components/studio/ScriptPicker'
import { EpisodeResult } from '@/components/studio/EpisodeResult'
import { ChatBox } from '@/components/studio/ChatBox'

const ROTATING_WORDS = ['podcasts', 'YouTube videos', 'newsletters', 'scripts', 'narrations', 'episodes']

export default function Home() {
  const g = useGenerate()
  const { data: session } = useSession()
  const [dark, setDark] = useState(true)
  const [wordIndex, setWordIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(true)

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
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${c.border}`, backdropFilter: 'blur(16px)', background: c.nav, transition: 'background .3s' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: -.3 }}>SceneForge</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {[['Studio','/studio'],['Work','/episodes'],['Dashboard','/dashboard']].map(([l,h]) => (
              <a key={l} href={h} className="nav-link">{l}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setDark(!dark)} style={{ width: 30, height: 30, borderRadius: 6, background: 'transparent', border: `1px solid ${c.border}`, color: c.muted, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = c.text; e.currentTarget.style.color = c.text }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.muted }}>
              {dark ? '○' : '●'}
            </button>
            {session ? (
              <>
                <span style={{ fontSize: 13, color: c.muted, padding: '0 12px' }}>{session.user?.email}</span>
                <a href="/api/auth/signout" className="nav-link">Sign out</a>
              </>
            ) : (
              <>
                <a href="/login" className="nav-link">Sign in</a>
                <a href="/login" style={{ fontSize: 13, fontWeight: 500, background: c.accent, color: c.accentFg, padding: '7px 16px', borderRadius: 7, transition: 'opacity .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '.8')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  Get started
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '88px 24px 64px', textAlign: 'center' }}>

        <h1 className="f0" style={{ fontSize: 'clamp(38px, 6vw, 68px)', fontWeight: 600, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 }}>
          Create studio-quality<br />
          <span suppressHydrationWarning={true} style={{ color: dark ? c.muted : c.text }}>
            {displayed}
            <span style={{ animation: 'blink 1s step-end infinite', borderRight: `2px solid ${c.text}`, marginLeft: 2 }}>&nbsp;</span>
          </span>
        </h1>

        <p className="f1" style={{ fontSize: 16, color: c.muted, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 40px', fontWeight: 400 }}>
          Research, scripts, voice, visuals, and SEO — one workflow, fully in your control.
        </p>

        {/* CONSOLE */}
        <div className="f2" style={{ maxWidth: 620, margin: '0 auto' }}>
          <div className="card" style={{ borderColor: isWorking ? c.text : c.border }}>

            {(g.step === 'idle' || isFailed) && <>
              <div style={{ padding: '16px 18px 10px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: c.muted, fontSize: 16, marginTop: 2, flexShrink: 0 }}>›</span>
                <textarea
                  value={g.topic}
                  onChange={e => g.setTopic(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); g.generate() } }}
                  rows={2}
                  placeholder="What's your episode about?"
                  style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, color: c.text, lineHeight: 1.6, resize: 'none', fontWeight: 400 }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 14px', borderTop: `1px solid ${c.border}` }}>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {['Research', 'Scripts ×5', 'Voice', 'Visuals', 'SEO'].map(tag => (
                    <span key={tag} style={{ fontSize: 10, color: c.subtle, padding: '2px 8px', borderRadius: 4, border: `1px solid ${c.border}`, fontWeight: 500, letterSpacing: .2 }}>{tag}</span>
                  ))}
                </div>
                <button onClick={g.generate} disabled={!g.topic.trim()}
                  style={{ fontSize: 13, fontWeight: 500, padding: '7px 18px', borderRadius: 7, background: g.topic.trim() ? c.accent : c.surface2, color: g.topic.trim() ? c.accentFg : c.subtle, transition: 'all .15s' }}
                  onMouseEnter={e => { if (g.topic.trim()) e.currentTarget.style.opacity = '.85' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
                  Create episode →
                </button>
              </div>
              {isFailed && g.error && <p style={{ padding: '0 18px 12px', fontSize: 12, color: '#f87171' }}>{g.error}</p>}
            </>}

            {isConfiguring && <div style={{ padding: '14px 18px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <button onClick={g.reset} style={{ fontSize: 11, color: c.muted, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = c.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = c.muted)}>← Back</button>
                <span style={{ fontSize: 12, color: c.muted, fontWeight: 500 }}>Configure your episode</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: c.muted, marginBottom: 8, fontWeight: 500 }}>Duration</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {['30sec', '1min', '2min', '5min', '10min', '15min', '20min', '30min', '45min', '60min'].map(d => (
                    <button key={d} onClick={() => g.setSelectedDuration(d)}
                      style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, border: `1px solid ${g.selectedDuration === d ? c.border2 : c.border}`, background: g.selectedDuration === d ? c.surface2 : 'transparent', color: g.selectedDuration === d ? c.text : c.muted, cursor: 'pointer', transition: 'all .15s' }}>
                      {d}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type custom: e.g. 3min, 90sec"
                  value={g.selectedDuration}
                  onChange={e => g.setSelectedDuration(e.target.value)}
                  style={{ width: '100%', fontSize: 12, padding: '7px 12px', borderRadius: 6, border: `1px solid ${c.border}`, background: c.surface, color: c.text, fontFamily: 'inherit', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 11, color: c.muted, marginBottom: 8, fontWeight: 500 }}>Speaker format</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[['both', 'A + B (Conversation)'], ['a', 'Solo A'], ['b', 'Solo B']].map(([val, label]) => (
                    <button key={val} onClick={() => g.setSelectedSpeaker(val)}
                      style={{ fontSize: 11, padding: '5px 12px', borderRadius: 6, border: `1px solid ${g.selectedSpeaker === val ? c.border2 : c.border}`, background: g.selectedSpeaker === val ? c.surface2 : 'transparent', color: g.selectedSpeaker === val ? c.text : c.muted, cursor: 'pointer', transition: 'all .15s' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={g.startGeneration}
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

          {g.step === 'idle' && <p className="f3" style={{ marginTop: 12, fontSize: 11, color: c.muted, textAlign: 'center', letterSpacing: .3 }}>
            No auto-posting · You own every episode · Claude · ElevenLabs · Replicate
          </p>}
        </div>
      </section>

      {/* NUMBERS */}
      <div style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[['1 session','Weeks of work compressed'],['5 scripts','Written + scored per topic'],['Your call','You review before publishing'],['Studio grade','ElevenLabs + AI visuals']].map(([v,l],i,a) => (
            <div key={v} style={{ padding: '28px 24px', textAlign: 'center', borderRight: i < a.length-1 ? `1px solid ${c.border}` : 'none' }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{v}</div>
              <div style={{ fontSize: 12, color: dark ? c.muted : c.text }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TICKER */}
      <div style={{ overflow: 'hidden', borderBottom: `1px solid ${c.border}`, padding: '11px 0', background: c.surface }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 22s linear infinite' }}>
          {[...Array(2)].flatMap(() => ['Research Agent','Script × 5','Claude Sonnet 4','ElevenLabs','Replicate','SEO Package','Human in the loop','Zero auto-post','Multi-provider AI','Studio quality']).map((s,i) => (
            <span key={i} style={{ fontSize: 11, color: c.muted, padding: '0 22px', borderRight: `1px solid ${c.border}`, whiteSpace: 'nowrap', fontWeight: 500, letterSpacing: .3 }}>{s}</span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px 0' }}>
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
              <div style={{ padding: '18px 0 18px 18px', fontSize: 10, color: c.subtle, fontWeight: 600, letterSpacing: .5 }}>{n}</div>
              <div style={{ padding: '18px 14px', fontSize: 13, fontWeight: 600, color: c.text, borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}` }}>{name}</div>
              <div style={{ padding: '18px 22px', fontSize: 13, color: c.muted, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px 0' }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Why SceneForge</p>
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 600, letterSpacing: -.6, lineHeight: 1.2 }}>Not a generator. A production system.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: c.border, borderRadius: 10, overflow: 'hidden' }}>
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
              <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE */}
      <section style={{ maxWidth: 640, margin: '80px auto 0', padding: '0 24px' }}>
        <div className="card" style={{ padding: '32px 36px' }}>
          <p style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.65, marginBottom: 16, color: c.text }}>
            "The research alone saves me three hours per episode. The script evaluation is the feature I didn't know I needed."
          </p>
          <p style={{ fontSize: 12, color: c.subtle }}>Early access creator · Scripted tech podcast</p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1080, margin: '80px auto 0', padding: '0 24px 100px' }}>
        <div className="card" style={{ padding: '60px 52px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 48 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 }}>Begin production</p>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 600, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 14 }}>
              Your brief. Studio output.
            </h2>
            <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.7, maxWidth: 360 }}>10 free credits on sign up. No card required. Research, scripts, voice, visuals, and SEO — done.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
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
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '18px 24px', maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 18, height: 18, borderRadius: 5, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 13 }}>SceneForge</span>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {[['Terms','/terms'],['Privacy','/privacy'],['GitHub','https://github.com/Sudharsansus/sf']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: c.muted, padding: '4px 10px', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = c.text)}
              onMouseLeave={e => (e.currentTarget.style.color = c.muted)}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 11, color: c.muted }}>© 2025 SceneForge</span>
      </footer>

      <ChatBox />
    </div>
  )
}