export const FLAGS = {
  /** No-login 60-second homepage preview */
  homepagePreview: { default: true, description: 'Anonymous 60s preview on the landing page' },
  /** Hinglish / Tanglish code-mixed scripts */
  codeMixedLanguages: { default: true, description: 'Hinglish and Tanglish modes' },
  /** Video episodes + Shorts (needs worker-media deployed) */
  videoRendering: { default: false, description: 'MP4 episodes and Shorts via worker-media' },
  /** Shows / series with saved hosts */
  shows: { default: false, description: 'Saved shows with recurring hosts and music' },
  /** RSS hosting + distribution */
  rssHosting: { default: false, description: 'Hosted RSS feeds' },
} as const

export type FlagName = keyof typeof FLAGS
