'use client'
// ── ScriptPicker component ────────────────────────────────────────────────────
// Renders the 5-script selection UI with evaluation scores
// Extracted from app/page.tsx

import { useState } from 'react'

interface Script {
  angle: string
  title: string
  hook: string
  lines: any[]
}
interface Score {
  angle: string
  total: number
}

interface Props {
  scripts:          Script[]
  evaluations:      Score[]
  winner:           string
  selectedAngle:    string
  selectedDuration: string
  selectedSpeaker:  string
  onSelectAngle:    (angle: string) => void
  onSelectDuration: (d: string) => void
  onSelectSpeaker:  (s: string) => void
  onProduce:        () => void
}

export function ScriptPicker({
  scripts, evaluations, winner, selectedAngle, selectedDuration, selectedSpeaker,
  onSelectAngle, onSelectDuration, onSelectSpeaker, onProduce
}: Props) {
  const [customDuration, setCustomDuration] = useState('')
  const getScore = (angle: string) => evaluations.find(e => e.angle === angle)?.total || 0

  return (
    <div style={{ textAlign:'left' }}>
      <div style={{ marginBottom:20, textAlign:'center' }}>
        <div style={{ fontFamily:'monospace', fontSize:10, color:'#444', letterSpacing:1, marginBottom:8 }}>PICK YOUR SCRIPT</div>
        <div style={{ fontSize:13, color:'#666' }}>
          Claude generated {scripts.length} variations. Scored on 10 metrics. Pick one to produce.
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
        {scripts.map(s => {
          const score = getScore(s.angle)
          const isWinner   = s.angle === winner
          const isSelected = s.angle === selectedAngle
          return (
            <div key={s.angle} onClick={() => onSelectAngle(s.angle)}
              style={{ padding:'16px 18px', background: isSelected?'#1a1a1a':'#111', border:`1px solid ${isSelected?'#444':'#1f1f1f'}`, borderRadius:12, cursor:'pointer', transition:'all .15s', position:'relative', overflow:'hidden' }}>
              {isWinner && (
                <div style={{ position:'absolute', top:10, right:12, fontFamily:'monospace', fontSize:9, color:'#4ade80', background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.2)', padding:'2px 7px', borderRadius:4 }}>
                  TOP PICK
                </div>
              )}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <div style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${isSelected?'#f0f0f0':'#333'}`, background:isSelected?'#f0f0f0':'transparent', flexShrink:0 }} />
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:16, fontStyle:'italic', color:'#f0f0f0' }}>{s.title}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginLeft:26 }}>
                <span style={{ fontFamily:'monospace', fontSize:10, color:'#555', background:'#1a1a1a', padding:'2px 7px', borderRadius:4, border:'1px solid #222', textTransform:'uppercase' }}>{s.angle}</span>
                {score > 0 && <span style={{ fontFamily:'monospace', fontSize:10, color:'#666' }}>Score: {score}/100</span>}
              </div>
              {isSelected && (
                <div style={{ marginTop:10, marginLeft:26 }}>
                  <div style={{ fontSize:12, color:'#888', fontStyle:'italic', marginBottom:12 }}>{s.hook}</div>
                  
                  <div style={{ marginBottom:14 }}>
                    <p style={{ fontSize:11, color:'#555', marginBottom:6, fontWeight:500 }}>Duration</p>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                      {['30sec', '1min', '2min', '5min', '10min', '15min', '20min', '30min', '45min', '60min'].map(d => (
                        <button key={d} onClick={e => { e.stopPropagation(); onSelectDuration(d); setCustomDuration('') }}
                          style={{ fontSize:11, padding:'4px 10px', borderRadius:5, border:`1px solid ${selectedDuration===d?'#666':'#222'}`, background:selectedDuration===d?'#2a2a2a':'transparent', color:selectedDuration===d?'#f0f0f0':'#555', cursor:'pointer' }}>
                          {d}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Or type custom: e.g. 3min, 90sec"
                      value={selectedDuration}
                      onChange={e => onSelectDuration(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      onKeyDown={e => e.stopPropagation()}
                      style={{ width:'100%', fontSize:12, padding:'7px 12px', borderRadius:6, border:'1px solid #333', background:'#0a0a0a', color:'#888', fontFamily:'inherit' }}
                    />
                  </div>

                  <div>
                    <p style={{ fontSize:11, color:'#555', marginBottom:6, fontWeight:500 }}>Speaker format</p>
                    <div style={{ display:'flex', gap:6 }}>
                      {[['both', 'A + B (Conversation)'], ['a', 'Solo A'], ['b', 'Solo B']].map(([val, label]) => (
                        <button key={val} onClick={e => { e.stopPropagation(); onSelectSpeaker(val as string) }}
                          style={{ fontSize:11, padding:'5px 12px', borderRadius:6, border:`1px solid ${selectedSpeaker === val ? '#666' : '#222'}`, background: selectedSpeaker === val ? '#2a2a2a' : 'transparent', color: selectedSpeaker === val ? '#f0f0f0' : '#555', cursor:'pointer' }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button onClick={onProduce}
        style={{ width:'100%', padding:'14px', fontSize:14, fontWeight:500, color:'#0c0c0c', background:'#f0f0f0', border:'none', borderRadius:10, cursor:'pointer', fontFamily:"'Instrument Sans',sans-serif" }}>
        Produce episode — {selectedDuration} {selectedSpeaker !== 'both' ? `(${selectedSpeaker === 'a' ? 'Solo A' : 'Solo B'})` : ''} ↗
      </button>
    </div>
  )
}
