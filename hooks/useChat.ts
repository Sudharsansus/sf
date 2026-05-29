// ── useChat hook ──────────────────────────────────────────────────────────────
// Extracts chat state and streaming logic from app/page.tsx

import { useState, useRef, useEffect } from 'react'

export interface ChatMessage { role: 'user' | 'assistant'; content: string }

export function useChat(initialMessage = "Hi! I'm Sus AI. Ask me for episode ideas or how the pipeline works.") {
  const [messages,  setMessages]  = useState<ChatMessage[]>([{ role: 'assistant', content: initialMessage }])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [isOpen,    setIsOpen]    = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: input.trim() }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs); setInput(''); setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs })
      })
      const reader = res.body?.getReader()
      const dec = new TextDecoder()
      let text = ''
      setMessages(m => [...m, { role: 'assistant', content: '' }])
      while (reader) {
        const { done, value } = await reader.read(); if (done) break
        for (const line of dec.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue
          const d = line.slice(6); if (d === '[DONE]') break
          try { text += JSON.parse(d).text; setMessages(m => { const u=[...m]; u[u.length-1]={role:'assistant',content:text}; return u }) } catch {}
        }
      }
    } finally { setLoading(false) }
  }

  return { messages, input, setInput, loading, isOpen, setIsOpen, send, bottomRef }
}
