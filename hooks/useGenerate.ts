'use client'
// ── useGenerate v7 ──────────────────────────────────────────────────────────
// Uses creator language. Maps workflow steps to stage keys.

import { useState } from 'react'
import type { StageKey } from '@/components/workflow/WorkflowTimeline'

export type Step = 'idle' | 'configuring' | 'working' | 'picking' | 'producing' | 'complete' | 'failed'

export function useGenerate() {
  const [topic,            setTopic]            = useState('')
  const [step,             setStep]             = useState<Step>('idle')
  const [activeStage,      setActiveStage]      = useState<StageKey | null>(null)
  const [completedStages,  setCompletedStages]  = useState<StageKey[]>([])
  const [failedStages,     setFailedStages]     = useState<StageKey[]>([])
  const [scripts,          setScripts]          = useState<any[]>([])
  const [evaluations,      setEvaluations]      = useState<any[]>([])
  const [winner,           setWinner]           = useState('')
  const [selectedAngle,    setSelectedAngle]    = useState('')
  const [selectedDuration, setSelectedDuration] = useState('5min')
  const [selectedSpeaker,  setSelectedSpeaker]  = useState('both')
  const [result,           setResult]           = useState<any>(null)
  const [error,            setError]            = useState('')
  const [episodeId,        setEpisodeId]        = useState('')
  const [shareId,          setShareId]          = useState('')

  function completeStage(key: StageKey) {
    setCompletedStages(prev => prev.includes(key) ? prev : [...prev, key])
    setActiveStage(null)
  }

  function reset() {
    setStep('idle'); setResult(null); setScripts([]); setEvaluations([])
    setError(''); setTopic(''); setEpisodeId(''); setShareId('')
    setSelectedAngle(''); setActiveStage(null)
    setCompletedStages([]); setFailedStages([])
  }

  async function generate() {
    if (!topic.trim() || (step !== 'idle' && step !== 'failed')) return
    setError(''); setResult(null); setScripts([]); setEvaluations([])
    setCompletedStages([]); setFailedStages([])
    setStep('configuring')
  }

  async function startGeneration(voiceA?: string, voiceB?: string, language?: string) {
    if (step !== 'configuring') return
    setStep('working')

    const idemKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`

    setActiveStage('research')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idemKey },
        body: JSON.stringify({ topic: topic.trim(), voiceA, voiceB, language, duration: selectedDuration })
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error || 'Something went wrong'); setStep('failed'); return }

      completeStage('research')
      setActiveStage('script')
      await new Promise(r => setTimeout(r, 300))
      completeStage('script')

      setEpisodeId(data.episodeId)
      setShareId(data.shareId)
      setScripts(data.scripts || [])
      setEvaluations(data.evaluations || [])
      setWinner(data.winner || data.scripts?.[0]?.angle || '')
      setSelectedAngle(data.winner || data.scripts?.[0]?.angle || '')
      setStep('picking')
    } catch {
      setFailedStages(['research'])
      setError('Connection lost. Please try again.')
      setStep('failed')
    }
  }

  async function produce() {
    if (!selectedAngle || !episodeId) return
    setStep('producing')
    setActiveStage('refine')
    try {
      const res = await fetch('/api/agents/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId, selectedAngle, durationLabel: selectedDuration, selectedSpeaker })
      })
      const data = await res.json()

      completeStage('refine')
      setActiveStage('voice')
      await new Promise(r => setTimeout(r, 400))
      completeStage('voice')
      setActiveStage('visuals')
      await new Promise(r => setTimeout(r, 300))
      completeStage('visuals')
      setActiveStage('packaging')
      await new Promise(r => setTimeout(r, 300))
      completeStage('packaging')

      if (!res.ok) { setError(data.error || 'Production failed'); setStep('failed'); return }

      setResult(data)
      setStep('complete')
    } catch {
      setFailedStages(f => [...f, 'voice'])
      setError('Production failed. Please try again.')
      setStep('failed')
    }
  }

  return {
    topic, setTopic, step,
    activeStage, completedStages, failedStages,
    scripts, evaluations, winner,
    selectedAngle, setSelectedAngle,
    selectedDuration, setSelectedDuration,
    selectedSpeaker, setSelectedSpeaker,
    result, error, episodeId, shareId,
    generate, startGeneration, produce, reset
  }
}
