import { getLanguage, languageName } from '@isaii/i18n'

/** Language instructions appended to the user message (keeps the cached system prompt identical across languages). */
export function languageInstruction(code: string): string {
  if (!code || code === 'en') return ''
  const lang = getLanguage(code)
  if (code === 'hi-en') {
    return '\n\nWrite in Hinglish: natural, everyday Hindi mixed with English the way urban Indians speak. Write Hindi words in Devanagari and English words in Latin letters. Do not translate common English terms (podcast, startup, phone) into Hindi.'
  }
  if (code === 'ta-en') {
    return '\n\nWrite in Tanglish: everyday Tamil mixed with English the way people in Chennai speak. Write Tamil words in Tamil script and English words in Latin letters. Keep common English terms in English.'
  }
  const name = languageName(code)
  const dir = lang?.dir === 'rtl' ? ' (right-to-left)' : ''
  return `\n\nWrite everything in ${name}${dir}, in its native script. Use names, examples, currency and numbers that feel natural to native speakers. Do not transliterate into Latin letters.`
}
