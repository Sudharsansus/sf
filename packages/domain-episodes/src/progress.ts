export type Stage = 'research' | 'script' | 'refine' | 'voice' | 'visuals' | 'packaging'

type EpisodeLike = {
  status: string
  agentStep?: string | null
  audioUrl?: string | null
  thumbnailUrls?: unknown
  seoData?: unknown
}

const RESEARCH_DONE = new Set(['research_done', 'scripts', 'scripts_done', 'evaluate', 'evaluate_done', 'awaiting_selection'])
const REFINE_DONE = new Set(['refined', 'producing', 'complete'])

/** Real progress for the studio UI, derived from what has actually been stored. */
export function progressOf(ep: EpisodeLike): { done: Stage[]; active: Stage | null; finished: boolean; failed: boolean } {
  const step = ep.agentStep ?? ''
  const done: Stage[] = []
  if (RESEARCH_DONE.has(step) || ep.status === 'awaiting_selection' || isProducing(ep)) done.push('research')
  if (step === 'awaiting_selection' || ep.status === 'awaiting_selection' || isProducing(ep)) done.push('script')
  if (REFINE_DONE.has(step) || ep.audioUrl || ep.status === 'complete' || ep.status === 'partial_failure') done.push('refine')
  if (ep.audioUrl) done.push('voice')
  if (Array.isArray(ep.thumbnailUrls) && ep.thumbnailUrls.length) done.push('visuals')
  if (ep.seoData && typeof ep.seoData === 'object' && Object.keys(ep.seoData as object).length) done.push('packaging')
  const order: Stage[] = ['research', 'script', 'refine', 'voice', 'visuals', 'packaging']
  const finished = ep.status === 'complete' || ep.status === 'partial_failure'
  const failed = ep.status === 'failed'
  const active = finished || failed || ep.status === 'awaiting_selection' ? null : order.find(s => !done.includes(s)) ?? null
  return { done, active, finished, failed }
}

function isProducing(ep: EpisodeLike) {
  return ['producing', 'complete', 'partial_failure'].includes(ep.status)
}
