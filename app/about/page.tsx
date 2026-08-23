import type { Metadata } from 'next'
import { AboutClient } from './AboutClient'

export const metadata: Metadata = {
  title: 'About',
  description:
    "I don't just build. I hunt for complete dominance. Explore Sanskar's background, methodology, capabilities, certificates, and core philosophy.",
  openGraph: {
    title: 'About | Sanskar — Manifesto & Methodology',
    description:
      'Developer, problem solver, and relentless learner building interactive WebGL experiences, full-stack applications, and AI systems.',
  },
}

export default function AboutPage() {
  return <AboutClient />
}
