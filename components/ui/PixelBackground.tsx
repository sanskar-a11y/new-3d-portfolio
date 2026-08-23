'use client'

import { useEffect, useRef } from 'react'

// Pre-allocated RGBA color string lookup table (256 discrete opacity slots)
// Completely eliminates template string allocations inside the 60fps render loop
const COLOR_LOOKUP: string[] = new Array(256)
for (let i = 0; i < 256; i++) {
  COLOR_LOOKUP[i] = `rgba(255, 255, 255, ${(i / 255).toFixed(3)})`
}

export function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId = 0
    let isRunning = false
    let isIntersecting = true
    let width = 0
    let height = 0

    // Configuration parameters
    const virtualBlockSize = 20 // Dense grid cell size in px (3.5x higher particle count)
    const blockFillProbability = 0.85 // High density particle distribution
    const maxRepelDist = 150 // Mouse hover interaction radius in px
    const maxRepelDistSq = maxRepelDist * maxRepelDist

    interface Particle {
      x: number
      y: number
      baseX: number
      baseY: number
      vx: number
      vy: number
      size: number
      baseOpacity: number
      currentOpacity: number
      phaseX: number
      phaseY: number
      speedX: number
      speedY: number
      ampX: number
      ampY: number
      pulseSpeed: number
      pulsePhase: number
    }

    let particles: Particle[] = []

    const initParticles = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      particles = []
      const cols = Math.ceil(width / virtualBlockSize) + 1
      const rows = Math.ceil(height / virtualBlockSize) + 1

      // Populate particles using virtual cell division with random jitter
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() < blockFillProbability) {
            const baseX = c * virtualBlockSize + Math.random() * virtualBlockSize
            const baseY = r * virtualBlockSize + Math.random() * virtualBlockSize
            const size = 1.4 + Math.random() * 1.8
            const baseOpacity = 0.15 + Math.random() * 0.28

            particles.push({
              x: baseX,
              y: baseY,
              baseX,
              baseY,
              vx: 0,
              vy: 0,
              size,
              baseOpacity,
              currentOpacity: baseOpacity,
              phaseX: Math.random() * Math.PI * 2,
              phaseY: Math.random() * Math.PI * 2,
              speedX: 0.4 + Math.random() * 0.8,
              speedY: 0.4 + Math.random() * 0.8,
              ampX: 12 + Math.random() * 18,
              ampY: 12 + Math.random() * 18,
              pulseSpeed: 0.8 + Math.random() * 1.5,
              pulsePhase: Math.random() * Math.PI * 2,
            })
          }
        }
      }
    }

    initParticles()

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX
      mouseRef.current.targetY = e.clientY
    }

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -1000
      mouseRef.current.targetY = -1000
    }

    window.addEventListener('resize', initParticles)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    const render = () => {
      if (!isRunning || document.hidden || !isIntersecting) {
        isRunning = false
        return
      }

      const time = performance.now() * 0.001

      // Smooth lerp mouse tracking
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.18
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.18

      ctx.clearRect(0, 0, width, height)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i]

        // Continuous organic floating & wave drift
        const driftX = Math.sin(time * pt.speedX + pt.phaseX) * pt.ampX + Math.cos(time * pt.speedY * 0.7 + pt.phaseY) * (pt.ampX * 0.4)
        const driftY = Math.cos(time * pt.speedY + pt.phaseY) * pt.ampY + Math.sin(time * pt.speedX * 0.7 + pt.phaseX) * (pt.ampY * 0.4)

        const anchorX = pt.baseX + driftX
        const anchorY = pt.baseY + driftY

        // Calculate distance from mouse to dynamic anchor coordinate
        const dx = anchorX - mx
        const dy = anchorY - my
        const distSq = dx * dx + dy * dy

        let targetX = anchorX
        let targetY = anchorY

        // Dynamic twinkling opacity pulsation
        const twinkle = 0.7 + 0.35 * Math.sin(time * pt.pulseSpeed + pt.pulsePhase)
        let targetOpacity = pt.baseOpacity * twinkle

        // Mouse hover interaction (vanishing + gentle push away)
        if (distSq < maxRepelDistSq && distSq > 0.001) {
          const dist = Math.sqrt(distSq)
          const normX = dx / dist
          const normY = dy / dist
          const factor = 1 - dist / maxRepelDist // 1.0 at center, 0.0 at radius edge

          // Smoothly drop opacity to 0 when near cursor (vanishing effect)
          targetOpacity = targetOpacity * Math.max(0, 1 - Math.pow(factor, 0.6) * 1.5)

          // Gently repel particle away from cursor
          const repelForce = Math.pow(factor, 1.5) * 28
          targetX = anchorX + normX * repelForce
          targetY = anchorY + normY * repelForce
        }

        // Spring physics back to target anchor position
        const ax = (targetX - pt.x) * 0.16
        const ay = (targetY - pt.y) * 0.16
        pt.vx = (pt.vx + ax) * 0.74
        pt.vy = (pt.vy + ay) * 0.74
        pt.x += pt.vx
        pt.y += pt.vy

        // Smooth lerp for opacity transitions
        pt.currentOpacity += (targetOpacity - pt.currentOpacity) * 0.15

        // Render crisp box shape using pre-allocated lookup table
        if (pt.currentOpacity > 0.005) {
          const alphaIdx = Math.min(255, Math.max(0, Math.floor(pt.currentOpacity * 255)))
          ctx.fillStyle = COLOR_LOOKUP[alphaIdx]
          ctx.fillRect(
            Math.round(pt.x - pt.size / 2),
            Math.round(pt.y - pt.size / 2),
            pt.size,
            pt.size
          )
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    const startLoop = () => {
      if (!isRunning && !document.hidden && isIntersecting) {
        isRunning = true
        animationFrameId = requestAnimationFrame(render)
      }
    }

    const stopLoop = () => {
      isRunning = false
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = 0
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop()
      } else {
        startLoop()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    let observer: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        const entry = entries[0]
        if (entry) {
          isIntersecting = entry.isIntersecting
          if (!isIntersecting) {
            stopLoop()
          } else {
            startLoop()
          }
        }
      })
      observer.observe(canvas)
    }

    startLoop()

    return () => {
      window.removeEventListener('resize', initParticles)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      observer?.disconnect()
      stopLoop()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
    />
  )
}
