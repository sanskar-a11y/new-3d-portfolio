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
    window.scrollTo({
      top: window.innerHeight * 0.4,
      behavior: 'smooth',
    })
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md bg-[#0a0a0d]/95 border border-cyan-500/40 rounded-3xl p-8 sm:p-10 shadow-[0_0_60px_rgba(0,240,255,0.25)] text-center flex flex-col items-center gap-6"
        >
          {/* Subtle neon pulse icon */}
          <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.6)] animate-pulse">
            <span className="text-2xl">✨</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] text-cyan-400 tracking-widest uppercase font-bold">
              3D SHOWCASE PORTFOLIO
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              CLICK HERE TO SEE
            </h2>
            <p className="text-xs text-white/60 font-mono tracking-wide mt-1">
              Explore 20 interactive projects with scroll-driven 3D cat depth layering.
            </p>
          </div>

          {/* Action Button */}
          <div className="w-full mt-2">
            <button
              onClick={handleAction}
              className="w-full py-4 px-6 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-[0_0_25px_rgba(0,240,255,0.6)] hover:shadow-[0_0_35px_rgba(0,240,255,0.9)] hover:scale-[1.02] cursor-pointer"
            >
              CLICK HERE TO SEE
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-white/40 hover:text-white text-sm p-2 transition-colors duration-200 cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
