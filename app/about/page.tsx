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
      <div className="fixed inset-0 z-[5]">
        <AboutBackground />
      </div>
      <div className="relative z-[15]">
        <About />
      </div>
    </main>
  )
}

