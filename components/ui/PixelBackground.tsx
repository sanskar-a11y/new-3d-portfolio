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

    // Authentic Yuta Abe grid parameters
    const gap = 26              // 26px grid spacing
    const dotSize = 2.5         // 2.5px square box pixels
    const maxRepelDist = 130    // Mouse repulsion magnetic radius
    const maxRepelDistSq = maxRepelDist * maxRepelDist
    const pushForce = 22        // Max displacement distance

    interface GridPoint {
      baseX: number
      baseY: number
      x: number
      y: number
      vx: number
      vy: number
      baseOpacity: number
      currentOpacity: number
    }

    let gridPoints: GridPoint[] = []

    const initGrid = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      gridPoints = []
      const cols = Math.ceil(width / gap) + 1
      const rows = Math.ceil(height / gap) + 1

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = c * gap + 13
          const by = r * gap + 13
          gridPoints.push({
            baseX: bx,
            baseY: by,
            x: bx,
            y: by,
            vx: 0,
            vy: 0,
            baseOpacity: 0.12,
            currentOpacity: 0.12,
          })
        }
      }
    }

    initGrid()

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX
      mouseRef.current.targetY = e.clientY
    }

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -1000
      mouseRef.current.targetY = -1000
    }

    window.addEventListener('resize', initGrid)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    const render = () => {
      // Smooth lerp mouse tracking
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.18
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.18

      ctx.clearRect(0, 0, width, height)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < gridPoints.length; i++) {
        const pt = gridPoints[i]

        // 1. Calculate vector from mouse to grid point
        const dx = pt.x - mx
        const dy = pt.y - my
        const distSq = dx * dx + dy * dy

        let repelX = 0
        let repelY = 0
        let targetOpacity = pt.baseOpacity

        if (distSq < maxRepelDistSq && distSq > 0.001) {
          const dist = Math.sqrt(distSq)
          const normX = dx / dist
          const normY = dy / dist

          // Repulsion factor (1.0 at center, 0.0 at radius edge)
          const factor = 1 - dist / maxRepelDist
          const force = Math.pow(factor, 1.5) * pushForce

          repelX = normX * force
          repelY = normY * force

          // Vanish completely under core cursor center, brighten slightly at outer rim
          targetOpacity = pt.baseOpacity * (1 - Math.pow(factor, 0.8))
        }

        // Target position with mouse repulsion added
        const targetX = pt.baseX + repelX
        const targetY = pt.baseY + repelY

        // 2. Spring elasticity physics returning points to base positions
        const ax = (targetX - pt.x) * 0.22
        const ay = (targetY - pt.y) * 0.22

        pt.vx = (pt.vx + ax) * 0.72
        pt.vy = (pt.vy + ay) * 0.72

        pt.x += pt.vx
        pt.y += pt.vy

        // Smooth lerp opacity
        pt.currentOpacity += (targetOpacity - pt.currentOpacity) * 0.15

        if (pt.currentOpacity > 0.005) {
          ctx.fillStyle = `rgba(255, 255, 255, ${pt.currentOpacity})`
          // Draw Yuta Abe signature square box pixel
          ctx.fillRect(Math.round(pt.x - dotSize / 2), Math.round(pt.y - dotSize / 2), dotSize, dotSize)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', initGrid)
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
