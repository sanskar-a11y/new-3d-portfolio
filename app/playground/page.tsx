'use client'

import { Background } from '@/components/canvas/Background'

export default function PlaygroundPage() {
  return (
    <main className="relative min-h-screen w-full pt-32 px-6 sm:px-12 flex flex-col justify-between">
      <Background />
      <div className="mx-auto max-w-7xl w-full my-auto z-10">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter mb-8">Playground</h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-12">
          Experimental 3D shaders, canvas interactions, and creative coding sandbox.
        </p>
      </div>
    </main>
  )
}

