'use client'

import { Works } from '@/components/sections/Works'
import { ProjectsLoader } from '@/components/ui/ProjectsLoader'

export function ProjectsClient() {
  return (
    <main className="min-h-screen w-full pt-20 sm:pt-24">
      <ProjectsLoader />
      {/* Transparent — 3D cat visible behind project titles */}
      <Works />
    </main>
  )
}
