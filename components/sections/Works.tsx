'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion'
import Image from 'next/image'
import { useAppStore } from '@/store/useAppStore'
import { Magnetic } from '@/components/ui/Magnetic'

const projects = [
  {
    index: '01',
    title: 'Ethereal',
    category: 'Creative Direction',
    year: '2025',
    image: 'https://picsum.photos/seed/ethereal/1200/800'
  },
  {
    index: '02',
    title: 'Lumina',
    category: 'Web Experience',
    year: '2024',
    image: 'https://picsum.photos/seed/lumina/1200/800'
  },
  {
    index: '03',
    title: 'Aura',
    category: 'Interactive Design',
    year: '2024',
    image: 'https://picsum.photos/seed/aura/1200/800'
  },
  {
    index: '04',
    title: 'Nexus',
    category: 'Digital Product',
    year: '2023',
    image: 'https://picsum.photos/seed/nexus/1200/800'
  }
]

function ProjectCard({ project, idx, hoveredIndex, setHoveredIndex, setCursorVariant }: any) {
  const cardRef = useRef(null)
  const isInView = useInView(cardRef, { once: true })

  return (
    <motion.div
      ref={cardRef}
      initial={{ y: 60, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: idx * 0.1 }}
      className="group relative flex cursor-pointer flex-col justify-between border-b border-white/10 py-14 sm:py-16 px-4"
      onMouseEnter={() => {
        setCursorVariant('hover')
        setHoveredIndex(idx)
      }}
      onMouseLeave={() => {
        setCursorVariant('default')
        setHoveredIndex(null)
      }}
    >
      <div className="flex w-full flex-col justify-between sm:flex-row sm:items-center">
        <div className="flex flex-col z-10 text-white">
          <div className="flex items-center gap-6 sm:gap-12">
            <span className="font-mono text-xs text-white/40 tracking-widest">{project.index}</span>
            <h3 className="text-5xl sm:text-8xl font-bold tracking-tighter transition-transform duration-500 group-hover:translate-x-6">
              {project.title}
            </h3>
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-widest text-white/50 border border-white/20 px-3 py-1 rounded-full w-fit sm:hidden">
            {project.category}
          </p>
        </div>
        
        <div className="z-10 mt-6 flex items-center justify-between sm:mt-0 sm:w-1/3 text-white">
          <p className="hidden text-[11px] uppercase tracking-widest text-white/50 border border-white/20 px-3 py-1 rounded-full sm:block transition-transform duration-500 group-hover:-translate-x-4">
            {project.category}
          </p>
          <p className="text-xs text-gray-400">{project.year}</p>
        </div>
      </div>

      <div 
        className={`relative w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          hoveredIndex === idx ? 'aspect-video mt-8 sm:mt-12 opacity-100' : 'h-0 mt-0 opacity-0'
        }`}
      >
        <Image 
          src={project.image}
          alt={project.title}
          fill
          className="object-cover rounded-xl transition-transform duration-700 group-hover:scale-[1.04]"
          referrerPolicy="no-referrer"
        />
      </div>
    </motion.div>
  )
}

export function Works() {
  const container = useRef(null)
  const setCursorVariant = useAppStore((state) => state.setCursorVariant)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end start']
  })

  return (
    <section ref={container} className="relative w-full py-32 sm:py-48 px-6 sm:px-12 bg-[#050505] z-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-24 text-xs uppercase tracking-widest text-gray-500">Selected Works</h2>
        
        <div className="flex flex-col border-t border-white/10">
          {projects.map((project, index) => (
            <ProjectCard 
              key={index}
              project={project}
              idx={index}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
              setCursorVariant={setCursorVariant}
            />
          ))}
        </div>

        <div className="mt-32 flex justify-center z-10 relative">
          <Magnetic>
            <div 
              onMouseEnter={() => setCursorVariant('hidden')}
              onMouseLeave={() => setCursorVariant('default')}
              className="group flex h-36 w-36 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[#050505] transition-colors duration-500 hover:bg-white text-white hover:text-black"
            >
              <span className="text-xs font-medium uppercase tracking-widest transition-colors duration-500">View All</span>
            </div>
          </Magnetic>
        </div>
      </div>
    </section>
  )
}
