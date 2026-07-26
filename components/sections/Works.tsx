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
    <section className="relative w-full min-h-screen flex items-center justify-between z-20">
      {/* LEFT SIDE — Large stacked project titles overlaying the 3D cat */}
      <div className="flex-1 flex flex-col justify-center pl-4 sm:pl-12 lg:pl-16 pr-2 sm:pr-6 py-8 sm:py-12 z-20">
        {projects.map((project, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.08 }}
            className="group relative flex items-center gap-2 sm:gap-6 cursor-pointer py-2 sm:py-3.5 select-none"
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
            {/* Cyan accent bar for active/hovered project */}
            <div
              className={`absolute left-0 w-1 rounded-full transition-all duration-300 ${
                hoveredIndex === idx
                  ? 'h-full bg-cyan-400 opacity-100 shadow-[0_0_12px_rgba(0,240,255,0.8)]'
                  : 'h-0 bg-cyan-400 opacity-0'
              }`}
            />

            {/* Index number */}
            <span className="font-mono text-[10px] sm:text-xs text-white/30 tracking-wider tabular-nums pl-3 sm:pl-6">
              {project.index}
            </span>

            {/* Project title */}
            <h3
              className={`text-xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight transition-all duration-300 ${
                hoveredIndex === idx
                  ? 'text-white translate-x-2 sm:translate-x-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : hoveredIndex !== null
                    ? 'text-white/20'
                    : 'text-white/70 hover:text-white/90'
              }`}
            >
              {project.title}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* RIGHT SIDE — Thumbnail grid visible on ALL screen sizes */}
      <div className="flex flex-col justify-center gap-2.5 sm:gap-4 w-[120px] sm:w-[180px] md:w-[220px] lg:w-[260px] py-8 sm:py-12 pr-4 sm:pr-12 lg:pr-16 z-20">
        {projects.map((project, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
            className={`relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border shadow-lg ${
              hoveredIndex === idx
                ? 'border-cyan-400/80 opacity-100 scale-[1.04] shadow-[0_0_20px_rgba(0,240,255,0.3)] ring-1 ring-cyan-400/50'
                : 'border-white/[0.08] opacity-60 hover:opacity-85 hover:scale-[1.01]'
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
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 120px, (max-width: 768px) 180px, 260px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Dark overlay on non-hovered */}
            <div
              className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${
                hoveredIndex === idx ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
