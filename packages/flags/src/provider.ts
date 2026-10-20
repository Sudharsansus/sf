import { FLAGS, type FlagName } from './flags'

export type FlagSource = Record<string, string | undefined>

/** Env override: FLAG_VIDEO_RENDERING=true. Falls back to the flag default. */
export function isEnabled(name: FlagName, source: FlagSource = process.env): boolean {
  const envKey = 'FLAG_' + name.replace(/[A-Z]/g, c => '_' + c).toUpperCase()
  const raw = source[envKey]
  if (raw === undefined) return FLAGS[name].default
  return raw === '1' || raw.toLowerCase() === 'true'
}
