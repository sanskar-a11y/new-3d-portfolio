'use client'

import { useState, useEffect, useRef } from 'react'

export interface PlaygroundHUDProps {
  cellCount: number
  switchCount: number
  lightsOut: boolean
  onToggleLights: () => void
  activeTitle?: string
}

/**
 * Formats active cell counter to 3-digit zero-padded string.
 */
export function formatCellCount(count: number): string {
  if (isNaN(count) || count <= 0) return '---'
  return Math.min(999, Math.floor(count)).toString().padStart(3, '0')
}

/**
 * Formats elapsed seconds to MM:SS string.
 */
export function formatElapsedStopwatch(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00'
  const totalSec = Math.floor(seconds)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  const minsStr = mins < 10 ? `0${mins}` : `${mins}`
  const secsStr = secs < 10 ? `0${secs}` : `${secs}`
  return `${minsStr}:${secsStr}`
}

/**
 * Formats switch counter to 3-digit zero-padded string.
 */
export function formatSwitchCount(count: number): string {
  if (isNaN(count) || count < 0) return '000'
  return Math.min(999, Math.floor(count)).toString().padStart(3, '0')
}

/**
 * Rates reaction time latency.
 */
export function rateReactionLatency(
  latencyMs: number
): 'INCREDIBLE' | 'FAST' | 'GOOD' | 'SLOW' | 'TOO EARLY' {
  if (latencyMs < 0) return 'TOO EARLY'
  if (latencyMs < 200) return 'INCREDIBLE'
  if (latencyMs < 300) return 'FAST'
  if (latencyMs < 500) return 'GOOD'
  return 'SLOW'
}

const SCRAMBLE_CHARS = '0123456789ABCDEF!@#$%'

export function PlaygroundHUD({
  cellCount,
  switchCount,
  lightsOut,
  onToggleLights,
  activeTitle,
}: PlaygroundHUDProps) {
  const [elapsed, setElapsed] = useState('00:00')
  const [isVisible, setIsVisible] = useState(false)
  const [scrambledSwitches, setScrambledSwitches] = useState('000')
  const startTimeRef = useRef<number | null>(null)
  const scrambleIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 250)
    return () => clearTimeout(timer)
  }, [])

  // Live session elapsed timer (MM:SS)
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

  // Matrix Hacker Scramble animation on switchCount change
  useEffect(() => {
    const targetString = String(switchCount).padStart(3, '0')
    let iteration = 0
    const totalIterations = 7

    if (scrambleIntervalRef.current) {
      clearInterval(scrambleIntervalRef.current)
    }

    scrambleIntervalRef.current = setInterval(() => {
      iteration++
      if (iteration >= totalIterations) {
        setScrambledSwitches(targetString)
        if (scrambleIntervalRef.current) {
          clearInterval(scrambleIntervalRef.current)
          scrambleIntervalRef.current = null
        }
      } else {
        const scrambled = targetString
          .split('')
          .map((char, index) => {
            if (index < iteration / 2.5) {
              return char
            }
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          })
          .join('')
        setScrambledSwitches(scrambled)
      }
    }, 45)

    return () => {
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current)
      }
    }
  }, [switchCount])

  const formattedCells = String(cellCount || 0).padStart(3, '0')

  return (
    <>
      <div
        className={`pg-ui pointer-events-none ${isVisible ? 'is-visible' : ''}`}
        data-pg-ui
      >
        {/* Top-left Corner: Active Title or Lab Tag */}
        <div className="pg-ui__corner pg-ui__corner--tl">
          {activeTitle && (
            <span className="pg-ui__sub tracking-widest text-[10px] text-cyan-400">
              [ {activeTitle} ]
            </span>
          )}
        </div>

        {/* Top-right Corner: Navigation Hint */}
        <div className="pg-ui__corner pg-ui__corner--tr">
          <span className="pg-ui__hint">
            <span className="pg-ui__hint-icon" aria-hidden="true" />
            DRAG TO EXPLORE
          </span>
        </div>

        {/* Bottom-left Corner: Brand Header */}
        <div className="pg-ui__corner pg-ui__corner--bl">
          <h1 className="pg-ui__brand">PLAYGROUND</h1>
          <div className="pg-ui__sub">— Visual sketches, creative coding, shaders</div>
        </div>

        {/* Bottom-right Corner: Telemetry Stats */}
        <div className="pg-ui__corner pg-ui__corner--br">
          <div className="pg-ui__stats">
            <span className="pg-ui__lbl">cells</span>
            <span className="pg-ui__num" data-pg-cells>
              {formattedCells}
            </span>
            <span className="pg-ui__lbl">elapsed</span>
            <span className="pg-ui__num" data-pg-elapsed>
              {elapsed}
            </span>
            <span className="pg-ui__lbl">switches</span>
            <span className="pg-ui__num" data-pg-switches>
              {scrambledSwitches}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Switcher / LightsOut Toggle Pill */}
      <div
        id="js-lights-btn"
        className={`pg-switcher switcher c-lights-btn ${
          lightsOut ? 'is-active' : ''
        }`}
        role="group"
        aria-label="LIGHTSOUT"
      >
        <button
          className="pg-switcher__toggle switcher__toggle"
          type="button"
          aria-pressed={lightsOut}
          aria-label="Toggle Lights Out mode"
          onClick={onToggleLights}
        >
          <span className="pg-switcher__thumb switcher__thumb" aria-hidden="true" />
        </button>
        <span
          className="pg-switcher__label switcher__label"
          onClick={onToggleLights}
        >
          SHIFT
        </span>
      </div>
    </>
  )
}
