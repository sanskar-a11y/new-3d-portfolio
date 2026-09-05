'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'

const emptySubscribe = () => () => {}

export function Preloader() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  const [stage, setStage] = useState<'meow' | 'loading' | 'done'>('meow')
  const [counter, setCounter] = useState(0)
  const isLoaded = useAppStore((state) => state.isLoaded)
  const setLoaded = useAppStore((state) => state.setLoaded)
  const setCursorVariant = useAppStore((state) => state.setCursorVariant)

  // Stage 1: "meow meow" prologue duration
  useEffect(() => {
    if (!mounted) return
    const meowTimer = setTimeout(() => {
      setStage('loading')
    }, 1400)

    return () => clearTimeout(meowTimer)
  }, [mounted])

  // Stage 2: Smooth numeric progress counter (0 -> 100)
  useEffect(() => {
    if (stage !== 'loading') return

    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        // Smooth non-linear acceleration
        const increment = prev < 70 ? 2 : prev < 95 ? 3 : 1
        return Math.min(prev + increment, 100)
      })
    }, 18)

    return () => clearInterval(interval)
  }, [stage])

  // Stage 3: Transition to complete
  useEffect(() => {
    if (counter >= 100) {
      const exitTimer = setTimeout(() => {
        setLoaded(true)
        setCursorVariant('default')
        setStage('done')
      }, 350)
      return () => clearTimeout(exitTimer)
    }
  }, [counter, setLoaded, setCursorVariant])

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0a0a] text-white select-none">
        <span className="font-extralight tracking-[0.4em] text-2xl uppercase opacity-60">
          meow meow
        </span>
      </div>
    )
  }

  const formattedCounter = counter.toString().padStart(3, '0')

  return (
    <AnimatePresence mode="wait">
      {!isLoaded && (
        <motion.div
          key="master-preloader"
          initial={{ opacity: 1 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[200] flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-[#0a0a0a] text-white select-none overflow-hidden"
          style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
          {/* Top subtle metadata */}
          <div className="flex justify-between items-center w-full font-mono text-[11px] sm:text-xs tracking-[0.25em] text-white/75 uppercase">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              SANSKAR // 3D CORE
            </span>
            <span>NEW DELHI [28°36&apos;N 77°12&apos;E]</span>
          </div>

          {/* Center Stage: Meow Prologue vs Classic Minimalist Progress */}
          <div className="flex flex-col items-center justify-center my-auto w-full max-w-xl mx-auto min-h-[220px]">
            <AnimatePresence mode="wait">
              {stage === 'meow' ? (
                /* ─── Phase 1: Majestic "meow meow" Reveal ─── */
                <motion.div
                  key="meow-phase"
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(12px)' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center gap-4"
                >
                  <span className="text-[clamp(2rem,6vw,4rem)] font-extralight tracking-[0.45em] lowercase italic text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]">
                    meow meow
                  </span>
                  <p className="font-mono text-[10px] sm:text-xs tracking-[0.3em] uppercase text-white/75">
                    [ Awakening Consciousness // Cat Core ]
                  </p>
                </motion.div>
              ) : (
                /* ─── Phase 2: Minimalist Classic Monochromatic Counter ─── */
                <motion.div
                  key="counter-phase"
                  initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center w-full"
                >
                  <p className="font-mono text-[11px] tracking-[0.35em] text-white/80 uppercase mb-4 text-center">
                    INITIALIZING ENVIRONMENT
                  </p>

                  <div className="flex items-baseline gap-2 font-light tracking-tighter">
                    <span className="text-[clamp(4.5rem,14vw,9rem)] font-extralight leading-none font-sans tracking-tight text-white">
                      {formattedCounter}
                    </span>
                    <span className="text-xs sm:text-sm font-mono tracking-widest text-white/80 uppercase">
                      %
                    </span>
                  </div>

                  {/* Ultra-thin hairline progress bar */}
                  <div className="w-56 sm:w-72 h-[1px] bg-white/30 mt-8 relative overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                      style={{ width: `${counter}%` }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom minimal telemetry */}
          <div className="flex justify-between items-end w-full font-mono text-[10px] sm:text-[11px] tracking-[0.2em] text-white/75 uppercase">
            <span>{stage === 'meow' ? '[ SYSTEM_PROLOGUE ]' : `[ BUFFER_STREAM: ${counter}% ]`}</span>
            <span>{stage === 'meow' ? 'INITIALIZING' : counter >= 100 ? 'READY // LAUNCHING' : 'PLEASE STANDBY'}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
