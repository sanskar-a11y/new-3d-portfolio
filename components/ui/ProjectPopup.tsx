'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playGlassClinkSound } from '@/lib/audio'

export function ProjectPopup() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const handleAction = () => {
    playGlassClinkSound()
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      <div 
        onClick={handleAction}
        className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md select-none cursor-pointer p-6 transition-all duration-300"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="text-center flex flex-col items-center gap-3"
        >
          <span className="font-mono text-sm sm:text-base tracking-[0.3em] uppercase text-white/90 font-bold border-b border-white/30 pb-1.5 hover:border-white transition-colors duration-300 drop-shadow-sm">
            CLICK HERE TO SEE
          </span>
          <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
            [ CLICK ANYWHERE TO ENTER ]
          </span>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
