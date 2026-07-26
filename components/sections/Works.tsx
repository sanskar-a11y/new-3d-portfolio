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
    <section className="relative w-full min-h-screen flex flex-col justify-center px-2 sm:px-6 md:px-10 lg:px-12 py-12 z-20">
      <div className="w-full max-w-none flex flex-col gap-1 sm:gap-2">
        {projects.map((project, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            className="group relative flex items-center justify-between py-1.5 sm:py-2.5 lg:py-3 transition-all duration-300 cursor-pointer select-none"
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
            {/* Left side: Pure Project Title */}
            <h3
              className={`text-xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight transition-all duration-300 ${
                hoveredIndex === idx
                  ? 'text-white translate-x-2 sm:translate-x-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'text-white/70 group-hover:text-white'
              }`}
            >
              {project.title}
            </h3>

            {/* Right side: Sleek widescreen rectangular screenshot (aspect-video / 16:9) matching row height */}
            <div
              className={`relative aspect-video w-[90px] sm:w-[140px] md:w-[170px] lg:w-[200px] rounded-lg overflow-hidden transition-all duration-300 shadow-md shrink-0 ${
                hoveredIndex === idx
                  ? 'opacity-100 scale-105 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                  : 'opacity-60 group-hover:opacity-90'
              }`}
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 640px) 90px, (max-width: 768px) 140px, 200px"
                className="object-cover transition-transform duration-500 group-hover:scale-110 grayscale contrast-125"
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
