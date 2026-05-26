'use client'
import { useGenerate } from '@/hooks/useGenerate'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import { ScriptPicker } from '@/components/studio/ScriptPicker'
import { EpisodeResult } from '@/components/studio/EpisodeResult'
import { ChatBox } from '@/components/studio/ChatBox'

export default function Home() {
  const g = useGenerate()
  const isWorking  = g.step === 'working' || g.step === 'producing'
  const isPicking  = g.step === 'picking'
  const isComplete = g.step === 'complete'
  const isFailed   = g.step === 'failed'

  return (
    <div style={{ background: '#050505', minHeight: '100vh', color: '#fff', fontFamily: "'Syne', sans-serif", overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        .fu0 { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.0s both; }
        .fu1 { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .fu2 { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .fu3 { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
        .fu4 { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both; }

        textarea:focus, input:focus { outline: none; }
        textarea::placeholder, input::placeholder { color: #555; }
        a { text-decoration: none; color: inherit; }
        button { font-family: inherit; cursor: pointer; }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
          border: 1px solid #1a1a1a;
        }
        .card-hover:hover {
          border-color: #00ff87;
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(0,255,135,0.08);
        }

        .glow-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        .glow-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #00ff87, #60efff);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .glow-btn:hover::before { opacity: 0.15; }
        .glow-btn:hover { box-shadow: 0 0 30px rgba(0,255,135,0.3); transform: translateY(-1px); }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #00ff87; border-radius: 2px; }
      `}</style>

      {/* ── NOISE TEXTURE OVERLAY ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        opacity: 0.4
      }} />

      {/* ── HERO GLOW ORBS ── */}
      <div style={{ position: 'fixed', top: '-200px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '600px', background: 'radial-gradient(ellipse, rgba(0,255,135,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, animation: 'glow 8s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', bottom: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(96,239,255,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: '1px solid #111', backdropFilter: 'blur(20px)', background: 'rgba(5,5,5,0.8)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff87', boxShadow: '0 0 12px #00ff87', animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>SceneForge</span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#00ff87', letterSpacing: 2, border: '1px solid #00ff8740', padding: '2px 6px', borderRadius: 3 }}>STUDIO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[['Studio','/studio'],['Work','/episodes'],['Dashboard','/dashboard']].map(([l,h]) => (
              <a key={l} href={h} style={{ fontSize: 13, color: '#888', padding: '8px 14px', borderRadius: 8, transition: 'color 0.2s', fontFamily: "'Outfit', sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#888')}>{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href="/login" style={{ fontSize: 13, color: '#888', padding: '8px 16px', fontFamily: "'Outfit', sans-serif" }}>Sign in</a>
            <a href="/login" className="glow-btn" style={{ fontSize: 13, fontWeight: 600, color: '#050505', background: '#00ff87', padding: '9px 20px', borderRadius: 8, fontFamily: "'Outfit', sans-serif", position: 'relative' }}>
              Start free →
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '140px 32px 80px', textAlign: 'center' }}>

        <div className="fu0" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32, background: '#0a1a0a', border: '1px solid #00ff8740', borderRadius: 100, padding: '6px 16px 6px 10px' }}>
          <div style={{ background: '#00ff87', borderRadius: '50%', width: 6, height: 6, animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#00ff87', letterSpacing: 1 }}>CREATOR PRODUCTION STUDIO</span>
        </div>

        <h1 className="fu1" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(52px, 8vw, 96px)', lineHeight: 0.95, letterSpacing: -3, marginBottom: 28 }}>
          <span style={{ display: 'block', color: '#fff' }}>Produce studio-grade</span>
          <span style={{ display: 'block', background: 'linear-gradient(135deg, #00ff87, #60efff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>creator content</span>
          <span style={{ display: 'block', color: '#fff' }}>in minutes.</span>
        </h1>

        <p className="fu2" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, color: '#888', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 48px', fontWeight: 300 }}>
          Research. Scripts. Voice. Visuals. SEO. All in one workflow — you stay in control and publish when you're ready.
        </p>

        {/* ── CONSOLE ── */}
        <div className="fu3" style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            background: '#0a0a0a',
            border: `1px solid ${isWorking ? '#00ff87' : '#1a1a1a'}`,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: isWorking ? '0 0 60px rgba(0,255,135,0.08)' : '0 0 0 1px #111',
            transition: 'all 0.4s'
          }}>
            {/* Console header bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px', borderBottom: '1px solid #111', background: '#080808' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#333', marginLeft: 8 }}>sceneforge — production studio</span>
              {isWorking && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#00ff87', marginLeft: 'auto', animation: 'pulse 1s infinite' }}>● RUNNING</span>}
            </div>

            {/* Input */}
            {(g.step === 'idle' || isFailed) && (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '20px 20px 14px' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: '#00ff87', marginTop: 2, flexShrink: 0 }}>$</span>
                  <textarea
                    value={g.topic}
                    onChange={e => g.setTopic(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); g.generate() } }}
                    rows={2}
                    placeholder="What's your episode about? Press Enter to start..."
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 15, color: '#fff', lineHeight: 1.6, resize: 'none', fontFamily: "'Outfit', sans-serif" }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['🔍 Research', '✍ Scripts×5', '🎙 Voice', '🖼 Visuals', '📋 SEO'].map(c => (
                      <span key={c} style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#444', padding: '3px 8px', borderRadius: 4, border: '1px solid #1a1a1a' }}>{c}</span>
                    ))}
                  </div>
                  <button onClick={g.generate} disabled={!g.topic.trim()}
                    className="glow-btn"
                    style={{ fontSize: 13, fontWeight: 700, color: g.topic.trim() ? '#050505' : '#333', background: g.topic.trim() ? '#00ff87' : '#111', border: 'none', padding: '10px 24px', borderRadius: 8, transition: 'all 0.2s', position: 'relative', fontFamily: "'Outfit', sans-serif" }}>
                    Begin production ↗
                  </button>
                </div>
                {isFailed && g.error && <p style={{ padding: '0 20px 16px', fontSize: 12, color: '#ff4444', fontFamily: "'Space Mono', monospace" }}>✕ {g.error}</p>}
              </div>
            )}

            {/* Working */}
            {(isWorking) && (
              <div style={{ padding: '16px 20px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#00ff87' }}>
                    {g.step === 'working' ? '$ researching + writing...' : '$ producing assets...'}
                  </span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#444' }}>{g.completedStages.length}/6</span>
                </div>
                <WorkflowTimeline activeStage={g.activeStage} completedStages={g.completedStages} failedStages={g.failedStages} />
              </div>
            )}

            {/* Script Picker */}
            {isPicking && g.scripts.length > 0 && (
              <div style={{ padding: '16px 20px 20px' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#00ff87', marginBottom: 12 }}>$ choose your angle —</div>
                <ScriptPicker scripts={g.scripts} evaluations={g.evaluations} winner={g.winner} selectedAngle={g.selectedAngle} selectedDuration={g.selectedDuration} onSelectAngle={g.setSelectedAngle} onSelectDuration={g.setSelectedDuration} onProduce={g.produce} />
              </div>
            )}

            {/* Result */}
            {isComplete && g.result && <EpisodeResult result={g.result} onReset={g.reset} />}
          </div>

          {g.step === 'idle' && (
            <p style={{ marginTop: 14, fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#333', textAlign: 'center', letterSpacing: 0.5 }}>
              NO AUTO-POSTING · YOU OWN EVERY EPISODE · CLAUDE + ELEVENLABS + REPLICATE
            </p>
          )}
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid #111', borderBottom: '1px solid #111' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[
            ['60s', 'Topic to first script'],
            ['5×', 'Script variations scored'],
            ['100%', 'Creator controlled'],
            ['$0', 'ML training needed'],
          ].map(([v, l], i, a) => (
            <div key={v} style={{ padding: '40px 32px', borderRight: i < a.length - 1 ? '1px solid #111' : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 48, letterSpacing: -2, background: 'linear-gradient(135deg, #00ff87, #60efff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 8 }}>{v}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#555', fontWeight: 300 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MARQUEE ── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '20px 0', borderBottom: '1px solid #111', overflow: 'hidden', background: '#080808' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 25s linear infinite' }}>
          {[...Array(2)].map((_, ri) =>
            ['Research Agent', 'Script × 5', 'Claude Sonnet 4', 'ElevenLabs Voice', 'Replicate Thumbnails', 'SEO Package', 'Human in the Loop', 'Zero Auto-Post', 'Studio Quality', 'Multi-Provider AI'].map((item, i) => (
              <span key={`${ri}-${i}`} style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: i % 2 === 0 ? '#00ff87' : '#333', padding: '0 32px', borderRight: '1px solid #1a1a1a', whiteSpace: 'nowrap', display: 'inline-block' }}>
                {item}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '100px 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56, gap: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#00ff87', letterSpacing: 2, marginBottom: 16 }}>// THE WORKFLOW</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(32px,4vw,52px)', letterSpacing: -1.5, lineHeight: 1.0 }}>
              From brief to<br /><span style={{ background: 'linear-gradient(135deg, #00ff87, #60efff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>broadcast-ready.</span>
            </h2>
          </div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: '#555', lineHeight: 1.7, maxWidth: 320, fontWeight: 300 }}>Six stages. One session. You make the only decision that matters.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: '#111' }}>
          {[
            ['01', '🔍', 'Research', 'Deep topic analysis — facts, angles, controversies, trending hooks. Before a word of script is written.'],
            ['02', '✍', 'Script × 5', 'Five completely different angles. Technical, Story, Investment, Beginner, Contrarian. Each scored on 10 metrics.'],
            ['03', '⚡', 'You choose', 'Pick the angle and length. 20, 30, or 45 minutes. This is the only decision in the workflow.'],
            ['04', '🎙', 'Narration', 'ElevenLabs renders two distinct voices at broadcast quality. Not TTS — an actual conversation.'],
            ['05', '🖼', 'Visuals', 'Three AI cover art variations for YouTube, podcast platforms, and social.'],
            ['06', '📋', 'Packaging', 'YouTube title + description, Instagram caption, Twitter thread, LinkedIn post, newsletter — done.'],
          ].map(([n, ic, name, desc]) => (
            <div key={n} className="card-hover" style={{ background: '#080808', padding: '32px 28px', cursor: 'default', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0a0a0a'; (e.currentTarget.querySelector('.step-num') as any).style.color = '#00ff87' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#080808'; (e.currentTarget.querySelector('.step-num') as any).style.color = '#222' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span className="step-num" style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#222', transition: 'color 0.3s', letterSpacing: 1 }}>{n}</span>
                <span style={{ fontSize: 24 }}>{ic}</span>
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 10, color: '#fff' }}>{name}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#555', lineHeight: 1.7, fontWeight: 300 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY SCENEFORGE ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '100px 32px 0' }}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#00ff87', letterSpacing: 2, marginBottom: 16 }}>// NOT A GENERATOR</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(32px,4vw,52px)', letterSpacing: -1.5, lineHeight: 1.0 }}>
            A production system.<br /><span style={{ color: '#333' }}>Built for creators who ship.</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: '#111' }}>
          {[
            ['You stay in control', 'No auto-posting. No scheduling. No spam. You decide what goes live and when. Every episode is reviewed before it leaves your account.', '🔒'],
            ['Quality over quantity', 'Five distinct scripts per topic, scored on engagement, clarity, authority, and viral potential. You pick the best — not the first.', '⚡'],
            ['Real voices', 'ElevenLabs renders two distinct speaker personalities. Natural pacing, tone, and emotion. Not TTS — a conversation.', '🎙'],
            ['Your IP, your brand', 'Every episode belongs to you. Download audio, visuals, transcript. No lock-in. No revenue share.', '👑'],
            ['Multi-provider reliability', 'Claude fails → OpenAI. OpenAI fails → Groq. Three AI providers on standby. No single point of failure.', '🛡'],
            ['Built for volume', 'One episode or fifty — same quality, same workflow, same speed. Infrastructure that scales with your output.', '🚀'],
          ].map(([name, body, icon]) => (
            <div key={name as string} className="card-hover" style={{ background: '#080808', padding: '32px 28px', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0a1a0a'; (e.currentTarget.querySelector('.accent-line') as any).style.transform = 'scaleX(1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#080808'; (e.currentTarget.querySelector('.accent-line') as any).style.transform = 'scaleX(0)' }}>
              <div className="accent-line" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #00ff87, #60efff)', transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)' }} />
              <div style={{ fontSize: 28, marginBottom: 16 }}>{icon as string}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, color: '#fff', marginBottom: 10, lineHeight: 1.2 }}>{name as string}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#555', lineHeight: 1.7, fontWeight: 300 }}>{body as string}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '100px auto 0', padding: '0 32px' }}>
        <div style={{ background: '#080808', border: '1px solid #1a1a1a', borderRadius: 16, padding: '48px 52px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(0,255,135,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#00ff87', marginBottom: 24, letterSpacing: 1 }}>// EARLY ACCESS</div>
          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 22, color: '#fff', lineHeight: 1.5, marginBottom: 24 }}>
            "The research alone saves me three hours per episode. The script evaluation is the feature I didn't know I needed."
          </p>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#444' }}>Early access creator · Scripted tech podcast</div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '100px auto 0', padding: '0 32px 120px' }}>
        <div style={{ background: 'linear-gradient(135deg, #0a1a0a 0%, #050505 100%)', border: '1px solid #00ff8730', borderRadius: 20, padding: '80px 64px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 64, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, left: -60, width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,255,135,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#00ff87', letterSpacing: 2, marginBottom: 20 }}>// BEGIN PRODUCTION</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.95, letterSpacing: -2.5, marginBottom: 16 }}>
              Your brief.<br /><span style={{ background: 'linear-gradient(135deg, #00ff87, #60efff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Studio output.</span>
            </h2>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: '#555', lineHeight: 1.7, maxWidth: 420, fontWeight: 300 }}>Research, script, narration, visuals, and distribution copy — done. 10 free credits on sign up. No card required.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
            <a href="/login" className="glow-btn" style={{ fontSize: 16, fontWeight: 700, color: '#050505', background: '#00ff87', border: 'none', padding: '16px 40px', borderRadius: 10, textAlign: 'center', whiteSpace: 'nowrap', fontFamily: "'Outfit', sans-serif", position: 'relative' }}>
              Start producing free ↗
            </a>
            <a href="/studio" style={{ fontSize: 14, color: '#444', background: 'none', border: '1px solid #1a1a1a', padding: '14px 40px', borderRadius: 10, textAlign: 'center', fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a1a1a')}>
              See the Studio
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid #111', padding: '28px 32px', maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff87' }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>SceneForge</span>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {[['Terms','/terms'],['Privacy','/privacy'],['GitHub','https://github.com/Sudharsansus/sf']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#444', padding: '6px 12px', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#888')}
              onMouseLeave={e => (e.currentTarget.style.color = '#444')}>{l}</a>
          ))}
        </div>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#1a1a1a', letterSpacing: 2 }}>PRODUCTION STUDIO FOR CREATOR MEDIA</span>
      </footer>

      <ChatBox />
    </div>
  )
}