'use client'
import { useState, useEffect, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

let addToastFn: ((message: string, type: ToastType) => void) | null = null

export function toast(message: string, type: ToastType = 'success') {
  addToastFn?.(message, type)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  useEffect(() => {
    addToastFn = addToast
    return () => { addToastFn = null }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div style={{ position: 'fixed', bottom: 90, right: 28, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          background: t.type === 'success' ? '#0a0a0a' : t.type === 'error' ? '#1a0a0a' : '#0a0a14',
          border: `1px solid ${t.type === 'success' ? '#4ade80' : t.type === 'error' ? '#f87171' : '#60a5fa'}`,
          color: t.type === 'success' ? '#4ade80' : t.type === 'error' ? '#f87171' : '#60a5fa',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'slideIn .2s ease',
          fontFamily: "'Inter', -apple-system, sans-serif",
          maxWidth: 320,
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontSize: 15 }}>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          {t.message}
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  )
}
