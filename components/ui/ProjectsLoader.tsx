'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ProjectsLoader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 18) + 12
      if (current >= 100) {
        current = 100
        setProgress(100)
        clearInterval(interval)
        setTimeout(() => {
          setIsDone(true)
          if (onComplete) onComplete()
        }, 300)
      } else {
        setProgress(current)
      }
    }, 45)

    return () => clearInterval(interval)
  }, [onComplete])

  if (isDone) return null

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]/90 backdrop-blur-lg select-none pointer-events-auto"
        >
          {/* Cyberpunk HUD Frame Box */}
          <div className="relative w-80 sm:w-96 p-6 border border-cyan-500/30 rounded-2xl bg-black/60 shadow-[0_0_40px_rgba(0,240,255,0.15)] flex flex-col items-center gap-5">
            {/* Top Status Telemetry */}
            <div className="w-full flex justify-between items-center font-mono text-[10px] tracking-widest text-cyan-400/80 uppercase">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                SYS.MATRIX
              </span>
              <span>[ DECRYPTING ]</span>
            </div>

            {/* Main Animated Title */}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <h2 className="font-mono text-xs sm:text-sm font-bold tracking-[0.25em] text-white uppercase">
                PROJECTS INCOMING
              </h2>
              <p className="font-mono text-[10px] text-white/50 tracking-wider uppercase">
                Synchronizing 3D Interactive Archive
              </p>
            </div>

            {/* Glowing Digital Counter */}
            <div className="font-mono text-3xl sm:text-4xl font-black text-cyan-400 tracking-tighter drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]">
              {progress.toString().padStart(3, '0')}
              <span className="text-lg text-cyan-500/70 font-normal">%</span>
            </div>

            {/* Sleek Neon Progress Bar */}
            <div className="w-full h-1.5 bg-cyan-950/60 rounded-full overflow-hidden border border-cyan-500/20">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-white to-cyan-400 rounded-full shadow-[0_0_12px_rgba(0,240,255,0.9)]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
              />
            </div>

            {/* Bottom Cyber Tag */}
            <div className="w-full flex justify-between items-center font-mono text-[9px] text-white/40 tracking-widest uppercase">
              <span>LOC: /PROJECTS</span>
              <span>20 ITEMS READY</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
