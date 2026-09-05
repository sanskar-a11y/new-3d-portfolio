'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'

// ── PRE-ALLOCATED SCRATCHPAD VECTORS (zero GC pressure in render loop) ──
const _start = new THREE.Vector3()
const _rootArc = new THREE.Vector3()
const _idealMid = new THREE.Vector3()
const _idealEnd = new THREE.Vector3()
const _midInertia = new THREE.Vector3()
const _endInertia = new THREE.Vector3()
const _fMid = new THREE.Vector3()
const _fEnd = new THREE.Vector3()
const _tempVel = new THREE.Vector3()
const _bezierP = new THREE.Vector3()
const _bezierPNext = new THREE.Vector3()

/** Evaluate cubic bezier at parameter t, writing result into `out` */
function evalCubicBezier(
  out: THREE.Vector3,
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
  t: number
): THREE.Vector3 {
  const t1 = 1 - t
  const t1sq = t1 * t1
  const t1cb = t1sq * t1
  const tsq = t * t
  const tcb = tsq * t
  const m1 = 3 * t1sq * t
  const m2 = 3 * t1 * tsq

  out.x = t1cb * p0.x + m1 * p1.x + m2 * p2.x + tcb * p3.x
  out.y = t1cb * p0.y + m1 * p1.y + m2 * p2.y + tcb * p3.y
  out.z = t1cb * p0.z + m1 * p1.z + m2 * p2.z + tcb * p3.z
  return out
}

// ── STATIC DATA (hoisted outside component — zero per-frame allocations) ──
const WHISKER_ROWS = [
  { y: -0.12, z: 0.36, len: 0.52, angleY: 0.04, flex: 1.0 },
  { y: -0.17, z: 0.36, len: 0.56, angleY: -0.02, flex: 1.2 },
  { y: -0.22, z: 0.35, len: 0.50, angleY: -0.08, flex: 1.4 },
]
const WHISKER_SIDES = [-1, 1] as const

// ── Pure White & Black Shader with Particle Assembly ──
const CatShader = {
  uniforms: {
    uTime: { value: 0 },
    uAutoPhase: { value: 0 },
    uIntroProgress: { value: 0 },
    uScanY: { value: 0 },
    uResolution: { value: new THREE.Vector2(1000, 1000) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uVelocity: { value: new THREE.Vector3(0, 0, 0) },
    uAcceleration: { value: new THREE.Vector3(0, 0, 0) },
    uEarDeform: { value: new THREE.Vector3(0, 0, 0) },
  },
  vertexShader: /* glsl */ `
    attribute vec3 barycentric;
    varying vec3 vBarycentric;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    uniform float uTime;
    uniform float uIntroProgress;
    uniform vec3 uEarDeform;

    void main() {
      vBarycentric = barycentric;

      vec3 displacedPos = position;

      // Natural subtle ear gravity displacement
      float earMaskY = smoothstep(0.15, 0.35, position.y);
      float earMaskX = smoothstep(0.15, 0.30, abs(position.x));
      float earMask = earMaskY * earMaskX;
      if (earMask > 0.001) {
        displacedPos += uEarDeform * earMask;
      }

      // Smooth, clean intro assembly dispersion (Particle intro restored)
      float dispersion = 1.0 - smoothstep(0.0, 1.0, uIntroProgress);
      if (dispersion > 0.001) {
        displacedPos += normal * (dispersion * 0.12);
      }

      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(displacedPos, 1.0);
      vWorldPosition = worldPosition.xyz;
      vec4 mvPosition = modelViewMatrix * vec4(displacedPos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uAutoPhase;
    uniform float uIntroProgress;
    uniform float uScanY;
    uniform vec2 uResolution;
    uniform vec2 uMouse;

    varying vec3 vBarycentric;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    // Anti-aliased wireframe edge (Standard)
    float getWireEdge() {
      float minBary = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
      float d = fwidth(minBary);
      float thickness = d * 1.5;
      return 1.0 - smoothstep(0.0, thickness, minBary);
    }

    // Thicker wireframe edge for transitions so the blue is visible
    float getTransitionWireEdge() {
      float minBary = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
      float d = fwidth(minBary);
      float thickness = d * 2.5;
      return 1.0 - smoothstep(0.0, thickness, minBary);
    }

    // World-space 45-degree halftone with fwidth anti-aliasing (surface-adhered)
    float getHalftoneMask(vec3 normal, vec3 lightDir1, vec3 lightDir2) {
      vec2 st = vWorldPosition.xy;
      float gridScale = 120.0;

      const mat2 rot = mat2(0.70710678, -0.70710678, 0.70710678, 0.70710678);
      vec2 rotSt = rot * st * gridScale;

      vec2 gridPos = floor(rotSt) + 0.5;
      float dist = length(rotSt - gridPos);

      float NdotL1 = max(dot(normal, lightDir1), 0.0);
      float NdotL2 = max(dot(normal, lightDir2), 0.0);

      float intensity = pow(NdotL1, 1.3) * 0.75 + (NdotL2 * 0.25) + 0.08;
      float maxRadius = 0.48 * clamp(intensity, 0.0, 1.0);

      float d = fwidth(dist);
      return 1.0 - smoothstep(maxRadius - d, maxRadius + d, dist);
    }

    void main() {
      // ── NaN-safe face normal ──
      vec3 dx = dFdx(vViewPosition);
      vec3 dy = dFdy(vViewPosition);
      vec3 crossN = cross(dx, dy);
      vec3 faceNormal = length(crossN) < 1e-4 ? normalize(vNormal) : normalize(crossN);

      // ── View direction & dual-light setup ──
      vec3 viewDir = normalize(vViewPosition);
      vec3 keyLight = normalize(vec3(0.7, 0.8, 0.7));
      vec3 fillLight = normalize(vec3(-0.8, -0.4, -0.4));
      float NdotL = max(dot(faceNormal, keyLight), 0.0);

      // ── White-tinted Fresnel rim ──
      float fresnel = pow(1.0 - max(dot(viewDir, faceNormal), 0.0), 3.0);
      vec3 totalRim = vec3(1.0, 1.0, 1.0) * fresnel * max(NdotL, 0.15) * 1.8;

      // ── Crossfade weights (3 modes, ~12s each, 36s total loop) ──
      float wWire = 1.0 - smoothstep(0.88, 1.12, uAutoPhase);
      wWire += smoothstep(2.88, 3.0, uAutoPhase);
      wWire = clamp(wWire, 0.0, 1.0);
      float wHalf = smoothstep(0.88, 1.12, uAutoPhase) * (1.0 - smoothstep(1.88, 2.12, uAutoPhase));
      float wLidar = smoothstep(1.88, 2.12, uAutoPhase) * (1.0 - smoothstep(2.88, 3.0, uAutoPhase));

      // ── Color palette ──
      vec3 darkBg = vec3(0.02, 0.02, 0.02);
      vec3 facetDark = vec3(0.09, 0.09, 0.09);
      vec3 dotWhite = vec3(1.0, 1.0, 1.0);
      vec3 beamWhite = vec3(1.0, 1.0, 1.0); // Restored to White

      // ── MODE 0: Wireframe ──
      vec3 wireColor = vec3(0.0);
      float facet = 0.0;
      if (wWire > 0.001 || wLidar > 0.001) {
        facet = floor(NdotL * 5.0) / 5.0;
      }
      if (wWire > 0.001) {
        float wireEdge = getWireEdge();
        vec3 baseFacet = mix(darkBg, facetDark, facet);
        wireColor = mix(baseFacet, dotWhite, wireEdge * 1.0) + totalRim * 0.6;
      }

      // ── MODE 1: World-Space Halftone ──
      vec3 halftoneColor = vec3(0.0);
      float dotMask = 0.0;
      if (wHalf > 0.001 || wLidar > 0.001) {
        dotMask = getHalftoneMask(faceNormal, keyLight, fillLight);
      }
      if (wHalf > 0.001) {
        halftoneColor = mix(darkBg, dotWhite, dotMask) + totalRim * 0.8;
      }

      // ── MODE 2: Holographic LiDAR Laser Sweep ──
      vec3 lidarColor = vec3(0.0);
      if (wLidar > 0.001) {
        float distToScan = vWorldPosition.y - uScanY;
        float laserCore = smoothstep(0.04, 0.0, abs(distToScan));
        float trailMask = smoothstep(-0.25, 0.0, distToScan) * step(distToScan, 0.0);
        float microLines = sin(vWorldPosition.y * 120.0 - uTime * 20.0) * 0.5 + 0.5;
        float scanIntensity = (laserCore * 3.0) + (trailMask * microLines * 0.5) + (trailMask * 0.15);
        
        vec3 halftonePart = mix(darkBg, dotWhite, dotMask);
        vec3 wirePart = mix(darkBg, facetDark, facet);
        float planeBlend = smoothstep(-0.05, 0.05, distToScan);
        vec3 baseSurface = mix(wirePart, halftonePart, planeBlend);
        
        lidarColor = baseSurface + totalRim * 0.7 + (beamWhite * scanIntensity);
      }

      // ── Composite all modes ──
      vec3 finalColor = wireColor * wWire + halftoneColor * wHalf + lidarColor * wLidar;

      // ── Crossfade transition energy (Blue lines only) ──
      float isTransitioning = 1.0 - max(wWire, max(wHalf, wLidar));
      float transWireEdge = getTransitionWireEdge();
      vec3 transitionBlue = vec3(0.08, 0.55, 1.0); // Vibrant blue
      finalColor += transitionBlue * isTransitioning * transWireEdge * 3.5; // Boosted intensity for visibility

      // ── Screen-space corrected hover glow (Bluish restored) ──
      vec2 screenPos = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
      float aspect = uResolution.x / uResolution.y;
      screenPos.x *= aspect;
      vec2 mouseScreen = uMouse;
      mouseScreen.x *= aspect;
      float mouseDist = length(mouseScreen - screenPos);
      float hoverArea = 1.0 - smoothstep(0.0, 0.5, mouseDist);

      vec3 mouseLightPos = vec3(uMouse.x * 3.5, uMouse.y * 3.5, 2.0);
      vec3 mouseLightDir = normalize(mouseLightPos - vWorldPosition);
      float mouseGlow = pow(max(dot(faceNormal, mouseLightDir), 0.0), 5.0);
      vec3 hoverGlow = vec3(0.08, 0.55, 1.0) * mouseGlow * hoverArea * 2.2;
      finalColor += hoverGlow;

      // ── Smooth opacity blend during initial particle assembly ──
      finalColor = mix(darkBg, finalColor, smoothstep(0.0, 0.3, uIntroProgress));

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}

// Generate 6 sleek cubic bezier whisker curves (3 left, 3 right) exactly on the muzzle
function createWhiskerGeometry() {
  const points: THREE.Vector3[] = []
  const rows = [
    { y: -0.12, z: 0.36, len: 0.54, angleY: 0.04 },
    { y: -0.17, z: 0.36, len: 0.58, angleY: -0.02 },
    { y: -0.22, z: 0.35, len: 0.52, angleY: -0.08 },
  ]

  ;[-1, 1].forEach((side) => {
    rows.forEach((row) => {
      const startX = side * 0.14
      const endX = side * (0.14 + row.len)
      const p0 = new THREE.Vector3(startX, row.y, row.z)
      const p1 = new THREE.Vector3(startX + side * 0.14, row.y + 0.04, row.z + 0.05)
      const p2 = new THREE.Vector3(startX + side * row.len * 0.55, row.y + row.angleY * 0.5 - 0.02, row.z - 0.06)
      const p3 = new THREE.Vector3(endX, row.y + row.angleY - 0.05, row.z - 0.18)
      const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3)
      const curvePoints = curve.getPoints(24)
      for (let i = 0; i < curvePoints.length - 1; i++) {
        points.push(curvePoints[i], curvePoints[i + 1])
      }
    })
  })

  return new THREE.BufferGeometry().setFromPoints(points)
}

export function CatModel() {
  const groupRef = useRef<THREE.Group>(null)
  const eyeRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const isLoaded = useAppStore((state) => state.isLoaded)
  const setTelemetry = useAppStore((state) => state.setTelemetry)
  const setStoreMode = useAppStore((state) => state.setMode)
  const telemetryKeyRef = useRef('')
  const introStartTimeRef = useRef<number | null>(null)
  const { viewport } = useThree()
  const mobileTiltRef = useRef({ x: 0, y: 0 })

  // Dynamic responsive sizing & positioning for desktop, tablet & mobile viewports
  const isMobile = viewport.width < 4.8
  const isTablet = viewport.width >= 4.8 && viewport.width < 7.5
  const isLaptop = viewport.width >= 7.5 && viewport.height < 5.4

  const responsiveScale = useMemo(() => {
    if (isMobile) {
      return Math.max(2.6, Math.min(viewport.width * 0.68, 3.2))
    }
    if (isTablet) {
      return 4.2
    }
    if (isLaptop) {
      return 4.5
    }
    return Math.min(5.2, Math.max(4.5, viewport.width * 0.52))
  }, [viewport.width, isMobile, isTablet, isLaptop])

  const basePosY = useMemo(() => {
    if (isMobile) return -0.08
    if (isLaptop) return -0.06
    return -0.08
  }, [isMobile, isLaptop])

  // Track scroll velocity via wheel event listener
  const scrollVelRef = useRef(0)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      scrollVelRef.current += e.deltaY * 0.002
    }
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  const prevMouseRef = useRef({ x: 0, y: 0 })
  const mouseVelRef = useRef({ x: 0, y: 0 })
  const mouseAccelRef = useRef({ x: 0, y: 0 })

  const physicsStateRef = useRef({
    pos: new THREE.Vector3(0, basePosY, 0),
    vel: new THREE.Vector3(0, 0, 0),
    accel: new THREE.Vector3(0, 0, 0),
    rot: new THREE.Euler(0, 0, 0),
    rotVel: new THREE.Vector3(0, 0, 0),
    rotAccel: new THREE.Vector3(0, 0, 0),
  })

  // R3: Ear Vertex Spring Physics State
  const earPhysicsRef = useRef({
    pos: new THREE.Vector3(0, 0, 0),
    vel: new THREE.Vector3(0, 0, 0),
  })

  // R3: Eye Tracking Lag / Spring Inertia Physics State
  const eyePhysicsRef = useRef({
    rot: new THREE.Euler(0, 0, 0),
    rotVel: new THREE.Vector3(0, 0, 0),
    pos: new THREE.Vector3(0, 0, 0),
    posVel: new THREE.Vector3(0, 0, 0),
  })

  // R3: Whisker Multi-Node Spring Physics State (6 whiskers, mid and end control nodes)
  const whiskerPhysicsRef = useRef(
    Array.from({ length: 6 }, () => ({
      midPos: new THREE.Vector3(0, 0, 0),
      midVel: new THREE.Vector3(0, 0, 0),
      endPos: new THREE.Vector3(0, 0, 0),
      endVel: new THREE.Vector3(0, 0, 0),
      initialized: false,
    }))
  )

  // Load 3D cat model
  const { scene } = useGLTF('/cat.glb') as any

  // Extract body and eye meshes, convert to non-indexed and inject barycentric coordinates for wireframe
  const { bodyGeometry, eyeGeometry, whiskerGeometry } = useMemo(() => {
    let bodyGeo: THREE.BufferGeometry | null = null
    let eyeGeo: THREE.BufferGeometry | null = null

    scene.traverse((child: any) => {
      if (child.isMesh && child.geometry) {
        if (child.name.includes('\u7403') || child.name.includes('001') || child.name.toLowerCase().includes('eye')) {
          eyeGeo = child.geometry.clone()
        } else if (!bodyGeo) {
          const nonIndexed = child.geometry.toNonIndexed()
          const count = nonIndexed.attributes.position.count
          const barycentric = new Float32Array(count * 3)
          for (let i = 0; i < count; i += 3) {
            barycentric.set([1, 0, 0], i * 3)
            barycentric.set([0, 1, 0], (i + 1) * 3)
            barycentric.set([0, 0, 1], (i + 2) * 3)
          }
          nonIndexed.setAttribute('barycentric', new THREE.BufferAttribute(barycentric, 3))
          bodyGeo = nonIndexed
        }
      }
    })

    return {
      bodyGeometry: bodyGeo || new THREE.SphereGeometry(1, 16, 16),
      eyeGeometry: eyeGeo || new THREE.SphereGeometry(0.2, 16, 16),
      whiskerGeometry: createWhiskerGeometry(),
    }
  }, [scene])

  const customMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(CatShader.uniforms),
      vertexShader: CatShader.vertexShader,
      fragmentShader: CatShader.fragmentShader,
      side: THREE.DoubleSide,
    })
  }, [])

  // Pure white eyeballs within carved sockets
  const eyeballMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xffffff,
    })
  }, [])

  // Soft white whiskers
  const whiskerMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      linewidth: 2,
    })
  }, [])

  const whiskerGeoRef = useRef<THREE.BufferGeometry>(null)

  // ── Mobile Device Orientation (tilt-to-track) ──
  useEffect(() => {
    if (typeof window === 'undefined') return

    let permissionGranted = false

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!permissionGranted) return
      const gamma = Math.max(-1, Math.min(1, (e.gamma || 0) / 45))
      const beta = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 45))
      mobileTiltRef.current.x = gamma * 0.25
      mobileTiltRef.current.y = -beta * 0.18
    }

    const init = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const result = await (DeviceOrientationEvent as any).requestPermission()
          permissionGranted = result === 'granted'
        } catch {
          permissionGranted = false
        }
      } else {
        permissionGranted = true
      }

      if (permissionGranted) {
        window.addEventListener('deviceorientation', handleOrientation, { passive: true })
      }
    }

    init()

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime()
    const dt = Math.min(delta, 0.033)

    // ── R1: MOUSE & SCROLL VELOCITY / ACCELERATION TRACKING ──
    const currentMouseX = state.pointer.x
    const currentMouseY = state.pointer.y

    const vx = (currentMouseX - prevMouseRef.current.x) / (dt || 0.016)
    const vy = (currentMouseY - prevMouseRef.current.y) / (dt || 0.016)
    const ax = (vx - mouseVelRef.current.x) / (dt || 0.016)
    const ay = (vy - mouseVelRef.current.y) / (dt || 0.016)

    mouseVelRef.current.x = vx
    mouseVelRef.current.y = vy
    mouseAccelRef.current.x = ax
    mouseAccelRef.current.y = ay
    prevMouseRef.current.x = currentMouseX
    prevMouseRef.current.y = currentMouseY

    scrollVelRef.current *= Math.pow(0.92, dt * 60)

    // ── R1: 6-DOF 2ND-ORDER SPRING-DAMPER PHYSICS ENGINE ──
    const p = physicsStateRef.current

    // Target rotations (blend mobile tilt when available)
    const tiltX = mobileTiltRef.current.x
    const tiltY = mobileTiltRef.current.y
    const targetRotY = currentMouseX * (isMobile ? 0.12 : 0.18) + vx * 0.005 + tiltX
    const targetRotX = -currentMouseY * (isMobile ? 0.09 : 0.14) + vy * 0.005 + tiltY
    const targetRotZ = currentMouseX * 0.04 - vx * 0.01

    // Target positions
    const gravityPull = -currentMouseY * 0.024 - scrollVelRef.current * 0.008
    const gravitySag = Math.sin(elapsed * 1.8) * 0.009 - 0.05
    const breathingFloat = Math.cos(elapsed * 2.8) * 0.003 + Math.sin(elapsed * 0.85) * 0.004

    const targetPosX = currentMouseX * 0.03 + vx * 0.003
    const targetPosY = basePosY + gravitySag + gravityPull + breathingFloat - Math.abs(vy) * 0.004
    const targetPosZ = -Math.abs(currentMouseY) * 0.016 - Math.abs(vx) * 0.004

    // Position Spring — critically damped (c = 2*sqrt(k) ≈ 37.4)
    const kPos = 350.0
    const cPos = 37.5

    p.accel.x = -kPos * (p.pos.x - targetPosX) - cPos * p.vel.x
    p.accel.y = -kPos * (p.pos.y - targetPosY) - cPos * p.vel.y
    p.accel.z = -kPos * (p.pos.z - targetPosZ) - cPos * p.vel.z

    p.vel.x += p.accel.x * dt
    p.vel.y += p.accel.y * dt
    p.vel.z += p.accel.z * dt

    p.pos.x += p.vel.x * dt
    p.pos.y += p.vel.y * dt
    p.pos.z += p.vel.z * dt

    // Rotation Spring — critically damped (c = 2*sqrt(k) ≈ 34.6)
    const kRot = 300.0
    const cRot = 34.6

    p.rotAccel.x = -kRot * (p.rot.x - targetRotX) - cRot * p.rotVel.x
    p.rotAccel.y = -kRot * (p.rot.y - targetRotY) - cRot * p.rotVel.y
    p.rotAccel.z = -kRot * (p.rot.z - targetRotZ) - cRot * p.rotVel.z

    p.rotVel.x += p.rotAccel.x * dt
    p.rotVel.y += p.rotAccel.y * dt
    p.rotVel.z += p.rotAccel.z * dt

    p.rot.x += p.rotVel.x * dt
    p.rot.y += p.rotVel.y * dt
    p.rot.z += p.rotVel.z * dt

    // Apply 6-DOF transform + breathing scale to cat group
    if (groupRef.current) {
      groupRef.current.position.copy(p.pos)
      groupRef.current.rotation.copy(p.rot)
      // Subtle breathing scale oscillation (0.5%)
      const breathe = 1.0 + Math.sin(elapsed * 1.2) * 0.005
      const s = responsiveScale * breathe
      groupRef.current.scale.set(s, s, s)
    }

    // ── NON-OSCILLATING CRITICALLY DAMPED EAR GRAVITY TRACKING ──
    const ear = earPhysicsRef.current
    const targetEarX = -p.rot.z * 0.0104 - vx * 0.0052
    const targetEarY = -Math.abs(p.rot.x) * 0.0104 - vy * 0.0052 - 0.00624
    const targetEarZ = 0.0

    const earDamp = 1.0 - Math.exp(-16.0 * dt)
    ear.pos.x += (targetEarX - ear.pos.x) * earDamp
    ear.pos.y += (targetEarY - ear.pos.y) * earDamp
    ear.pos.z += (targetEarZ - ear.pos.z) * earDamp
    ear.vel.set(0, 0, 0)

    // ── SHADER UNIFORM UPDATES ──
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = elapsed
      materialRef.current.uniforms.uResolution.value.set(
        state.size.width * state.viewport.dpr,
        state.size.height * state.viewport.dpr
      )
      materialRef.current.uniforms.uMouse.value.set(state.pointer.x, state.pointer.y)
      materialRef.current.uniforms.uScanY.value = Math.sin(elapsed * 1.4) * 1.6

      // Pass soft-body deformation & ear masking uniforms
      materialRef.current.uniforms.uVelocity.value.copy(p.vel)
      materialRef.current.uniforms.uAcceleration.value.copy(p.accel)
      materialRef.current.uniforms.uEarDeform.value.copy(ear.pos)

      // Particle assembly intro progress (Restored to 3.5s duration)
      if (!isLoaded) {
        materialRef.current.uniforms.uIntroProgress.value = 0.0
        introStartTimeRef.current = null
      } else {
        if (introStartTimeRef.current === null) {
          introStartTimeRef.current = elapsed
        }
        const activeIntroTime = elapsed - introStartTimeRef.current
        const introVal = Math.min(1.0, activeIntroTime / 3.5)
        // Particle assembly easing
        materialRef.current.uniforms.uIntroProgress.value = 1.0 - Math.pow(1.0 - introVal, 3)

        if (activeIntroTime < 3.5) {
          if (telemetryKeyRef.current !== 'intro') {
            telemetryKeyRef.current = 'intro'
            setTelemetry({
              line1: 'ASSEMBLING 3D CORE',
              line2: 'SYSTEM INITIALIZED',
              isTransition: true,
            })
          }
        }
      }

      // Start auto-cycling only after intro completes (3.5s)
      if (introStartTimeRef.current !== null) {
        const introActive = elapsed - introStartTimeRef.current
        if (introActive >= 3.5) {
          const cycleTime = Math.max(0, introActive - 3.5)
          const phase = (cycleTime * 0.0833) % 3.0
          materialRef.current.uniforms.uAutoPhase.value = phase

          let currentKey = ''
          let line1 = ''
          let line2 = ''
          let isTransition = false
          let currentModeIndex = 0

          if (phase >= 0.0 && phase < 0.88) {
            currentKey = 'mode-0'
            line1 = 'BRAIN IS OFFLINE'
            line2 = 'BE BACK LATER'
            isTransition = false
            currentModeIndex = 0
          } else if (phase >= 0.88 && phase < 1.12) {
            currentKey = 'trans-0-1'
            line1 = 'RECONFIGURING MESH'
            line2 = 'HALFTONE ENGAGED'
            isTransition = true
            currentModeIndex = 1
          } else if (phase >= 1.12 && phase < 1.88) {
            currentKey = 'mode-1'
            line1 = 'QUANTUM HALFTONE'
            line2 = 'PHOTON DOT MATRIX'
            isTransition = false
            currentModeIndex = 1
          } else if (phase >= 1.88 && phase < 2.12) {
            currentKey = 'trans-1-2'
            line1 = 'CALIBRATING OPTICS'
            line2 = 'INITIATING LIDAR'
            isTransition = true
            currentModeIndex = 2
          } else if (phase >= 2.12 && phase < 2.88) {
            currentKey = 'mode-2'
            line1 = 'LIDAR PHOTON SWEEP'
            line2 = '120HZ VOLUMETRIC'
            isTransition = false
            currentModeIndex = 2
          } else {
            currentKey = 'trans-2-0'
            line1 = 'SYNTHESIZING FACETS'
            line2 = 'ORIGAMI PROTOCOL'
            isTransition = true
            currentModeIndex = 0
          }

          if (telemetryKeyRef.current !== currentKey) {
            telemetryKeyRef.current = currentKey
            setTelemetry({ line1, line2, isTransition })
            setStoreMode(currentModeIndex)
          }
        }
      }
    }

    // ── FLUID EYE TRACKING LAG / SPRING INERTIA ──
    if (eyeRef.current) {
      const eye = eyePhysicsRef.current
      const targetEyeRotY = state.pointer.x * 0.14
      const targetEyeRotX = -state.pointer.y * 0.12

      const targetEyePosX = state.pointer.x * 0.012 - p.vel.x * 0.005
      const targetEyePosY = -state.pointer.y * 0.012 - p.vel.y * 0.005

      const kEye = 180.0
      const cEye = 18.0

      const fEyeRotX = -kEye * (eye.rot.x - targetEyeRotX) - cEye * eye.rotVel.x
      const fEyeRotY = -kEye * (eye.rot.y - targetEyeRotY) - cEye * eye.rotVel.y

      eye.rotVel.x += fEyeRotX * dt
      eye.rotVel.y += fEyeRotY * dt
      eye.rot.x += eye.rotVel.x * dt
      eye.rot.y += eye.rotVel.y * dt

      const fEyePosX = -kEye * (eye.pos.x - targetEyePosX) - cEye * eye.posVel.x
      const fEyePosY = -kEye * (eye.pos.y - targetEyePosY) - cEye * eye.posVel.y

      eye.posVel.x += fEyePosX * dt
      eye.posVel.y += fEyePosY * dt
      eye.pos.x += eye.posVel.x * dt
      eye.pos.y += eye.posVel.y * dt

      eyeRef.current.rotation.set(eye.rot.x, eye.rot.y, 0)
      eyeRef.current.position.set(eye.pos.x, eye.pos.y, 0)

      // Subtle eye glow modulation (idle life)
      const glowVal = 0.88 + Math.sin(elapsed * 2.0) * 0.08
      eyeballMaterial.color.setRGB(glowVal, glowVal, Math.min(1.0, glowVal + 0.04))
    }

    // ── HIGH-FLUID WHISKER ELASTICITY & WHIP INERTIA PHYSICS ──
    if (whiskerGeoRef.current && groupRef.current) {
      const targetGeo = (whiskerGeoRef.current as any).geometry || whiskerGeoRef.current
      if (targetGeo && targetGeo.attributes && targetGeo.attributes.position) {
        const posAttr = targetGeo.attributes.position as THREE.BufferAttribute
        if (posAttr && posAttr.array) {
          const array = posAttr.array as Float32Array
          let ptr = 0
          let whiskerChanged = false

          let whiskerIdx = 0
          const kWhisker = 72.0
          const cWhisker = 6.2

          // Use hoisted WHISKER_SIDES and WHISKER_ROWS (zero per-frame allocations)
          for (let s = 0; s < WHISKER_SIDES.length; s++) {
            const side = WHISKER_SIDES[s]
            for (let rowIdx = 0; rowIdx < WHISKER_ROWS.length; rowIdx++) {
              const row = WHISKER_ROWS[rowIdx]
              const stateNode = whiskerPhysicsRef.current[whiskerIdx]
              const startX = side * 0.14
              const endX = side * (0.14 + row.len)

              // Multi-harmonic aerodynamic breeze & subtle organic twitching
              const breathSway = Math.sin(elapsed * 2.8 + rowIdx * 0.85 + side * 1.4) * 0.018 * row.flex
              const flutter = Math.cos(elapsed * 5.4 + rowIdx * 1.2 + side * 0.7) * 0.009 * row.flex
              const twitchImpulse = Math.sin(elapsed * 0.65) > 0.92 ? Math.sin(elapsed * 26.0) * 0.022 * row.flex : 0.0
              const dynamicWind = breathSway + flutter + twitchImpulse

              // Head turn inertia & drag lag
              const headTurnDragZ = -p.rot.y * side * 0.07 * row.flex - vx * side * 0.035 * row.flex
              const headPitchDrag = -p.rot.x * 0.11 * row.flex - vy * 0.045 * row.flex
              const lateralFlare = side * (Math.abs(p.rot.y) * 0.03 + Math.abs(vx) * 0.02) * row.flex

              const totalDrop = -0.012 * row.flex + headPitchDrag + dynamicWind

              _start.set(startX, row.y, row.z)
              
              // Initial natural outward curvature arc sprouting from muzzle
              _rootArc.set(
                startX + side * 0.14,
                row.y + 0.04 + Math.sin(elapsed * 2.8 + side) * 0.006,
                row.z + 0.05
              )

              _idealMid.set(
                startX + side * row.len * 0.55 + lateralFlare * 0.5,
                row.y + row.angleY * 0.5 - 0.02 + totalDrop * 0.55,
                row.z - 0.06 + headTurnDragZ * 0.5
              )
              _idealEnd.set(
                endX + lateralFlare,
                row.y + row.angleY - 0.05 + totalDrop,
                row.z - 0.18 + headTurnDragZ
              )

              if (!stateNode.initialized) {
                stateNode.midPos.copy(_idealMid)
                stateNode.endPos.copy(_idealEnd)
                stateNode.initialized = true
              }

              // Dynamic whip inertia from head rotation and mouse movement velocity
              _midInertia.set(
                (-p.accel.x * 0.06 - vx * 0.08) * row.flex,
                (-p.accel.y * 0.06 - vy * 0.08) * row.flex,
                (-p.accel.z * 0.04) * row.flex
              )
              _endInertia.set(
                (-p.accel.x * 0.14 - vx * 0.18) * row.flex,
                (-p.accel.y * 0.14 - vy * 0.18) * row.flex,
                (-p.accel.z * 0.09) * row.flex
              )

              // Spring update for Mid Node (zero-alloc)
              _fMid.subVectors(_idealMid, stateNode.midPos)
                .multiplyScalar(kWhisker)
              _tempVel.copy(stateNode.midVel).multiplyScalar(cWhisker)
              _fMid.sub(_tempVel).add(_midInertia)

              stateNode.midVel.addScaledVector(_fMid, dt)
              _tempVel.copy(stateNode.midVel).multiplyScalar(dt)
              stateNode.midPos.add(_tempVel)

              // Spring update for End Tip Node (zero-alloc)
              _fEnd.subVectors(_idealEnd, stateNode.endPos)
                .multiplyScalar(kWhisker * 0.85)
              _tempVel.copy(stateNode.endVel).multiplyScalar(cWhisker)
              _fEnd.sub(_tempVel).add(_endInertia)

              stateNode.endVel.addScaledVector(_fEnd, dt)
              _tempVel.copy(stateNode.endVel).multiplyScalar(dt)
              stateNode.endPos.add(_tempVel)

              // Generate 24 sub-segments via inline cubic bezier + 10% organic fluid wave ripple
              const WHISKER_SEGMENTS = 24
              evalCubicBezier(_bezierP, _start, _rootArc, stateNode.midPos, stateNode.endPos, 0)
              for (let seg = 1; seg <= WHISKER_SEGMENTS; seg++) {
                const t = seg / WHISKER_SEGMENTS
                evalCubicBezier(_bezierPNext, _start, _rootArc, stateNode.midPos, stateNode.endPos, t)

                // 10% organic fluid traveling ripple towards tip (t * t ensures root stays firmly anchored)
                const fluidWaveY = Math.sin(elapsed * 3.5 - t * 4.5 + rowIdx * 1.1 + side * 1.3) * (0.015 * t * t * row.flex)
                const fluidWaveZ = Math.cos(elapsed * 3.0 - t * 3.8 + rowIdx * 0.9) * (0.008 * t * t * row.flex)
                _bezierPNext.y += fluidWaveY
                _bezierPNext.z += fluidWaveZ

                if (
                  Math.abs(array[ptr] - _bezierP.x) > 1e-5 ||
                  Math.abs(array[ptr + 1] - _bezierP.y) > 1e-5 ||
                  Math.abs(array[ptr + 2] - _bezierP.z) > 1e-5 ||
                  Math.abs(array[ptr + 3] - _bezierPNext.x) > 1e-5 ||
                  Math.abs(array[ptr + 4] - _bezierPNext.y) > 1e-5 ||
                  Math.abs(array[ptr + 5] - _bezierPNext.z) > 1e-5
                ) {
                  whiskerChanged = true
                }

                array[ptr++] = _bezierP.x
                array[ptr++] = _bezierP.y
                array[ptr++] = _bezierP.z
                array[ptr++] = _bezierPNext.x
                array[ptr++] = _bezierPNext.y
                array[ptr++] = _bezierPNext.z
                _bezierP.copy(_bezierPNext)
              }

              whiskerIdx++
            }
          }

          if (whiskerChanged) {
            posAttr.needsUpdate = true
          }
        }
      }
    }
  })

  // Dispose all manually-created GPU resources on unmount / HMR
  useEffect(() => {
    return () => {
      bodyGeometry?.dispose()
      eyeGeometry?.dispose()
      whiskerGeometry?.dispose()
      customMaterial?.dispose()
      eyeballMaterial?.dispose()
      whiskerMaterial?.dispose()
    }
  }, [bodyGeometry, eyeGeometry, whiskerGeometry, customMaterial, eyeballMaterial, whiskerMaterial])

  return (
    <group ref={groupRef} position={[0, basePosY, 0]} scale={[responsiveScale, responsiveScale, responsiveScale]}>
      {/* Cyber Cat Head Base with Pure White Shaders and Particle Intro */}
      <mesh geometry={bodyGeometry}>
        <primitive object={customMaterial} ref={materialRef} attach="material" />
      </mesh>

      {/* Pure White Eyeballs with Fluid Tracking Lag & Spring Inertia */}
      <mesh ref={eyeRef} geometry={eyeGeometry} material={eyeballMaterial} />

      {/* 6 Dynamic Whisker Lines with Multi-Node Spring-Lag Elasticity */}
      <lineSegments ref={whiskerGeoRef} geometry={whiskerGeometry} material={whiskerMaterial} />
    </group>
  )
}

useGLTF.preload('/cat.glb')
