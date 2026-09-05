'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   GLSL Shaders: Kinetic Liquid Wave Surface
   Features analytical normal estimation, dynamic specular shine,
   Fresnel rim glow, and mouse interaction ripples.
───────────────────────────────────────────────────────────── */

const liquidVertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vElevation;

  // Simplex 3D Noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // Displacement function
  float getElevation(vec2 pos, float time) {
    float t = time * 0.25;
    
    // Large undulating waves
    float elevation = snoise(vec3(pos.x * 0.4, pos.y * 0.4 - uScroll * 0.001, t * 0.5)) * 0.65;
    
    // Medium secondary ripples
    elevation += snoise(vec3(pos.x * 0.9 + t * 0.2, pos.y * 0.9, t * 0.7)) * 0.3;
    
    // Fine capillary texture
    elevation += snoise(vec3(pos.x * 2.2, pos.y * 2.2 - t * 0.4, t * 1.2)) * 0.12;

    // Interactive mouse distortion wave
    float dist = distance(pos, uMouse);
    float mouseWave = sin(dist * 6.0 - time * 3.5) * exp(-dist * 1.5) * 0.45;
    elevation += mouseWave;

    return elevation;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    float elevation = getElevation(pos.xy, uTime);
    pos.z += elevation;
    vElevation = elevation;

    // Compute normal using finite differences for accurate light reflection
    float offset = 0.04;
    float elRight = getElevation(pos.xy + vec2(offset, 0.0), uTime);
    float elUp    = getElevation(pos.xy + vec2(0.0, offset), uTime);

    vec3 v1 = vec3(offset, 0.0, elRight - elevation);
    vec3 v2 = vec3(0.0, offset, elUp - elevation);
    vec3 calculatedNormal = normalize(cross(v1, v2));

    vNormal = normalMatrix * calculatedNormal;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const liquidFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vElevation;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Directional light following cursor
    vec3 lightDir = normalize(vec3(uMouse.x * 0.8, uMouse.y * 0.8 + 0.3, 1.2));
    
    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);

    // Specular highlight (glossy metallic reflection)
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 28.0);

    // Fresnel rim sheen (creates that luminous edge contour)
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.2);

    // Deep matte black base with titanium-silver sheen
    vec3 matteBase = vec3(0.035, 0.035, 0.04);
    vec3 midTone = vec3(0.09, 0.095, 0.11);
    vec3 silverHighlight = vec3(0.92, 0.94, 0.98);
    vec3 rimColor = vec3(0.65, 0.68, 0.75);

    // Composite surface color
    vec3 color = mix(matteBase, midTone, diff * 0.6);
    color += spec * silverHighlight * 0.75;
    color += fresnel * rimColor * 0.5;

    // Elevation glow on wave crests
    float crest = smoothstep(0.2, 0.8, vElevation);
    color += crest * vec3(0.08, 0.09, 0.11);

    // Subtle edge vignette
    vec2 center = vUv - 0.5;
    float vignette = 1.0 - dot(center, center) * 0.9;
    color *= clamp(vignette, 0.3, 1.0);

    gl_FragColor = vec4(color, 0.95);
  }
`

/* ─── 3D Liquid Plane ─── */
function LiquidMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const mouseRef = useRef(new THREE.Vector2(0, 0))
  const scrollRef = useRef(0)
  const { viewport } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
    }),
    []
  )

  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useFrame(({ clock, pointer }) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.ShaderMaterial

    mat.uniforms.uTime.value = clock.getElapsedTime()

    // Smooth cursor interpolation
    const targetX = pointer.x * viewport.width * 0.5
    const targetY = pointer.y * viewport.height * 0.5
    mouseRef.current.x += (targetX - mouseRef.current.x) * 0.08
    mouseRef.current.y += (targetY - mouseRef.current.y) * 0.08
    mat.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y)

    // Smooth scroll interpolation
    mat.uniforms.uScroll.value += (scrollRef.current - mat.uniforms.uScroll.value) * 0.05
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -0.5]} rotation={[-0.15, 0, 0]}>
      <planeGeometry args={[viewport.width * 1.6, viewport.height * 1.6, 160, 160]} />
      <shaderMaterial
        vertexShader={liquidVertexShader}
        fragmentShader={liquidFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}

/* ─── Floating 3D Particle Dust ─── */
const PARTICLE_COUNT = 120
const PARTICLE_POSITIONS = new Float32Array(PARTICLE_COUNT * 3)
const PARTICLE_SCALES = new Float32Array(PARTICLE_COUNT)

for (let i = 0; i < PARTICLE_COUNT; i++) {
  // Deterministic pseudo-random distribution based on index
  const seed1 = Math.sin(i * 12.9898 + 78.233) * 43758.5453
  const seed2 = Math.sin(i * 93.9898 + 67.345) * 24634.6345
  const seed3 = Math.sin(i * 45.1234 + 12.876) * 58392.1234
  const rand1 = seed1 - Math.floor(seed1)
  const rand2 = seed2 - Math.floor(seed2)
  const rand3 = seed3 - Math.floor(seed3)

  PARTICLE_POSITIONS[i * 3] = (rand1 - 0.5) * 15
  PARTICLE_POSITIONS[i * 3 + 1] = (rand2 - 0.5) * 15
  PARTICLE_POSITIONS[i * 3 + 2] = (rand3 - 0.5) * 6 + 1
  PARTICLE_SCALES[i] = rand1 * 0.04 + 0.015
}

function ParticleDust() {
  const pointsRef = useRef<THREE.Points>(null)

  useFrame(({ clock, pointer }) => {
    if (!pointsRef.current) return
    const t = clock.getElapsedTime()
    pointsRef.current.rotation.y = t * 0.015 + pointer.x * 0.05
    pointsRef.current.rotation.x = t * 0.01 + pointer.y * 0.05
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[PARTICLE_POSITIONS, 3]}
        />
        <bufferAttribute
          attach="attributes-scale"
          args={[PARTICLE_SCALES, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#c8d0e0"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

/* ─── Exported Fullscreen Background Component ─── */
export function AboutBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full overflow-hidden bg-[#0a0a0a]">
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        camera={{ position: [0, 0, 4.2], fov: 50 }}
      >
        <LiquidMesh />
        <ParticleDust />
      </Canvas>
    </div>
  )
}
