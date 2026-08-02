'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'

// ── PRE-ALLOCATED SCRATCHPAD VECTORS (zero GC pressure in render loop) ──
const _start = new THREE.Vector3()
const _idealMid = new THREE.Vector3()
const _idealEnd = new THREE.Vector3()
const _midInertia = new THREE.Vector3()
const _endInertia = new THREE.Vector3()
const _fMid = new THREE.Vector3()
const _fEnd = new THREE.Vector3()
const _tempVel = new THREE.Vector3()
const _bezierP = new THREE.Vector3()
const _bezierPNext = new THREE.Vector3()

/** Evaluate quadratic bezier at parameter t, writing result into `out` */
function evalQuadBezier(out: THREE.Vector3, p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, t: number): THREE.Vector3 {
  const t1 = 1 - t
  const t1sq = t1 * t1
  const tsq = t * t
  const t12t = 2 * t1 * t
  out.x = t1sq * p0.x + t12t * p1.x + tsq * p2.x
  out.y = t1sq * p0.y + t12t * p1.y + tsq * p2.y
  out.z = t1sq * p0.z + t12t * p1.z + tsq * p2.z
  return out
}

// Pure Black & White Yuta Abe-style shader with continuous auto-cycling transitions & bluish hover/transition glow
// Upgraded with R2 Soft-Body Mesh Deformation & Ear Vertex Masking
const CatShader = {
  uniforms: {
    uTime: { value: 0 },
    uAutoPhase: { value: 0 },    // 0-3 continuous cycling: 0-1 wireframe, 1-2 halftone, 2-3 lidar
    uScanY: { value: 0 },
    uIntroProgress: { value: 0 }, // 0.0 (dispersed particles) -> 1.0 (assembled cat)
    uResolution: { value: new THREE.Vector2(1000, 1000) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    // Soft-Body Mesh Physics Uniforms (R2 & R3)
    uVelocity: { value: new THREE.Vector3(0, 0, 0) },
    uAcceleration: { value: new THREE.Vector3(0, 0, 0) },
    uDeformAmount: { value: 0.036 },
    uEarDeform: { value: new THREE.Vector3(0, 0, 0) },
  },
  vertexShader: `
    attribute vec3 barycentric;
    varying vec3 vBarycentric;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    uniform float uTime;
    uniform float uAutoPhase;
    uniform float uScanY;
    uniform float uIntroProgress;
    uniform vec2 uMouse;

    uniform vec3 uVelocity;
    uniform vec3 uAcceleration;
    uniform float uDeformAmount;
    uniform vec3 uEarDeform;

    void main() {
      vUv = uv;
      vBarycentric = barycentric;
      
      vec3 displacedPos = position;

      // Natural subtle ear gravity displacement
      float earMaskY = smoothstep(0.15, 0.35, position.y);
      float earMaskX = smoothstep(0.15, 0.30, abs(position.x));
      float earMask = earMaskY * earMaskX;
      if (earMask > 0.001) {
        vec3 earGravity = uEarDeform * earMask;
        displacedPos += earGravity;
      }

      // 4. Smooth, clean intro assembly dispersion
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
  fragmentShader: `
    uniform float uTime;
    uniform float uAutoPhase;
    uniform float uScanY;
    uniform vec2 uResolution;
    uniform float uIntroProgress;
    uniform vec2 uMouse;

    varying vec3 vBarycentric;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    // Helper: 45-Degree Rotated Halftone Dot Matrix (softer grid scale)
    float getHalftoneMask(vec3 normal, vec3 lightDir1, vec3 lightDir2) {
      vec2 st = gl_FragCoord.xy / max(uResolution.y, 1.0);
      float gridScale = 220.0;
      
      // Rotate grid by 45 degrees (PI / 4) for signature print aesthetic
      float angle = 0.78539816339;
      mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
      vec2 rotSt = rot * st * gridScale;
      
      vec2 gridPos = floor(rotSt) + 0.5;
      float dist = length(rotSt - gridPos);
      
      float NdotL1 = max(dot(normal, lightDir1), 0.0);
      float NdotL2 = max(dot(normal, lightDir2), 0.0);
      
      float intensity = pow(NdotL1, 1.3) * 0.75 + (NdotL2 * 0.25) + 0.08;
      float maxRadius = 0.48 * clamp(intensity, 0.0, 1.0);
      
      return smoothstep(maxRadius, maxRadius - 0.05, dist);
    }

    void main() {
      // Razor-sharp flat faceted normal calculation (Yuta Abe's signature look!)
      vec3 dx = dFdx(vViewPosition);
      vec3 dy = dFdy(vViewPosition);
      vec3 faceNormal = normalize(cross(dx, dy));
      if (length(faceNormal) < 0.1) faceNormal = normalize(vNormal);

      vec3 viewDir = normalize(vViewPosition);
      
      // Lighting setup — 100% pure neutral B&W contrast
      vec3 keyLight = normalize(vec3(0.7, 0.8, 0.7));    // Top-right neutral
      vec3 fillLight = normalize(vec3(-0.8, -0.4, -0.4)); // Bottom-left neutral
      float NdotL = max(dot(faceNormal, keyLight), 0.0);
      
      // --- PURE WHITE FRESNEL RIM ---
      float fresnel = pow(1.0 - max(dot(viewDir, faceNormal), 0.0), 2.0);
      vec3 totalRim = vec3(1.0, 1.0, 1.0) * fresnel * 1.4;

      // Pure B&W palette
      vec3 darkBg = vec3(0.02, 0.02, 0.02);
      vec3 facetDark = vec3(0.09, 0.09, 0.09);  // Soft gray facet tone
      vec3 dotWhite = vec3(0.95, 0.95, 0.95);   // Pure white dots
      
      // --- Compute each mode independently for crossfading ---
      
      // MODE 0: Crisp Faceted Wireframe Base (using real triangle barycentric edges)
      float minBary = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
      float wireEdge = 1.0 - smoothstep(0.0, 0.035, minBary);
      float facet = floor(NdotL * 5.0) / 5.0;
      vec3 baseFacet = mix(darkBg, facetDark, facet);
      vec3 wireColor = mix(baseFacet, dotWhite, wireEdge * 0.85) + totalRim * 0.6;
      
      // MODE 1: 45° Halftone Dot Matrix
      float dotMask = getHalftoneMask(faceNormal, keyLight, fillLight);
      vec3 halftoneColor = mix(darkBg, dotWhite, dotMask) + totalRim * 0.8;
      
      // MODE 2: Holographic LiDAR Laser Sweep
      float distToScan = vWorldPosition.y - uScanY;
      float laserCore = smoothstep(0.04, 0.0, abs(distToScan));
      float trailMask = smoothstep(-0.25, 0.0, distToScan) * step(distToScan, 0.0);
      float microLines = sin(vWorldPosition.y * 120.0 - uTime * 20.0) * 0.5 + 0.5;
      float scanIntensity = (laserCore * 3.0) + (trailMask * microLines * 0.5) + (trailMask * 0.15);
      
      vec3 halftonePart = mix(darkBg, dotWhite, dotMask);
      vec3 wirePart = mix(darkBg, facetDark, facet);
      float planeBlend = smoothstep(-0.05, 0.05, distToScan);
      vec3 baseSurface = mix(wirePart, halftonePart, planeBlend);
      
      vec3 beamColor = vec3(0.2, 0.7, 1.0);
      vec3 lidarColor = baseSurface + totalRim * 0.7 + (beamColor * scanIntensity);

      // --- AUTO-CYCLING CROSSFADE ---
      float wWire = 1.0 - smoothstep(0.88, 1.12, uAutoPhase);
      wWire += smoothstep(2.88, 3.0, uAutoPhase);
      wWire = clamp(wWire, 0.0, 1.0);
      
      float wHalf = smoothstep(0.88, 1.12, uAutoPhase) * (1.0 - smoothstep(1.88, 2.12, uAutoPhase));
      float wLidar = smoothstep(1.88, 2.12, uAutoPhase) * (1.0 - smoothstep(2.88, 3.0, uAutoPhase));
      
      float totalWeight = max(wWire + wHalf + wLidar, 0.001);
      wWire /= totalWeight;
      wHalf /= totalWeight;
      wLidar /= totalWeight;
      
      vec3 finalColor = wireColor * wWire + halftoneColor * wHalf + lidarColor * wLidar;

      // Add dynamic bluish transition energy during crossfades between modes
      float isTransitioning = 1.0 - max(wWire, max(wHalf, wLidar));
      vec3 transitionBlue = vec3(0.12, 0.65, 1.0) * isTransitioning * 2.5;
      finalColor += transitionBlue;

      // --- HOVER CURSOR BLUISH AREA ---
      // When hovering over the cat, that area lights up with an electric cyan/blue glow!
      vec3 mouseLightPos = vec3(uMouse.x * 3.5, uMouse.y * 3.5, 2.0);
      vec3 mouseLightDir = normalize(mouseLightPos - vWorldPosition);
      float mouseGlow = pow(max(dot(faceNormal, mouseLightDir), 0.0), 5.0);
      float mouseDist = length(vec2(uMouse.x * 2.2, uMouse.y * 2.2) - vWorldPosition.xy);
      float hoverArea = smoothstep(1.4, 0.0, mouseDist);
      vec3 hoverBlue = vec3(0.05, 0.6, 1.0) * mouseGlow * hoverArea * 2.2;
      finalColor += hoverBlue;

      // Smooth opacity blend during initial particle assembly
      finalColor = mix(darkBg, finalColor, smoothstep(0.0, 0.3, uIntroProgress));

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}

// Generate 6 sleek cubic bezier whisker curves (3 left, 3 right) exactly on the muzzle
function createWhiskerGeometry() {
  const points: THREE.Vector3[] = []
  const rows = [
    { y: -0.12, z: 0.36, len: 0.52, angleY: 0.04 },
    { y: -0.17, z: 0.36, len: 0.56, angleY: -0.02 },
    { y: -0.22, z: 0.35, len: 0.50, angleY: -0.08 },
  ]

  ;[-1, 1].forEach((side) => {
    rows.forEach((row) => {
      const startX = side * 0.14
      const endX = side * (0.14 + row.len)
      const start = new THREE.Vector3(startX, row.y, row.z)
      const mid = new THREE.Vector3(startX + side * row.len * 0.5, row.y + row.angleY * 0.5, row.z - 0.05)
      const end = new THREE.Vector3(endX, row.y + row.angleY, row.z - 0.15)
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
      const curvePoints = curve.getPoints(20)
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
  const introStartTimeRef = useRef<number | null>(null)
  const { viewport } = useThree()

  // Dynamic responsive sizing & positioning for desktop, tablet & mobile viewports
  const isMobile = viewport.width < 4.8
  const isTablet = viewport.width >= 4.8 && viewport.width < 7.5
  const isLaptop = viewport.width >= 7.5 && viewport.height < 5.4 // Laptop screens (~1080p / 768p browser viewports)

  // Smaller scale specifically on mobile phone screens, without touching tablet/laptop/desktop
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
    // Large Desktop Monitors: Huge hero cat model (~5.0)
    return Math.min(5.2, Math.max(4.5, viewport.width * 0.52))
  }, [viewport.width, isMobile, isTablet, isLaptop])

  // Lift the cat model higher up on screen (-0.06 / -0.08)
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

  // Load authentic Yuta Abe cat 3D model
  const { scene } = useGLTF('/cat.glb') as any

  // Extract body and eye meshes, convert to non-indexed and inject barycentric coordinates for wireframe
  const { bodyGeometry, eyeGeometry, whiskerGeometry } = useMemo(() => {
    let bodyGeo: THREE.BufferGeometry | null = null
    let eyeGeo: THREE.BufferGeometry | null = null

    scene.traverse((child: any) => {
      if (child.isMesh && child.geometry) {
        if (child.name.includes('球') || child.name.includes('001') || child.name.toLowerCase().includes('eye')) {
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

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime()
    // Clamp dt to avoid physics explosion on low frame rates or tab switches
    const dt = Math.min(delta, 0.033)

    // -------------------------------------------------------------
    // R1: MOUSE & SCROLL VELOCITY / ACCELERATION TRACKING
    // -------------------------------------------------------------
    const currentMouseX = state.pointer.x
    const currentMouseY = state.pointer.y

    const vx = (currentMouseX - prevMouseRef.current.x) / (dt || 0.016)
    const vy = (currentMouseY - prevMouseRef.current.y) / (dt || 0.016)
    const ax = (vx - mouseVelRef.current.x) / (dt || 0.016)
    const ay = (vy - mouseVelRef.current.y) / (dt || 0.016)

    // Mutate existing refs instead of allocating new objects every frame
    mouseVelRef.current.x = vx
    mouseVelRef.current.y = vy
    mouseAccelRef.current.x = ax
    mouseAccelRef.current.y = ay
    prevMouseRef.current.x = currentMouseX
    prevMouseRef.current.y = currentMouseY

    // Smoothly decay scroll velocity
    scrollVelRef.current *= Math.pow(0.92, dt * 60)

    // -------------------------------------------------------------
    // R1: 6-DOF 2ND-ORDER SPRING-DAMPER PHYSICS ENGINE
    // -------------------------------------------------------------
    const p = physicsStateRef.current

    // Target rotations (firm, crisp rotation tracking with 80% reduced fluid sway)
    const targetRotY = currentMouseX * (isMobile ? 0.12 : 0.18) + vx * 0.005
    const targetRotX = -currentMouseY * (isMobile ? 0.09 : 0.14) + vy * 0.005
    const targetRotZ = currentMouseX * 0.04 - vx * 0.01

    // Target positions (Firm body: gravity sag + breathing float reduced by 80%)
    const gravityPull = -currentMouseY * 0.024 - scrollVelRef.current * 0.008
    const gravitySag = Math.sin(elapsed * 1.8) * 0.009 - 0.05
    const breathingFloat = Math.cos(elapsed * 2.8) * 0.003 + Math.sin(elapsed * 0.85) * 0.004
    
    const targetPosX = currentMouseX * 0.03 + vx * 0.003
    const targetPosY = basePosY + gravitySag + gravityPull + breathingFloat - Math.abs(vy) * 0.004
    const targetPosZ = -Math.abs(currentMouseY) * 0.016 - Math.abs(vx) * 0.004

    // 2nd-Order Spring-Damper Equations (Firm body springs)
    // 1. Position Spring Engine
    const kPos = 350.0
    const cPos = 28.0

    p.accel.x = -kPos * (p.pos.x - targetPosX) - cPos * p.vel.x
    p.accel.y = -kPos * (p.pos.y - targetPosY) - cPos * p.vel.y
    p.accel.z = -kPos * (p.pos.z - targetPosZ) - cPos * p.vel.z

    p.vel.x += p.accel.x * dt
    p.vel.y += p.accel.y * dt
    p.vel.z += p.accel.z * dt

    p.pos.x += p.vel.x * dt
    p.pos.y += p.vel.y * dt
    p.pos.z += p.vel.z * dt

    // 2. Rotation Spring Engine (Firm body rotation)
    const kRot = 300.0
    const cRot = 24.0

    p.rotAccel.x = -kRot * (p.rot.x - targetRotX) - cRot * p.rotVel.x
    p.rotAccel.y = -kRot * (p.rot.y - targetRotY) - cRot * p.rotVel.y
    p.rotAccel.z = -kRot * (p.rot.z - targetRotZ) - cRot * p.rotVel.z

    p.rotVel.x += p.rotAccel.x * dt
    p.rotVel.y += p.rotAccel.y * dt
    p.rotVel.z += p.rotAccel.z * dt

    p.rot.x += p.rotVel.x * dt
    p.rot.y += p.rotVel.y * dt
    p.rot.z += p.rotVel.z * dt

    // Apply 6-DOF transform to cat group
    if (groupRef.current) {
      groupRef.current.position.copy(p.pos)
      groupRef.current.rotation.copy(p.rot)
    }

    // -------------------------------------------------------------
    // NON-OSCILLATING CRITICALLY DAMPED EAR GRAVITY TRACKING (ZERO JIGGLE)
    // -------------------------------------------------------------
    const ear = earPhysicsRef.current
    const targetEarX = -p.rot.z * 0.0104 - vx * 0.0052
    const targetEarY = -Math.abs(p.rot.x) * 0.0104 - vy * 0.0052 - 0.00624  // Ear gravity sag increased by 4%
    const targetEarZ = 0.0

    // Critically damped exponential smoothing: smooth follow with ZERO jiggle or spring wobble
    const earDamp = 1.0 - Math.exp(-16.0 * dt)
    ear.pos.x += (targetEarX - ear.pos.x) * earDamp
    ear.pos.y += (targetEarY - ear.pos.y) * earDamp
    ear.pos.z += (targetEarZ - ear.pos.z) * earDamp
    ear.vel.set(0, 0, 0)

    // -------------------------------------------------------------
    // R2 & R3: UNIFORM UPDATES TO CAT SHADER
    // -------------------------------------------------------------
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = elapsed
      materialRef.current.uniforms.uResolution.value.set(
        state.gl.domElement.width, 
        state.gl.domElement.height
      )
      materialRef.current.uniforms.uMouse.value.set(state.pointer.x, state.pointer.y)
      materialRef.current.uniforms.uScanY.value = Math.sin(elapsed * 1.4) * 1.6

      // Pass soft-body deformation & ear masking uniforms
      materialRef.current.uniforms.uVelocity.value.copy(p.vel)
      materialRef.current.uniforms.uAcceleration.value.copy(p.accel)
      materialRef.current.uniforms.uEarDeform.value.copy(ear.pos)

      // Start auto-cycling only after intro completes (~3.5s); cycle speed 0.027 (~36s full loop, ~12s per mode)
      const cycleTime = Math.max(0, elapsed - 3.5)
      materialRef.current.uniforms.uAutoPhase.value = (cycleTime * 0.027) % 3.0

      // Particle assembly intro progress
      if (!isLoaded) {
        materialRef.current.uniforms.uIntroProgress.value = 0.0
        introStartTimeRef.current = null
      } else {
        if (introStartTimeRef.current === null) {
          introStartTimeRef.current = elapsed
        }
        const activeIntroTime = elapsed - introStartTimeRef.current
        const introVal = Math.min(1.0, activeIntroTime / 3.5)
        materialRef.current.uniforms.uIntroProgress.value = 1.0 - Math.pow(1.0 - introVal, 3)
      }
    }

    // -------------------------------------------------------------
    // R3: FLUID EYE TRACKING LAG / SPRING INERTIA (NODE 1 / "球")
    // -------------------------------------------------------------
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
    }

    // -------------------------------------------------------------
    // R3: HIGH-FLUID WHISKER ELASTICITY & WHIP INERTIA PHYSICS
    // -------------------------------------------------------------
    if (whiskerGeoRef.current && groupRef.current) {
      const targetGeo = (whiskerGeoRef.current as any).geometry || whiskerGeoRef.current
      if (targetGeo && targetGeo.attributes && targetGeo.attributes.position) {
        const posAttr = targetGeo.attributes.position as THREE.BufferAttribute
        if (posAttr && posAttr.array) {
          const array = posAttr.array as Float32Array
          let ptr = 0

          const whiskerRows = [
            { y: -0.12, z: 0.36, len: 0.52, angleY: 0.04, flex: 1.0 },
            { y: -0.17, z: 0.36, len: 0.56, angleY: -0.02, flex: 1.2 },
            { y: -0.22, z: 0.35, len: 0.50, angleY: -0.08, flex: 1.4 },
          ]

          let whiskerIdx = 0
          const kWhisker = 140.0  // Balanced spring stiffness for natural whisker posture
          const cWhisker = 12.0   // Natural damping to prevent drooping

          ;[-1, 1].forEach((side) => {
            whiskerRows.forEach((row, rowIdx) => {
              const stateNode = whiskerPhysicsRef.current[whiskerIdx]
              const startX = side * 0.14
              const endX = side * (0.14 + row.len)

              // Realistic gravity sag increased by 10% + movement inertia when cursor moves
              const gravitySag = -0.0088 * row.flex
              const pitchInertia = -p.rot.x * 0.066 * row.flex - vy * 0.0066 * row.flex
              const rollInertia = side * p.rot.y * 0.055 * row.flex - side * vx * 0.0066 * row.flex
              const sway = Math.sin(elapsed * 2.2 + rowIdx * 0.8 + side * 1.2) * 0.0055 * row.flex

              const totalDrop = gravitySag + pitchInertia + rollInertia + sway

              // Use pre-allocated scratchpad vectors (ZERO allocations per frame)
              _start.set(startX, row.y, row.z)
              _idealMid.set(
                startX + side * row.len * 0.5,
                row.y + row.angleY * 0.5 + totalDrop * 0.45,
                row.z - 0.05
              )
              _idealEnd.set(
                endX,
                row.y + row.angleY + totalDrop,
                row.z - 0.15
              )

              if (!stateNode.initialized) {
                stateNode.midPos.copy(_idealMid)
                stateNode.endPos.copy(_idealEnd)
                stateNode.initialized = true
              }

              // Subtle spring inertia forces (mutate pre-allocated vectors)
              _midInertia.set(
                -p.accel.x * 0.02 * row.flex,
                -p.accel.y * 0.02 * row.flex,
                -p.accel.z * 0.015 * row.flex
              )
              _endInertia.set(
                -p.accel.x * 0.04 * row.flex,
                -p.accel.y * 0.04 * row.flex,
                -p.accel.z * 0.025 * row.flex
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
                .multiplyScalar(kWhisker * 0.9)
              _tempVel.copy(stateNode.endVel).multiplyScalar(cWhisker)
              _fEnd.sub(_tempVel).add(_endInertia)

              stateNode.endVel.addScaledVector(_fEnd, dt)
              _tempVel.copy(stateNode.endVel).multiplyScalar(dt)
              stateNode.endPos.add(_tempVel)

              // Generate 20 sub-segments via inline quadratic bezier (no curve/getPoints allocation)
              const WHISKER_SEGMENTS = 20
              evalQuadBezier(_bezierP, _start, stateNode.midPos, stateNode.endPos, 0)
              for (let seg = 1; seg <= WHISKER_SEGMENTS; seg++) {
                const t = seg / WHISKER_SEGMENTS
                evalQuadBezier(_bezierPNext, _start, stateNode.midPos, stateNode.endPos, t)
                array[ptr++] = _bezierP.x
                array[ptr++] = _bezierP.y
                array[ptr++] = _bezierP.z
                array[ptr++] = _bezierPNext.x
                array[ptr++] = _bezierPNext.y
                array[ptr++] = _bezierPNext.z
                // Swap: current next becomes next current
                _bezierP.copy(_bezierPNext)
              }

              whiskerIdx++
            })
          })

          posAttr.needsUpdate = true
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
      {/* Authentic Yuta Abe Head Base with auto-cycling B&W Halftone / LiDAR / Wireframe Shaders */}
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
