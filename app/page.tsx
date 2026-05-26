'use client'
import { useState } from 'react'
import { useGenerate } from '@/hooks/useGenerate'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import { ScriptPicker } from '@/components/studio/ScriptPicker'
import { EpisodeResult } from '@/components/studio/EpisodeResult'
import { ChatBox } from '@/components/studio/ChatBox'

export default function Home() {
  const g = useGenerate()
  const [dark, setDark] = useState(true)

  const isWorking  = g.step === 'working' || g.step === 'producing'
  const isPicking  = g.step === 'picking'
  const isComplete = g.step === 'complete'
  const isFailed   = g.step === 'failed'

  const t = {
    bg:       dark ? '#0f0f0f' : '#fafaf8',
    bg2:      dark ? '#161616' : '#f2f2ef',
    bg3:      dark ? '#1c1c1c' : '#e8e8e4',
    border:   dark ? '#262626' : '#d8d8d2',
    border2:  dark ? '#2e2e2e' : '#cececa',
    text:     dark ? '#f0f0f0' : '#111111',
    text2:    dark ? '#888888' : '#666666',
    text3:    dark ? '#444444' : '#999999',
    accent:   dark ? '#d4a853' : '#c49a3a',
    accentBg: dark ? 'rgba(212,168,83,0.08)' : 'rgba(196,154,58,0.1)',
    inputBg:  dark ? '#141414' : '#ffffff',
  }

  return (
    <div style={{ background: t.bg, minHeight: '100vh', color: t.text, transition: 'background 0.4s, color 0.4s' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; }
        textarea, input { font-family: inherit; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .f0 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.0s both; }
        .f1 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.08s both; }
        .f2 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.16s both; }
        .f3 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.24s both; }
        .f4 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.32s both; }

        textarea::placeholder { color: #666; }
        textarea:focus { outline: none; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: dark ? 'rgba(15,15,15,0.92)' : 'rgba(250,250,248,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${t.border}`,
        transition: 'background 0.4s',
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: t.accent, animation: 'pulse 3s infinite' }} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontStyle: 'italic', color: t.text, letterSpacing: -0.3 }}>SceneForge</span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: t.text3, letterSpacing: 1.5, border: `1px solid ${t.border}`, padding: '2px 6px', borderRadius: 3 }}>STUDIO</span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 0 }}>
            {[['Studio','/studio'],['Work','/episodes'],['Dashboard','/dashboard']].map(([l,h]) => (
              <a key={l} href={h} style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, color: t.text2, padding: '8px 14px', borderRadius: 7, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = t.text)}
                onMouseLeave={e => (e.currentTarget.style.color = t.text2)}>{l}</a>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Theme toggle */}
            <button onClick={() => setDark(!dark)} style={{
              width: 36, height: 36, borderRadius: 8, background: t.bg3, border: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, transition: 'all 0.2s', color: t.text2
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.text2 }}>
              {dark ? '☀' : '◐'}
            </button>

            <a href="/login" style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, color: t.text2, padding: '8px 14px', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = t.text)}
              onMouseLeave={e => (e.currentTarget.style.color = t.text2)}>Sign in</a>

            <a href="/login" style={{
              fontFamily: "'Geist', sans-serif", fontSize: 13, fontWeight: 500,
              color: dark ? '#0f0f0f' : '#fafaf8',
              background: t.text,
              padding: '8px 18px', borderRadius: 8,
              transition: 'all 0.2s', display: 'inline-block'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = t.text; e.currentTarget.style.color = dark ? '#0f0f0f' : '#fafaf8' }}>
              Start free
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: '96px 32px 72px', textAlign: 'center', position: 'relative' }}>
        {/* Subtle glow */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: `radial-gradient(ellipse, ${t.accentBg} 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <div className="f0" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28, padding: '5px 14px 5px 10px', borderRadius: 100, background: t.accentBg, border: `1px solid ${dark ? 'rgba(212,168,83,0.2)' : 'rgba(196,154,58,0.3)'}` }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: t.accent }} />
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: t.accent, letterSpacing: 1.5 }}>CREATOR PRODUCTION STUDIO</span>
        </div>

        <h1 className="f1" style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(44px, 7vw, 80px)',
          lineHeight: 1.08,
          letterSpacing: -1.5,
          marginBottom: 24,
          fontWeight: 400,
        }}>
          Your AI-assisted<br />
          <em style={{ color: t.accent, fontStyle: 'italic' }}>production studio.</em>
        </h1>

        <p className="f2" style={{ fontFamily: "'Geist', sans-serif", fontSize: 17, color: t.text2, lineHeight: 1.72, maxWidth: 480, margin: '0 auto 48px', fontWeight: 300 }}>
          Compress weeks of research, scripting, and production into a single session. You review and publish on your own schedule.
        </p>

        {/* ── INPUT CONSOLE ── */}
        <div className="f3" style={{ maxWidth: 660, margin: '0 auto' }}>
          <div style={{
            background: t.inputBg,
            border: `1px solid ${isWorking ? t.accent : t.border}`,
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: dark
              ? `0 1px 3px rgba(0,0,0,0.4), 0 20px 60px rgba(0,0,0,0.3)${isWorking ? `, 0 0 40px rgba(212,168,83,0.06)` : ''}`
              : `0 1px 3px rgba(0,0,0,0.08), 0 20px 60px rgba(0,0,0,0.06)`,
            transition: 'all 0.4s',
          }}>

            {/* Input state */}
            {(g.step === 'idle' || isFailed) && (
              <>
                <div style={{ padding: '20px 22px 14px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, color: t.accent, marginTop: 2, flexShrink: 0 }}>›</span>
                  <textarea
                    value={g.topic}
                    onChange={e => g.setTopic(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); g.generate() } }}
                    rows={2}
                    placeholder="What's your episode about?"
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 15, color: t.text, lineHeight: 1.6, resize: 'none', fontFamily: "'Geist', sans-serif", fontWeight: 300 }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 16px', borderTop: `1px solid ${t.border}` }}>
                  <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                    {['Research', '5 Scripts', 'Voice', 'Visuals', 'SEO'].map(c => (
                      <span key={c} style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: t.text3, padding: '3px 8px', borderRadius: 4, border: `1px solid ${t.border}`, letterSpacing: 0.3 }}>{c}</span>
                    ))}
                  </div>
                  <button onClick={g.generate} disabled={!g.topic.trim()}
                    style={{
                      marginTop: 10,
                      fontFamily: "'Geist', sans-serif", fontSize: 13, fontWeight: 500,
                      color: g.topic.trim() ? (dark ? '#0f0f0f' : '#fafaf8') : t.text3,
                      background: g.topic.trim() ? t.text : t.bg3,
                      padding: '9px 20px', borderRadius: 8,
                      transition: 'all 0.2s',
                      border: `1px solid ${g.topic.trim() ? 'transparent' : t.border}`,
                    }}
                    onMouseEnter={e => { if (g.topic.trim()) { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = '#fff' } }}
                    onMouseLeave={e => { if (g.topic.trim()) { e.currentTarget.style.background = t.text; e.currentTarget.style.color = dark ? '#0f0f0f' : '#fafaf8' } }}>
                    Begin production →
                  </button>
                </div>
                {isFailed && g.error && <p style={{ padding: '0 20px 14px', fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#e05555' }}>✕ {g.error}</p>}
              </>
            )}

            {/* Working */}
            {isWorking && (
              <div style={{ padding: '16px 20px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: t.accent, letterSpacing: 0.5 }}>
                    {g.step === 'working' ? '› researching + writing...' : '› producing assets...'}
                  </span>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: t.text3 }}>{g.completedStages.length}/6</span>
                </div>
                <WorkflowTimeline activeStage={g.activeStage} completedStages={g.completedStages} failedStages={g.failedStages} />
              </div>
            )}

            {/* Script picker */}
            {isPicking && g.scripts.length > 0 && (
              <div style={{ padding: '16px 20px 20px' }}>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: t.accent, marginBottom: 12, letterSpacing: 0.5 }}>› choose your angle</div>
                <ScriptPicker scripts={g.scripts} evaluations={g.evaluations} winner={g.winner} selectedAngle={g.selectedAngle} selectedDuration={g.selectedDuration} onSelectAngle={g.setSelectedAngle} onSelectDuration={g.setSelectedDuration} onProduce={g.produce} />
              </div>
            )}

            {/* Result */}
            {isComplete && g.result && <EpisodeResult result={g.result} onReset={g.reset} />}
          </div>

          {g.step === 'idle' && (
            <p style={{ marginTop: 14, fontFamily: "'Geist Mono', monospace", fontSize: 10, color: t.text3, textAlign: 'center', letterSpacing: 0.8 }}>
              NO AUTO-POSTING · CLAUDE · ELEVENLABS · REPLICATE · YOU OWN EVERY EPISODE
            </p>
          )}
        </div>
      </section>

      {/* ── STATS ── */}
      <div style={{ borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[
            ['One session', 'Weeks of production compressed'],
            ['5 angles', 'Written and scored per episode'],
            ['Your call', 'You review before anything goes live'],
            ['Studio quality', 'ElevenLabs narration + AI visuals'],
          ].map(([v, l], i, a) => (
            <div key={v} style={{ padding: '36px 32px', borderRight: i < a.length - 1 ? `1px solid ${t.border}` : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 22, color: t.accent, marginBottom: 6 }}>{v}</div>
              <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 12, color: t.text2, fontWeight: 300 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MARQUEE ── */}
      <div style={{ borderBottom: `1px solid ${t.border}`, overflow: 'hidden', background: t.bg2, padding: '16px 0' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 28s linear infinite' }}>
          {[...Array(2)].flatMap(() =>
            ['Research', 'Script × 5', 'Claude Sonnet 4', 'ElevenLabs', 'Replicate', 'SEO Package', 'Human in the loop', 'Studio quality', 'Multi-provider', 'Zero auto-post']
          ).map((item, i) => (
            <span key={i} style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: t.text3, padding: '0 28px', borderRight: `1px solid ${t.border}`, whiteSpace: 'nowrap', display: 'inline-block', letterSpacing: 0.5 }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '96px 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 52, gap: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: t.accent, letterSpacing: 2, marginBottom: 14 }}>THE WORKFLOW</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: 'clamp(28px,3.5vw,44px)', letterSpacing: -0.8, lineHeight: 1.1 }}>
              From brief to broadcast-ready.<br /><em style={{ color: t.text2, fontStyle: 'italic' }}>In one session.</em>
            </h2>
          </div>
          <p style={{ fontFamily: "'Geist', sans-serif", fontSize: 14, color: t.text2, lineHeight: 1.72, maxWidth: 300, fontWeight: 300 }}>
            Six stages. One session. You make the only decision that matters — which angle to produce.
          </p>
        </div>

        <div style={{ border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden' }}>
          {[
            ['01', 'Research', 'Deep topic analysis — key facts, angles, controversies, trending hooks. Before a word of script is written.'],
            ['02', 'Script × 5', 'Five completely different angles scored on 10 quality metrics. Technical, Story, Investment, Beginner, Contrarian.'],
            ['03', 'You choose', 'Pick the angle and length that fits. 20, 30, or 45 minutes. This is the only decision in the workflow.'],
            ['04', 'Narration', 'ElevenLabs renders two distinct speaker voices at broadcast quality. Not robotic TTS — a real conversation.'],
            ['05', 'Visuals', 'Three cover art variations generated for YouTube, podcast platforms, and social media.'],
            ['06', 'Packaging', 'YouTube description, Instagram caption, Twitter thread, LinkedIn post, blog post, newsletter — all done.'],
          ].map(([n, name, desc], i, arr) => (
            <div key={n} style={{
              display: 'grid', gridTemplateColumns: '64px 200px 1fr', alignItems: 'center',
              borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : 'none',
              background: t.inputBg, transition: 'background 0.2s'
            }}
              onMouseEnter={e => (e.currentTarget.style.background = t.bg2)}
              onMouseLeave={e => (e.currentTarget.style.background = t.inputBg)}>
              <div style={{ padding: '22px 0 22px 24px', fontFamily: "'Geist Mono', monospace", fontSize: 10, color: t.text3, letterSpacing: 1 }}>{n}</div>
              <div style={{ padding: '22px 20px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 17, color: t.text, borderLeft: `1px solid ${t.border}`, borderRight: `1px solid ${t.border}` }}>{name}</div>
              <div style={{ padding: '22px 28px', fontFamily: "'Geist', sans-serif", fontSize: 13, color: t.text2, lineHeight: 1.65, fontWeight: 300 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY SCENEFORGE ── */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '96px 32px 0' }}>
        <div style={{ marginBottom: 52 }}>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: t.accent, letterSpacing: 2, marginBottom: 14 }}>WHAT MAKES IT DIFFERENT</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: 'clamp(28px,3.5vw,44px)', letterSpacing: -0.8, lineHeight: 1.1 }}>
            Not a generator.<br /><em style={{ color: t.text2 }}>A production system.</em>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: t.border, borderRadius: 12, overflow: 'hidden' }}>
          {[
            ['You stay in control', 'No auto-posting. No scheduling. No spam. You decide what goes live. Every episode is reviewed before it leaves your account.'],
            ['Quality over quantity', 'Five distinct scripts per topic, scored on engagement, clarity, authority, and viral potential. You pick the best — not the first.'],
            ['Real voices', 'ElevenLabs renders two distinct speaker personalities. Natural pacing, tone, emotion. Not TTS — a conversation.'],
            ['Your IP, your brand', 'Every episode belongs to you. Download audio, visuals, transcript. No platform lock-in. No revenue share.'],
            ['Multi-provider reliability', 'Claude fails → OpenAI. OpenAI fails → Groq. Three AI providers on standby. No single point of failure.'],
            ['Built for volume', 'One episode or fifty — same quality, same workflow, same speed. Infrastructure that scales with your output.'],
          ].map(([name, body]) => (
            <div key={name} style={{ background: t.inputBg, padding: '32px 28px', position: 'relative', overflow: 'hidden', transition: 'background 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = t.bg2; (e.currentTarget.querySelector('.al') as any).style.transform = 'scaleX(1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = t.inputBg; (e.currentTarget.querySelector('.al') as any).style.transform = 'scaleX(0)' }}>
              <div className="al" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: t.accent, transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)' }} />
              <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 18, color: t.text, marginBottom: 12, lineHeight: 1.25 }}>{name}</div>
              <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, color: t.text2, lineHeight: 1.7, fontWeight: 300 }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section style={{ maxWidth: 720, margin: '96px auto 0', padding: '0 32px' }}>
        <div style={{ background: t.bg2, border: `1px solid ${t.border}`, borderRadius: 14, padding: '44px 52px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 24, right: 32, fontFamily: "'Playfair Display', serif", fontSize: 80, color: t.accent, opacity: 0.08, lineHeight: 1 }}>"</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 21, color: t.text, lineHeight: 1.55, marginBottom: 24 }}>
            "The research alone saves me three hours per episode. The script evaluation is the feature I didn't know I needed."
          </p>
          <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 12, color: t.text3, fontWeight: 300 }}>Early access creator · Scripted tech podcast</div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 1120, margin: '96px auto 0', padding: '0 32px 120px' }}>
        <div style={{
          background: dark ? 'linear-gradient(135deg, #161410 0%, #0f0f0f 60%)' : 'linear-gradient(135deg, #f5f0e8 0%, #fafaf8 60%)',
          border: `1px solid ${dark ? 'rgba(212,168,83,0.2)' : 'rgba(196,154,58,0.25)'}`,
          borderRadius: 16, padding: '72px 64px',
          display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 64,
          position: 'relative', overflow: 'hidden', transition: 'background 0.4s'
        }}>
          <div>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: t.accent, letterSpacing: 2, marginBottom: 18 }}>BEGIN PRODUCTION</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: 'clamp(32px,4vw,56px)', lineHeight: 1.0, letterSpacing: -1, marginBottom: 16 }}>
              Your brief.<br /><em style={{ color: t.accent }}>Studio output.</em>
            </h2>
            <p style={{ fontFamily: "'Geist', sans-serif", fontSize: 14, color: t.text2, lineHeight: 1.72, maxWidth: 400, fontWeight: 300 }}>
              Research, script, narration, visuals, and distribution copy — done. 10 free credits on sign up. No card required.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
            <a href="/login" style={{
              fontFamily: "'Geist', sans-serif", fontSize: 15, fontWeight: 500,
              color: dark ? '#0f0f0f' : '#fafaf8', background: t.text,
              padding: '14px 40px', borderRadius: 10, textAlign: 'center', whiteSpace: 'nowrap',
              transition: 'all 0.2s', display: 'block'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = t.text; e.currentTarget.style.color = dark ? '#0f0f0f' : '#fafaf8' }}>
              Start producing →
            </a>
            <a href="/studio" style={{
              fontFamily: "'Geist', sans-serif", fontSize: 14, color: t.text2,
              border: `1px solid ${t.border}`, padding: '13px 40px',
              borderRadius: 10, textAlign: 'center', transition: 'all 0.2s', display: 'block'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.text2 }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border }}>
              See the Studio
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${t.border}`, padding: '24px 32px', maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: t.accent }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 15, color: t.text2 }}>SceneForge</span>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {[['Terms','/terms'],['Privacy','/privacy'],['GitHub','https://github.com/Sudharsansus/sf']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontFamily: "'Geist', sans-serif", fontSize: 12, color: t.text3, padding: '6px 12px', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = t.text2)}
              onMouseLeave={e => (e.currentTarget.style.color = t.text3)}>{l}</a>
          ))}
        </div>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: t.text3, letterSpacing: 1.5 }}>PRODUCTION STUDIO FOR CREATOR MEDIA</span>
      </footer>

      <ChatBox />
    </div>
  )
}