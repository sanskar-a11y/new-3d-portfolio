'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useAppStore } from '@/store/useAppStore'
import { playGlassClinkSound } from '@/lib/audio'

const projects = [
  {
    index: '01',
    title: 'ETHEREAL',
    image: 'https://picsum.photos/seed/ethereal/600/340',
  },
  {
    index: '02',
    title: 'LUMINA',
    image: 'https://picsum.photos/seed/lumina/600/340',
  },
  {
    index: '03',
    title: 'AURA',
    image: 'https://picsum.photos/seed/aura/600/340',
  },
  {
    index: '04',
    title: 'NEXUS',
    image: 'https://picsum.photos/seed/nexus/600/340',
  },
]

export function Works() {
  const setCursorVariant = useAppStore((state) => state.setCursorVariant)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center px-2 sm:px-6 md:px-10 lg:px-12 py-8">
      <div className="w-full max-w-none flex flex-col gap-0 sm:gap-1">
        {projects.map((project, idx) => {
          const isSelected = hoveredIndex === idx

          // Layering Hierarchy:
          // 3D Cat Model Canvas is at fixed z-20.
          // By default (no hover), ALL project divs are at z-10 (Cat model is ON TOP of all projects).
          // When a project div is hovered/clicked: that specific div pops to z-40 (ON TOP of cat model).
          // All other non-hovered project divs remain at z-10 (BELOW cat model).
          const zIndexClass = isSelected
            ? 'relative z-40 opacity-100'
            : 'relative z-10 opacity-65 hover:opacity-100'

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className={`group flex items-center justify-between py-1 sm:py-1.5 lg:py-2 transition-all duration-300 cursor-pointer select-none ${zIndexClass}`}
              onMouseEnter={() => {
                setCursorVariant('hover')
                setHoveredIndex(idx)
                playGlassClinkSound()
              }}
              onMouseLeave={() => {
                setCursorVariant('default')
                setHoveredIndex(null)
              }}
              onClick={() => {
                const nextIndex = hoveredIndex === idx ? null : idx
                setHoveredIndex(nextIndex)
                if (nextIndex !== null) {
                  playGlassClinkSound()
                }
              }}
            >
              {/* Left side: Pure Project Title */}
              <h3
                className={`text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none transition-all duration-300 ${
                  isSelected
                    ? 'text-white translate-x-2 sm:translate-x-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                    : 'text-white/70 group-hover:text-white'
                }`}
              >
                {project.title}
              </h3>

              {/* Right side: Sleek widescreen rectangular screenshot */}
              <div
                className={`relative aspect-video w-[80px] sm:w-[120px] md:w-[150px] lg:w-[180px] rounded-md overflow-hidden transition-all duration-300 shadow-md shrink-0 ${
                  isSelected
                    ? 'opacity-100 scale-105 shadow-[0_0_20px_rgba(0,240,255,0.4)] ring-1 ring-cyan-400/50'
                    : 'opacity-60 group-hover:opacity-90'
                }`}
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 120px, 180px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110 grayscale contrast-125"
                  referrerPolicy="no-referrer"
                />
                <div
                  className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
                    isSelected ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
