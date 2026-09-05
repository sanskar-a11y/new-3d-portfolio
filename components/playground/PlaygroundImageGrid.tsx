'use client'

import React from 'react'
import type { SketchDef } from './sketches'
import { PlaygroundCanvas } from './PlaygroundCanvas'

export interface PlaygroundImageGridProps {
  sketches: SketchDef[]
  isDark: boolean
  onSelectSketch: (sketch: SketchDef) => void
}

/**
 * @deprecated Superseded by `PlaygroundCanvas` which renders a high-performance
 * WebGL procedural mosaic canvas with 7 GLSL kinetic shader transitions, 2D momentum
 * drift physics, and toroidal coordinate wrapping matching https://yutaabe.com/playground/.
 *
 * Retained for backwards compatibility.
 */
export function PlaygroundImageGrid({
  sketches,
  isDark,
  onSelectSketch,
}: PlaygroundImageGridProps) {
  return (
    <PlaygroundCanvas
      sketches={sketches}
      isDark={isDark}
      onSelectSketch={onSelectSketch}
    />
  )
}
