// Single source of truth for supported languages — used by the studio picker,
// the Claude prompts and ElevenLabs model selection. Indian languages first.

export type Language = { code: string; name: string; native: string; region: 'india' | 'global' }

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English',    native: 'English',  region: 'global' },
  { code: 'hi', name: 'Hindi',      native: 'हिन्दी',    region: 'india' },
  { code: 'ta', name: 'Tamil',      native: 'தமிழ்',     region: 'india' },
  { code: 'te', name: 'Telugu',     native: 'తెలుగు',    region: 'india' },
  { code: 'kn', name: 'Kannada',    native: 'ಕನ್ನಡ',     region: 'india' },
  { code: 'ml', name: 'Malayalam',  native: 'മലയാളം',   region: 'india' },
  { code: 'bn', name: 'Bengali',    native: 'বাংলা',     region: 'india' },
  { code: 'mr', name: 'Marathi',    native: 'मराठी',     region: 'india' },
  { code: 'gu', name: 'Gujarati',   native: 'ગુજરાતી',   region: 'india' },
  { code: 'pa', name: 'Punjabi',    native: 'ਪੰਜਾਬੀ',    region: 'india' },
  { code: 'or', name: 'Odia',       native: 'ଓଡ଼ିଆ',      region: 'india' },
  { code: 'ur', name: 'Urdu',       native: 'اردو',      region: 'india' },
  { code: 'es', name: 'Spanish',    native: 'Español',  region: 'global' },
  { code: 'fr', name: 'French',     native: 'Français', region: 'global' },
  { code: 'de', name: 'German',     native: 'Deutsch',  region: 'global' },
  { code: 'pt', name: 'Portuguese', native: 'Português', region: 'global' },
  { code: 'ar', name: 'Arabic',     native: 'العربية',   region: 'global' },
  { code: 'ja', name: 'Japanese',   native: '日本語',     region: 'global' },
  { code: 'ko', name: 'Korean',     native: '한국어',     region: 'global' },
  { code: 'it', name: 'Italian',    native: 'Italiano', region: 'global' },
  { code: 'zh', name: 'Chinese',    native: '中文',       region: 'global' },
]

export const LANGUAGE_COUNT = LANGUAGES.length
export const INDIAN_LANGUAGE_COUNT = LANGUAGES.filter(l => l.region === 'india').length
export const languageName = (code: string) => LANGUAGES.find(l => l.code === code)?.name ?? code
