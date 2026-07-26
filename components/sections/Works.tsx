'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useAppStore } from '@/store/useAppStore'
import { Magnetic } from '@/components/ui/Magnetic'

const projects = [
  {
    title: 'Ethereal',
    category: 'Creative Direction',
    year: '2025',
    image: 'https://picsum.photos/seed/ethereal/1200/800'
  },
  {
    title: 'Lumina',
    category: 'Web Experience',
    year: '2024',
    image: 'https://picsum.photos/seed/lumina/1200/800'
  },
  {
    title: 'Aura',
    category: 'Interactive Design',
    year: '2024',
    image: 'https://picsum.photos/seed/aura/1200/800'
  },
  {
    title: 'Nexus',
    category: 'Digital Product',
    year: '2023',
    image: 'https://picsum.photos/seed/nexus/1200/800'
  }
]

export function Works() {
  const container = useRef(null)
  const setCursorVariant = useAppStore((state) => state.setCursorVariant)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end start']
  })

  return (
    <section ref={container} className="relative w-full py-24 sm:py-48 px-6 sm:px-12 bg-[#050505] z-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-20 text-xs uppercase tracking-widest text-gray-500">Selected Works</h2>
        
        <div className="flex flex-col border-t border-white/10">
          {projects.map((project, index) => (
            <div 
              key={index}
              className="group relative flex cursor-pointer flex-col justify-between border-b border-white/10 py-12 px-4"
              onMouseEnter={() => {
                setCursorVariant('hover')
                setHoveredIndex(index)
              }}
              onMouseLeave={() => {
                setCursorVariant('default')
                setHoveredIndex(null)
              }}
            >
              <div className="flex w-full flex-col justify-between sm:flex-row sm:items-center">
                <div className="flex flex-col z-10 text-white">
                  <h3 className="text-4xl sm:text-7xl font-bold tracking-tighter transition-transform duration-500 group-hover:translate-x-4">
                    {project.title}
                  </h3>
                  <p className="mt-4 text-xs uppercase tracking-widest text-gray-400 sm:hidden">
                    {project.category}
                  </p>
                </div>
                
                <div className="z-10 mt-4 flex items-center justify-between sm:mt-0 sm:w-1/3 text-white">
                  <p className="hidden text-xs uppercase tracking-widest text-gray-400 sm:block transition-transform duration-500 group-hover:-translate-x-4">
                    {project.category}
                  </p>
                  <p className="text-xs text-gray-400">{project.year}</p>
                </div>
              </div>

              <div 
                className={`relative w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  hoveredIndex === index ? 'aspect-video mt-8 sm:mt-12 opacity-100' : 'h-0 mt-0 opacity-0'
                }`}
              >
                <Image 
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          ))}
        </div>



        <div className="mt-20 flex justify-center z-10 relative">
          <Magnetic>
            <div 
              onMouseEnter={() => setCursorVariant('hidden')}
              onMouseLeave={() => setCursorVariant('default')}
              className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[#050505] transition-colors hover:bg-white hover:text-black"
            >
              <span className="text-xs font-medium uppercase tracking-widest">View All</span>
            </div>
          </Magnetic>
        </div>
      </div>
    </section>
  )
}
