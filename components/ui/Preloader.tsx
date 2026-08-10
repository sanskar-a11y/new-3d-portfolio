'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'

export function Preloader() {
  const [mounted, setMounted] = useState(false)
  const [counter, setCounter] = useState(0)
  const isLoaded = useAppStore((state) => state.isLoaded)
  const setLoaded = useAppStore((state) => state.setLoaded)
  const setCursorVariant = useAppStore((state) => state.setCursorVariant)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Smooth counter: increment by 2 every 12ms (~600ms total duration)
    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          // Trigger scene entry immediately at 100
          setLoaded(true)
          setCursorVariant('default')
          return 100
        }
        return Math.min(prev + 2, 100)
      })
    }, 12)

    return () => {
      clearInterval(interval)
    }
  }, [mounted, setLoaded, setCursorVariant])

  // If not mounted yet (SSR or initial hydration), render consistent static state to prevent hydration error
  if (!mounted) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col justify-between p-8 sm:p-12 bg-[#080808] text-[#F0EDE8] select-none">
        <div className="flex justify-between items-center w-full font-mono text-xs tracking-[0.25em] text-white/70 uppercase">
          <span>Yuta Abe Style / 3D Experience</span>
          <span>Tokyo, JP</span>
        </div>
        <div className="flex flex-col items-center justify-center my-auto">
          <div className="font-mono text-xs sm:text-sm tracking-[0.3em] text-[#30b8ff] uppercase mb-4 text-center">
            Loading Experience
          </div>
          <div className="flex items-baseline gap-2 font-light tracking-tighter">
            <span className="text-7xl sm:text-[9vw] font-bold leading-none font-sans tracking-tight">000</span>
            <span className="text-sm font-mono tracking-widest text-white/70 uppercase">%</span>
          </div>
          <div className="w-48 sm:w-64 h-[1px] bg-white/15 mt-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-[#30b8ff] w-0" />
          </div>
        </div>
        <div className="flex justify-between items-end w-full font-mono text-[11px] tracking-[0.2em] text-white/70 uppercase">
          <span>[ System Ready ]</span>
          <span>Please Wait</span>
        </div>
      </div>
    )
  }

  // Format number as classic 3-digit counter (000 -> 100)
  const formattedCounter = counter.toString().padStart(3, '0')

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ 
            y: '-100%',
            transition: { duration: 0.35, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[200] flex flex-col justify-between p-8 sm:p-12 bg-[#080808] text-[#F0EDE8] select-none"
        >
          {/* Top minimal branding */}
          <div className="flex justify-between items-center w-full font-mono text-xs tracking-[0.25em] text-white/70 uppercase">
            <span>Yuta Abe Style / 3D Experience</span>
            <span>Tokyo, JP</span>
          </div>

          {/* Center classic minimalist loader */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="overflow-hidden mb-6">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="font-mono text-xs sm:text-sm tracking-[0.3em] text-[#30b8ff] uppercase mb-4 text-center"
              >
                Loading Experience
              </motion.div>
            </div>

            {/* Classic Typography Progress Counter */}
            <div className="flex items-baseline gap-2 font-light tracking-tighter">
              <span className="text-7xl sm:text-[9vw] font-bold leading-none font-sans tracking-tight">
                {formattedCounter}
              </span>
              <span className="text-sm font-mono tracking-widest text-white/70 uppercase">%</span>
            </div>

            {/* Sleek ultra-thin progress bar */}
            <div className="w-48 sm:w-64 h-[1px] bg-white/15 mt-8 relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-[#30b8ff] transition-all duration-75 ease-out"
                style={{ width: `${counter}%` }}
              />
            </div>
          </div>

          {/* Bottom status */}
          <div className="flex justify-between items-end w-full font-mono text-[11px] tracking-[0.2em] text-white/70 uppercase">
            <span>[ System Ready ]</span>
            <span>Please Wait</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
