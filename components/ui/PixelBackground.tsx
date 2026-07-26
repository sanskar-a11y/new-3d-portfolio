'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

interface PixelCluster {
  id: number
  top: string
  left: string
  pixels: { id: number; baseOpacity: number }[]
}

export function PixelBackground() {
  const [hoveredClusterId, setHoveredClusterId] = useState<number | null>(null)

  // Generate 10 fixed block clusters distributed across the viewport
  const clusters: PixelCluster[] = useMemo(() => {
    const positions = [
      { top: '12%', left: '7%' },
      { top: '18%', left: '84%' },
      { top: '32%', left: '14%' },
      { top: '38%', left: '88%' },
      { top: '54%', left: '5%' },
      { top: '64%', left: '82%' },
      { top: '75%', left: '10%' },
      { top: '85%', left: '86%' },
      { top: '26%', left: '48%' },
      { top: '72%', left: '52%' },
    ]

    return positions.map((pos, clusterIdx) => ({
      id: clusterIdx,
      top: pos.top,
      left: pos.left,
      // Exactly 6 box-shaped pixels per cluster
      pixels: Array.from({ length: 6 }, (_, pIdx) => ({
        id: pIdx,
        baseOpacity: 0.12 + (pIdx % 3) * 0.05,
      })),
    }))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-15 overflow-hidden select-none">
      {clusters.map((cluster) => {
        const isHovered = hoveredClusterId === cluster.id

        return (
          <div
            key={cluster.id}
            style={{ top: cluster.top, left: cluster.left }}
            className="absolute pointer-events-auto p-4 cursor-pointer group"
            onMouseEnter={() => setHoveredClusterId(cluster.id)}
            onMouseLeave={() => setHoveredClusterId(null)}
          >
            {/* 10 Blocks containing 6 Box-Shaped Pixels in a 3x2 Grid */}
            <div className="grid grid-cols-3 gap-1.5 p-2 rounded-md transition-colors duration-300">
              {cluster.pixels.map((pixel) => (
                <motion.div
                  key={pixel.id}
                  animate={{
                    opacity: isHovered ? 0 : pixel.baseOpacity,
                    scale: isHovered ? 0.3 : 1,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="w-3.5 h-3.5 bg-white border border-white/20 rounded-none shadow-[0_0_6px_rgba(255,255,255,0.15)]"
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
