'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'

export function Hero() {
  const container = useRef(null)
  
  return (
    <section 
      ref={container}
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden pt-24 pointer-events-none"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-xs uppercase tracking-widest text-gray-500"
      >
        <div className="w-[1px] h-12 bg-gray-500/50 relative overflow-hidden">
          <motion.div 
            className="w-full h-full bg-white origin-top"
            animate={{ scaleY: [0, 1, 0], translateY: ['-100%', '0%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
        </div>
        Scroll to explore
      </motion.div>
    </section>
  )
}
