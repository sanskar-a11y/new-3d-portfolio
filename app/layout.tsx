import dynamic from 'next/dynamic'
import { Syne, Space_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/ui/Navbar'
import { HUD } from '@/components/ui/HUD'
import { Preloader } from '@/components/ui/Preloader'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { PixelBackground } from '@/components/ui/PixelBackground'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import { TransitionProvider } from '@/components/providers/TransitionProvider'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
  weight: ['400', '700'],
})

import { CanvasWrapper } from '@/components/canvas/CanvasWrapper'

export const metadata = {
  title: 'Sanskar — Creative Developer, Video Editor & Designer',
  description: 'Portfolio of Sanskar — a creative developer, video editor, and designer building premium digital experiences.',
  authors: [{ name: 'Sanskar Sharma', url: 'https://github.com/sanskar-a11y' }],
  keywords: ['Sanskar', 'Creative Developer', 'Video Editor', 'Thumbnail Designer', 'Next.js', 'React', 'Three.js', 'WebGL', 'Portfolio'],
  openGraph: {
    title: 'Sanskar — Creative Developer, Video Editor & Designer',
    description: 'Websites, videos, and thumbnails crafted to feel premium.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`noise-overlay bg-[#0a0a0a] ${syne.variable} ${spaceMono.variable}`}>
        <div className="fixed inset-0 z-0 bg-[#0a0a0a] pointer-events-none" />
        <PixelBackground />
        <ErrorBoundary>
          <Preloader />
          <CanvasWrapper />
          <HUD />
          <Navbar />
          <SmoothScrollProvider>
            <TransitionProvider>
              {children}
            </TransitionProvider>
          </SmoothScrollProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

