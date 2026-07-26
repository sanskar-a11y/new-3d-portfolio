'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useAppStore } from '@/store/useAppStore'

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
    <section className="relative w-full min-h-screen flex flex-col justify-center px-4 sm:px-12 lg:px-16 py-20 z-20">
      <div className="mx-auto w-full max-w-7xl flex flex-col gap-2 sm:gap-4">
        {projects.map((project, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            className={`group relative flex items-center justify-between p-3 sm:p-5 lg:p-6 rounded-xl transition-all duration-300 cursor-pointer border select-none ${
              hoveredIndex === idx
                ? 'bg-white/[0.04] border-cyan-400/50 shadow-[0_0_25px_rgba(0,240,255,0.15)]'
                : 'bg-transparent border-white/[0.05] hover:border-white/20'
            }`}
            onMouseEnter={() => {
              setCursorVariant('hover')
              setHoveredIndex(idx)
            }}
            onMouseLeave={() => {
              setCursorVariant('default')
              setHoveredIndex(null)
            }}
            onClick={() => setHoveredIndex(hoveredIndex === idx ? null : idx)}
          >
            {/* Left side: Accent indicator + Index + Title */}
            <div className="flex items-center gap-3 sm:gap-6">
              <div
                className={`w-1 sm:w-1.5 h-6 sm:h-10 lg:h-12 rounded-full transition-all duration-300 ${
                  hoveredIndex === idx
                    ? 'bg-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.8)]'
                    : 'bg-white/10 group-hover:bg-white/30'
                }`}
              />
              <span className="font-mono text-xs sm:text-sm text-white/40 tracking-widest tabular-nums">
                {project.index}
              </span>
              <h3
                className={`text-xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight transition-all duration-300 ${
                  hoveredIndex === idx
                    ? 'text-white translate-x-1 sm:translate-x-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                    : 'text-white/70 group-hover:text-white'
                }`}
              >
                {project.title}
              </h3>
            </div>

            {/* Right side: Sleek widescreen rectangular screenshot (aspect-video / 16:9) matching row height */}
            <div
              className={`relative aspect-video w-[110px] sm:w-[170px] md:w-[210px] lg:w-[250px] rounded-lg overflow-hidden transition-all duration-300 border shadow-md shrink-0 ${
                hoveredIndex === idx
                  ? 'border-cyan-400 opacity-100 scale-105 shadow-[0_0_15px_rgba(0,240,255,0.4)] ring-1 ring-cyan-400/50'
                  : 'border-white/10 opacity-60 group-hover:opacity-90'
              }`}
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 640px) 110px, (max-width: 768px) 170px, 250px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div
                className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${
                  hoveredIndex === idx ? 'opacity-0' : 'opacity-100'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
