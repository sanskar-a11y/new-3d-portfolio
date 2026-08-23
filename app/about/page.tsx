'use client'

import dynamic from 'next/dynamic'
import { About } from '@/components/sections/About'

const AboutBackground = dynamic(
  () => import('@/components/canvas/AboutBackground').then((mod) => mod.AboutBackground),
  { ssr: false }
)

export default function AboutPage() {
  return (
    <main className="relative min-h-screen w-full pt-20" style={{ background: '#0a0a0a' }}>
      <AboutBackground />
      <div className="relative z-10">
        <About />
      </div>
    </main>
  )
}
