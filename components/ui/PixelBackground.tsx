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

    // Grid config matching Yuta Abe signature pixel grid
    const pixelSize = 3        // 3px x 3px square box pixels
    const gap = 28             // 28px grid spacing
    const radius = 110         // Vanish radius around cursor
    const radiusSq = radius * radius

    interface Pixel {
      x: number
      y: number
      currentOpacity: number
      baseOpacity: number
    }

    let pixels: Pixel[] = []

    const initGrid = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      pixels = []
      const cols = Math.ceil(width / gap) + 1
      const rows = Math.ceil(height / gap) + 1

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          pixels.push({
            x: c * gap + 14,
            y: r * gap + 14,
            currentOpacity: 0.14,
            baseOpacity: 0.14,
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
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.15
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.15

      ctx.clearRect(0, 0, width, height)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < pixels.length; i++) {
        const p = pixels[i]
        const dx = p.x - mx
        const dy = p.y - my
        const distSq = dx * dx + dy * dy

        // Calculate target opacity based on distance to cursor
        let targetOpacity = p.baseOpacity
        if (distSq < radiusSq) {
          const factor = Math.sqrt(distSq) / radius
          targetOpacity = p.baseOpacity * Math.pow(factor, 2) // Smooth curve vanish
        }

        // Lerp opacity change for organic fade-out and fade-in
        p.currentOpacity += (targetOpacity - p.currentOpacity) * 0.12

        if (p.currentOpacity > 0.005) {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.currentOpacity})`
          // Draw crisp square box pixel
          ctx.fillRect(p.x - pixelSize / 2, p.y - pixelSize / 2, pixelSize, pixelSize)
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
