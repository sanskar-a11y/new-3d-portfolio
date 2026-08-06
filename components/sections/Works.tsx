'use client'

import React, { useEffect, useRef, useState, useCallback, memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { useAppStore } from '@/store/useAppStore'
import { playGlassClinkSound } from '@/lib/audio'

// Dark cyber SVG placeholder generator for instant zero-latency image rendering
const makePlaceholder = (title: string, idx: string) =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340"><rect width="600" height="340" fill="%230c0d12"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2300f0ff" font-family="monospace" font-size="28" font-weight="bold" letter-spacing="4">${idx} // ${title}</text></svg>`

const projects = [
  { index: '01', title: 'ETHEREAL', image: makePlaceholder('ETHEREAL', '01') },
  { index: '02', title: 'LUMINA', image: makePlaceholder('LUMINA', '02') },
  { index: '03', title: 'AURA', image: makePlaceholder('AURA', '03') },
  { index: '04', title: 'NEXUS', image: makePlaceholder('NEXUS', '04') },
  { index: '05', title: 'KINETIC', image: makePlaceholder('KINETIC', '05') },
  { index: '06', title: 'VELOCITY', image: makePlaceholder('VELOCITY', '06') },
  { index: '07', title: 'MONOLITH', image: makePlaceholder('MONOLITH', '07') },
  { index: '08', title: 'SYNAPSE', image: makePlaceholder('SYNAPSE', '08') },
  { index: '09', title: 'CHROMA', image: makePlaceholder('CHROMA', '09') },
  { index: '10', title: 'VORTEX', image: makePlaceholder('VORTEX', '10') },
  { index: '11', title: 'SOLARIS', image: makePlaceholder('SOLARIS', '11') },
  { index: '12', title: 'NEBULA', image: makePlaceholder('NEBULA', '12') },
  { index: '13', title: 'SPECTRA', image: makePlaceholder('SPECTRA', '13') },
  { index: '14', title: 'HYPERION', image: makePlaceholder('HYPERION', '14') },
  { index: '15', title: 'QUANTUM', image: makePlaceholder('QUANTUM', '15') },
  { index: '16', title: 'OBSIDIAN', image: makePlaceholder('OBSIDIAN', '16') },
  { index: '17', title: 'ZENITH', image: makePlaceholder('ZENITH', '17') },
  { index: '18', title: 'CYBERPUNK', image: makePlaceholder('CYBERPUNK', '18') },
  { index: '19', title: 'ASTRONOMY', image: makePlaceholder('ASTRONOMY', '19') },
  { index: '20', title: 'MIRAGE', image: makePlaceholder('MIRAGE', '20') },
]

interface ProjectItemProps {
  project: { index: string; title: string; image: string }
  idx: number
  isSelected: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onSelect: () => void
  setRef: (el: HTMLDivElement | null) => void
}

export const ProjectItem = memo(function ProjectItem({
  project,
  idx,
  isSelected,
  onMouseEnter,
  onMouseLeave,
  onSelect,
  setRef,
}: ProjectItemProps) {
  const shouldReduceMotion = useReducedMotion()
  const zIndexClass = isSelected
    ? 'relative z-60 opacity-100 scale-[1.015]'
    : 'relative z-10 opacity-45 hover:opacity-75'

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    }
  }

  return (
    <motion.div
      ref={setRef}
      tabIndex={0}
      role="button"
      aria-label={`Project: ${project.title}`}
      aria-pressed={isSelected}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25, delay: shouldReduceMotion ? 0 : Math.min(idx * 0.015, 0.2) }}
      className={`group flex items-center justify-between py-2 sm:py-2.5 lg:py-3 transition-all duration-300 cursor-pointer select-none focus-visible:outline-cyan-400 ${zIndexClass}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      {/* Left side: Kinetic Typography Project Title */}
      <div className="flex items-center gap-3">
        {isSelected && (
          <motion.div
            layoutId="activeIndicator"
            className="w-1.5 h-8 sm:h-10 lg:h-12 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.8)]"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
        <h3
          className={`text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none transition-all duration-300 ${
            isSelected
              ? 'text-white translate-x-2 sm:translate-x-3 drop-shadow-[0_0_25px_rgba(0,240,255,0.5)]'
              : 'text-white/60'
          }`}
        >
          {project.title}
        </h3>
      </div>

      {/* Right side: Sleek Widescreen Screenshot */}
      <div
        className={`relative aspect-video w-[85px] sm:w-[130px] md:w-[160px] lg:w-[190px] rounded-md overflow-hidden transition-all duration-300 shadow-md shrink-0 ${
          isSelected
            ? 'opacity-100 scale-110 shadow-[0_0_30px_rgba(0,240,255,0.5)] ring-2 ring-cyan-400/80'
            : 'opacity-30'
        }`}
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 85px, (max-width: 768px) 130px, 190px"
          className="object-cover transition-transform duration-300 group-hover:scale-110 grayscale contrast-125"
        />
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isSelected ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>
    </motion.div>
  )
})

export const Works = memo(function Works() {
  const setCursorVariant = useAppStore((state) => state.setCursorVariant)
  const [scrollActiveIndex, setScrollActiveIndex] = useState<number>(0)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const cachedCenters = useRef<number[]>([])

  const handleMouseEnter = useCallback(() => setCursorVariant('hover'), [setCursorVariant])
  const handleMouseLeave = useCallback(() => setCursorVariant('default'), [setCursorVariant])

  // Stable ref setter per index to preserve React.memo on ProjectItem
  const refSetters = useRef<((el: HTMLDivElement | null) => void)[]>([])
  const getSetRef = useCallback((idx: number) => {
    if (!refSetters.current[idx]) {
      refSetters.current[idx] = (el: HTMLDivElement | null) => {
        itemRefs.current[idx] = el
      }
    }
    return refSetters.current[idx]
  }, [])

  // Stable selection handler per index to preserve React.memo on ProjectItem
  const selectHandlers = useRef<(() => void)[]>([])
  const getSelectHandler = useCallback((idx: number) => {
    if (!selectHandlers.current[idx]) {
      selectHandlers.current[idx] = () => {
        setScrollActiveIndex(idx)
        playGlassClinkSound()
      }
    }
    return selectHandlers.current[idx]
  }, [])

  // Pre-compute element vertical centers relative to document top to prevent layout thrashing on scroll
  const recalculateCenters = useCallback(() => {
    cachedCenters.current = itemRefs.current.map((el) => {
      if (!el) return 0
      const rect = el.getBoundingClientRect()
      return rect.top + window.scrollY + rect.height / 2
    })
  }, [])

  // Scroll listener: find project row closest to vertical center using cachedCenters + window.scrollY
  useEffect(() => {
    let lastIndex = 0
    let rafId: number | null = null
    let ticking = false

    recalculateCenters()

    const updateActiveIndex = () => {
      ticking = false
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80
      let closestIdx = 0

      if (isAtBottom) {
        closestIdx = projects.length - 1
      } else {
        const viewportCenterY = window.scrollY + window.innerHeight / 2
        let minDistance = Infinity

        for (let i = 0; i < cachedCenters.current.length; i++) {
          const center = cachedCenters.current[i]
          if (!center) continue
          const distance = Math.abs(center - viewportCenterY)
          if (distance < minDistance) {
            minDistance = distance
            closestIdx = i
          }
        }
      }

      if (closestIdx !== lastIndex) {
        lastIndex = closestIdx
        setScrollActiveIndex(closestIdx)
        playGlassClinkSound()
      }
    }

    const handleScroll = () => {
      if (!ticking) {
        ticking = true
        rafId = requestAnimationFrame(updateActiveIndex)
      }
    }

    const handleResize = () => {
      recalculateCenters()
      updateActiveIndex()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    updateActiveIndex()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [recalculateCenters])

  return (
    <section className="w-full min-h-screen flex flex-col justify-center px-2 sm:px-6 md:px-10 lg:px-12 pt-24 sm:pt-32 pb-[45vh]">
      <div className="w-full max-w-none flex flex-col gap-1 sm:gap-2">
        {projects.map((project, idx) => (
          <ProjectItem
            key={project.index}
            project={project}
            idx={idx}
            isSelected={scrollActiveIndex === idx}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onSelect={getSelectHandler(idx)}
            setRef={getSetRef(idx)}
          />
        ))}
      </div>
    </section>
  )
})
