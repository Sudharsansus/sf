'use client'

import { useEffect, useState } from 'react'

export type StageKey = 'research' | 'script' | 'refine' | 'voice' | 'visuals' | 'packaging'

interface Stage {
  key:   StageKey
  label: string
  sub:   string
  icon:  React.ReactNode
}

const STAGES: Stage[] = [
  { key: 'research',  label: 'Research',  sub: 'Analysing topic, angles, and hooks', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { key: 'script',    label: 'Script',    sub: 'Writing 5 unique episode angles',    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
  { key: 'refine',    label: 'Refine',    sub: 'Sharpening your chosen script',       icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { key: 'voice',     label: 'Voice',     sub: 'Rendering 2-speaker narration',       icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg> },
  { key: 'visuals',   label: 'Visuals',   sub: 'Generating cover art',                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  { key: 'packaging', label: 'Packaging', sub: 'Writing SEO, captions & newsletter',  icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg> },
]

type StageStatus = 'idle' | 'active' | 'done' | 'failed'

interface Props {
  activeStage:     StageKey | null
  completedStages: StageKey[]
  failedStages?:   StageKey[]
}

export function WorkflowTimeline({ activeStage, completedStages, failedStages = [] }: Props) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 600)
    return () => clearInterval(t)
  }, [])

  function getStatus(key: StageKey): StageStatus {
    if (failedStages.includes(key))    return 'failed'
    if (completedStages.includes(key)) return 'done'
    if (activeStage === key)           return 'active'
    return 'idle'
  }

  return (
    <div style={{ padding: '28px 0', width: '100%' }}>
      {STAGES.map((stage, i) => {
        const status   = getStatus(stage.key)
        const isLast   = i === STAGES.length - 1
        const isDone   = status === 'done'
        const isActive = status === 'active'
        const isFailed = status === 'failed'
        const isIdle   = status === 'idle'

        return (
          <div key={stage.key} style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
            {/* Left column: connector + icon */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
              {/* Icon circle */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: isDone ? '#f0f0f0' : isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: `1.5px solid ${isDone ? '#f0f0f0' : isActive ? 'rgba(255,255,255,0.3)' : isFailed ? '#ef4444' : 'rgba(255,255,255,0.05)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
                boxShadow: isActive ? '0 0 20px rgba(240,240,240,0.08)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                position: 'relative', zIndex: 1,
              }}>
                {isDone   && <span style={{ color: '#080808', fontSize: 13, fontWeight: 700 }}>✓</span>}
                {isActive && (
                  <span style={{
                    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                    background: '#f0f0f0',
                    animation: 'pulse 1s ease-in-out infinite',
                  }} />
                )}
                {isFailed && <span style={{ color: '#ef4444', fontSize: 11 }}>✕</span>}
                {isIdle   && <span style={{ color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center' }}>{stage.icon}</span>}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div style={{ width: 1.5, flex: 1, minHeight: 28, background: 'rgba(255,255,255,0.05)', margin: '4px 0', position: 'relative', overflow: 'hidden' }}>
                  {isDone && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(255,255,255,0.15)',
                      animation: 'slideRight 0.4s ease both',
                      transformOrigin: 'top',
                    }} />
                  )}
                </div>
              )}
            </div>

            {/* Right: labels */}
            <div style={{ paddingLeft: 16, paddingBottom: isLast ? 0 : 24, paddingTop: 6, flex: 1 }}>
              <div style={{
                fontSize: 14, fontWeight: 600,
                color: isFailed ? '#ef4444' : isActive ? 'inherit' : isDone ? undefined : 'rgba(255,255,255,0.12)',
                opacity: isDone ? 0.5 : 1,
                letterSpacing: -0.2,
                transition: 'color 0.3s',
              }}>
                {stage.label}
                {isActive && (
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginLeft: 10, letterSpacing: 0 }}>
                    {['◌', '◉', '◌'][tick % 3]}
                  </span>
                )}
              </div>
              {(isActive || isDone) && (
                <div style={{
                  fontSize: 12,
                  color: isDone ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.35)',
                  marginTop: 2, lineHeight: 1.5,
                  animation: isActive ? 'fadeIn 0.4s ease' : 'none',
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
