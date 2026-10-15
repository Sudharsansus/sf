// ── WORKFLOW STATE MACHINE ────────────────────────────────────────────────────
// Every episode follows a deterministic state graph.
// No "magic strings" scattered across routes — all states defined here.

export type WorkflowStatus =
  | 'queued'
  | 'researching'
  | 'scripting'
  | 'evaluating'
  | 'awaiting_selection'
  | 'refining'
  | 'audio_rendering'
  | 'thumbnail_rendering'
  | 'seo_generating'
  | 'uploading'
  | 'complete'
  | 'failed'
  | 'partial_failure'  // completed but some steps failed (e.g. thumbnails failed, audio ok)

export type AgentStep =
  | 'research'        | 'research_done'
  | 'scripts'         | 'scripts_done'
  | 'evaluate'        | 'evaluate_done'
  | 'awaiting_selection'
  | 'refining'        | 'refined'
  | 'producing'
  | 'audio_done'      | 'audio_failed'
  | 'thumbnails_done' | 'thumbnails_failed'
  | 'seo_done'        | 'seo_failed'
  | 'complete'
  | 'failed'

// Valid transitions — prevents illegal state jumps
export const TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  queued:             ['researching', 'failed'],
  researching:        ['scripting', 'failed'],
  scripting:          ['evaluating', 'failed'],
  evaluating:         ['awaiting_selection', 'failed'],
  awaiting_selection: ['refining', 'failed'],
  refining:           ['audio_rendering', 'failed'],
  audio_rendering:    ['thumbnail_rendering', 'partial_failure', 'failed'],
  thumbnail_rendering:['seo_generating', 'partial_failure', 'failed'],
  seo_generating:     ['uploading', 'complete', 'partial_failure'],
  uploading:          ['complete', 'partial_failure', 'failed'],
  complete:           [],
  failed:             [],
  partial_failure:    []
}

export function canTransition(from: WorkflowStatus, to: WorkflowStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function isTerminal(status: WorkflowStatus): boolean {
  return ['complete', 'failed', 'partial_failure'].includes(status)
}

export function isRecoverable(status: WorkflowStatus): boolean {
  return ['audio_rendering', 'thumbnail_rendering', 'seo_generating', 'uploading', 'partial_failure'].includes(status)
}

// Human-readable status labels for UI
export const STATUS_LABELS: Record<WorkflowStatus, string> = {
  queued:              'Queued',
  researching:         'Researching topic…',
  scripting:           'Writing 5 scripts…',
  evaluating:          'Evaluating + ranking…',
  awaiting_selection:  'Awaiting your selection',
  refining:            'Refining script…',
  audio_rendering:     'Rendering audio…',
  thumbnail_rendering: 'Generating thumbnails…',
  seo_generating:      'Writing SEO copy…',
  uploading:           'Uploading assets…',
  complete:            'Ready',
  failed:              'Failed',
  partial_failure:     'Partially complete'
}
