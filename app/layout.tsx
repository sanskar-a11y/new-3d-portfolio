import './globals.css'
import { Navbar } from '@/components/ui/Navbar'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { Preloader } from '@/components/ui/Preloader'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

export const metadata = {
  title: '3D Portfolio',
  description: 'Interactive 3D Portfolio Experience',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <Preloader />
          <CustomCursor />
          <Navbar />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
