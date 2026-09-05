'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import type { SketchDef } from '@/components/playground/sketches'
import { generateMosaicLayout, type MosaicCell } from '@/lib/playground/mosaicLayout'
import { createMomentumPhysics, type MomentumController } from '@/lib/playground/momentumPhysics'
import { createTileShaderMaterial } from '@/components/playground/shaders/tileShader'

export interface PlaygroundCanvasProps {
  sketches: SketchDef[]
  isDark?: boolean
  isModalOpen?: boolean
  selectedSketch?: SketchDef | null
  onSelectSketch: (sketch: SketchDef) => void
  onSwitch?: () => void
}

interface CellInternal {
  cell: MosaicCell
  geometry: THREE.PlaneGeometry
  material: THREE.ShaderMaterial
  masterMesh: THREE.Mesh
  replicaMeshes: THREE.Mesh[]
  textureA: THREE.Texture | null
  textureB: THREE.Texture | null
  hoverValue: number
  hoverTime: number
  isTransitioning: boolean
  transitionProgress: number
  transitionSpeed: number
  transType: number
  fadeTarget: number
  fadeCurrent: number
}

export function PlaygroundCanvas({
  sketches,
  isDark = false,
  isModalOpen = false,
  selectedSketch = null,
  onSelectSketch,
  onSwitch,
}: PlaygroundCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Stable callback & prop refs for RAF loop
  const onSelectSketchRef = useRef(onSelectSketch)
  const onSwitchRef = useRef(onSwitch)
  const isDarkRef = useRef(isDark)
  const isModalOpenRef = useRef(isModalOpen)
  const selectedSketchRef = useRef(selectedSketch)

  useEffect(() => {
    onSelectSketchRef.current = onSelectSketch
    onSwitchRef.current = onSwitch
    isDarkRef.current = isDark
    isModalOpenRef.current = isModalOpen
    selectedSketchRef.current = selectedSketch
  }, [onSelectSketch, onSwitch, isDark, isModalOpen, selectedSketch])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas || sketches.length === 0) return

    let width = container.clientWidth || window.innerWidth
    let height = container.clientHeight || window.innerHeight

    // 1. WebGL Renderer with dynamic DPR clamping
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)

    // 2. Orthographic Camera matching window pixel dimensions
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      1000
    )
    camera.position.set(0, 0, 10)
    camera.lookAt(0, 0, 0)

    const scene = new THREE.Scene()
    const gridGroup = new THREE.Group()
    scene.add(gridGroup)

    // 3. Texture Loader & Texture Cache
    const textureLoader = new THREE.TextureLoader()
    const textureCache = new Map<string, THREE.Texture>()

    const loadTexture = (url: string, onLoaded?: (tex: THREE.Texture) => void): THREE.Texture => {
      const cached = textureCache.get(url)
      if (cached) {
        if (onLoaded) onLoaded(cached)
        return cached
      }
      const tex = textureLoader.load(url, (loadedTex) => {
        loadedTex.minFilter = THREE.LinearMipmapLinearFilter
        loadedTex.magFilter = THREE.LinearFilter
        loadedTex.generateMipmaps = true
        loadedTex.needsUpdate = true
        if (onLoaded) onLoaded(loadedTex)
      })
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.magFilter = THREE.LinearFilter
      textureCache.set(url, tex)
      return tex
    }

    // Preload textures for sketches
    sketches.forEach((sketch) => {
      loadTexture(sketch.image)
    })

    // 4. Generate Mosaic Layout & Instantiate 3x3 Toroidal Mesh Grid
    let layout = generateMosaicLayout(width, height, sketches)
    let packW = layout.packWidth
    let packH = layout.packHeight

    // Track cells and mesh-to-cell lookup
    let cellInternals: CellInternal[] = []
    const meshMap = new Map<THREE.Mesh, CellInternal>()
    const raycastMeshes: THREE.Mesh[] = []

    const buildGrid = (newLayout: typeof layout) => {
      // Clean up previous meshes
      cellInternals.forEach((ci) => {
        ci.geometry.dispose()
        ci.material.dispose()
      })
      while (gridGroup.children.length > 0) {
        gridGroup.remove(gridGroup.children[0])
      }
      meshMap.clear()
      raycastMeshes.length = 0

      layout = newLayout
      packW = layout.packWidth
      packH = layout.packHeight

      cellInternals = layout.cells.map((cell) => {
        const geometry = new THREE.PlaneGeometry(cell.width, cell.height)
        const initialTex = textureCache.get(cell.sketch.image) || null

        const material = createTileShaderMaterial({
          width: cell.width,
          height: cell.height,
          uRepeatA: cell.uRepeat,
          uOffsetA: cell.uOffset,
          textureA: initialTex,
        })

        if (!initialTex) {
          loadTexture(cell.sketch.image, (loadedTex) => {
            material.uniforms.uTexA.value = loadedTex
            material.uniforms.uHasA.value = true
            material.uniformsNeedUpdate = true
          })
        }

        // Master mesh at centered (x, y)
        const masterMesh = new THREE.Mesh(geometry, material)
        masterMesh.position.set(cell.x, cell.y, 0)
        gridGroup.add(masterMesh)

        // 8 spatial replicas across 3x3 grid
        const replicaMeshes: THREE.Mesh[] = []
        for (let rx = -1; rx <= 1; rx++) {
          for (let ry = -1; ry <= 1; ry++) {
            if (rx === 0 && ry === 0) continue
            const replica = new THREE.Mesh(geometry, material)
            replica.position.set(
              cell.x + rx * packW,
              cell.y + ry * packH,
              0
            )
            gridGroup.add(replica)
            replicaMeshes.push(replica)
          }
        }

        const internal: CellInternal = {
          cell,
          geometry,
          material,
          masterMesh,
          replicaMeshes,
          textureA: initialTex,
          textureB: null,
          hoverValue: 0,
          hoverTime: 0,
          isTransitioning: false,
          transitionProgress: 0,
          transitionSpeed: 0.8,
          transType: 0,
          fadeTarget: 1.0,
          fadeCurrent: 1.0,
        }

        meshMap.set(masterMesh, internal)
        raycastMeshes.push(masterMesh)
        replicaMeshes.forEach((rep) => {
          meshMap.set(rep, internal)
          raycastMeshes.push(rep)
        })

        return internal
      })
    }

    buildGrid(layout)

    // 5. Momentum Physics
    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0
    const physics: MomentumController = createMomentumPhysics({
      packWidth: packW,
      packHeight: packH,
      isTouch: isTouchDevice,
      autoDrift: true,
    })

    // 6. Raycasting & Mouse state
    const raycaster = new THREE.Raycaster()
    const mouseNdc = new THREE.Vector2(-999, -999)
    let hoveredInternal: CellInternal | null = null

    const handlePointerDown = (e: PointerEvent) => {
      physics.onPointerDown(e.clientX, e.clientY)
      document.body.classList.add('is-dragging')
    }

    const handlePointerMove = (e: PointerEvent) => {
      physics.onPointerMove(e.clientX, e.clientY)
      mouseNdc.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseNdc.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    const handlePointerUp = (e: PointerEvent) => {
      document.body.classList.remove('is-dragging')
      const { wasClick } = physics.onPointerUp(e.clientX, e.clientY)

      if (wasClick) {
        // Execute Raycast to select sketch
        mouseNdc.x = (e.clientX / window.innerWidth) * 2 - 1
        mouseNdc.y = -(e.clientY / window.innerHeight) * 2 + 1
        raycaster.setFromCamera(mouseNdc, camera)
        const intersects = raycaster.intersectObjects(raycastMeshes)

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh
          const hitInternal = meshMap.get(hitMesh)
          if (hitInternal) {
            onSelectSketchRef.current(hitInternal.cell.sketch)
          }
        }
      }
    }

    const handlePointerCancel = () => {
      document.body.classList.remove('is-dragging')
      physics.onPointerCancel()
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      physics.onWheel(e.deltaX, e.deltaY, e.shiftKey)
    }

    container.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)
    container.addEventListener('wheel', handleWheel, { passive: false })

    // 7. Periodic Random Kinetic Shader Transitions
    let nextTransitionTimer = 2.0
    const triggerRandomTransition = () => {
      if (cellInternals.length === 0 || isModalOpenRef.current) return

      // Find an idle cell
      const idleCells = cellInternals.filter((ci) => !ci.isTransitioning)
      if (idleCells.length === 0) return

      const cellToTransition =
        idleCells[Math.floor(Math.random() * idleCells.length)]

      // Pick a random destination sketch different from current
      const candidateSketches = sketches.filter(
        (s) => s.image !== cellToTransition.cell.sketch.image
      )
      const nextSketch =
        candidateSketches[Math.floor(Math.random() * candidateSketches.length)] ||
        sketches[0]

      const texB = loadTexture(nextSketch.image, (loadedTex) => {
        if (cellToTransition.material.uniforms.uTexB) {
          cellToTransition.material.uniforms.uTexB.value = loadedTex
          cellToTransition.material.uniforms.uHasB.value = true
        }
      })

      // Update uniforms for Transition B
      cellToTransition.textureB = texB
      cellToTransition.material.uniforms.uTexB.value = texB
      cellToTransition.material.uniforms.uHasB.value = true
      cellToTransition.transType = Math.floor(Math.random() * 7) // Modes 0 to 6
      cellToTransition.material.uniforms.uTransType.value =
        cellToTransition.transType
      cellToTransition.transitionProgress = 0.0
      cellToTransition.transitionSpeed = 0.6 + Math.random() * 0.4
      cellToTransition.isTransitioning = true

      // Update sketch definition on cell
      cellToTransition.cell.sketch = nextSketch
    }

    // 8. Window Resize Handler
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        width = container.clientWidth || window.innerWidth
        height = container.clientHeight || window.innerHeight

        camera.left = -width / 2
        camera.right = width / 2
        camera.top = height / 2
        camera.bottom = -height / 2
        camera.updateProjectionMatrix()

        renderer.setSize(width, height)
        const newLayout = generateMosaicLayout(width, height, sketches)
        buildGrid(newLayout)
        physics.setDimensions(newLayout.packWidth, newLayout.packHeight)
      }, 150)
    }
    window.addEventListener('resize', handleResize)

    // 9. Animation Render Loop
    let animationFrameId: number
    let lastTime = performance.now()
    let grayscaleCurrent = isDarkRef.current ? 1.0 : 0.0
    let hoverFrame = 0

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const now = performance.now()
      const dt = Math.min(0.1, (now - lastTime) / 1000)
      lastTime = now

      // Synchronize physics auto-drift with modal state
      physics.setAutoDrift(!isModalOpenRef.current)

      // Update Momentum Physics
      const physState = physics.update(dt)

      // Apply Dual-Axis Toroidal Coordinate Wrapping
      gridGroup.position.x = physState.wrapX
      gridGroup.position.y = -physState.wrapY

      // Apply Dynamic Camera Zoom
      camera.zoom = physState.zoom
      camera.updateProjectionMatrix()

      // Hover Raycasting (every 2nd frame when not dragging to eliminate CPU stutter)
      hoverFrame = (hoverFrame + 1) & 1
      if (
        hoverFrame === 0 &&
        !physState.isDragging &&
        !isTouchDevice &&
        !isModalOpenRef.current
      ) {
        raycaster.setFromCamera(mouseNdc, camera)
        const intersects = raycaster.intersectObjects(raycastMeshes)
        if (intersects.length > 0) {
          hoveredInternal =
            meshMap.get(intersects[0].object as THREE.Mesh) || null
        } else {
          hoveredInternal = null
        }
      }

      // Grayscale Theme Transition
      const grayscaleTarget = isDarkRef.current ? 1.0 : 0.0
      grayscaleCurrent += (grayscaleTarget - grayscaleCurrent) * Math.min(1.0, 5.0 * dt)

      // Update Cell Shader Uniforms & Transitions
      for (let i = 0; i < cellInternals.length; i++) {
        const ci = cellInternals[i]
        const mat = ci.material
        const uniforms = mat.uniforms

        // 1. Grayscale
        uniforms.uGrayscale.value = grayscaleCurrent

        // 2. Hover Magnification & Neon Cyan Pulse
        const isHovered = ci === hoveredInternal
        const hoverTarget = isHovered ? 1.0 : 0.0
        ci.hoverValue += (hoverTarget - ci.hoverValue) * Math.min(1.0, 8.0 * dt)
        ci.hoverTime += dt

        uniforms.uHover.value = ci.hoverValue
        uniforms.uHoverTime.value = ci.hoverTime

        // 3. Modal Dimming (uFade = 0.15 for background cells)
        const isSelected =
          selectedSketchRef.current &&
          selectedSketchRef.current.id === ci.cell.sketch.id
        ci.fadeTarget = isModalOpenRef.current
          ? isSelected
            ? 1.0
            : 0.15
          : 1.0
        ci.fadeCurrent += (ci.fadeTarget - ci.fadeCurrent) * Math.min(1.0, 6.0 * dt)
        uniforms.uFade.value = ci.fadeCurrent

        // 4. Kinetic Texture Transition Progress
        if (ci.isTransitioning) {
          ci.transitionProgress += dt * ci.transitionSpeed
          if (ci.transitionProgress >= 1.0) {
            ci.transitionProgress = 1.0
            ci.isTransitioning = false

            // Finalize transition: swap Texture B into Texture A
            if (ci.textureB) {
              ci.textureA = ci.textureB
              uniforms.uTexA.value = ci.textureB
              uniforms.uHasA.value = true
              uniforms.uTexB.value = null
              uniforms.uHasB.value = false
            }
            uniforms.uMix.value = 0.0
            ci.transitionProgress = 0.0

            // Notify switch counter
            if (onSwitchRef.current) {
              onSwitchRef.current()
            }
          } else {
            uniforms.uMix.value = ci.transitionProgress
          }
        }
      }

      // Automated Periodic Transition Trigger
      nextTransitionTimer -= dt
      if (nextTransitionTimer <= 0) {
        nextTransitionTimer = 2.5 + Math.random() * 2.0
        triggerRandomTransition()
      }

      // Render Scene
      renderer.render(scene, camera)
    }

    animate()

    // 10. Clean Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId)
      clearTimeout(resizeTimeout)
      document.body.classList.remove('is-dragging')

      container.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      container.removeEventListener('wheel', handleWheel)
      window.removeEventListener('resize', handleResize)

      cellInternals.forEach((ci) => {
        ci.geometry.dispose()
        ci.material.dispose()
      })
      textureCache.forEach((tex) => tex.dispose())
      renderer.dispose()
    }
  }, [sketches])

  return (
    <div
      ref={containerRef}
      className="pg-canvas fixed inset-0 z-0 select-none overflow-hidden touch-none"
      style={{ touchAction: 'none' }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
