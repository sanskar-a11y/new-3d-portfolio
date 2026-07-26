'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'

// Pure Black & White Yuta Abe-style shader with continuous auto-cycling transitions & bluish hover/transition glow
const CatShader = {
  uniforms: {
    uTime: { value: 0 },
    uAutoPhase: { value: 0 },    // 0-3 continuous cycling: 0-1 wireframe, 1-2 halftone, 2-3 lidar
    uScanY: { value: 0 },
    uIntroProgress: { value: 0 }, // 0.0 (dispersed particles) -> 1.0 (assembled cat)
    uResolution: { value: new THREE.Vector2(1000, 1000) },
    uMouse: { value: new THREE.Vector2(0, 0) },
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

    void main() {
      vUv = uv;
      vBarycentric = barycentric;
      vNormal = normalize(normalMatrix * normal);
      
      // Keep pristine model geometry without ear distortion or shape deformation
      vec3 displacedPos = position;
      
      // Smooth, clean intro assembly without chaotic shape deformation
      float dispersion = 1.0 - smoothstep(0.0, 1.0, uIntroProgress);
      if (dispersion > 0.001) {
        displacedPos += normal * (dispersion * 0.12);
      }
      
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
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const isLoaded = useAppStore((state) => state.isLoaded)
  const introStartTimeRef = useRef<number | null>(null)
  const { viewport } = useThree()

  // Dynamic responsive sizing & positioning for desktop, tablet & mobile viewports
  const isMobile = viewport.width < 4.8
  const isTablet = viewport.width >= 4.8 && viewport.width < 7.5
  const isWidescreen = viewport.aspect >= 1.5 // 16:9 and 16:10 screen aspect ratios

  // Make cat head bigger on desktop (~3.85 - 4.15), balanced on tablet (~3.4), and slightly reduced on mobile (~2.0 - 2.5)
  const responsiveScale = useMemo(() => {
    if (isMobile) {
      return Math.max(2.0, Math.min(viewport.width * 0.52, 2.5))
    }
    if (isTablet) {
      return 3.4
    }
    // Desktop: bigger cat head (3.85 to 4.15 based on aspect ratio)
    return Math.min(4.15, Math.max(3.85, viewport.width * 0.45))
  }, [viewport.width, isMobile, isTablet])

  // Perfectly align the 3D cat head so its ears frame the SANSKAR logo across all screen sizes
  const basePosY = useMemo(() => {
    if (isMobile) return -0.22
    if (isWidescreen) return -0.28
    return -0.26
  }, [isMobile, isWidescreen])

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

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = elapsed
      materialRef.current.uniforms.uResolution.value.set(
        state.gl.domElement.width, 
        state.gl.domElement.height
      )
      // Pass normalized mouse coordinates for bluish hover glow & ear tilt
      materialRef.current.uniforms.uMouse.value.set(state.pointer.x, state.pointer.y)
      materialRef.current.uniforms.uScanY.value = Math.sin(elapsed * 1.4) * 1.6

      // Start auto-cycling only after intro completes (~3.5s); cycle speed 0.027 (~36s full loop, ~12s per mode)
      const cycleTime = Math.max(0, elapsed - 3.5)
      materialRef.current.uniforms.uAutoPhase.value = (cycleTime * 0.027) % 3.0

      // Smooth, impactful particle assembly starting exactly when the preloader finishes!
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

    if (groupRef.current) {
      // Clamped rotation following so ears frame SANSKAR cleanly without overlapping text
      const targetRotationY = state.pointer.x * (isMobile ? 0.08 : 0.12)
      const targetRotationX = -state.pointer.y * (isMobile ? 0.06 : 0.08)

      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.08
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.08

      // Idle floating breathing motion (positioned to align ears perfectly below SANSKAR logo)
      groupRef.current.position.y = basePosY + Math.sin(elapsed * 1.2) * 0.025
    }

    // Dynamic Real-time Whisker Gravity & Spring Inertia Physics
    if (whiskerGeoRef.current && groupRef.current) {
      const posAttr = whiskerGeoRef.current.attributes.position as THREE.BufferAttribute
      if (posAttr) {
        const array = posAttr.array as Float32Array
        let ptr = 0

        const headPitch = groupRef.current.rotation.x
        const headRoll = groupRef.current.rotation.y

        const whiskerRows = [
          { y: -0.12, z: 0.36, len: 0.52, angleY: 0.04, flex: 1.0 },
          { y: -0.17, z: 0.36, len: 0.56, angleY: -0.02, flex: 1.3 },
          { y: -0.22, z: 0.35, len: 0.50, angleY: -0.08, flex: 1.6 },
        ]

        ;[-1, 1].forEach((side) => {
          whiskerRows.forEach((row, rowIdx) => {
            const startX = side * 0.14
            const endX = side * (0.14 + row.len)

            // Gravity sag + motion inertia + subtle organic breathing sway
            const gravitySag = -0.05 * row.flex
            const pitchInertia = -headPitch * 0.3 * row.flex
            const rollInertia = side * headRoll * 0.2 * row.flex
            const sway = Math.sin(elapsed * 2.6 + rowIdx * 0.8 + side * 1.2) * 0.016 * row.flex

            const totalDrop = gravitySag + pitchInertia + rollInertia + sway

            const start = new THREE.Vector3(startX, row.y, row.z)
            const mid = new THREE.Vector3(
              startX + side * row.len * 0.5,
              row.y + row.angleY * 0.5 + totalDrop * 0.45,
              row.z - 0.05
            )
            const end = new THREE.Vector3(
              endX,
              row.y + row.angleY + totalDrop,
              row.z - 0.15
            )

            const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
            const curvePoints = curve.getPoints(20)

            for (let i = 0; i < curvePoints.length - 1; i++) {
              array[ptr++] = curvePoints[i].x
              array[ptr++] = curvePoints[i].y
              array[ptr++] = curvePoints[i].z
              array[ptr++] = curvePoints[i + 1].x
              array[ptr++] = curvePoints[i + 1].y
              array[ptr++] = curvePoints[i + 1].z
            }
          })
        })

        posAttr.needsUpdate = true
      }
    }
  })

  return (
    <group ref={groupRef} position={[0, basePosY, 0]} scale={[responsiveScale, responsiveScale, responsiveScale]}>
      {/* Authentic Yuta Abe Head Base with auto-cycling B&W Halftone / LiDAR / Wireframe Shaders */}
      <mesh geometry={bodyGeometry}>
        <primitive object={customMaterial} ref={materialRef} attach="material" />
      </mesh>

      {/* Pure White Eyeballs */}
      <mesh geometry={eyeGeometry} material={eyeballMaterial} />

      {/* 6 Dynamic Gravity-Affected Whiskers */}
      <lineSegments ref={whiskerGeoRef} geometry={whiskerGeometry} material={whiskerMaterial} />
    </group>
  )
}

useGLTF.preload('/cat.glb')
