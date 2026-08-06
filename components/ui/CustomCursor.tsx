'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function CustomCursor() {
  const cursor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cursor.current) return

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    let lastMouseMoveTime = performance.now()
    let tickerActive = false

    // QuickSetters for better performance
    const xSet = gsap.quickSetter(cursor.current, 'x', 'px')
    const ySet = gsap.quickSetter(cursor.current, 'y', 'px')

    const startTicker = () => {
      if (!tickerActive) {
        gsap.ticker.add(tick)
        tickerActive = true
      }
    }

    const stopTicker = () => {
      if (tickerActive) {
        gsap.ticker.remove(tick)
        tickerActive = false
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      lastMouseMoveTime = performance.now()
      startTicker()
    }

    window.addEventListener('mousemove', onMouseMove)

    const tick = () => {
      const dt = 1.0 - Math.pow(1.0 - 0.25, gsap.ticker.deltaRatio())
      pos.x += (mouse.x - pos.x) * dt
      pos.y += (mouse.y - pos.y) * dt
      
      xSet(pos.x)
      ySet(pos.y)

      // Pause ticker if mouse has been stationary/idle for > 500ms and cursor reached target position
      const now = performance.now()
      const distSq = (mouse.x - pos.x) ** 2 + (mouse.y - pos.y) ** 2
      if (now - lastMouseMoveTime > 500 && distSq < 0.01) {
        xSet(mouse.x)
        ySet(mouse.y)
        stopTicker()
      }
    }

    startTicker()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      stopTicker()
    }
  }, [])

  return (
    <div
      ref={cursor}
      className="pointer-events-none fixed left-0 top-0 z-[99999] rounded-full bg-white mix-blend-difference"
      style={{
        transform: 'translate(-50%, -50%)',
        width: 12,
        height: 12,
      }}
    />
  )
}
