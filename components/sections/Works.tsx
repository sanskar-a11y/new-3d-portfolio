'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useAppStore } from '@/store/useAppStore'

const projects = [
  {
    index: '01',
    title: 'ETHEREAL',
    image: 'https://picsum.photos/seed/ethereal/400/300',
  },
  {
    index: '02',
    title: 'LUMINA',
    image: 'https://picsum.photos/seed/lumina/400/300',
  },
  {
    index: '03',
    title: 'AURA',
    image: 'https://picsum.photos/seed/aura/400/300',
  },
  {
    index: '04',
    title: 'NEXUS',
    image: 'https://picsum.photos/seed/nexus/400/300',
  },
]

export function Works() {
  const setCursorVariant = useAppStore((state) => state.setCursorVariant)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="relative w-full min-h-screen flex">
      {/* LEFT SIDE — Large stacked project titles overlaying the 3D cat */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        {projects.map((project, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.08 }}
            className="group relative flex items-center gap-4 sm:gap-6 cursor-pointer py-2 sm:py-3"
            onMouseEnter={() => {
              setCursorVariant('hover')
              setHoveredIndex(idx)
            }}
            onMouseLeave={() => {
              setCursorVariant('default')
              setHoveredIndex(null)
            }}
          >
            {/* Cyan accent bar for active/hovered project */}
            <div
              className={`absolute left-0 w-1 rounded-full transition-all duration-300 ${
                hoveredIndex === idx
                  ? 'h-full bg-cyan-400 opacity-100'
                  : 'h-0 bg-cyan-400 opacity-0'
              }`}
            />

            {/* Index number */}
            <span className="font-mono text-[11px] sm:text-xs text-white/30 tracking-wider tabular-nums pl-4 sm:pl-6">
              {project.index}
            </span>

            {/* Project title */}
            <h3
              className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight transition-all duration-300 ${
                hoveredIndex === idx
                  ? 'text-white translate-x-2'
                  : hoveredIndex !== null
                    ? 'text-white/20'
                    : 'text-white/70'
              }`}
            >
              {project.title}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* RIGHT SIDE — Small thumbnail grid */}
      <div className="hidden md:flex flex-col gap-3 w-[220px] lg:w-[260px] py-12 pr-6 sm:pr-12 lg:pr-16">
        {projects.map((project, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
            className={`relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border ${
              hoveredIndex === idx
                ? 'border-white/30 opacity-100 scale-[1.02]'
                : 'border-white/[0.06] opacity-60 hover:opacity-80'
            }`}
            onMouseEnter={() => {
              setCursorVariant('hover')
              setHoveredIndex(idx)
            }}
            onMouseLeave={() => {
              setCursorVariant('default')
              setHoveredIndex(null)
            }}
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Dark overlay on non-hovered */}
            <div
              className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
                hoveredIndex === idx ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
