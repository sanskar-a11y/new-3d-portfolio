import * as THREE from 'three'

export const tileVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const tileFragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform bool      uHasA;
uniform bool      uHasB;
uniform vec2      uRepeatA;
uniform vec2      uOffsetA;
uniform vec2      uRepeatB;
uniform vec2      uOffsetB;
uniform vec3      uFlatColor;
uniform float     uMix;         // Transition progress 0.0 -> 1.0
uniform int       uTransType;    // Mode 0 to 6
uniform vec2      uMeshSize;     // Cell dimensions in px
uniform float     uReveal;       // Intro reveal progress (-1.0 to 1.0)
uniform float     uExit;         // Exit wipe (0.0 to 1.0)
uniform float     uGrayscale;    // 0.0 = color, 1.0 = grayscale
uniform float     uNoiseAmt;     // 0.0 to 1.0 noise dissolve
uniform float     uHover;        // 0.0 to 1.0 hover optical zoom & glow
uniform float     uHoverTime;    // Continuous time for pulse
uniform float     uFade;         // Master opacity & brightness fade (0.15 for lightbox modal)

varying vec2 vUv;

#define PI 3.14159265358979323846

// High-speed pseudo-random generator
float rand(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 2D Value Noise
float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(rand(i),                  rand(i + vec2(1.0, 0.0)), f.x),
        mix(rand(i + vec2(0.0, 1.0)), rand(i + vec2(1.0, 1.0)), f.x),
        f.y
    );
}

// Sample texture A with cover math
vec3 sampleA(vec2 uv) {
    if (!uHasA) return uFlatColor;
    return texture2D(uTexA, uv * uRepeatA + uOffsetA).rgb;
}

// Sample texture B with cover math
vec3 sampleB(vec2 uv) {
    if (!uHasB) return uFlatColor;
    return texture2D(uTexB, uv * uRepeatB + uOffsetB).rgb;
}

void main() {
    if (vUv.y < uExit) discard;

    float alpha = clamp(uReveal + 1.0, 0.0, 1.0) * clamp(uFade, 0.0, 1.0);
    float texBlend = clamp(uReveal, 0.0, 1.0);
    if (alpha <= 0.0) discard;

    // Dynamic Hover Optical Magnification Lens
    vec2 uv = vUv;
    if (uHover > 0.001) {
        float zoom = uHover * 0.07;
        uv = (uv - 0.5) * (1.0 - zoom) + 0.5;
    }

    vec3 col = uFlatColor;

    if (uMix < 0.001) {
        col = sampleA(uv);
    } else if (uMix > 0.999) {
        col = sampleB(uv);
    } 
    // MODE 0: Procedural Cell Block Dissolve
    else if (uTransType == 0) {
        float cellPx = 14.0;
        vec2 c = floor(vUv * uMeshSize / cellPx);
        float r = rand(c);
        float local = smoothstep(r, r + 0.18, uMix);
        col = mix(sampleA(uv), sampleB(uv), local);
    }
    // MODE 1: Chromatic Aberration & RGB Prism Split
    else if (uTransType == 1) {
        float bell = sin(uMix * PI);
        float sh = bell * 0.05;
        vec2 uvA = uv * uRepeatA + uOffsetA;
        vec2 uvB = uv * uRepeatB + uOffsetB;
        vec3 a = vec3(
            uHasA ? texture2D(uTexA, uvA + vec2(sh, 0.0)).r : uFlatColor.r,
            uHasA ? texture2D(uTexA, uvA).g                 : uFlatColor.g,
            uHasA ? texture2D(uTexA, uvA - vec2(sh, 0.0)).b : uFlatColor.b
        );
        vec3 b = vec3(
            uHasB ? texture2D(uTexB, uvB + vec2(sh, 0.0)).r : uFlatColor.r,
            uHasB ? texture2D(uTexB, uvB).g                 : uFlatColor.g,
            uHasB ? texture2D(uTexB, uvB - vec2(sh, 0.0)).b : uFlatColor.b
        );
        col = mix(a, b, smoothstep(0.4, 0.6, uMix));
    }
    // MODE 2: Luminous Procedural Noise Burn with Electric Cyan Edge
    else if (uTransType == 2) {
        float n = vnoise(vUv * 4.5);
        float thr = uMix * 1.3 - 0.15;
        float band = smoothstep(thr - 0.05, thr + 0.05, n);
        vec3 base = mix(sampleB(uv), sampleA(uv), band);
        float edge = exp(-pow((n - thr) * 22.0, 2.0)) * (1.0 - 4.0 * pow(uMix - 0.5, 2.0));
        col = base + vec3(0.188, 0.722, 1.00) * edge * 0.55;
    }
    // MODE 3: Harmonic Wave Ripple Warp
    else if (uTransType == 3) {
        float bell = sin(uMix * PI);
        vec2 du = vec2(
            sin(vUv.y * 18.0 + uMix * 7.0) * bell * 0.07,
            cos(vUv.x * 18.0 + uMix * 7.0) * bell * 0.07
        );
        vec3 a = sampleA(uv + du);
        vec3 b = sampleB(uv - du);
        col = mix(a, b, smoothstep(0.35, 0.65, uMix));
    }
    // MODE 4: Horizontal Interlaced Scanline Shutter Wipe
    else if (uTransType == 4) {
        float bandY = floor(vUv.y * 9.0);
        float bandDelay = rand(vec2(bandY, 17.3)) * 0.4;
        float local = smoothstep(bandDelay, bandDelay + 0.6, uMix);
        float threshold = local * 1.04 - 0.02;
        float bandMix = smoothstep(threshold - 0.05, threshold + 0.05, vUv.x);
        col = mix(sampleB(uv), sampleA(uv), bandMix);
    }
    // MODE 5: Scanline Glitch Slice Jitter with RGB Fringe
    else if (uTransType == 5) {
        float bell = sin(uMix * PI);
        float sliceY = floor(vUv.y * 24.0);
        float seed = rand(vec2(sliceY, 91.7));
        float ofs = (seed * 2.0 - 1.0) * 0.18 * bell;
        vec2 sUV = uv + vec2(ofs, 0.0);
        float chr = bell * 0.022;
        vec2 uvA = sUV * uRepeatA + uOffsetA;
        vec2 uvB = sUV * uRepeatB + uOffsetB;
        vec3 a = vec3(
            uHasA ? texture2D(uTexA, uvA + vec2(chr, 0.0)).r : uFlatColor.r,
            uHasA ? texture2D(uTexA, uvA).g                  : uFlatColor.g,
            uHasA ? texture2D(uTexA, uvA - vec2(chr, 0.0)).b : uFlatColor.b
        );
        vec3 b = vec3(
            uHasB ? texture2D(uTexB, uvB + vec2(chr, 0.0)).r : uFlatColor.r,
            uHasB ? texture2D(uTexB, uvB).g                  : uFlatColor.g,
            uHasB ? texture2D(uTexB, uvB - vec2(chr, 0.0)).b : uFlatColor.b
        );
        col = mix(a, b, smoothstep(0.30, 0.70, uMix));
    }
    // MODE 6: Dynamic Mosaic Pixelation Crunch
    else {
        float bell = sin(uMix * PI);
        float cellPx = mix(2.0, 32.0, bell);
        vec2 grid = max(uMeshSize / cellPx, vec2(1.0));
        vec2 qUV = (floor(vUv * grid) + 0.5) / grid;
        col = mix(sampleA(qUV), sampleB(qUV), smoothstep(0.45, 0.55, uMix));
    }

    col = mix(uFlatColor, col, texBlend);

    // Dynamic Neon Cyan Bounding Box & Breathing Glow on Hover
    float hoverGate = uHover * (1.0 - uNoiseAmt);
    if (hoverGate > 0.001) {
        vec2 d = abs(vUv - 0.5) * 2.0;
        float edgeMax = max(d.x, d.y);
        float line = smoothstep(0.985, 1.0, edgeMax);
        float bloom = pow(smoothstep(0.55, 1.0, edgeMax), 2.5);
        float pulse = 0.80 + 0.20 * sin(uHoverTime * 3.0);
        col += vec3(0.188, 0.722, 1.0) * (line * 2.6 + bloom * 0.55) * hoverGate * pulse;
    }

    // Grayscale / Theme Adaptation
    float gray = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(gray), uGrayscale);

    // Background Canvas Dimming for Lightbox Modal
    col *= mix(0.20, 1.0, uFade);

    gl_FragColor = vec4(col, alpha);
}
`

export interface CreateTileMaterialOptions {
  width: number
  height: number
  uRepeatA?: [number, number]
  uOffsetA?: [number, number]
  textureA?: THREE.Texture | null
  flatColorHex?: number
}

export function createTileShaderMaterial(options: CreateTileMaterialOptions): THREE.ShaderMaterial {
  const {
    width,
    height,
    uRepeatA = [1, 1],
    uOffsetA = [0, 0],
    textureA = null,
    flatColorHex = 0x121214,
  } = options

  return new THREE.ShaderMaterial({
    vertexShader: tileVertexShader,
    fragmentShader: tileFragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTexA: { value: textureA },
      uTexB: { value: null },
      uHasA: { value: !!textureA },
      uHasB: { value: false },
      uRepeatA: { value: new THREE.Vector2(uRepeatA[0], uRepeatA[1]) },
      uOffsetA: { value: new THREE.Vector2(uOffsetA[0], uOffsetA[1]) },
      uRepeatB: { value: new THREE.Vector2(1, 1) },
      uOffsetB: { value: new THREE.Vector2(0, 0) },
      uFlatColor: { value: new THREE.Color(flatColorHex) },
      uMix: { value: 0.0 },
      uTransType: { value: 0 },
      uMeshSize: { value: new THREE.Vector2(width, height) },
      uReveal: { value: 1.0 },
      uExit: { value: 0.0 },
      uGrayscale: { value: 0.0 },
      uNoiseAmt: { value: 0.0 },
      uHover: { value: 0.0 },
      uHoverTime: { value: 0.0 },
      uFade: { value: 1.0 },
    },
  })
}

// Shader aliases for contract compatibility
export const TILE_VERTEX_SHADER = tileVertexShader
export const TILE_FRAGMENT_SHADER = tileFragmentShader

export const REQUIRED_UNIFORM_KEYS = [
  'uTexA',
  'uTexB',
  'uHasA',
  'uHasB',
  'uRepeatA',
  'uOffsetA',
  'uRepeatB',
  'uOffsetB',
  'uFlatColor',
  'uMix',
  'uTransType',
  'uMeshSize',
  'uReveal',
  'uExit',
  'uGrayscale',
  'uNoiseAmt',
  'uHover',
  'uHoverTime',
  'uFade',
] as const

export const TRANSITION_MODES = [
  { index: 0, id: 'dissolve', name: 'Cell Block Dissolve' },
  { index: 1, id: 'chromatic', name: 'Chromatic Aberration' },
  { index: 2, id: 'noise_burn', name: 'Noise Burn with Cyan Edge' },
  { index: 3, id: 'wave_warp', name: 'Sine Wave Ripple Warp' },
  { index: 4, id: 'scanline_wipe', name: 'Horizontal Band Wipe' },
  { index: 5, id: 'glitch_slice', name: 'Glitch Slice Jitter' },
  { index: 6, id: 'mosaic_crunch', name: 'Mosaic Pixelation Crunch' },
] as const

/**
 * Optical hover zoom lens UV calculation.
 */
export function computeHoverLensUv(
  uvX: number,
  uvY: number,
  uHover: number,
  maxZoom = 0.07
): { uvX: number; uvY: number } {
  if (uHover <= 0.001) return { uvX, uvY }
  const zoom = Math.max(0, Math.min(1, uHover)) * maxZoom
  return {
    uvX: (uvX - 0.5) * (1.0 - zoom) + 0.5,
    uvY: (uvY - 0.5) * (1.0 - zoom) + 0.5,
  }
}

/**
 * Neon cyan border pulse and bloom intensity calculation.
 */
export function computeNeonCyanGlow(
  uvX: number,
  uvY: number,
  uHover: number,
  uHoverTime: number,
  uNoiseAmt = 0.0
): { line: number; bloom: number; pulse: number; totalIntensity: number } {
  const hoverGate = uHover * (1.0 - uNoiseAmt)
  if (hoverGate <= 0.001) {
    return { line: 0, bloom: 0, pulse: 0, totalIntensity: 0 }
  }

  const dx = Math.abs(uvX - 0.5) * 2.0
  const dy = Math.abs(uvY - 0.5) * 2.0
  const edgeMax = Math.max(dx, dy)

  const smoothstep = (min: number, max: number, x: number) => {
    const t = Math.max(0, Math.min(1, (x - min) / (max - min)))
    return t * t * (3 - 2 * t)
  }

  const line = smoothstep(0.985, 1.0, edgeMax)
  const bloom = Math.pow(smoothstep(0.55, 1.0, edgeMax), 2.5)
  const pulse = 0.8 + 0.2 * Math.sin(uHoverTime * 3.0)
  const totalIntensity = (line * 2.6 + bloom * 0.55) * hoverGate * pulse

  return { line, bloom, pulse, totalIntensity }
}

/**
 * RGB Luma grayscale conversion.
 */
export function computeLumaGrayscale(
  r: number,
  g: number,
  b: number,
  uGrayscale: number
): [number, number, number] {
  const gray = 0.299 * r + 0.587 * g + 0.114 * b
  const gClamped = Math.max(0, Math.min(1, uGrayscale))
  return [
    r * (1 - gClamped) + gray * gClamped,
    g * (1 - gClamped) + gray * gClamped,
    b * (1 - gClamped) + gray * gClamped,
  ]
}

/**
 * Chromatic aberration bell curve & shift magnitude.
 */
export function computeChromaticShift(uMix: number, maxShift = 0.05): number {
  const clampedMix = Math.max(0, Math.min(1, uMix))
  const bell = Math.sin(clampedMix * Math.PI)
  return bell * maxShift
}
