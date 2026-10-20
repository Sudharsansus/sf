export type Script =
  | 'Latn' | 'Deva' | 'Taml' | 'Telu' | 'Knda' | 'Mlym' | 'Beng' | 'Gujr' | 'Guru' | 'Orya' | 'Arab' | 'Jpan' | 'Hang' | 'Hans'

export type Language = {
  code: string
  name: string
  native: string
  region: 'india' | 'global'
  script: Script
  dir: 'ltr' | 'rtl'
  /** Code-mixed variants (e.g. Hinglish) write the base language mixed with English. */
  codeMixedWith?: string
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', native: 'English', region: 'global', script: 'Latn', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'india', script: 'Deva', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'india', script: 'Taml', dir: 'ltr' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', region: 'india', script: 'Telu', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'india', script: 'Knda', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'india', script: 'Mlym', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', region: 'india', script: 'Beng', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', region: 'india', script: 'Deva', dir: 'ltr' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', region: 'india', script: 'Gujr', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'india', script: 'Guru', dir: 'ltr' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', region: 'india', script: 'Orya', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', native: 'اردو', region: 'india', script: 'Arab', dir: 'rtl' },
  { code: 'es', name: 'Spanish', native: 'Español', region: 'global', script: 'Latn', dir: 'ltr' },
  { code: 'fr', name: 'French', native: 'Français', region: 'global', script: 'Latn', dir: 'ltr' },
  { code: 'de', name: 'German', native: 'Deutsch', region: 'global', script: 'Latn', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', native: 'Português', region: 'global', script: 'Latn', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', native: 'العربية', region: 'global', script: 'Arab', dir: 'rtl' },
  { code: 'ja', name: 'Japanese', native: '日本語', region: 'global', script: 'Jpan', dir: 'ltr' },
  { code: 'ko', name: 'Korean', native: '한국어', region: 'global', script: 'Hang', dir: 'ltr' },
  { code: 'it', name: 'Italian', native: 'Italiano', region: 'global', script: 'Latn', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', native: '中文', region: 'global', script: 'Hans', dir: 'ltr' },
]

/** Code-mixed modes — offered next to their base language. */
export const CODE_MIXED: Language[] = [
  { code: 'hi-en', name: 'Hinglish', native: 'Hinglish', region: 'india', script: 'Deva', dir: 'ltr', codeMixedWith: 'en' },
  { code: 'ta-en', name: 'Tanglish', native: 'Tanglish', region: 'india', script: 'Taml', dir: 'ltr', codeMixedWith: 'en' },
]

const ALL = [...LANGUAGES, ...CODE_MIXED]

export const LANGUAGE_COUNT = LANGUAGES.length
export const INDIAN_LANGUAGE_COUNT = LANGUAGES.filter(l => l.region === 'india').length
export const getLanguage = (code: string) => ALL.find(l => l.code === code)
export const languageName = (code: string) => getLanguage(code)?.name ?? code
export const isSupported = (code: string) => ALL.some(l => l.code === code)
