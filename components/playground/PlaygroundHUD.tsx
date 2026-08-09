'use client'

import { useState, useEffect, useRef } from 'react'

interface PlaygroundHUDProps {
  cellCount: number
  switchCount: number
  lightsOut: boolean
  onToggleLights: () => void
}

export function PlaygroundHUD({ cellCount, switchCount, lightsOut, onToggleLights }: PlaygroundHUDProps) {
  const [elapsed, setElapsed] = useState('00:00')
  const [isVisible, setIsVisible] = useState(false)
  const startTimeRef = useRef<number | null>(null)

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // Elapsed timer
  useEffect(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }
    const interval = setInterval(() => {
      if (startTimeRef.current === null) return
      const diff = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const mins = String(Math.floor(diff / 60)).padStart(2, '0')
      const secs = String(diff % 60).padStart(2, '0')
      setElapsed(`${mins}:${secs}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`pg-ui ${isVisible ? 'is-visible' : ''}`}>
      {/* Bottom-left: Minimal Brand Header */}
      <div className="pg-ui__corner pg-ui__corner--bl">
        <h1 className="pg-ui__brand">PLAYGROUND</h1>
      </div>
    </div>
  )
}


