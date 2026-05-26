'use client'
// ── ChatBox component ─────────────────────────────────────────────────────────
// Floating AI assistant — extracted from app/page.tsx

import { useChat } from '@/hooks/useChat'

export function ChatBox() {
  const { messages, input, setInput, loading, isOpen, setIsOpen, send, bottomRef } = useChat()

  return (
    <div style={{ position:'fixed', bottom:28, right:28, zIndex:500 }}>
      {isOpen && (
        <div style={{ position:'absolute', bottom:62, right:0, width:360, height:480, background:'#111', border:'1px solid #222', borderRadius:16, display:'flex', flexDirection:'column', boxShadow:'0 24px 80px rgba(0,0,0,0.7)', overflow:'hidden' }}>
          {/* Header */}
          <div style={{ padding:'14px 18px', borderBottom:'1px solid #1a1a1a', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:600, color:'#f0f0f0' }}>SceneForge AI</div>
              <div style={{ fontSize:11, color:'#444' }}>Powered by Claude</div>
            </div>
            <button onClick={() => setIsOpen(false)}
              style={{ background:'none', border:'none', color:'#555', cursor:'pointer', fontSize:20, lineHeight:1 }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px 14px 8px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom:10, display:'flex', justifyContent: m.role==='user'?'flex-end':'flex-start' }}>
                <div style={{
                  maxWidth:'85%', padding:'9px 13px', fontSize:13, lineHeight:1.55,
                  borderRadius: m.role==='user'?'12px 12px 3px 12px':'12px 12px 12px 3px',
                  background: m.role==='user'?'#f0f0f0':'#1a1a1a',
                  color: m.role==='user'?'#0c0c0c':'#d0d0d0'
                }}>
                  {m.content || (loading && i === messages.length - 1 ? '▌' : '')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding:'10px 12px 14px', borderTop:'1px solid #1a1a1a', display:'flex', gap:8, flexShrink:0 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask anything…"
              style={{ flex:1, background:'#1a1a1a', border:'1px solid #222', borderRadius:8, padding:'9px 12px', fontSize:13, color:'#f0f0f0', outline:'none', fontFamily:"'Instrument Sans',sans-serif" }} />
            <button onClick={send} disabled={loading}
              style={{ background:'#f0f0f0', border:'none', borderRadius:8, padding:'0 14px', cursor:'pointer', fontSize:14, color:'#0c0c0c', fontWeight:600 }}>↗</button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setIsOpen(!isOpen)}
        style={{ width:50, height:50, borderRadius:13, background:'#f0f0f0', border:'none', cursor:'pointer', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 24px rgba(0,0,0,0.5)', transition:'transform .2s' }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
        {isOpen ? '×' : '💬'}
      </button>
    </div>
  )
}
