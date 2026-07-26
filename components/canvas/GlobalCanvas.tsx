'use client'

import { Background } from '@/components/canvas/Background'
import { CatModel } from '@/components/canvas/CatModel'
import { HUD } from '@/components/ui/HUD'

export function GlobalCanvas() {
  return (
    <>
      <Background>
        <CatModel />
      </Background>
      <HUD />
    </>
  )
}
