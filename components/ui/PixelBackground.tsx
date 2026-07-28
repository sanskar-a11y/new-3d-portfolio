'use client'

import { useEffect, useRef } from 'react'

export function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0

    // Configuration parameters
    const virtualBlockSize = 36 // Grid cell size in px
    const blockFillProbability = 0.6 // Exactly 6 out of 10 blocks contain a pixel (0.6 density)
    const maxRepelDist = 140 // Mouse hover interaction radius in px
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
          // Exactly 60% probability (6 out of 10 blocks contain a pixel)
          if (Math.random() < blockFillProbability) {
            // Random position within the virtual block to ensure organic, non-pattern layout
            const baseX = c * virtualBlockSize + Math.random() * virtualBlockSize
            const baseY = r * virtualBlockSize + Math.random() * virtualBlockSize

            // Random size between 2.5 and 3.0 px (crisp box shape)
            const size = 2.5 + Math.random() * 0.5

            // Base transparency around 0.16 to 0.26
            const baseOpacity = 0.16 + Math.random() * 0.10

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
      // Smooth lerp mouse tracking
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.18
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.18

      ctx.clearRect(0, 0, width, height)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i]

        // Calculate distance from mouse to resting anchor coordinate
        const dx = pt.baseX - mx
        const dy = pt.baseY - my
        const distSq = dx * dx + dy * dy

        let targetX = pt.baseX
        let targetY = pt.baseY
        let targetOpacity = pt.baseOpacity

        // Mouse hover interaction (vanishing + gentle push away)
        if (distSq < maxRepelDistSq && distSq > 0.001) {
          const dist = Math.sqrt(distSq)
          const normX = dx / dist
          const normY = dy / dist
          const factor = 1 - dist / maxRepelDist // 1.0 at center, 0.0 at radius edge

          // Smoothly drop opacity to 0 when near cursor (vanishing effect)
          targetOpacity = pt.baseOpacity * Math.max(0, 1 - Math.pow(factor, 0.6) * 1.5)

          // Gently repel particle away from cursor
          const repelForce = Math.pow(factor, 1.5) * 22
          targetX = pt.baseX + normX * repelForce
          targetY = pt.baseY + normY * repelForce
        }

        // Spring physics (Hooke's law) back to anchor target position
        const ax = (targetX - pt.x) * 0.18
        const ay = (targetY - pt.y) * 0.18
        pt.vx = (pt.vx + ax) * 0.72
        pt.vy = (pt.vy + ay) * 0.72
        pt.x += pt.vx
        pt.y += pt.vy

        // Smooth lerp for opacity transitions
        pt.currentOpacity += (targetOpacity - pt.currentOpacity) * 0.15

        // Render crisp box shape (square pixel)
        if (pt.currentOpacity > 0.005) {
          ctx.fillStyle = `rgba(255, 255, 255, ${pt.currentOpacity})`
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

    render()

    return () => {
      window.removeEventListener('resize', initParticles)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
    />
  )
}

