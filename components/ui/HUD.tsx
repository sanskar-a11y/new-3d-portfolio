'use client'

import { useEffect, useState, memo, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { Magnetic } from '@/components/ui/Magnetic'
import { isSoundMutedState, toggleSoundMute, playGlassClinkSound } from '@/lib/audio'

export const HUD = memo(function HUD() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isProjects = pathname === '/projects'
  const mode = useAppStore((state) => state.mode)
  const cycleMode = useAppStore((state) => state.cycleMode)
  const telemetry = useAppStore((state) => state.telemetry)
  const [isMuted, setIsMuted] = useState(isSoundMutedState())
  const [timeData, setTimeData] = useState({
    hour: '12',
    minute: '00',
    ampm: 'AM',
    weather: 'OVERCAST, 24°C',
  })

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date()
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        const parts = formatter.formatToParts(now)
        const hour = parts.find((p) => p.type === 'hour')?.value || '12'
        const minute = parts.find((p) => p.type === 'minute')?.value || '00'
        const ampm = parts.find((p) => p.type === 'dayPeriod')?.value?.toUpperCase() || 'AM'

        // Dynamic time-of-day condition for New Delhi
        const hr = parseInt(hour, 10) + (ampm === 'PM' && hour !== '12' ? 12 : 0)
        let weather = 'CLEAR SKY, 24°C'
        if (hr >= 5 && hr < 11) weather = 'MISTY MORNING, 22°C'
        else if (hr >= 11 && hr < 16) weather = 'SUNNY, 32°C'
        else if (hr >= 16 && hr < 19) weather = 'GOLDEN HOUR, 29°C'
        else if (hr >= 19 && hr < 23) weather = 'OVERCAST, 26°C'
        else weather = 'OVERCAST, 24°C'

        setTimeData({ hour, minute, ampm, weather })
      } catch {}
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleToggleSound = useCallback(() => {
    const nextMuted = toggleSoundMute()
    setIsMuted(nextMuted)
    if (!nextMuted) {
      playGlassClinkSound()
    }
  }, [])

  // Allow keyboard 'Shift' key to cycle mode on Home page
  useEffect(() => {
    if (!isHome) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        cycleMode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isHome, cycleMode])

  return (
    <>
      {/* ── Left Flank: Time & Dynamic Atmosphere (Yuta Abe Style Line-Mask Reveal) ── */}
      {isHome && (
        <div
          className="fixed left-5 sm:left-6 md:left-10 top-[25%] md:top-1/2 -translate-y-1/2 z-40 pointer-events-none select-none text-[9px] sm:text-[10px] md:text-xs tracking-[0.08em] uppercase opacity-75"
          style={{ fontFamily: 'var(--font-space-mono), monospace', color: 'var(--col-white)' }}
        >
          <div className="flex flex-col gap-0.5">
            <div className="overflow-hidden py-0.5">
              <motion.div
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-white"
              >
                {timeData.hour}
                <span className="inline-block animate-pulse mx-0.5 text-white/80">:</span>
                {timeData.minute} {timeData.ampm} NEW DELHI
              </motion.div>
            </div>
            <div className="overflow-hidden py-0.5">
              <motion.div
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-white/85 tracking-[0.08em]"
              >
                {timeData.weather}
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* ── Right Flank: Dynamic Dialogue (Yuta Abe Style Line-Mask Reveal) ── */}
      {isHome && (
        <div
          className="fixed right-5 sm:right-6 md:right-10 top-[75%] md:top-1/2 -translate-y-1/2 z-40 pointer-events-none select-none text-[9px] sm:text-[10px] md:text-xs tracking-[0.08em] text-right uppercase opacity-75"
          style={{ fontFamily: 'var(--font-space-mono), monospace', color: 'var(--col-white)' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${telemetry.line1}-${telemetry.line2}`}
              className="flex flex-col gap-0.5 items-end"
            >
              {/* Line 1 Masked Reveal */}
              <div className="overflow-hidden py-0.5">
                <motion.span
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-110%', opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="block font-normal tracking-[0.08em] text-white"
                >
                  {telemetry.line1}
                </motion.span>
              </div>

              {/* Line 2 Masked Reveal (Staggered) */}
              <div className="overflow-hidden py-0.5">
                <motion.span
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-110%', opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.09, ease: [0.16, 1, 0.3, 1] }}
                  className="block text-white/85 tracking-[0.08em]"
                >
                  {telemetry.line2}
                </motion.span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ── Bottom Left: Sleek Minimalist [ (o) ] SHIFT Switcher ── */}
      <div className="fixed bottom-5 sm:bottom-8 left-5 sm:left-10 z-50 pointer-events-auto select-none">
        {isHome && (
          <Magnetic>
            <button
              onClick={cycleMode}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 cursor-pointer group font-mono text-[10px] sm:text-xs tracking-[0.1em] uppercase"
              aria-label="Shift Cat Visual Shader Mode"
            >
              {/* Minimalist Switch Toggle Pill */}
              <div className="relative w-7 h-3.5 rounded-full border border-white/70 group-hover:border-white transition-colors duration-200 box-border p-0.5 flex items-center">
                <div
                  className={`w-2 h-2 rounded-full bg-white transition-transform duration-300 ${
                    mode === 0 ? 'translate-x-0' : mode === 1 ? 'translate-x-1.5' : 'translate-x-3 bg-white'
                  }`}
                />
              </div>
              <span className="font-mono text-[10px] sm:text-xs tracking-[0.1em]">SHIFT</span>
            </button>
          </Magnetic>
        )}

        {isProjects && (
          <Magnetic>
            <button
              onClick={handleToggleSound}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-full transition-all duration-300 backdrop-blur-sm cursor-pointer ${
                isMuted
                  ? 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30'
                  : 'bg-black/40 border-white/30 text-white hover:bg-white/10 hover:border-white/60'
              }`}
            >
              <span className="text-xs">{isMuted ? '🔇' : '🔊'}</span>
              <span className="font-bold text-[10px] tracking-widest uppercase">
                {isMuted ? 'SOUND OFF' : 'SOUND ON'}
              </span>
            </button>
          </Magnetic>
        )}
      </div>

      {/* ── Bottom Right: Clean Social Icons (SNS) Matching Screenshot ── */}
      <div className="fixed bottom-5 sm:bottom-8 right-5 sm:right-10 z-50 pointer-events-auto flex items-center gap-3.5 sm:gap-4 text-white/70 select-none">
        <Magnetic>
          <a
            href="https://x.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-200 p-1"
            aria-label="X (Twitter)"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </Magnetic>

        <Magnetic>
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-200 p-1"
            aria-label="Instagram"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </Magnetic>

        <Magnetic>
          <a
            href="https://github.com/sanskar-a11y"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-200 p-1"
            aria-label="GitHub"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </Magnetic>
      </div>
    </>
  )
})
