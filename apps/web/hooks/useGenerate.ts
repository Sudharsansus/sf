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

  const [voices,           setVoices]           = useState<{ voiceA?: string; voiceB?: string }>({})

  /** Poll an episode until `isDone` passes. Throws if the job fails. */
  async function pollEpisode(id: string, onTick: (ep: any) => void, isDone: (ep: any) => boolean) {
    const started = Date.now()
    while (Date.now() - started < 30 * 60 * 1000) {
      await new Promise(r => setTimeout(r, 2500))
      const res = await fetch(`/api/jobs?episodeId=${id}`)
      if (!res.ok) continue
      const ep = await res.json()
      if (ep.status === 'failed') throw new Error('Generation failed. Any credits used were refunded.')
      onTick(ep)
      if (isDone(ep)) return ep
    }
    throw new Error('This is taking longer than expected. Check your episodes page shortly.')
  }

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
    setVoices({ voiceA, voiceB })

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

      setEpisodeId(data.episodeId)
      setShareId(data.shareId)

      // Follow the background job until the five scripts are ready.
      const ep = await pollEpisode(data.episodeId, e => {
        if (['scripts', 'scripts_done', 'evaluate', 'evaluate_done'].includes(e.agentStep)) {
          completeStage('research'); setActiveStage('script')
        }
      }, e => e.status === 'awaiting_selection')

      completeStage('research'); completeStage('script')
      const scriptList = ep.allScripts?.scripts || []
      const win = ep.evaluations?.winner || scriptList[0]?.angle || ''
      setScripts(scriptList)
      setEvaluations(ep.evaluations?.scores || [])
      setWinner(win)
      setSelectedAngle(win)
      setStep('picking')
    } catch (e: any) {
      setFailedStages(['research'])
      setError(e?.message || 'Connection lost. Please try again.')
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
        body: JSON.stringify({ episodeId, selectedAngle, durationLabel: selectedDuration, selectedSpeaker, ...voices })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Production failed'); setStep('failed'); return }

      const done = (e: any) => ['complete', 'partial_failure'].includes(e.status)
      const ep = data.status && done(data) ? data : await pollEpisode(episodeId, e => {
        if (e.agentStep && e.agentStep !== 'queued' && e.agentStep !== 'refine') { completeStage('refine'); setActiveStage('voice') }
        if (e.thumbnailUrls?.length) completeStage('visuals')
        if (e.seoData && Object.keys(e.seoData).length) completeStage('packaging')
      }, done)

      ;(['refine', 'voice', 'visuals', 'packaging'] as StageKey[]).forEach(completeStage)
      setResult(ep)
      setStep('complete')
    } catch (e: any) {
      setFailedStages(f => [...f, 'voice'])
      setError(e?.message || 'Production failed. Please try again.')
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
