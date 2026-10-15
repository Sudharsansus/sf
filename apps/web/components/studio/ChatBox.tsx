'use client'
import { useChat } from '@/hooks/useChat'
import { useState } from 'react'

export function ChatBox() {
  const { messages, input, setInput, loading, isOpen, setIsOpen, send, bottomRef } = useChat()
  const [dark] = useState(() => {
    if (typeof window !== 'undefined') {
      return !document.documentElement.classList.contains('light')
    }
    return true
  })

  const bg = '#0f0f0f'
  const surface = '#1a1a1a'
  const border = '#222'
  const text = '#f0f0f0'
  const muted = '#888'

  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 500, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {isOpen && (
        <div style={{ position: 'absolute', bottom: 62, right: 0, width: 360, height: 500, background: bg, border: `1px solid ${border}`, borderRadius: 18, display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: bg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M1.5 8.5L5 1.5L8.5 8.5" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: text }}>SUS AI</div>
                <div style={{ fontSize: 10, color: '#444' }}>Powered by Claude</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}
              style={{ background: surface, border: `1px solid ${border}`, borderRadius: 7, color: muted, cursor: 'pointer', fontSize: 16, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = text)}
              onMouseLeave={e => (e.currentTarget.style.color = muted)}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 8px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 10, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', fontSize: 13, lineHeight: 1.6,
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'user' ? '#f5f5f5' : surface,
                  color: m.role === 'user' ? '#0a0a0a' : '#d0d0d0',
                  border: m.role === 'user' ? 'none' : `1px solid ${border}`,
                }}>
                  {m.content || (loading && i === messages.length - 1 ? '▌' : '')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px 14px', borderTop: `1px solid ${border}`, display: 'flex', gap: 8, flexShrink: 0, background: bg }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask anything…"
              style={{ flex: 1, background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: text, outline: 'none', fontFamily: 'inherit', transition: 'border-color .15s' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#444')}
              onBlur={e => (e.currentTarget.style.borderColor = border)} />
            <button onClick={send} disabled={loading}
              style={{ background: '#f5f5f5', border: 'none', borderRadius: 10, padding: '0 16px', cursor: loading ? 'default' : 'pointer', fontSize: 14, color: '#0a0a0a', fontWeight: 600, opacity: loading ? .5 : 1, transition: 'opacity .15s' }}>↗</button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setIsOpen(!isOpen)}
        style={{ width: 52, height: 52, borderRadius: 14, background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.5)', transition: 'transform .2s, box-shadow .2s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5)' }}>
        {isOpen ? '×' : '💬'}
      </button>
    </div>
  )
}
