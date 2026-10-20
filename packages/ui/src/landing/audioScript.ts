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

/** ElevenLabs model per language: v3 covers every Indian language, multilingual v2 the rest. */
export const TTS_MODEL_V3 = 'eleven_v3'
export const TTS_MODEL_V2 = 'eleven_multilingual_v2'

export type Greeting = {
  code: string; language: string; native: string; region: 'india' | 'global'
  host: string; voice: string; text: string; english: string
}

/** Fictional local hosts — illustrated, not real people. Files: /landing/audio/greet-{code}.mp3 */
export const GREETINGS: Greeting[] = [
  // ── India ────────────────────────────────────────────────────────────────
  { code: 'hi', language: 'Hindi', native: 'हिन्दी', region: 'india', host: 'Ananya', voice: VOICE_IDS.rachel,
    text: 'शो में आपका स्वागत है। आज हम ताजमहल की कहानी सुनेंगे।',
    english: 'Welcome to the show. Today we’ll hear the story of the Taj Mahal.' },
  { code: 'ta', language: 'Tamil', native: 'தமிழ்', region: 'india', host: 'Kavya', voice: VOICE_IDS.bella,
    text: 'நிகழ்ச்சிக்கு வரவேற்கிறோம். இன்று மீனாட்சி அம்மன் கோயிலின் கதையைக் கேட்போம்.',
    english: 'Welcome to the show. Today we’ll hear the story of the Meenakshi Amman Temple.' },
  { code: 'te', language: 'Telugu', native: 'తెలుగు', region: 'india', host: 'Sravya', voice: VOICE_IDS.charlotte,
    text: 'షోకి స్వాగతం. ఈరోజు చార్మినార్ కథ విందాం.',
    english: 'Welcome to the show. Today let’s hear the story of the Charminar.' },
  { code: 'kn', language: 'Kannada', native: 'ಕನ್ನಡ', region: 'india', host: 'Shreya', voice: VOICE_IDS.alice,
    text: 'ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ಸ್ವಾಗತ. ಇಂದು ಮೈಸೂರು ಅರಮನೆಯ ಕಥೆಯನ್ನು ಕೇಳೋಣ.',
    english: 'Welcome to the show. Today let’s hear the story of Mysore Palace.' },
  { code: 'ml', language: 'Malayalam', native: 'മലയാളം', region: 'india', host: 'Meera', voice: VOICE_IDS.rachel,
    text: 'പരിപാടിയിലേക്ക് സ്വാഗതം. ഇന്ന് നമുക്ക് കേരളത്തിലെ കായലുകളുടെ കഥ കേൾക്കാം.',
    english: 'Welcome to the show. Today let’s hear the story of Kerala’s backwaters.' },
  { code: 'bn', language: 'Bengali', native: 'বাংলা', region: 'india', host: 'Riya', voice: VOICE_IDS.bella,
    text: 'অনুষ্ঠানে স্বাগতম। আজ আমরা ভিক্টোরিয়া মেমোরিয়ালের গল্প শুনব।',
    english: 'Welcome to the show. Today we’ll hear the story of the Victoria Memorial.' },
  { code: 'mr', language: 'Marathi', native: 'मराठी', region: 'india', host: 'Sneha', voice: VOICE_IDS.charlotte,
    text: 'कार्यक्रमात आपले स्वागत आहे. आज आपण गेटवे ऑफ इंडियाची गोष्ट ऐकूया.',
    english: 'Welcome to the show. Today let’s hear the story of the Gateway of India.' },
  { code: 'gu', language: 'Gujarati', native: 'ગુજરાતી', region: 'india', host: 'Kinjal', voice: VOICE_IDS.alice,
    text: 'કાર્યક્રમમાં આપનું સ્વાગત છે. આજે આપણે રાણી કી વાવની વાર્તા સાંભળીશું.',
    english: 'Welcome to the show. Today we’ll hear the story of Rani ki Vav.' },
  { code: 'pa', language: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'india', host: 'Simran', voice: VOICE_IDS.rachel,
    text: 'ਪ੍ਰੋਗਰਾਮ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਅੱਜ ਅਸੀਂ ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ ਦੀ ਕਹਾਣੀ ਸੁਣਾਂਗੇ।',
    english: 'Welcome to the show. Today we’ll hear the story of the Golden Temple.' },
  { code: 'or', language: 'Odia', native: 'ଓଡ଼ିଆ', region: 'india', host: 'Sasmita', voice: VOICE_IDS.bella,
    text: 'କାର୍ଯ୍ୟକ୍ରମକୁ ସ୍ୱାଗତ। ଆଜି ଆମେ କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିରର କାହାଣୀ ଶୁଣିବା।',
    english: 'Welcome to the show. Today we’ll hear the story of the Konark Sun Temple.' },
  { code: 'ur', language: 'Urdu', native: 'اردو', region: 'india', host: 'Zoya', voice: VOICE_IDS.charlotte,
    text: 'پروگرام میں خوش آمدید۔ آج ہم قطب مینار کی کہانی سنیں گے۔',
    english: 'Welcome to the show. Today we’ll hear the story of the Qutb Minar.' },
  // ── Global ───────────────────────────────────────────────────────────────
  { code: 'en', language: 'English', native: 'English', region: 'global', host: 'Olivia', voice: VOICE_IDS.charlotte,
    text: 'Welcome back to the show. Today we’re standing right under Tower Bridge.',
    english: 'Welcome back to the show. Today we’re standing right under Tower Bridge.' },
  { code: 'es', language: 'Spanish', native: 'Español', region: 'global', host: 'Lucía', voice: VOICE_IDS.alice,
    text: 'Bienvenidos al programa. Hoy hablamos de la Sagrada Família.',
    english: 'Welcome to the show. Today we’re talking about the Sagrada Família.' },
  { code: 'fr', language: 'French', native: 'Français', region: 'global', host: 'Camille', voice: VOICE_IDS.charlotte,
    text: 'Bienvenue dans l’émission. Aujourd’hui, direction la tour Eiffel.',
    english: 'Welcome to the show. Today, we’re heading to the Eiffel Tower.' },
  { code: 'de', language: 'German', native: 'Deutsch', region: 'global', host: 'Lena', voice: VOICE_IDS.rachel,
    text: 'Willkommen zur Sendung. Heute geht es um Schloss Neuschwanstein.',
    english: 'Welcome to the show. Today it’s all about Neuschwanstein Castle.' },
  { code: 'pt', language: 'Portuguese', native: 'Português', region: 'global', host: 'Inês', voice: VOICE_IDS.bella,
    text: 'Bem-vindos ao programa. Hoje vamos até à Torre de Belém.',
    english: 'Welcome to the show. Today we’re going to Belém Tower.' },
  { code: 'ar', language: 'Arabic', native: 'العربية', region: 'global', host: 'Layla', voice: VOICE_IDS.rachel,
    text: 'أهلاً بكم في البرنامج. اليوم نأخذكم إلى مدينة البتراء.',
    english: 'Welcome to the show. Today we take you to the city of Petra.' },
  { code: 'ja', language: 'Japanese', native: '日本語', region: 'global', host: 'Yui', voice: VOICE_IDS.alice,
    text: '番組へようこそ。今日は富士山の物語をお届けします。',
    english: 'Welcome to the show. Today we bring you the story of Mount Fuji.' },
  { code: 'ko', language: 'Korean', native: '한국어', region: 'global', host: 'Jiwoo', voice: VOICE_IDS.charlotte,
    text: '방송에 오신 것을 환영합니다. 오늘은 경복궁 이야기를 들려드릴게요.',
    english: 'Welcome to the show. Today we’ll tell you the story of Gyeongbokgung.' },
  { code: 'it', language: 'Italian', native: 'Italiano', region: 'global', host: 'Giulia', voice: VOICE_IDS.bella,
    text: 'Benvenuti alla puntata. Oggi parliamo del Colosseo.',
    english: 'Welcome to the episode. Today we’re talking about the Colosseum.' },
  { code: 'zh', language: 'Chinese', native: '中文', region: 'global', host: 'Mei', voice: VOICE_IDS.alice,
    text: '欢迎收听本期节目。今天我们来聊聊长城。',
    english: 'Welcome to this episode. Today let’s talk about the Great Wall.' },
]

/** Languages multilingual v2 voices well; everything else goes to v3. */
const V2_LANGS = new Set(['en', 'hi', 'ta', 'es', 'fr', 'de', 'pt', 'ar', 'ja', 'ko', 'it', 'zh'])
export const ttsModelFor = (code: string) => (V2_LANGS.has(code) ? TTS_MODEL_V2 : TTS_MODEL_V3)
