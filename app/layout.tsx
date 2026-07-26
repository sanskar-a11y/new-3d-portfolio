import './globals.css'
import { Navbar } from '@/components/ui/Navbar'
import { Preloader } from '@/components/ui/Preloader'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { GlobalCanvas } from '@/components/canvas/GlobalCanvas'

export const metadata = {
  title: '3D Portfolio',
  description: 'Interactive 3D Portfolio Experience',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise-overlay bg-[#050505]">
        <div className="fixed inset-0 z-0 bg-[#050505] pointer-events-none" />
        <ErrorBoundary>
          <Preloader />
          <GlobalCanvas />
          <Navbar />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
