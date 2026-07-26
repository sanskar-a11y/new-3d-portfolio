'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Magnetic } from '@/components/ui/Magnetic'

export function HUD() {
  const mode = useAppStore((state) => state.mode)
  const [timeString, setTimeString] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours() % 12 || 12
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM'
      setTimeString(`${hours}:${minutes} ${ampm}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-between p-6 sm:p-10 font-mono text-xs text-white/80 select-none">
      {/* Bottom Controls Only */}
      <div className="mt-auto flex justify-between items-end w-full">
        {/* Left Side: Time/Location + SHIFT Toggle */}
        <div className="flex flex-col items-start gap-4 pointer-events-auto">
          {/* Time & Location Display */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">
              NEW DELHI
            </span>
            <span className="font-mono text-white/80">
              {timeString || "00:00 AM"}
            </span>
          </div>

          {/* Sleek Minimal Controls: SHIFT & SOUND */}
          <div className="flex items-center gap-3">
            <Magnetic>
              <button
                onClick={() => {}}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-black/40 hover:bg-white/10 border border-white/20 hover:border-white/50 text-white rounded-full transition-all duration-300 backdrop-blur-sm cursor-pointer group"
              >
                <div className="w-5 h-2.5 rounded-full border border-white/60 p-0.5 flex items-center">
                  <div
                    className={`w-1.5 h-1.5 rounded-full bg-white transition-transform duration-300 ${
                      mode === 0 ? 'translate-x-0' : mode === 1 ? 'translate-x-1.5' : 'translate-x-2.5 bg-white'
                    }`}
                  />
                </div>
                <span className="font-bold text-[11px] tracking-widest text-white/90">SHIFT</span>
              </button>
            </Magnetic>

            <Magnetic>
              <button
                onClick={() => {
                  import('@/lib/audio').then(({ playGlassClinkSound }) => playGlassClinkSound())
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-white/10 border border-white/20 hover:border-white/50 text-white/90 hover:text-white rounded-full transition-all duration-300 backdrop-blur-sm cursor-pointer"
              >
                <span className="text-xs">🔊</span>
                <span className="font-bold text-[10px] tracking-widest uppercase">SOUND</span>
              </button>
            </Magnetic>
          </div>
        </div>

        {/* Bottom Right Social Links */}
        <div className="pointer-events-auto flex items-center gap-4 text-white/70">
          <Magnetic>
            <a
              href="https://www.linkedin.com/in/sanskar-sharma-b5830433a/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300 p-1.5"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>
          </Magnetic>

          <Magnetic>
            <a
              href="https://github.com/sanskar-a11y"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300 p-1.5"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
          </Magnetic>
        </div>
      </div>
    </div>
  )
}

