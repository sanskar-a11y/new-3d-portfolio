'use client'

import { Works } from '@/components/sections/Works'
import { motion } from 'framer-motion'

export default function ProjectsPage() {
  return (
    <main className="relative min-h-screen w-full pt-32 sm:pt-44 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6 sm:px-12 mb-20 sm:mb-32">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className="flex flex-col gap-4 sm:gap-8"
        >
          <h1 className="text-6xl sm:text-9xl font-bold tracking-tighter text-white uppercase">
            Projects
          </h1>
          <p className="font-mono text-xs text-white/40 tracking-widest uppercase">
            04 SELECTED WORKS — 2023-2025
          </p>
        </motion.div>
      </div>
      <Works />
    </main>
  )
}
