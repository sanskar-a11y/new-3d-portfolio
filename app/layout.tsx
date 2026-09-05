import type { Metadata } from 'next'
import { Syne, Space_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/ui/Navbar'
import { HUD } from '@/components/ui/HUD'
import { Preloader } from '@/components/ui/Preloader'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { PixelBackground } from '@/components/ui/PixelBackground'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import { TransitionProvider } from '@/components/providers/TransitionProvider'
import { CanvasWrapper } from '@/components/canvas/CanvasWrapper'

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

const SITE_URL = 'https://myportfolio-git-main-sanskar-a11ys-projects.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Sanskar — Creative Developer, AI Engineer & Designer',
    template: '%s | Sanskar',
  },
  description:
    'Official portfolio of Sanskar (Sanskar Sharma) — Creative Developer, AI Engineer & Problem Solver specializing in Three.js WebGL shaders, Next.js, React, Python AI automation, and interactive luxury digital experiences.',
  applicationName: 'Sanskar 3D Portfolio',
  authors: [{ name: 'Sanskar Sharma', url: 'https://github.com/sanskar-a11y' }],
  creator: 'Sanskar Sharma',
  publisher: 'Sanskar Sharma',
  category: 'technology',
  keywords: [
    'Sanskar',
    'Sanskar Sharma',
    'sanskar-a11y',
    'Creative Developer',
    'AI Engineer',
    'Three.js Developer',
    'WebGL Shaders',
    'Next.js 3D Portfolio',
    'React Developer India',
    'COER Hackathon Winner',
    'Creative Technologist',
    'Full Stack Web Engineer',
    'Python AI Automation',
    'Freelance Video Editor Fiverr',
    'GLSL Shader Art',
    'Modern Web Design',
    'Interactive 3D Website',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Sanskar Portfolio',
    title: 'Sanskar — Creative Developer, AI Engineer & Designer',
    description:
      'I don’t just build. I hunt for complete dominance. Explore interactive 3D WebGL experiences, AI engineering systems, and creative web development by Sanskar.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Sanskar Portfolio — Creative Developer & AI Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sanskar — Creative Developer, AI Engineer & Designer',
    description:
      'Interactive 3D WebGL Portfolio, full-stack software, and AI engineering by Sanskar.',
    creator: '@sanskar-a11y',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

// Structured Data (Schema.org JSON-LD)
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Sanskar Sharma',
      alternateName: 'Sanskar',
      url: SITE_URL,
      jobTitle: 'Creative Developer & AI Engineer',
      description:
        'Developer, problem solver, and relentless learner building interactive WebGL experiences, full-stack applications, and AI systems.',
      sameAs: [
        'https://github.com/sanskar-a11y',
        'https://www.linkedin.com/in/sanskar-sharma-b5830433a/',
        'https://www.fiverr.com/sanskar6008/buying?source=avatar_menu_profile',
      ],
      knowsAbout: [
        'React',
        'Next.js',
        'TypeScript',
        'Three.js',
        'WebGL',
        'GLSL Shaders',
        'Python',
        'Artificial Intelligence',
        'Automation',
        'UI/UX Design',
        'Video Editing',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Sanskar Portfolio',
      description:
        'Official 3D interactive portfolio of Sanskar — Creative Developer & AI Engineer.',
      publisher: {
        '@id': `${SITE_URL}/#person`,
      },
      inLanguage: 'en-US',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`noise-overlay bg-[#080808] ${syne.variable} ${spaceMono.variable}`}>
        <div className="fixed inset-0 z-0 bg-[#080808] pointer-events-none" />
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
