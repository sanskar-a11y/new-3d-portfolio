'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import './playground.css'
import { SKETCH_CATALOG, type SketchDef } from '@/components/playground/sketches'

const PlaygroundCanvas = dynamic(
  () => import('@/components/playground/PlaygroundCanvas').then((mod) => mod.PlaygroundCanvas),
  { ssr: false }
)

const PlaygroundHUD = dynamic(
  () => import('@/components/playground/PlaygroundHUD').then((mod) => mod.PlaygroundHUD),
  { ssr: false }
)

const LightsOut = dynamic(
  () => import('@/components/playground/LightsOut').then((mod) => mod.LightsOut),
  { ssr: false }
)

const SketchLightbox = dynamic(
  () => import('@/components/playground/SketchLightbox').then((mod) => mod.SketchLightbox),
  { ssr: false }
)

export function PlaygroundClient() {
  const [lightsOut, setLightsOut] = useState(false)
  const [switchCount, setSwitchCount] = useState(0)
  const [selectedSketch, setSelectedSketch] = useState<SketchDef | null>(null)

  const handleToggleLights = useCallback(() => {
    setLightsOut((prev) => !prev)
    setSwitchCount((prev) => prev + 1)
  }, [])

  const handleSwitch = useCallback(() => {
    setSwitchCount((prev) => prev + 1)
  }, [])

  const handleSelectSketch = useCallback((sketch: SketchDef) => {
    setSelectedSketch(sketch)
  }, [])

  const handleCloseLightbox = useCallback(() => {
    setSelectedSketch(null)
  }, [])

  // Add body class for playground-specific styles
  useEffect(() => {
    document.body.classList.add('playground-page')
    return () => {
      document.body.classList.remove('playground-page')
    }
  }, [])

  return (
    <main
      className={`relative h-dvh w-screen overflow-hidden transition-colors duration-700 ${
        lightsOut ? 'bg-[#000000]' : 'bg-[#080808]'
      }`}
    >
      {/* Background WebGL Procedural Mosaic Canvas with 7 GLSL Shaders & 2D Momentum Physics */}
      <PlaygroundCanvas
        sketches={SKETCH_CATALOG}
        isDark={lightsOut}
        isModalOpen={!!selectedSketch}
        selectedSketch={selectedSketch}
        onSelectSketch={handleSelectSketch}
        onSwitch={handleSwitch}
      />

      {/* Synchronized 4-Corner HUD Overlay */}
      <PlaygroundHUD
        cellCount={SKETCH_CATALOG.length}
        switchCount={switchCount}
        lightsOut={lightsOut}
        onToggleLights={handleToggleLights}
        activeTitle={selectedSketch?.title}
      />

      {/* LightsOut Shift Reaction Mini-Game */}
      <LightsOut
        lightsOut={lightsOut}
        onToggleLights={handleToggleLights}
        onSwitch={handleSwitch}
      />

      {/* Sketch Details Lightbox Modal */}
      <SketchLightbox
        sketch={selectedSketch}
        onClose={handleCloseLightbox}
        isDark={lightsOut}
      />
    </main>
  )
}
