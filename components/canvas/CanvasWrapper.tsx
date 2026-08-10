'use client'

import dynamic from 'next/dynamic'

export const CanvasWrapper = dynamic(
  () => import('./GlobalCanvas').then((mod) => mod.GlobalCanvas),
  { ssr: false }
)
