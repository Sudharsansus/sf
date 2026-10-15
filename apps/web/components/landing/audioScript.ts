// Shared by the landing sections and scripts/generate-landing-audio.ts.
// Edit text here, then re-run the script so the MP3s match.

export const VOICE_IDS = {
  rachel: '21m00Tcm4TlvDq8ikWAM',
  adam: 'pNInz6obpgDQGcFmaJgB',
  bella: 'EXAVITQu4vr4xnSDxMaL',
  charlotte: 'XB0fDUnXU5powFXDhCwa',
  alice: 'Xb7hH8MSUJpSbSDYk0k2',
} as const

export type ConvoLine = { speaker: 'A' | 'B'; text: string }

/** "Two hosts" section — played back line by line. Files: /landing/audio/convo-{i}.mp3 */
export const CONVO: ConvoLine[] = [
  { speaker: 'A', text: 'Okay, honest question. Do you actually read the terms and conditions?' },
  { speaker: 'B', text: 'Nobody does. That’s kind of the whole business model.' },
  { speaker: 'A', text: 'Right — the average one takes seventy-six minutes to read.' },
  { speaker: 'B', text: 'Seventy-six minutes? I’ve watched shorter movies.' },
  { speaker: 'A', text: 'So today: what you actually agree to when you click “accept”.' },
]
export const CONVO_VOICES = { A: VOICE_IDS.rachel, B: VOICE_IDS.adam }

/** Fictional local hosts — illustrated, not real people. Files: /landing/audio/greet-{code}.mp3 */
export const GREETINGS: {
  code: string; language: string; native: string; host: string; voice: string
  text: string; english: string
}[] = [
  { code: 'en', language: 'English', native: 'English', host: 'Olivia', voice: VOICE_IDS.charlotte,
    text: 'Welcome back to the show. Today we’re standing right under Tower Bridge.',
    english: 'Welcome back to the show. Today we’re standing right under Tower Bridge.' },
  { code: 'hi', language: 'Hindi', native: 'हिन्दी', host: 'Ananya', voice: VOICE_IDS.rachel,
    text: 'शो में आपका स्वागत है। आज हम ताजमहल की कहानी सुनेंगे।',
    english: 'Welcome to the show. Today we’ll hear the story of the Taj Mahal.' },
  { code: 'ta', language: 'Tamil', native: 'தமிழ்', host: 'Kavya', voice: VOICE_IDS.bella,
    text: 'நிகழ்ச்சிக்கு வரவேற்கிறோம். இன்று மீனாட்சி அம்மன் கோயிலின் கதையைக் கேட்போம்.',
    english: 'Welcome to the show. Today we’ll hear the story of the Meenakshi Amman Temple.' },
  { code: 'es', language: 'Spanish', native: 'Español', host: 'Lucía', voice: VOICE_IDS.alice,
    text: 'Bienvenidos al programa. Hoy hablamos de la Sagrada Família.',
    english: 'Welcome to the show. Today we’re talking about the Sagrada Família.' },
  { code: 'fr', language: 'French', native: 'Français', host: 'Camille', voice: VOICE_IDS.charlotte,
    text: 'Bienvenue dans l’émission. Aujourd’hui, direction la tour Eiffel.',
    english: 'Welcome to the show. Today, we’re heading to the Eiffel Tower.' },
  { code: 'de', language: 'German', native: 'Deutsch', host: 'Lena', voice: VOICE_IDS.rachel,
    text: 'Willkommen zur Sendung. Heute geht es um Schloss Neuschwanstein.',
    english: 'Welcome to the show. Today it’s all about Neuschwanstein Castle.' },
  { code: 'pt', language: 'Portuguese', native: 'Português', host: 'Inês', voice: VOICE_IDS.bella,
    text: 'Bem-vindos ao programa. Hoje vamos até à Torre de Belém.',
    english: 'Welcome to the show. Today we’re going to Belém Tower.' },
  { code: 'ja', language: 'Japanese', native: '日本語', host: 'Yui', voice: VOICE_IDS.alice,
    text: '番組へようこそ。今日は富士山の物語をお届けします。',
    english: 'Welcome to the show. Today we bring you the story of Mount Fuji.' },
  { code: 'ko', language: 'Korean', native: '한국어', host: 'Jiwoo', voice: VOICE_IDS.charlotte,
    text: '방송에 오신 것을 환영합니다. 오늘은 경복궁 이야기를 들려드릴게요.',
    english: 'Welcome to the show. Today we’ll tell you the story of Gyeongbokgung.' },
  { code: 'ar', language: 'Arabic', native: 'العربية', host: 'Layla', voice: VOICE_IDS.rachel,
    text: 'أهلاً بكم في البرنامج. اليوم نأخذكم إلى مدينة البتراء.',
    english: 'Welcome to the show. Today we take you to the city of Petra.' },
  { code: 'it', language: 'Italian', native: 'Italiano', host: 'Giulia', voice: VOICE_IDS.bella,
    text: 'Benvenuti alla puntata. Oggi parliamo del Colosseo.',
    english: 'Welcome to the episode. Today we’re talking about the Colosseum.' },
  { code: 'zh', language: 'Chinese', native: '中文', host: 'Mei', voice: VOICE_IDS.alice,
    text: '欢迎收听本期节目。今天我们来聊聊长城。',
    english: 'Welcome to this episode. Today let’s talk about the Great Wall.' },
]
