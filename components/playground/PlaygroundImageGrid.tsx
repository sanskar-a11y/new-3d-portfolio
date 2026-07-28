'use client'

import React, { useRef, useEffect, useMemo, useCallback } from 'react'
import type { SketchDef } from './sketches'

interface PlaygroundImageGridProps {
  sketches: SketchDef[]
  isDark: boolean
  onSelectSketch: (sketch: SketchDef) => void
}

export function PlaygroundImageGrid({
  sketches,
  isDark,
  onSelectSketch,
}: PlaygroundImageGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const set0Ref = useRef<HTMLDivElement>(null)
  const set1Ref = useRef<HTMLDivElement>(null)
  const colSet0Ref = useRef<HTMLDivElement>(null)
  const colSet1Ref = useRef<HTMLDivElement>(null)

  // Physics state refs (to avoid React re-render lag during pan/scroll)
  const current = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const totalDragDistance = useRef(0)

  // Split sketches into 6 columns for staggered masonry layout
  const columns = useMemo(() => {
    const cols: SketchDef[][] = [[], [], [], [], [], []]
    sketches.forEach((sketch, idx) => {
      cols[idx % 6].push(sketch)
    })
    return cols
  }, [sketches])

  // Wheel scroll handler with preventDefault
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const deltaX = e.deltaX || (e.shiftKey ? e.deltaY : 0)
      const deltaY = e.shiftKey ? 0 : e.deltaY

      target.current.x -= deltaX * 0.8
      target.current.y -= deltaY * 0.8
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  // Window pointer event listeners for robust drag tracking
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      const dx = e.clientX - lastMouse.current.x
      const dy = e.clientY - lastMouse.current.y
      totalDragDistance.current += Math.hypot(dx, dy)

      target.current.x += dx
      target.current.y += dy
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }

    const handlePointerUp = () => {
      isDragging.current = false
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [])

  // Animation frame loop for smooth lerp & infinite modulo wrapping
  useEffect(() => {
    let animationFrameId: number

    const update = () => {
      let tileW = 0
      if (set0Ref.current && set1Ref.current) {
        tileW = set1Ref.current.offsetLeft - set0Ref.current.offsetLeft
      }

      let tileH = 0
      if (colSet0Ref.current && colSet1Ref.current) {
        tileH = colSet1Ref.current.offsetTop - colSet0Ref.current.offsetTop
      }

      if (tileW > 0) {
        if (current.current.x > tileW / 2) {
          current.current.x -= tileW
          target.current.x -= tileW
        } else if (current.current.x < -tileW / 2) {
          current.current.x += tileW
          target.current.x += tileW
        }
      }
      if (tileH > 0) {
        if (current.current.y > tileH / 2) {
          current.current.y -= tileH
          target.current.y -= tileH
        } else if (current.current.y < -tileH / 2) {
          current.current.y += tileH
          target.current.y += tileH
        }
      }

      // Smooth lerp (factor 0.09)
      current.current.x += (target.current.x - current.current.x) * 0.09
      current.current.y += (target.current.y - current.current.y) * 0.09

      if (gridRef.current) {
        gridRef.current.style.transform = `translate3d(${current.current.x.toFixed(2)}px, ${current.current.y.toFixed(2)}px, 0px)`
      }

      animationFrameId = requestAnimationFrame(update)
    }

    animationFrameId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
    totalDragDistance.current = 0
  }, [])

  const handleCardClick = useCallback(
    (sketch: SketchDef) => {
      // Check if user was dragging vs clicking
      if (totalDragDistance.current < 5) {
        onSelectSketch(sketch)
      }
    },
    [onSelectSketch]
  )

  const cardBgStyle = isDark
    ? 'bg-[#000000] border-[#30b8ff]/40 shadow-[0_0_25px_rgba(48,184,255,0.15)] group-hover:shadow-[0_0_40px_rgba(48,184,255,0.4)]'
    : 'bg-[#121212] border-white/10 group-hover:border-white/30 group-hover:shadow-2xl'

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-screen h-dvh overflow-hidden cursor-grab active:cursor-grabbing select-none ${
        isDark ? 'bg-[#000000]' : 'bg-[#080808]'
      } transition-colors duration-500`}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
    >
      {/* Center anchor point */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Moving canvas grid */}
        <div
          ref={gridRef}
          className="flex gap-6 sm:gap-10 md:gap-14 w-max p-12 sm:p-20 md:p-32 will-change-transform"
          style={{ transform: 'translate3d(0px, 0px, 0px)' }}
        >
          {[0, 1, 2].map((setIdx) => (
            <div
              key={setIdx}
              ref={setIdx === 0 ? set0Ref : setIdx === 1 ? set1Ref : undefined}
              className="flex gap-6 sm:gap-10 md:gap-14 shrink-0"
            >
              {columns.map((colSketches, colIdx) => (
                <div
                  key={`${setIdx}-${colIdx}`}
                  className={`flex flex-col gap-6 sm:gap-10 md:gap-14 w-[300px] sm:w-[420px] md:w-[520px] lg:w-[600px] ${
                    colIdx % 2 === 1 ? 'pt-16 sm:pt-28 md:pt-40' : ''
                  }`}
                >
                  {[0, 1, 2].map((vSetIdx) => (
                    <div
                      key={vSetIdx}
                      ref={
                        setIdx === 0 && colIdx === 0 && vSetIdx === 0
                          ? colSet0Ref
                          : setIdx === 0 && colIdx === 0 && vSetIdx === 1
                          ? colSet1Ref
                          : undefined
                      }
                      className="flex flex-col gap-6 sm:gap-10 md:gap-14 shrink-0"
                    >
                      {colSketches.map((sketch) => {
                        // All cards uniform 16:9
                        const aspectClass = 'aspect-[16/9]'

                        return (
                          <div
                            key={`${setIdx}-${colIdx}-${vSetIdx}-${sketch.id}`}
                            onClick={() => handleCardClick(sketch)}
                            className={`border rounded-lg overflow-hidden group relative transition-all duration-500 cursor-pointer ${aspectClass} ${cardBgStyle}`}
                          >
                            <img
                              src={sketch.image}
                              alt={sketch.title}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.src = `https://picsum.photos/seed/fallback_${sketch.id}/800/450`
                              }}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter contrast-110 bg-[#121212]"
                            />

                            {/* Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 sm:p-8 flex flex-col justify-end pointer-events-none">
                              {/* Top right badge */}
                              <div className="absolute top-6 right-6 sm:top-8 sm:right-8 text-xs text-white/60 font-mono border border-white/20 px-2.5 py-1 rounded-full w-fit backdrop-blur-sm bg-black/40">
                                #{sketch.id}
                              </div>

                              {/* Bottom left info */}
                              <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                <div className="text-xs text-[#30b8ff] font-mono tracking-widest uppercase mb-1.5 font-bold">
                                  {sketch.tech}
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold font-sans text-white uppercase tracking-wider leading-tight">
                                  {sketch.title}
                                </h3>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
