'use client'
// ── WORKFLOW TIMELINE ──────────────────────────────────────────────────────────
// The centrepiece of v7. Shows live production progress in creator language.
// No "agents". No "orchestration". Just what the creator cares about.

import { useEffect, useState } from 'react'

export type StageKey = 'research' | 'script' | 'refine' | 'voice' | 'visuals' | 'packaging'

interface Stage {
  key:     StageKey
  label:   string
  sub:     string
  icon:    string
}

const STAGES: Stage[] = [
  { key:'research',  label:'Research',  sub:'Analysing topic, angles, and hooks', icon:'🔍' },
  { key:'script',    label:'Script',    sub:'Writing 5 unique episode angles',    icon:'✍' },
  { key:'refine',    label:'Refine',    sub:'Sharpening your chosen script',       icon:'◈' },
  { key:'voice',     label:'Voice',     sub:'Rendering 2-speaker narration',       icon:'🎙' },
  { key:'visuals',   label:'Visuals',   sub:'Generating cover art',                icon:'🖼' },
  { key:'packaging', label:'Packaging', sub:'Writing SEO, captions & newsletter',  icon:'📋' },
]

type StageStatus = 'idle' | 'active' | 'done' | 'failed'

interface Props {
  activeStage: StageKey | null
  completedStages: StageKey[]
  failedStages?: StageKey[]
}

export function WorkflowTimeline({ activeStage, completedStages, failedStages = [] }: Props) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 600)
    return () => clearInterval(t)
  }, [])

  function getStatus(key: StageKey): StageStatus {
    if (failedStages.includes(key))   return 'failed'
    if (completedStages.includes(key)) return 'done'
    if (activeStage === key)           return 'active'
    return 'idle'
  }

  return (
    <div style={{ padding:'28px 0', width:'100%' }}>
      {STAGES.map((stage, i) => {
        const status  = getStatus(stage.key)
        const isLast  = i === STAGES.length - 1
        const isDone   = status === 'done'
        const isActive = status === 'active'
        const isFailed = status === 'failed'
        const isIdle   = status === 'idle'

        return (
          <div key={stage.key} style={{ display:'flex', gap:0, alignItems:'stretch' }}>
            {/* Left column: connector + icon */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:40, flexShrink:0 }}>
              {/* Icon circle */}
              <div style={{
                width:36, height:36, borderRadius:'50%', flexShrink:0,
                background: isDone ? '#f0f0f0' : isActive ? '#1a1a1a' : '#0f0f0f',
                border: `1.5px solid ${isDone ? '#f0f0f0' : isActive ? '#444' : isFailed ? '#ef4444' : '#1a1a1a'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:14,
                boxShadow: isActive ? '0 0 20px rgba(240,240,240,0.08)' : 'none',
                transition:'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                position:'relative', zIndex:1
              }}>
                {isDone && <span style={{ color:'#080808', fontSize:13, fontWeight:700 }}>✓</span>}
                {isActive && (
                  <span style={{
                    display:'inline-block', width:8, height:8, borderRadius:'50%',
                    background:'#f0f0f0',
                    animation:'pulse 1s ease-in-out infinite'
                  }} />
                )}
                {isFailed && <span style={{ color:'#ef4444', fontSize:11 }}>✕</span>}
                {isIdle && <span style={{ color:'#2a2a2a', fontSize:12 }}>{stage.icon}</span>}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div style={{ width:1.5, flex:1, minHeight:28, background:'#1a1a1a', margin:'4px 0', position:'relative', overflow:'hidden' }}>
                  {isDone && (
                    <div style={{
                      position:'absolute', top:0, left:0, right:0, bottom:0,
                      background:'#333',
                      animation:'slideRight 0.4s ease both',
                      transformOrigin:'top'
                    }} />
                  )}
                </div>
              )}
            </div>

            {/* Right: labels */}
            <div style={{ paddingLeft:16, paddingBottom: isLast ? 0 : 24, paddingTop:6, flex:1 }}>
              <div style={{
                fontSize:14, fontWeight:600,
                color: isDone ? '#555' : isActive ? '#f0f0f0' : isFailed ? '#ef4444' : '#222',
                letterSpacing:-0.2,
                transition:'color 0.3s'
              }}>
                {stage.label}
                {isActive && (
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'#666', marginLeft:10, letterSpacing:0 }}>
                    {['◌', '◉', '◌'][tick % 3]}
                  </span>
                )}
              </div>
              {(isActive || isDone) && (
                <div style={{
                  fontSize:12, color: isDone ? '#333' : '#555',
                  marginTop:2, lineHeight:1.5,
                  animation: isActive ? 'fadeIn 0.4s ease' : 'none'
                }}>
                  {isDone ? 'Done' : stage.sub}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
