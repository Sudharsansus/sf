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

  const c = dark ? {
    bg: '#09090b', surface: '#18181b', border: '#27272a',
    text: '#fafafa', muted: '#a1a1aa', subtle: '#52525b',
    accent: '#6366f1', accentFg: '#fff',
    btn: '#fafafa', btnFg: '#09090b',
  } : {
    bg: '#ffffff', surface: '#f4f4f5', border: '#e4e4e7',
    text: '#09090b', muted: '#71717a', subtle: '#a1a1aa',
    accent: '#6366f1', accentFg: '#fff',
    btn: '#09090b', btnFg: '#ffffff',
  }

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, fontFamily: "'Inter', system-ui, sans-serif", transition: 'background .25s, color .25s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; }
        textarea { font-family: inherit; }
        textarea::placeholder { color: ${c.subtle}; }
        textarea:focus { outline: none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        .f0 { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) .0s both; }
        .f1 { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) .07s both; }
        .f2 { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) .14s both; }
        .f3 { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) .21s both; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:${c.border}; border-radius:2px; }
      `}</style>

      {/* NAV */}
      <header style={{ position:'sticky', top:0, zIndex:50, borderBottom:`1px solid ${c.border}`, backdropFilter:'blur(12px)', background: dark ? 'rgba(9,9,11,.9)' : 'rgba(255,255,255,.9)', transition:'background .25s' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:24, height:24, borderRadius:6, background:c.accent, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10 L6 2 L10 10" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontWeight:600, fontSize:15, letterSpacing:-.3 }}>SceneForge</span>
          </div>
          <nav style={{ display:'flex', gap:0 }}>
            {[['Studio','/studio'],['Work','/episodes'],['Dashboard','/dashboard']].map(([l,h]) => (
              <a key={l} href={h} style={{ fontSize:13, color:c.muted, padding:'6px 12px', borderRadius:6, transition:'color .15s' }}
                onMouseEnter={e=>(e.currentTarget.style.color=c.text)}
                onMouseLeave={e=>(e.currentTarget.style.color=c.muted)}>{l}</a>
            ))}
          </nav>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <button onClick={()=>setDark(!dark)} title="Toggle theme" style={{ width:32, height:32, borderRadius:6, background:'transparent', border:`1px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:c.muted, fontSize:13, transition:'all .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=c.text;e.currentTarget.style.color=c.text}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=c.border;e.currentTarget.style.color=c.muted}}>
              {dark ? '○' : '●'}
            </button>
            <a href="/login" style={{ fontSize:13, color:c.muted, padding:'6px 12px' }}>Sign in</a>
            <a href="/login" style={{ fontSize:13, fontWeight:500, background:c.btn, color:c.btnFg, padding:'7px 16px', borderRadius:7, transition:'opacity .15s' }}
              onMouseEnter={e=>(e.currentTarget.style.opacity='.85')}
              onMouseLeave={e=>(e.currentTarget.style.opacity='1')}>
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main style={{ maxWidth:760, margin:'0 auto', padding:'80px 24px 64px', textAlign:'center' }}>
        <div className="f0" style={{ display:'inline-flex', alignItems:'center', gap:6, marginBottom:24, padding:'4px 12px', borderRadius:999, background:c.surface, border:`1px solid ${c.border}`, fontSize:12, color:c.muted, fontWeight:500 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />
          AI-powered creator production
        </div>

        <h1 className="f1" style={{ fontSize:'clamp(36px,6vw,64px)', fontWeight:600, letterSpacing:'-1.5px', lineHeight:1.1, marginBottom:20 }}>
          Turn any topic into a<br />
          <span style={{ color:c.accent }}>broadcast-ready episode.</span>
        </h1>

        <p className="f2" style={{ fontSize:17, color:c.muted, lineHeight:1.7, maxWidth:480, margin:'0 auto 40px', fontWeight:400 }}>
          Research, scripts, voice, thumbnails, and SEO — all in one workflow. You review and publish when ready.
        </p>

        {/* CONSOLE */}
        <div className="f3" style={{ maxWidth:640, margin:'0 auto' }}>
          <div style={{
            background:c.surface, border:`1px solid ${isWorking ? c.accent : c.border}`,
            borderRadius:12, overflow:'hidden',
            boxShadow: dark ? '0 8px 32px rgba(0,0,0,.4)' : '0 4px 24px rgba(0,0,0,.08)',
            transition:'border-color .3s, box-shadow .3s'
          }}>
            {(g.step === 'idle' || isFailed) && <>
              <div style={{ padding:'16px 18px 12px', display:'flex', gap:10 }}>
                <span style={{ color:c.accent, fontWeight:600, fontSize:15, marginTop:1, flexShrink:0 }}>›</span>
                <textarea value={g.topic} onChange={e=>g.setTopic(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();g.generate()}}}
                  rows={2} placeholder="What's your episode about? (Press Enter)"
                  style={{ flex:1, border:'none', background:'transparent', fontSize:14, color:c.text, lineHeight:1.6, resize:'none', fontWeight:400 }} />
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px 14px', borderTop:`1px solid ${c.border}` }}>
                <div style={{ display:'flex', gap:4 }}>
                  {['Research','Scripts','Voice','Visuals','SEO'].map(tag => (
                    <span key={tag} style={{ fontSize:10, color:c.subtle, padding:'2px 7px', borderRadius:4, border:`1px solid ${c.border}`, fontWeight:500 }}>{tag}</span>
                  ))}
                </div>
                <button onClick={g.generate} disabled={!g.topic.trim()} style={{
                  fontSize:13, fontWeight:500, padding:'8px 18px', borderRadius:7,
                  background: g.topic.trim() ? c.accent : c.border,
                  color: g.topic.trim() ? c.accentFg : c.subtle,
                  transition:'all .15s', opacity: g.topic.trim() ? 1 : .6
                }}>
                  Begin →
                </button>
              </div>
              {isFailed && g.error && <p style={{ padding:'0 18px 12px', fontSize:12, color:'#ef4444' }}>{g.error}</p>}
            </>}

            {isWorking && <div style={{ padding:'14px 18px 18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:11, color:c.accent, fontWeight:500 }}>{g.step==='working' ? 'Researching + writing...' : 'Producing assets...'}</span>
                <span style={{ fontSize:11, color:c.subtle }}>{g.completedStages.length}/6 stages</span>
              </div>
              <WorkflowTimeline activeStage={g.activeStage} completedStages={g.completedStages} failedStages={g.failedStages} />
            </div>}

            {isPicking && g.scripts.length > 0 && <div style={{ padding:'14px 18px 18px' }}>
              <p style={{ fontSize:11, color:c.accent, fontWeight:500, marginBottom:12 }}>Choose your angle</p>
              <ScriptPicker scripts={g.scripts} evaluations={g.evaluations} winner={g.winner} selectedAngle={g.selectedAngle} selectedDuration={g.selectedDuration} onSelectAngle={g.setSelectedAngle} onSelectDuration={g.setSelectedDuration} onProduce={g.produce} />
            </div>}

            {isComplete && g.result && <EpisodeResult result={g.result} onReset={g.reset} />}
          </div>

          {g.step === 'idle' && <p style={{ marginTop:12, fontSize:11, color:c.subtle, textAlign:'center' }}>
            No auto-posting · You own every episode · Claude + ElevenLabs + Replicate
          </p>}
        </div>
      </main>

      {/* STATS */}
      <div style={{ borderTop:`1px solid ${c.border}`, borderBottom:`1px solid ${c.border}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
          {[['1 session','Weeks of work compressed'],['5 scripts','Written + scored per topic'],['Your call','You review before publishing'],['Studio quality','ElevenLabs + AI visuals']].map(([v,l],i,a) => (
            <div key={v} style={{ padding:'32px 24px', textAlign:'center', borderRight: i<a.length-1 ? `1px solid ${c.border}` : 'none' }}>
              <div style={{ fontWeight:600, fontSize:18, marginBottom:4 }}>{v}</div>
              <div style={{ fontSize:12, color:c.muted }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TICKER */}
      <div style={{ overflow:'hidden', background:c.surface, borderBottom:`1px solid ${c.border}`, padding:'12px 0' }}>
        <div style={{ display:'flex', width:'max-content', animation:'marquee 24s linear infinite' }}>
          {[...Array(2)].flatMap(()=>['Research Agent','Script × 5','Claude Sonnet 4','ElevenLabs Voice','Replicate Images','SEO Package','Human in the loop','Zero auto-post','Multi-provider AI','Studio quality']).map((s,i) => (
            <span key={i} style={{ fontSize:11, color:c.subtle, padding:'0 24px', borderRight:`1px solid ${c.border}`, whiteSpace:'nowrap', fontWeight:500 }}>{s}</span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'80px 24px 0' }}>
        <div style={{ marginBottom:40 }}>
          <p style={{ fontSize:11, fontWeight:600, color:c.accent, letterSpacing:1, textTransform:'uppercase', marginBottom:10 }}>Workflow</p>
          <h2 style={{ fontSize:'clamp(24px,3vw,36px)', fontWeight:600, letterSpacing:-.5, lineHeight:1.2 }}>From brief to broadcast-ready.</h2>
        </div>
        <div style={{ border:`1px solid ${c.border}`, borderRadius:10, overflow:'hidden' }}>
          {[
            ['01','Research','Deep topic analysis — facts, angles, hooks — before a word of script is written.'],
            ['02','Script × 5','Five angles scored on 10 metrics. Technical, Story, Investment, Beginner, Contrarian.'],
            ['03','You choose','Pick the angle and length. 20, 30, or 45 minutes. The only decision in the workflow.'],
            ['04','Narration','ElevenLabs renders two distinct voices at broadcast quality. A real conversation.'],
            ['05','Visuals','Three AI cover art variations for YouTube, podcasts, and social media.'],
            ['06','Packaging','YouTube, Instagram, Twitter, LinkedIn, blog post, newsletter — all written and ready.'],
          ].map(([n,name,desc],i,arr) => (
            <div key={n} style={{ display:'grid', gridTemplateColumns:'56px 160px 1fr', borderBottom: i<arr.length-1 ? `1px solid ${c.border}` : 'none', transition:'background .15s' }}
              onMouseEnter={e=>(e.currentTarget.style.background=c.surface)}
              onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
              <div style={{ padding:'20px 0 20px 20px', fontSize:11, color:c.subtle, fontWeight:600 }}>{n}</div>
              <div style={{ padding:'20px 16px', fontSize:14, fontWeight:600, color:c.text, borderLeft:`1px solid ${c.border}`, borderRight:`1px solid ${c.border}` }}>{name}</div>
              <div style={{ padding:'20px 24px', fontSize:13, color:c.muted, lineHeight:1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'80px 24px 0' }}>
        <div style={{ marginBottom:40 }}>
          <p style={{ fontSize:11, fontWeight:600, color:c.accent, letterSpacing:1, textTransform:'uppercase', marginBottom:10 }}>Why SceneForge</p>
          <h2 style={{ fontSize:'clamp(24px,3vw,36px)', fontWeight:600, letterSpacing:-.5, lineHeight:1.2 }}>Not a generator. A production system.</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:c.border, borderRadius:10, overflow:'hidden' }}>
          {[
            ['You stay in control','No auto-posting. No spam. You decide what goes live and when.'],
            ['Quality over quantity','Five scripts, scored. You pick the best — not the first.'],
            ['Real voices','ElevenLabs renders two speakers with natural pacing and emotion.'],
            ['Your IP','Every episode is yours. No lock-in, no revenue share, no platform tax.'],
            ['Multi-provider AI','Claude → OpenAI → Groq. Three providers on standby. No downtime.'],
            ['Scales with you','One episode or fifty. Same quality, same speed, same workflow.'],
          ].map(([name, body]) => (
            <div key={name} style={{ background:c.bg, padding:'28px 24px', transition:'background .15s', position:'relative', overflow:'hidden' }}
              onMouseEnter={e=>{e.currentTarget.style.background=c.surface;(e.currentTarget.querySelector('.bar') as any).style.opacity='1'}}
              onMouseLeave={e=>{e.currentTarget.style.background=c.bg;(e.currentTarget.querySelector('.bar') as any).style.opacity='0'}}>
              <div className="bar" style={{ position:'absolute', top:0, left:0, right:0, height:2, background:c.accent, opacity:0, transition:'opacity .25s' }} />
              <div style={{ fontWeight:600, fontSize:14, marginBottom:8, color:c.text }}>{name}</div>
              <div style={{ fontSize:13, color:c.muted, lineHeight:1.6 }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE */}
      <section style={{ maxWidth:680, margin:'80px auto 0', padding:'0 24px' }}>
        <div style={{ background:c.surface, border:`1px solid ${c.border}`, borderRadius:12, padding:'36px 40px' }}>
          <p style={{ fontSize:18, fontWeight:400, lineHeight:1.6, marginBottom:20, color:c.text }}>
            "The research alone saves me three hours per episode. The script evaluation is the feature I didn't know I needed."
          </p>
          <p style={{ fontSize:12, color:c.subtle }}>Early access creator · Scripted tech podcast</p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth:1100, margin:'80px auto 0', padding:'0 24px 100px' }}>
        <div style={{ background:c.surface, border:`1px solid ${c.border}`, borderRadius:14, padding:'64px 56px', display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:48 }}>
          <div>
            <p style={{ fontSize:11, fontWeight:600, color:c.accent, letterSpacing:1, textTransform:'uppercase', marginBottom:14 }}>Begin production</p>
            <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:600, letterSpacing:'-1px', lineHeight:1.1, marginBottom:14 }}>
              Your brief.<br />Studio output.
            </h2>
            <p style={{ fontSize:14, color:c.muted, lineHeight:1.7, maxWidth:380 }}>10 free credits on sign up. No card required. Research, scripts, voice, visuals, and distribution copy — done.</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
            <a href="/login" style={{ fontWeight:500, fontSize:14, color:c.btnFg, background:c.btn, padding:'13px 36px', borderRadius:9, textAlign:'center', whiteSpace:'nowrap', transition:'opacity .15s' }}
              onMouseEnter={e=>(e.currentTarget.style.opacity='.85')}
              onMouseLeave={e=>(e.currentTarget.style.opacity='1')}>
              Start producing →
            </a>
            <a href="/studio" style={{ fontSize:14, color:c.muted, border:`1px solid ${c.border}`, padding:'12px 36px', borderRadius:9, textAlign:'center', transition:'border-color .15s' }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=c.text)}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=c.border)}>
              See the Studio
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${c.border}`, padding:'20px 24px', maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:18, height:18, borderRadius:5, background:c.accent, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 10 L6 2 L10 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontWeight:600, fontSize:13 }}>SceneForge</span>
        </div>
        <div style={{ display:'flex', gap:0 }}>
          {[['Terms','/terms'],['Privacy','/privacy'],['GitHub','https://github.com/Sudharsansus/sf']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize:12, color:c.subtle, padding:'4px 10px', transition:'color .15s' }}
              onMouseEnter={e=>(e.currentTarget.style.color=c.muted)}
              onMouseLeave={e=>(e.currentTarget.style.color=c.subtle)}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize:11, color:c.subtle }}>© 2025 SceneForge</span>
      </footer>

      <ChatBox />
    </div>
  )
}