'use client'

import { Background } from '@/components/canvas/Background'
import { CatModel } from '@/components/canvas/CatModel'
import { HUD } from '@/components/ui/HUD'

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden select-none">
      <Background>
        <CatModel />
      </Background>
      <HUD />
    </main>
  )
}


