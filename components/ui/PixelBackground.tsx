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

    const radius = 130 // Vanish radius around cursor
    const radiusSq = radius * radius

    interface FloatingPixel {
      x: number
      y: number
      size: number
      vx: number
      vy: number
      baseOpacity: number
      currentOpacity: number
    }

    let pixels: FloatingPixel[] = []

    const initPixels = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      pixels = []
      // Generate randomly scattered pixel boxes (no rigid grid pattern)
      const count = Math.floor((width * height) / 3600)

      for (let i = 0; i < count; i++) {
        pixels.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() < 0.65 ? 3 : 4, // 3px or 4px square pixel box
          vx: (Math.random() - 0.5) * 0.4,   // Real-time drifting velocity X
          vy: (Math.random() - 0.5) * 0.4,   // Real-time drifting velocity Y
          baseOpacity: 0.08 + Math.random() * 0.14,
          currentOpacity: 0.12,
        })
      }
    }

    initPixels()

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX
      mouseRef.current.targetY = e.clientY
    }

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -1000
      mouseRef.current.targetY = -1000
    }

    window.addEventListener('resize', initPixels)
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

        // Dynamic position shifting across screen (no static pattern!)
        p.x += p.vx
        p.y += p.vy

        // Wrap around screen edges
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // Distance check to cursor for dynamic vanishing
        const dx = p.x - mx
        const dy = p.y - my
        const distSq = dx * dx + dy * dy

        let targetOpacity = p.baseOpacity
        if (distSq < radiusSq) {
          const factor = Math.sqrt(distSq) / radius
          targetOpacity = p.baseOpacity * Math.pow(factor, 2)
        }

        p.currentOpacity += (targetOpacity - p.currentOpacity) * 0.12

        if (p.currentOpacity > 0.005) {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.currentOpacity})`
          // Draw crisp square box pixel
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', initPixels)
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
