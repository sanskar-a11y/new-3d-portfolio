'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface LightsOutProps {
  lightsOut: boolean
  onToggleLights: () => void
  onSwitch: () => void
}

type GameState = 'idle' | 'waiting' | 'prompt' | 'result'

export function LightsOut({ lightsOut, onToggleLights, onSwitch }: LightsOutProps) {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [reactionTime, setReactionTime] = useState(0)
  const promptTimeRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Shift') return
      e.preventDefault()

      switch (gameState) {
        case 'idle':
          // Enter lights-out mode
          onToggleLights()
          onSwitch()
          setGameState('waiting')
          // Random delay before prompt
          const delay = 2000 + Math.random() * 3000
          timeoutRef.current = setTimeout(() => {
            promptTimeRef.current = performance.now()
            setGameState('prompt')
          }, delay)
          break

        case 'waiting':
          // Too early! Reset
          cleanup()
          setReactionTime(-1) // -1 means too early
          setGameState('result')
          timeoutRef.current = setTimeout(() => {
            onToggleLights()
            setGameState('idle')
          }, 2000)
          break

        case 'prompt':
          // Measure reaction time
          const rt = Math.round(performance.now() - promptTimeRef.current)
          setReactionTime(rt)
          setGameState('result')
          onSwitch()
          timeoutRef.current = setTimeout(() => {
            onToggleLights()
            setGameState('idle')
          }, 3000)
          break

        case 'result':
          // Already showing result, do nothing
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      cleanup()
    }
  }, [gameState, onToggleLights, onSwitch, cleanup])

  // Determine HUD classes
  const hudClasses = [
    'reaction-hud',
    gameState === 'prompt' ? 'is-prompt' : '',
    gameState === 'waiting' ? 'is-prompt is-waiting' : '',
    gameState === 'result' ? 'is-result' : '',
  ].filter(Boolean).join(' ')

  const getResultLabel = () => {
    if (reactionTime < 0) return 'TOO EARLY'
    if (reactionTime < 200) return 'INCREDIBLE'
    if (reactionTime < 300) return 'FAST'
    if (reactionTime < 500) return 'GOOD'
    return 'SLOW'
  }

  return (
    <div className={hudClasses} aria-hidden="true">
      <p className="reaction-prompt">
        LIGHTS OUT, PRESS SHIFT!
      </p>
      <p className="reaction-result">
        <span className="reaction-time">
          {reactionTime < 0 ? '---' : `${reactionTime}ms`}
        </span>
        <span className="reaction-label">
          {getResultLabel()}
        </span>
      </p>
    </div>
  )
}
