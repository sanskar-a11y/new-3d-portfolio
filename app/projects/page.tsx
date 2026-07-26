'use client'

import { Works } from '@/components/sections/Works'
import { ProjectPopup } from '@/components/ui/ProjectPopup'

export default function ProjectsPage() {
  return (
    <main className="min-h-screen w-full pt-20 sm:pt-24">
      <ProjectPopup />
      {/* Transparent — 3D cat visible behind project titles */}
      <Works />
    </main>
  )
}
