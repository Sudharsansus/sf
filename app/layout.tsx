import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'SUS — AI Creator Production Studio',
  description: 'Turn any topic into a broadcast-quality episode in minutes. 12 languages. 16 voices. Research, scripts, voice, visuals, and SEO — all in one workflow.',
  keywords: ['AI podcast', 'AI creator', 'script generator', 'ElevenLabs', 'podcast production', 'AI content'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://sus.studio'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'SUS — AI Creator Production Studio',
    description: 'Turn any topic into a broadcast-ready episode in minutes.',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SUS — AI Creator Production Studio',
    description: 'Turn any topic into a broadcast-ready episode in minutes.',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.svg" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}