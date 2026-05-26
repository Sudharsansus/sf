import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SceneForge — AI Podcast Studio',
  description: 'Turn any topic into a broadcast-quality podcast episode in 60 seconds. Powered by Claude + Wubble.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://sceneforge.vercel.app'),
  openGraph: {
    title: 'SceneForge — AI Podcast Studio',
    description: 'Turn any topic into a real podcast episode in 60 seconds.',
    type: 'website'
  },
  twitter: { card: 'summary_large_image' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
