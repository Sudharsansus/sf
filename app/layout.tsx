import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'SceneForge — AI Creator Production Studio',
  description: 'Turn any topic into a broadcast-quality episode in minutes. Research, scripts, voice, visuals, and SEO — all in one workflow.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://sf-bice.vercel.app'),
  openGraph: {
    title: 'SceneForge — AI Creator Production Studio',
    description: 'Turn any topic into a broadcast-ready episode in minutes.',
    type: 'website'
  },
  twitter: { card: 'summary_large_image' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}