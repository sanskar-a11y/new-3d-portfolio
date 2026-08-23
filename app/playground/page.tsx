import type { Metadata } from 'next'
import { PlaygroundClient } from './PlaygroundClient'

export const metadata: Metadata = {
  title: 'Playground',
  description:
    'Interactive digital lab, kinetic sketches, creative coding shaders, and visual design experiments by Sanskar.',
  openGraph: {
    title: 'Playground | Sanskar — Creative Lab & Visuals',
    description:
      'Interactive digital lab, kinetic sketches, creative coding shaders, and visual design experiments.',
  },
}

export default function PlaygroundPage() {
  return <PlaygroundClient />
}
