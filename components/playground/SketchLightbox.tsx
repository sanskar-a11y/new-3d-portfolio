'use client'

import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SketchDef } from './sketches'

export interface SketchLightboxProps {
  sketch: SketchDef | null
  onClose: () => void
  isDark: boolean
}

export function SketchLightbox({ sketch, onClose, isDark }: SketchLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (sketch) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [sketch, onClose])

  return (
    <AnimatePresence>
      {sketch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-100 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={onClose}
        >
          <motion.div
            layoutId={`sketch-${sketch.id}`}
            initial={{ scale: 0.92, opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ scale: 0.95, opacity: 0, y: 10, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className={`max-w-5xl w-full bg-[#0d0d0d] rounded-xl overflow-hidden flex flex-col md:flex-row relative z-101 transition-all duration-300 ${
              isDark
                ? 'border border-[#30b8ff]/40 shadow-[0_0_50px_rgba(48,184,255,0.25)]'
                : 'border border-white/10 shadow-2xl'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left side (Image display) */}
            <div className="relative aspect-video md:aspect-auto md:w-2/3 bg-black flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-[500px] group">
              <img
                src={sketch.image}
                alt={sketch.title}
                onError={(e) => {
                  e.currentTarget.src = `https://picsum.photos/seed/fallback_${sketch.id}/800/450`
                }}
                className="object-contain w-full h-full max-h-[75vh] will-change-transform transition-transform duration-500 ease-out group-hover:scale-105 bg-[#121212]"
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
            </div>

            {/* Right side (Details panel) */}
            <div className="md:w-1/3 p-6 sm:p-8 flex flex-col justify-between font-mono text-white bg-[#0d0d0d]">
              {/* Top Section */}
              <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
                <div className="flex items-center justify-between text-xs tracking-widest">
                  <span className="text-[#30b8ff] font-bold px-2 py-0.5 rounded bg-[#30b8ff]/10 border border-[#30b8ff]/30">
                    #{sketch.id}
                  </span>
                  <span className="text-white/90">{sketch.year}</span>
                </div>
                <div className="text-xs text-white/85 tracking-wider mt-1 break-words">
                  / {sketch.tech}
                </div>
              </div>

              {/* Middle Section */}
              <div className="my-6 md:my-auto py-2">
                <h3 className="font-sans text-2xl sm:text-3xl font-bold tracking-wider uppercase mb-4 text-white">
                  {sketch.title}
                </h3>
                <p className="font-mono text-sm text-white/90 leading-relaxed">
                  {sketch.description}
                </p>
              </div>

              {/* Bottom Section */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <span className="text-[10px] sm:text-xs text-white/90 uppercase tracking-widest hidden sm:inline">
                  ESC
                </span>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded border border-white/30 text-xs tracking-widest uppercase font-bold hover:border-[#30b8ff] hover:text-[#30b8ff] hover:bg-[#30b8ff]/5 hover:shadow-[0_0_20px_rgba(48,184,255,0.3)] transition-all duration-300 cursor-pointer text-center ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  CLOSE [X]
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SketchLightbox
