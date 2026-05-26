'use client'
import { useGenerate } from '@/hooks/useGenerate'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import { ScriptPicker } from '@/components/studio/ScriptPicker'
import { EpisodeResult } from '@/components/studio/EpisodeResult'
import { ChatBox } from '@/components/studio/ChatBox'

const MARQUEE = [
  'Research','Script writing','Voice rendering','Cover art','SEO copy',
  'Newsletter draft','Claude Sonnet 4','ElevenLabs','Replicate',
  'Human in the loop','Creator controlled','Studio quality'
]

export default function Home() {
  const g = useGenerate()
  const isWorking   = g.step === 'working' || g.step === 'producing'
  const isPicking   = g.step === 'picking'
  const isComplete  = g.step === 'complete'
  const isFailed    = g.step === 'failed'
  const showTimeline = isWorking || isPicking || isComplete || isFailed

  return (
    <div style={{ background:'#080808', minHeight:'100vh', color:'#f0f0f0' }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        background:'rgba(8,8,8,0.85)', backdropFilter:'blur(24px)',
        borderBottom:'1px solid #111'
      }}>
        <div style={{ maxWidth:1080, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:58 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:19, fontStyle:'italic', letterSpacing:-0.5 }}>SceneForge</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#333', letterSpacing:1.5, marginTop:1 }}>STUDIO</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            {[['Studio','/studio'],['Work','/episodes'],['Dashboard','/dashboard']].map(([l,h]) => (
              <a key={l} href={h} style={{ fontSize:13, color:'#555', padding:'6px 12px', borderRadius:7, transition:'color .15s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#f0f0f0')}
                onMouseLeave={e=>(e.currentTarget.style.color='#555')}>{l}</a>
            ))}
            <div style={{ width:1, height:18, background:'#1a1a1a', margin:'0 6px' }} />
            <a href="/login" style={{ fontSize:13, color:'#888', padding:'7px 14px', borderRadius:7 }}>Sign in</a>
            <a href="/login" style={{
              fontSize:13, fontWeight:500, color:'#080808', background:'#f0f0f0',
              padding:'8px 18px', borderRadius:8
            }}>Start free</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth:740, margin:'0 auto', padding:'128px 32px 72px', textAlign:'center', position:'relative' }}>
        {/* Ambient glow behind hero */}
        <div style={{ position:'absolute', top:80, left:'50%', transform:'translateX(-50%)', width:600, height:300, background:'radial-gradient(ellipse, rgba(255,255,255,0.022) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div className="fade-up" style={{ display:'inline-flex', alignItems:'center', gap:10, fontSize:11, color:'#444', letterSpacing:2, textTransform:'uppercase', marginBottom:32 }}>
          <div style={{ width:20, height:1, background:'#222' }} />
          Creator Production Studio
          <div style={{ width:20, height:1, background:'#222' }} />
        </div>

        <h1 className="fade-up-1" style={{
          fontFamily:"'DM Serif Display',serif",
          fontSize:'clamp(50px,8.5vw,96px)',
          lineHeight:0.94,
          letterSpacing:-3,
          marginBottom:28,
          fontWeight:400,
          position:'relative', zIndex:1
        }}>
          Your AI-assisted<br />
          <em style={{ color:'#303030' }}>production studio.</em>
        </h1>

        <p className="fade-up-2" style={{
          fontSize:'clamp(15px,1.8vw,17px)',
          color:'#555',
          lineHeight:1.75,
          maxWidth:460,
          margin:'0 auto 52px',
          letterSpacing:-0.1
        }}>
          Compress weeks of research, scripting, and production into a single session. You review and publish on your own schedule.
        </p>

        {/* ── PRODUCTION CONSOLE ── */}
        <div className="fade-up-3" style={{ maxWidth:640, margin:'0 auto' }}>
          <div style={{
            background:'#0d0d0d',
            border:'1px solid #1a1a1a',
            borderRadius:20,
            overflow:'hidden',
            boxShadow:'0 32px 80px rgba(0,0,0,0.6)',
            transition:'border-color .3s',
            ...(isWorking ? { borderColor:'#2a2a2a' } : {})
          }}>

            {/* ── INPUT STATE ── */}
            {(g.step === 'idle' || isFailed) && (
              <>
                <div style={{ padding:'24px 26px 18px', display:'flex', alignItems:'flex-start', gap:14 }}>
                  <div style={{ paddingTop:3, flexShrink:0 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'#2a2a2a' }} />
                  </div>
                  <textarea
                    value={g.topic}
                    onChange={e => g.setTopic(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();g.generate()} }}
                    rows={2}
                    placeholder="What's your episode about?"
                    style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:15, color:'#f0f0f0', lineHeight:1.65, resize:'none', letterSpacing:-0.1 }}
                  />
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px 20px' }}>
                  <div style={{ display:'flex', gap:5 }}>
                    {['Research','5 Scripts','Voice','Visuals','SEO'].map(c => (
                      <span key={c} style={{ fontSize:10, color:'#333', padding:'3px 8px', borderRadius:4, border:'1px solid #181818' }}>{c}</span>
                    ))}
                  </div>
                  <button
                    onClick={g.generate}
                    disabled={!g.topic.trim()}
                    style={{
                      display:'flex', alignItems:'center', gap:8,
                      fontSize:13, fontWeight:500,
                      color: g.topic.trim() ? '#080808' : '#333',
                      background: g.topic.trim() ? '#f0f0f0' : '#141414',
                      border:'none', padding:'10px 22px', borderRadius:10,
                      cursor: g.topic.trim() ? 'pointer' : 'default',
                      transition:'all .2s'
                    }}>
                    Begin production ↗
                  </button>
                </div>
                {isFailed && g.error && (
                  <div style={{ padding:'0 20px 16px', fontSize:12, color:'#ef4444' }}>{g.error}</div>
                )}
              </>
            )}

            {/* ── WORKFLOW TIMELINE ── */}
            {showTimeline && !isPicking && !isComplete && (
              <div style={{ padding:'8px 24px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4, padding:'10px 2px 0' }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'#333', letterSpacing:1 }}>
                    {g.step === 'working' ? 'RESEARCHING + WRITING' : 'PRODUCING'}
                  </span>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#222' }}>
                    {g.completedStages.length}/6 STAGES
                  </span>
                </div>
                <WorkflowTimeline
                  activeStage={g.activeStage}
                  completedStages={g.completedStages}
                  failedStages={g.failedStages}
                />
              </div>
            )}

            {/* ── SCRIPT PICKER ── */}
            {isPicking && g.scripts.length > 0 && (
              <div style={{ padding:'20px 24px' }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'#444', letterSpacing:1, marginBottom:6 }}>CHOOSE YOUR ANGLE</div>
                <div style={{ fontSize:13, color:'#555', marginBottom:18 }}>
                  {g.scripts.length} scripts written. Scored on 10 quality metrics. Pick one to produce.
                </div>
                <ScriptPicker
                  scripts={g.scripts}
                  evaluations={g.evaluations}
                  winner={g.winner}
                  selectedAngle={g.selectedAngle}
                  selectedDuration={g.selectedDuration}
                  onSelectAngle={g.setSelectedAngle}
                  onSelectDuration={g.setSelectedDuration}
                  onProduce={g.produce}
                />
              </div>
            )}

            {/* ── RESULT ── */}
            {isComplete && g.result && (
              <EpisodeResult result={g.result} onReset={g.reset} />
            )}
          </div>

          {g.step === 'idle' && (
            <p style={{ marginTop:14, fontSize:11, color:'#2a2a2a', textAlign:'center', letterSpacing:0.2 }}>
              You own every episode · No auto-posting · Claude · ElevenLabs · Replicate
            </p>
          )}
        </div>
      </section>

      {/* ── PROOF BAND ──────────────────────────────────────────────────── */}
      <div style={{ borderTop:'1px solid #111', borderBottom:'1px solid #111', display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          ['One session','Weeks of production compressed'],
          ['5 angles','Written and scored per episode'],
          ['Your call','You review before anything goes live'],
          ['Studio quality','ElevenLabs narration + AI visuals']
        ].map(([v,l], i, a) => (
          <div key={v} style={{ padding:'36px 32px', borderRight: i<a.length-1?'1px solid #111':'none' }}>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, fontStyle:'italic', color:'#f0f0f0', marginBottom:5, letterSpacing:-0.3 }}>{v}</div>
            <div style={{ fontSize:12.5, color:'#444', lineHeight:1.5 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── MARQUEE ─────────────────────────────────────────────────────── */}
      <div style={{ padding:'40px 0', borderBottom:'1px solid #111', overflow:'hidden' }}>
        <div style={{ display:'flex', width:'max-content', animation:'marquee 30s linear infinite' }}>
          {[...MARQUEE,...MARQUEE].map((item, i) => (
            <span key={i} style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:16, color:'#1f1f1f', padding:'0 32px', borderRight:'1px solid #111', whiteSpace:'nowrap', display:'block' }}>{item}</span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section style={{ maxWidth:1060, margin:'0 auto', padding:'88px 32px 0' }}>
        <div style={{ marginBottom:48 }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#333', letterSpacing:2, marginBottom:16 }}>THE PRODUCTION WORKFLOW</div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:'clamp(30px,4vw,48px)', letterSpacing:-1.5, lineHeight:1.05 }}>
            From brief to broadcast-ready.<br /><em style={{ color:'#2a2a2a' }}>In one session.</em>
          </h2>
        </div>

        {/* Timeline-style workflow */}
        <div style={{ display:'flex', flexDirection:'column', gap:0, border:'1px solid #111', borderRadius:14, overflow:'hidden' }}>
          {[
            ['01','Research',   'We dig into the topic — key facts, angles, controversies, and trending hooks — before a single word of script is written.'],
            ['02','Script × 5', 'Five completely different takes on your topic. Technical, Story, Investment, Beginner, Contrarian. Each scored on 10 quality metrics.'],
            ['03','You choose', 'You pick the angle and length that fits. 20, 30, or 45 minutes. This is the only decision in the workflow.'],
            ['04','Narration',  'ElevenLabs renders two distinct speaker voices at broadcast quality. Not robotic TTS — a real-sounding conversation.'],
            ['05','Visuals',    'Three cover art variations generated for YouTube, podcast platforms, and social media.'],
            ['06','Packaging',  'YouTube title and description, Instagram caption, Twitter thread, LinkedIn post, blog post, newsletter — all ready. You publish when you\'re ready.'],
          ].map(([n, name, desc], i, arr) => (
            <div key={n} style={{
              display:'grid', gridTemplateColumns:'60px 180px 1fr',
              alignItems:'center', gap:0,
              background:'#080808',
              borderBottom: i < arr.length-1 ? '1px solid #111' : 'none',
              transition:'background .2s'
            }}
              onMouseEnter={e=>(e.currentTarget.style.background='#0d0d0d')}
              onMouseLeave={e=>(e.currentTarget.style.background='#080808')}>
              <div style={{ padding:'24px 0 24px 24px', fontFamily:"'DM Mono',monospace", fontSize:10, color:'#222', letterSpacing:1 }}>{n}</div>
              <div style={{ padding:'24px 16px', fontFamily:"'DM Serif Display',serif", fontSize:17, fontStyle:'italic', color:'#f0f0f0', borderLeft:'1px solid #111', borderRight:'1px solid #111' }}>{name}</div>
              <div style={{ padding:'24px 28px', fontSize:13, color:'#555', lineHeight:1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY NOT OTHERS ──────────────────────────────────────────────── */}
      <section style={{ maxWidth:1060, margin:'0 auto', padding:'88px 32px 0' }}>
        <div style={{ marginBottom:48 }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#333', letterSpacing:2, marginBottom:16 }}>WHAT MAKES IT DIFFERENT</div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:'clamp(30px,4vw,48px)', letterSpacing:-1.5, lineHeight:1.05 }}>
            Not a generator.<br /><em style={{ color:'#2a2a2a' }}>A production system.</em>
          </h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'#111', borderRadius:14, overflow:'hidden' }}>
          {[
            ['You stay in control','No auto-posting. No auto-scheduling. No spam. You decide what goes live and when. Every episode is reviewed before it leaves your account.'],
            ['Quality over quantity','Five distinct scripts per topic, scored on engagement, clarity, authority, and viral potential. You pick the best one — not the first one.'],
            ['Real voices, not robots','ElevenLabs renders two distinct speaker personalities. Each line has natural pacing, tone, and emotion. Not TTS. A conversation.'],
            ['Your brand, your IP','Every episode belongs to you. Download the audio, the visuals, the transcript. No platform lock-in. No revenue share.'],
            ['Multi-provider reliability','If one AI provider goes down, the system automatically switches. Claude, OpenAI, and Groq all on standby. No single point of failure.'],
            ['Built for volume','One episode or fifty — same quality, same workflow, same speed. Infrastructure that scales with your creative output.'],
          ].map(([name, body]) => (
            <div key={name} style={{ background:'#080808', padding:'28px 24px', position:'relative', overflow:'hidden', transition:'background .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#0d0d0d';(e.currentTarget.querySelector('.ln') as any).style.transform='scaleX(1)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='#080808';(e.currentTarget.querySelector('.ln') as any).style.transform='scaleX(0)'}}>
              <div className="ln" style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'#f0f0f0', transform:'scaleX(0)', transformOrigin:'left', transition:'transform .35s cubic-bezier(.16,1,.3,1)' }} />
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:17, fontStyle:'italic', color:'#f0f0f0', marginBottom:10, letterSpacing:-0.3, lineHeight:1.2 }}>{name}</div>
              <div style={{ fontSize:12.5, color:'#555', lineHeight:1.7 }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIAL / SOCIAL PROOF PLACEHOLDER ──────────────────────── */}
      <section style={{ maxWidth:640, margin:'88px auto 0', padding:'0 32px' }}>
        <div style={{ background:'#0d0d0d', border:'1px solid #1a1a1a', borderRadius:14, padding:'36px 40px' }}>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, fontStyle:'italic', color:'#f0f0f0', lineHeight:1.5, marginBottom:20 }}>
            "The research alone saves me three hours per episode. The script evaluation is the feature I didn't know I needed."
          </div>
          <div style={{ fontSize:12, color:'#444' }}>Early access creator · Scripted tech podcast</div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section style={{ maxWidth:1060, margin:'88px auto 0', padding:'0 32px 100px' }}>
        <div style={{
          border:'1px solid #111', borderRadius:16, padding:'64px 56px',
          display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:64,
          background:'#0a0a0a', position:'relative', overflow:'hidden'
        }}>
          <div style={{ position:'absolute', top:-100, right:-80, width:400, height:400, background:'radial-gradient(circle, rgba(240,240,240,0.015) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#333', letterSpacing:2, marginBottom:20 }}>BEGIN PRODUCTION</div>
            <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:'clamp(36px,5vw,58px)', lineHeight:0.95, letterSpacing:-2.5, marginBottom:14, position:'relative', zIndex:1 }}>
              Your brief.<br /><em style={{ color:'#2a2a2a' }}>Studio output.</em>
            </h2>
            <p style={{ fontSize:14, color:'#444', lineHeight:1.7, maxWidth:380 }}>
              Research, script, narration, visuals, and distribution copy — done. 10 free episodes to start. No card required.
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, flexShrink:0 }}>
            <a href="/login" style={{ fontSize:15, fontWeight:500, color:'#080808', background:'#f0f0f0', border:'none', padding:'14px 36px', borderRadius:10, textAlign:'center', whiteSpace:'nowrap' }}>
              Start producing ↗
            </a>
            <a href="/studio" style={{ fontSize:14, color:'#444', background:'none', border:'1px solid #1a1a1a', padding:'14px 36px', borderRadius:10, textAlign:'center' }}>
              See the Studio
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop:'1px solid #111', padding:'22px 32px', maxWidth:1060, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:15, color:'#333' }}>SceneForge</span>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:'#222', letterSpacing:1.5 }}>STUDIO</span>
        </div>
        <div style={{ display:'flex', gap:2 }}>
          {[['Terms','/terms'],['Privacy','/privacy'],['GitHub','https://github.com/Sudharsansus/sf']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize:12, color:'#333', padding:'5px 10px', transition:'color .15s' }}
              onMouseEnter={e=>(e.currentTarget.style.color='#888')}
              onMouseLeave={e=>(e.currentTarget.style.color='#333')}>{l}</a>
          ))}
        </div>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:'#1a1a1a', letterSpacing:1.5 }}>PRODUCTION STUDIO FOR CREATOR MEDIA</span>
      </footer>

      <ChatBox />
    </div>
  )
}
