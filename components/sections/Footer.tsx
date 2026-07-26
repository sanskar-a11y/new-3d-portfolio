'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Magnetic } from '@/components/ui/Magnetic'

export function Footer() {
  const container = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end end']
  })

  const y = useTransform(scrollYProgress, [0, 1], [-100, 0])

  return (
    <motion.footer 
      ref={container} 
      className="relative flex flex-col justify-end w-full overflow-hidden bg-[#111] px-6 py-12 sm:px-12 z-10 min-h-[50vh]"
      style={{ y }}
    >
      <div className="flex flex-col sm:flex-row w-full justify-between items-end border-b border-white/20 pb-12">
        <div className="flex flex-col gap-6">
          <h3 className="text-4xl sm:text-6xl font-bold tracking-tighter text-white">Let&apos;s Talk</h3>
          <Magnetic>
            <a href="mailto:hello@example.com" className="text-xl sm:text-2xl text-gray-400 hover:text-white transition-colors">
              hello@example.com
            </a>
          </Magnetic>
        </div>
        
        <div className="mt-12 sm:mt-0 flex gap-12 text-sm uppercase tracking-widest text-gray-400">
          <ul className="flex flex-col sm:flex-row gap-6 sm:gap-12">
            <li>
              <Magnetic>
                <a 
                  href="https://www.linkedin.com/in/sanskar-sharma-b5830433a/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  LinkedIn
                </a>
              </Magnetic>
            </li>
            <li>
              <Magnetic>
                <a 
                  href="https://github.com/sanskar-a11y" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  GitHub
                </a>
              </Magnetic>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-gray-600 tracking-widest uppercase">
        <p>© {new Date().getFullYear()} Sanskar Sharma.</p>
        <p>Built with Claude Code, AI Studio, ChatGPT &amp; Antigravity.</p>
      </div>
    </motion.footer>
  )
}
