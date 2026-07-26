'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'

export function Background({ children }: { children?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {/* Dark background base */}
      <div className="fixed inset-0 z-[-1] bg-[#050505]" />

      {/* 3D Canvas layered between non-hovered content (z-10) and hovered content (z-40) */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        <Canvas 
          dpr={[1, 2]} 
          gl={{ antialias: true, powerPreference: 'default', alpha: true }} 
          camera={{ position: [0, 0, 5], fov: 50 }}
          eventSource={mounted ? document.body : undefined}
          eventPrefix="client"
        >
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </Canvas>
      </div>
    </>
  )
}
