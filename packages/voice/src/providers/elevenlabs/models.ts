export const TTS_V2 = 'eleven_multilingual_v2'
export const TTS_V3 = 'eleven_v3'

/** Multilingual v2 is steadier for these; v3 covers every Indian language (Telugu, Kannada, Malayalam, …). */
const V2_LANGS = new Set(['en', 'hi', 'ta', 'es', 'fr', 'de', 'pt', 'ar', 'ja', 'ko', 'it', 'zh'])

export function ttsModelFor(language = 'en'): string {
  const base = language.split('-')[0]!
  // Code-mixed (hi-en, ta-en) mixes scripts mid-sentence — v3 handles that better.
  if (language.includes('-')) return TTS_V3
  return V2_LANGS.has(base) ? TTS_V2 : TTS_V3
}

/** v3 does not accept neighbouring-text context. */
export const supportsContext = (model: string) => model === TTS_V2
