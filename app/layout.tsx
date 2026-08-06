import { Syne, Space_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/ui/Navbar'
import { HUD } from '@/components/ui/HUD'

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
import { Preloader } from '@/components/ui/Preloader'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { GlobalCanvas } from '@/components/canvas/GlobalCanvas'
import { PixelBackground } from '@/components/ui/PixelBackground'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import { TransitionProvider } from '@/components/providers/TransitionProvider'

export const metadata = {
  title: '3D Portfolio',
  description: 'Interactive 3D Portfolio Experience',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`noise-overlay bg-[#050505] ${syne.variable} ${spaceMono.variable}`}>
        <div className="fixed inset-0 z-0 bg-[#050505] pointer-events-none" />
        <PixelBackground />
        <ErrorBoundary>
          <Preloader />
          <GlobalCanvas />
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

