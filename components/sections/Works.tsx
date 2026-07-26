'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useAppStore } from '@/store/useAppStore'
import { playGlassClinkSound } from '@/lib/audio'

const projects = [
  { index: '01', title: 'ETHEREAL', image: 'https://picsum.photos/seed/ethereal/600/340' },
  { index: '02', title: 'LUMINA', image: 'https://picsum.photos/seed/lumina/600/340' },
  { index: '03', title: 'AURA', image: 'https://picsum.photos/seed/aura/600/340' },
  { index: '04', title: 'NEXUS', image: 'https://picsum.photos/seed/nexus/600/340' },
  { index: '05', title: 'KINETIC', image: 'https://picsum.photos/seed/kinetic/600/340' },
  { index: '06', title: 'VELOCITY', image: 'https://picsum.photos/seed/velocity/600/340' },
  { index: '07', title: 'MONOLITH', image: 'https://picsum.photos/seed/monolith/600/340' },
  { index: '08', title: 'SYNAPSE', image: 'https://picsum.photos/seed/synapse/600/340' },
  { index: '09', title: 'CHROMA', image: 'https://picsum.photos/seed/chroma/600/340' },
  { index: '10', title: 'VORTEX', image: 'https://picsum.photos/seed/vortex/600/340' },
  { index: '11', title: 'SOLARIS', image: 'https://picsum.photos/seed/solaris/600/340' },
  { index: '12', title: 'NEBULA', image: 'https://picsum.photos/seed/nebula/600/340' },
  { index: '13', title: 'SPECTRA', image: 'https://picsum.photos/seed/spectra/600/340' },
  { index: '14', title: 'HYPERION', image: 'https://picsum.photos/seed/hyperion/600/340' },
  { index: '15', title: 'QUANTUM', image: 'https://picsum.photos/seed/quantum/600/340' },
  { index: '16', title: 'OBSIDIAN', image: 'https://picsum.photos/seed/obsidian/600/340' },
  { index: '17', title: 'ZENITH', image: 'https://picsum.photos/seed/zenith/600/340' },
  { index: '18', title: 'CYBERPUNK', image: 'https://picsum.photos/seed/cyberpunk/600/340' },
  { index: '19', title: 'ASTRONOMY', image: 'https://picsum.photos/seed/astronomy/600/340' },
  { index: '20', title: 'MIRAGE', image: 'https://picsum.photos/seed/mirage/600/340' },
]

export function Works() {
  const setCursorVariant = useAppStore((state) => state.setCursorVariant)
  const [scrollActiveIndex, setScrollActiveIndex] = useState<number>(0)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Scroll listener: find project row closest to middle of screen
  useEffect(() => {
    let lastIndex = 0

    const handleScroll = () => {
      const centerY = window.innerHeight / 2
      let closestIdx = 0
      let minDistance = Infinity

      itemRefs.current.forEach((el, idx) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const itemCenterY = rect.top + rect.height / 2
        const distance = Math.abs(itemCenterY - centerY)
        if (distance < minDistance) {
          minDistance = distance
          closestIdx = idx
        }
      })

      if (closestIdx !== lastIndex) {
        lastIndex = closestIdx
        setScrollActiveIndex(closestIdx)
        playGlassClinkSound()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center px-2 sm:px-6 md:px-10 lg:px-12 py-24 sm:py-32">
      <div className="w-full max-w-none flex flex-col gap-1 sm:gap-2">
        {projects.map((project, idx) => {
          const isSelected = scrollActiveIndex === idx

          // Layering Hierarchy:
          // 3D Cat Model Canvas is fixed at z-30 (opacity 100).
          // Scroll-active project div: z-50 (ON TOP of cat model).
          // Inactive project divs: z-10 (BELOW cat model).
          const zIndexClass = isSelected
            ? 'relative z-50 opacity-100'
            : 'relative z-10 opacity-30 hover:opacity-60'

          return (
            <motion.div
              key={idx}
              ref={(el) => {
                itemRefs.current[idx] = el
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.5) }}
              className={`group flex items-center justify-between py-2 sm:py-2.5 lg:py-3 transition-all duration-300 cursor-pointer select-none ${zIndexClass}`}
              onMouseEnter={() => {
                setCursorVariant('hover')
              }}
              onMouseLeave={() => {
                setCursorVariant('default')
              }}
            >
              {/* Left side: Pure Project Title */}
              <h3
                className={`text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none transition-all duration-300 ${
                  isSelected
                    ? 'text-white translate-x-2 sm:translate-x-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                    : 'text-white/60 group-hover:text-white'
                }`}
              >
                {project.title}
              </h3>

              {/* Right side: Sleek widescreen rectangular screenshot */}
              <div
                className={`relative aspect-video w-[85px] sm:w-[130px] md:w-[160px] lg:w-[190px] rounded-md overflow-hidden transition-all duration-300 shadow-md shrink-0 ${
                  isSelected
                    ? 'opacity-100 scale-105 shadow-[0_0_20px_rgba(0,240,255,0.4)] ring-1 ring-cyan-400/50'
                    : 'opacity-40 group-hover:opacity-80'
                }`}
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 85px, (max-width: 768px) 130px, 190px"
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
