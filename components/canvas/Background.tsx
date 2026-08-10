'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'

export function Background({ children, frameloop = 'always' }: { children?: React.ReactNode; frameloop?: 'always' | 'demand' | 'never' }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="w-full h-full">
      <Canvas 
        dpr={[1, 1.5]} 
        frameloop={frameloop}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }} 
        camera={{ position: [0, 0, 5], fov: 50 }}
        eventSource={typeof document !== 'undefined' ? document.body : undefined}
        eventPrefix="client"
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  )
}

