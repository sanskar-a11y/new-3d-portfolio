'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export function About() {
  const container = useRef(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section ref={container} className="relative flex min-h-screen w-full items-center justify-center py-24 px-6 sm:px-12 bg-white text-black">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-12 sm:flex-row">
        
        <div className="w-full sm:w-1/3">
          <h2 className="text-sm uppercase tracking-widest text-gray-500">Philosophy</h2>
        </div>
        
        <div className="w-full sm:w-2/3">
          <motion.div style={{ y }} className="flex flex-col gap-8">
            <h3 className="text-3xl font-medium leading-tight tracking-tighter sm:text-5xl lg:text-6xl text-balance">
              Blending code and design to create immersive digital experiences that leave a lasting impression.
            </h3>
            
            <p className="max-w-xl text-lg text-gray-600 sm:text-xl">
              I specialize in crafting high-performance, interactive websites that push the boundaries of what is possible on the web. By combining modern technologies like WebGL and GSAP with a keen eye for minimalist design, I build platforms that are both functional and emotionally engaging.
            </p>

            <div className="mt-8 flex gap-4">
              {['Awwwards', 'FWA', 'CSSDA'].map((award, i) => (
                <div key={i} className="rounded-full border border-black/10 px-4 py-2 text-sm uppercase tracking-widest">
                  {award}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
