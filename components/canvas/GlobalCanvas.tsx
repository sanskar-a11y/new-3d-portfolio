'use client'

import { memo } from 'react'
import { usePathname } from 'next/navigation'
import { Background } from '@/components/canvas/Background'
import { CatModel } from '@/components/canvas/CatModel'

export const GlobalCanvas = memo(function GlobalCanvas() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isProjects = pathname === '/projects'
  const is3DPage = isHome || isProjects

  return (
    <div
      className={`fixed inset-0 z-20 transition-opacity duration-700 ${
        isHome
          ? 'opacity-100 pointer-events-none visible'
          : isProjects
          ? 'opacity-70 pointer-events-none visible'
          : 'opacity-0 pointer-events-none invisible'
      }`}
    >
      <Background frameloop={is3DPage ? 'always' : 'never'}>
        <CatModel />
      </Background>
    </div>
  )
})
