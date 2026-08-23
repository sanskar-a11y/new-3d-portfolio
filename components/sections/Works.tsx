'use client'

import React, { useEffect, useRef, useState, useCallback, memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { playGlassClinkSound } from '@/lib/audio'

export interface ProjectData {
  index: string
  title: string
  subtitle: string
  category: string
  year: string
  description: string
  problem?: string
  solution?: string
  outcome?: string
  tech: string[]
  liveUrl?: string
  githubUrl?: string
  status?: string
}

export const REAL_PROJECTS: ProjectData[] = [
  {
    index: '01',
    title: 'DIGITAL LEARNING PLATFORM',
    subtitle: 'COER UNIVERSITY HACKATHON',
    category: 'Full-Stack PWA / Hackathon Winner',
    year: '2025',
    description: 'National-level hackathon solution built and presented as team leader at COER University. A full-stack React Progressive Web App with Firebase Auth, Firestore, service workers, and AI-assisted learning tools.',
    problem: 'Students needed an accessible, offline-capable digital learning platform with smart AI-assisted prompts during fast-paced educational workflows.',
    solution: 'Architected and led a development team to build a React PWA with Firebase backend, instant caching, and prompt engineering.',
    outcome: 'Earned national recognition at COER University hackathon and fully deployed live on Netlify.',
    tech: ['React.js', 'Vite', 'Firebase', 'PWA', 'Bootstrap', 'AI Tools'],
    liveUrl: 'https://serene-daifuku-c1f5bb.netlify.app/',
    githubUrl: 'https://github.com/sanskar-a11y',
    status: 'Live & Deployed',
  },
  {
    index: '02',
    title: 'AI PRODUCTIVITY APP',
    subtitle: 'INTELLIGENT WORKFLOW ENGINE',
    category: 'AI Tool / SaaS Architecture',
    year: '2026',
    description: 'Next-generation AI-powered task management and workflow automation app featuring intelligent contextual prompt pipelines and modern UI architecture.',
    problem: 'Modern creators and engineers struggle with fractured task contexts and repetitive workflow handoffs.',
    solution: 'Designed an intelligent task orchestration system with prompt engineering and real-time state sync.',
    outcome: 'Currently in active development with modular Next.js and TypeScript architecture.',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'AI APIs', 'Prompt Engineering'],
    githubUrl: 'https://github.com/sanskar-a11y',
    status: 'In Progress (2026)',
  },
  {
    index: '03',
    title: 'CREATIVE VIDEO & MOTION SUITE',
    subtitle: 'HIGH-RETENTION STORYTELLING',
    category: 'Video Editing / Motion Graphics',
    year: '2025 - 2026',
    description: 'Cinematic, high-retention video edits for creators and brands. Engineered with story-driven pacing, custom motion typography, sound design, and color grading.',
    problem: 'Short-form and long-form creator content requires immediate hooks and relentless retention to convert audience attention.',
    solution: 'Developed a signature editing pipeline combining dynamic pacing, SFX layering, and motion graphics.',
    outcome: 'Produced high-impact visual assets and edits for clients on Fiverr and social media platforms.',
    tech: ['Premiere Pro', 'After Effects', 'Sound Design', 'Color Grading'],
    liveUrl: 'https://www.fiverr.com/sanskar6008/buying?source=avatar_menu_profile',
    status: 'Client Work & Production',
  },
  {
    index: '04',
    title: 'HIGH-CTR THUMBNAIL ENGINE',
    subtitle: 'CONVERSION-FOCUSED VISUALS',
    category: 'Thumbnail Design / Visual Strategy',
    year: '2025 - 2026',
    description: 'High-click custom thumbnails designed to stop the scroll. Engineered with precise visual hierarchy, color contrast, and psychological curiosity triggers.',
    problem: 'Great videos often underperform due to flat, unoptimized thumbnail compositions with low click-through rates.',
    solution: 'Crafted bespoke 3D-assisted and 2D high-contrast thumbnail compositions tailored to niche creator audiences.',
    outcome: 'Delivered high-performing thumbnail variations driving audience engagement.',
    tech: ['Photoshop', 'Figma', 'Visual Hierarchy', 'Typography'],
    liveUrl: 'https://www.fiverr.com/sanskar6008/buying?source=avatar_menu_profile',
    status: 'Client Work & Production',
  },
  {
    index: '05',
    title: '3D INTERACTIVE PORTFOLIO',
    subtitle: 'GLSL SHADERS & WEBGL 2.0',
    category: 'Creative Development / 3D Graphics',
    year: '2026',
    description: 'Interactive high-performance 3D WebGL experience featuring real-time GLSL visual shader transformations, dynamic physics spring whiskers, and kinetic typography.',
    problem: 'Standard flat portfolios fail to communicate modern creative coding and 3D technical capability.',
    solution: 'Architected a custom Three.js + React Three Fiber rendering pipeline with custom vertex/fragment shaders and optimized Framer Motion interactions.',
    outcome: 'Production-ready 60FPS 3D WebGL portfolio deployed on Vercel.',
    tech: ['Three.js', 'React Three Fiber', 'GLSL Shaders', 'Next.js', 'Framer Motion'],
    githubUrl: 'https://github.com/sanskar-a11y/new-3d-portfolio',
    status: 'Live & Active',
  },
]

interface ProjectItemProps {
  project: ProjectData
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
      className={`group flex flex-col gap-3 py-4 sm:py-5 lg:py-6 border-b border-white/10 transition-all duration-300 select-none focus-visible:outline-cyan-400 ${zIndexClass}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left side: Kinetic Typography Project Title & Category */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isSelected && (
            <motion.div
              layoutId="activeIndicator"
              className="w-1.5 h-8 sm:h-10 lg:h-12 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.8)]"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest uppercase">
                {`[ ${project.index} // ${project.year} ]`}
              </span>
              <span className="text-[10px] font-mono text-white/50 tracking-wider uppercase">
                {project.category}
              </span>
            </div>
            <h3
              className={`text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none transition-all duration-300 ${
                isSelected
                  ? 'text-white translate-x-1 sm:translate-x-2 drop-shadow-[0_0_25px_rgba(0,240,255,0.5)]'
                  : 'text-white/60'
              }`}
            >
              {project.title}
            </h3>
          </div>
        </div>

        {/* Right side: Action Links / Status Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 pointer-events-auto">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-cyan-400/50 bg-cyan-400/10 hover:bg-cyan-400 hover:text-black text-cyan-300 font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-200"
            >
              <span>DEMO</span>
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M14 3h7v7h-2V6.414l-9.293 9.293-1.414-1.414L17.586 5H14V3zM5 5h6V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-2v6H5V5z" />
              </svg>
            </a>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 text-white/80 font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-200"
            >
              <span>CODE</span>
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Expanded Project Brief on Selection */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden pt-2 text-xs font-mono text-white/70 max-w-4xl flex flex-col gap-3"
        >
          <p className="leading-relaxed text-white/85 text-xs sm:text-sm">
            {project.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
            {project.tech.map((t) => (
              <span
                key={t}
                className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/90 text-[10px] tracking-wider uppercase font-semibold"
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      )}
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
        closestIdx = REAL_PROJECTS.length - 1
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
    <section className="w-full min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-10 lg:px-16 pt-24 sm:pt-32 pb-[45vh]">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-2">
        {REAL_PROJECTS.map((project, idx) => (
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
