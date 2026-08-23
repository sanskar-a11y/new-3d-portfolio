'use client'

import React, { useEffect, useRef, useState, useCallback, memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { playGlassClinkSound } from '@/lib/audio'

import Image from 'next/image'

const makePlaceholder = (title: string, idx: string) =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340"><rect width="600" height="340" fill="%230c0d12"/><rect x="1" y="1" width="598" height="338" fill="none" stroke="%23222228" stroke-width="2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="monospace" font-size="20" font-weight="bold" letter-spacing="4">${idx} // ${title}</text></svg>`

export interface ProjectData {
  index: string
  title: string
  subtitle: string
  category: string
  year: string
  description: string
  image: string
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
    image: makePlaceholder('DIGITAL LEARNING PLATFORM', '01'),
    liveUrl: 'https://serene-daifuku-c1f5bb.netlify.app/',
    githubUrl: 'https://github.com/sanskar-a11y',
    status: 'Live & Deployed',
  },
  {
    index: '02',
    title: 'VELVET LIQUID LUXURY',
    subtitle: 'ARTISAN 3D WEB EXPERIENCE',
    category: '3D Web Experience / Creative Dev',
    year: '2026',
    description: 'High-end interactive 3D digital brand experience for artisan beverages. Features sticky canvas scroll scenes, 3D interactive drink gallery with physics rotations, dynamic lighting, and kinetic typography marquees.',
    problem: 'Luxury beverage brands struggle to communicate craft and tactile quality through static e-commerce pages.',
    solution: 'Engineered an immersive sticky WebGL canvas experience with custom shader atmospheres, interactive product gallery cards, and scroll-linked camera sequences.',
    outcome: 'Deployed live on Vercel delivering 60FPS fluid product storytelling.',
    tech: ['Next.js', 'Three.js / WebGL', 'Tailwind CSS', 'Framer Motion', 'GSAP'],
    image: makePlaceholder('VELVET LIQUID LUXURY', '02'),
    liveUrl: 'https://demo-olive-sigma-32.vercel.app/',
    status: 'Live & Deployed',
  },
  {
    index: '03',
    title: 'AGENTIC 60 ROADMAP',
    subtitle: 'AI ENGINEERING CURRICULUM',
    category: 'AI Tooling / Interactive Roadmap',
    year: '2026',
    description: 'Gamified 60-day interactive engineering curriculum for mastering Agentic AI systems with LangGraph, Claude Agent SDK, evaluation frameworks, and hands-on portfolio milestones.',
    problem: 'Developers lack a structured, gamified progression path to transition from prompt wrappers to production autonomous agent architectures.',
    solution: 'Built an interactive timeline roadmap with day-by-day milestone tracking, difficulty tiers, and interactive skill assessments.',
    outcome: 'Deployed live on Vercel as an open-access roadmap for modern AI engineers.',
    tech: ['React.js', 'Vite', 'TypeScript', 'Tailwind CSS', 'Lucide Icons'],
    image: makePlaceholder('AGENTIC 60 ROADMAP', '03'),
    liveUrl: 'https://roadmap-project-sigma.vercel.app/',
    status: 'Live & Deployed',
  },
  {
    index: '04',
    title: 'BUBBLIER JAIPUR',
    subtitle: 'PREMIUM ROOFTOP & BOBA CAFE',
    category: 'Brand Experience & Web App',
    year: '2025',
    description: 'Bespoke editorial web destination for Jaipur premier bubble tea and rooftop cafe. Engineered with warm terracotta palettes, custom drink filter systems, and rooftop sunset booking flows.',
    problem: 'Cafes require an evocative visual identity and seamless mobile menu exploration to convert social media discovery into foot traffic.',
    solution: 'Designed an editorial typography layout with responsive menu filters, ingredient showcases, and rooftop ambiance previews.',
    outcome: 'Deployed live on GitHub Pages with instant mobile responsiveness.',
    tech: ['HTML5', 'CSS Custom Properties', 'Modern JavaScript', 'Typography'],
    image: makePlaceholder('BUBBLIER JAIPUR', '04'),
    liveUrl: 'https://gonnatakeover.github.io/P2/',
    githubUrl: 'https://github.com/gonnatakeover/P2',
    status: 'Live & Deployed',
  },
  {
    index: '05',
    title: 'CALM LUXURY DINING',
    subtitle: 'SMOOTH SCROLL CAFE DESTINATION',
    category: 'Creative Web / Lenis & GSAP',
    year: '2025',
    description: 'Atmospheric dining and night-cafe web platform featuring buttery-smooth Lenis inertial scrolling, GSAP ScrollTrigger parallax reveals, and sophisticated editorial layouts.',
    problem: 'Hospitality concepts often suffer from jarring page jumps and disjointed storytelling.',
    solution: 'Integrated Lenis smooth scrolling with GSAP timeline triggers, staggered image cards, and ambient micro-animations.',
    outcome: 'Deployed live on GitHub Pages delivering ultra-fluid browsing.',
    tech: ['Tailwind CSS', 'GSAP / ScrollTrigger', 'Lenis Scroll', 'JavaScript'],
    image: makePlaceholder('CALM LUXURY DINING', '05'),
    liveUrl: 'https://gonnatakeover.github.io/P3/',
    githubUrl: 'https://github.com/gonnatakeover/P3',
    status: 'Live & Deployed',
  },
  {
    index: '06',
    title: '3D INTERACTIVE PORTFOLIO',
    subtitle: 'GLSL SHADERS & WEBGL 2.0',
    category: 'Creative Development / 3D Graphics',
    year: '2026',
    description: 'Interactive high-performance 3D WebGL experience featuring real-time GLSL visual shader transformations, dynamic physics spring whiskers, and kinetic typography.',
    problem: 'Standard flat portfolios fail to communicate modern creative coding and 3D technical capability.',
    solution: 'Architected a custom Three.js + React Three Fiber rendering pipeline with custom vertex/fragment shaders and optimized Framer Motion interactions.',
    outcome: 'Production-ready 60FPS 3D WebGL portfolio deployed on Vercel.',
    tech: ['Three.js', 'React Three Fiber', 'GLSL Shaders', 'Next.js', 'Framer Motion'],
    image: makePlaceholder('3D INTERACTIVE PORTFOLIO', '06'),
    liveUrl: 'https://myportfolio-git-main-sanskar-a11ys-projects.vercel.app/',
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
    : 'relative z-10 opacity-40 hover:opacity-70'

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
      className={`group flex flex-col gap-3 py-4 sm:py-5 lg:py-6 border-b border-white/10 transition-all duration-300 select-none focus-visible:outline-white ${zIndexClass}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between w-full gap-4">
        {/* Left side: Kinetic Typography Project Title & Category */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {isSelected && (
            <motion.div
              layoutId="activeIndicator"
              className="w-1 h-8 sm:h-10 lg:h-12 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] shrink-0"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-white/90 font-bold tracking-widest uppercase">
                {`[ ${project.index} // ${project.year} ]`}
              </span>
              <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase truncate">
                {project.category}
              </span>
            </div>
            <h3
              className={`text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none transition-all duration-300 ${
                isSelected
                  ? 'text-white translate-x-1 sm:translate-x-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                  : 'text-white/40'
              }`}
            >
              {project.title}
            </h3>
          </div>
        </div>

        {/* Right side: Classic black / monochrome preview image */}
        <div
          className={`relative aspect-video w-[95px] sm:w-[140px] md:w-[175px] lg:w-[210px] rounded-lg overflow-hidden transition-all duration-300 shadow-xl shrink-0 border ${
            isSelected
              ? 'opacity-100 scale-105 border-white/50 shadow-[0_0_25px_rgba(255,255,255,0.15)] ring-1 ring-white/40'
              : 'opacity-25 border-white/10 hover:opacity-50'
          }`}
        >
          <Image
            src={project.image}
            alt={project.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 95px, (max-width: 768px) 140px, 210px"
            className="object-cover transition-transform duration-300 group-hover:scale-105 grayscale contrast-125"
          />
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              isSelected ? 'opacity-0' : 'opacity-100'
            }`}
          />
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
          <p className="leading-relaxed text-white/80 text-xs sm:text-sm">
            {project.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-white/30 bg-white/10 hover:bg-white hover:text-black text-white font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-200"
              >
                <span>VISIT DEMO</span>
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 text-white/90 font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-200"
              >
                <span>SOURCE CODE</span>
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
            )}

            {project.tech.map((t) => (
              <span
                key={t}
                className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] tracking-wider uppercase font-mono"
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
