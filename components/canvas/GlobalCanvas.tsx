'use client'

import { usePathname } from 'next/navigation'
import { Background } from '@/components/canvas/Background'
import { CatModel } from '@/components/canvas/CatModel'
import { HUD } from '@/components/ui/HUD'

export function GlobalCanvas() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <>
      <div className={`transition-opacity duration-700 ${isHome ? 'opacity-100' : 'opacity-40'}`}>
        <Background>
          <CatModel />
        </Background>
      </div>
      <HUD />
    </>
  )
}
