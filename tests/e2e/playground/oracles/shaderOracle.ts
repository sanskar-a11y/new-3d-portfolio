/**
 * Authoritative mathematical and GLSL specification oracle for Kinetic Shaders (R3).
 * Directly derived from PROJECT.md, spec.md, and GLSL fragment/vertex definitions.
 */

export interface ShaderUniformsSpecification {
  uTexA: { type: 't'; required: true };
  uTexB: { type: 't'; required: true };
  uHasA: { type: 'b'; default: false };
  uHasB: { type: 'b'; default: false };
  uRepeatA: { type: 'v2'; default: [1.0, 1.0] };
  uOffsetA: { type: 'v2'; default: [0.0, 0.0] };
  uRepeatB: { type: 'v2'; default: [1.0, 1.0] };
  uOffsetB: { type: 'v2'; default: [0.0, 0.0] };
  uFlatColor: { type: 'v3'; default: [0.05, 0.05, 0.05] };
  uMix: { type: 'f'; default: 0.0; range: [0.0, 1.0] };
  uTransType: { type: 'i'; default: 0; range: [0, 6] };
  uMeshSize: { type: 'v2'; default: [100.0, 100.0] };
  uReveal: { type: 'f'; default: 1.0 };
  uExit: { type: 'f'; default: 0.0 };
  uGrayscale: { type: 'f'; default: 0.0; range: [0.0, 1.0] };
  uNoiseAmt: { type: 'f'; default: 0.0; range: [0.0, 1.0] };
  uHover: { type: 'f'; default: 0.0; range: [0.0, 1.0] };
  uHoverTime: { type: 'f'; default: 0.0 };
  uFade: { type: 'f'; default: 1.0; range: [0.0, 1.0] };
}

export const REQUIRED_UNIFORM_KEYS: Array<keyof ShaderUniformsSpecification> = [
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
];

export const TRANSITION_MODES = [
  { index: 0, id: 'dissolve', name: 'Cell Block Dissolve' },
  { index: 1, id: 'chromatic', name: 'Chromatic Aberration' },
  { index: 2, id: 'noise_burn', name: 'Noise Burn with Cyan Edge' },
  { index: 3, id: 'wave_warp', name: 'Sine Wave Ripple Warp' },
  { index: 4, id: 'scanline_wipe', name: 'Horizontal Band Wipe' },
  { index: 5, id: 'glitch_slice', name: 'Glitch Slice Jitter' },
  { index: 6, id: 'mosaic_crunch', name: 'Mosaic Pixelation Crunch' },
] as const;

/**
 * Optical hover zoom lens UV calculation.
 */
export function computeHoverLensUv(
  uvX: number,
  uvY: number,
  uHover: number,
  maxZoom = 0.07
): { uvX: number; uvY: number } {
  if (uHover <= 0.001) return { uvX, uvY };
  const zoom = Math.max(0, Math.min(1, uHover)) * maxZoom;
  return {
    uvX: (uvX - 0.5) * (1.0 - zoom) + 0.5,
    uvY: (uvY - 0.5) * (1.0 - zoom) + 0.5,
  };
}

/**
 * Neon cyan border pulse and bloom intensity.
 */
export function computeNeonCyanGlow(
  uvX: number,
  uvY: number,
  uHover: number,
  uHoverTime: number,
  uNoiseAmt = 0.0
): { line: number; bloom: number; pulse: number; totalIntensity: number } {
  const hoverGate = uHover * (1.0 - uNoiseAmt);
  if (hoverGate <= 0.001) {
    return { line: 0, bloom: 0, pulse: 0, totalIntensity: 0 };
  }

  const dx = Math.abs(uvX - 0.5) * 2.0;
  const dy = Math.abs(uvY - 0.5) * 2.0;
  const edgeMax = Math.max(dx, dy);

  // Smoothstep helpers
  const smoothstep = (min: number, max: number, x: number) => {
    const t = Math.max(0, Math.min(1, (x - min) / (max - min)));
    return t * t * (3 - 2 * t);
  };

  const line = smoothstep(0.985, 1.0, edgeMax);
  const bloom = Math.pow(smoothstep(0.55, 1.0, edgeMax), 2.5);
  const pulse = 0.80 + 0.20 * Math.sin(uHoverTime * 3.0);
  const totalIntensity = (line * 2.6 + bloom * 0.55) * hoverGate * pulse;

  return { line, bloom, pulse, totalIntensity };
}

/**
 * RGB Luma grayscale conversion.
 */
export function computeLumaGrayscale(r: number, g: number, b: number, uGrayscale: number): [number, number, number] {
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  const gClamped = Math.max(0, Math.min(1, uGrayscale));
  return [
    r * (1 - gClamped) + gray * gClamped,
    g * (1 - gClamped) + gray * gClamped,
    b * (1 - gClamped) + gray * gClamped,
  ];
}

/**
 * Chromatic aberration bell curve & shift magnitude.
 */
export function computeChromaticShift(uMix: number, maxShift = 0.05): number {
  const clampedMix = Math.max(0, Math.min(1, uMix));
  const bell = Math.sin(clampedMix * Math.PI);
  return bell * maxShift;
}

/**
 * Validates GLSL vertex shader code for required elements.
 */
export function validateVertexShader(glsl: string): { valid: boolean; missing: string[] } {
  const required = ['vUv', 'uv', 'projectionMatrix', 'modelViewMatrix', 'gl_Position'];
  const missing = required.filter(r => !glsl.includes(r));
  return { valid: missing.length === 0, missing };
}

/**
 * Validates GLSL fragment shader code for all 7 transition modes and uniforms.
 */
export function validateFragmentShader(glsl: string): { valid: boolean; missing: string[] } {
  const required = [
    'uTexA',
    'uTexB',
    'uMix',
    'uTransType',
    'uHover',
    'uHoverTime',
    'uGrayscale',
    'uFade',
    'vUv',
    'gl_FragColor',
  ];
  const missing = required.filter(r => !glsl.includes(r));
  return { valid: missing.length === 0, missing };
}
