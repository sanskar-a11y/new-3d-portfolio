# Project: Interactive WebGL Playground

## Architecture
- **Rendering Architecture**: Dedicated Three.js WebGL canvas (`components/playground/PlaygroundCanvas.tsx`) mounted inside `app/playground/PlaygroundClient.tsx`. Global 3D canvas (`GlobalCanvas.tsx`) halts rendering on `/playground` (`frameloop="never"`), granting full GPU budget to the playground.
- **Surface & Geometry**: Recursive 2D Binary Space Partitioning (BSP) on desktop/tablet and 3-column masonry on mobile (<480px) subdividing 48 sketch planes with `uRepeat` and `uOffset` UV aspect ratio cover fitting.
- **Physics & Coordinate Wrapping**: Dual-axis toroidal coordinate wrapping ($x - \text{round}(x / W_{pack}) \times W_{pack}$) across a 3x3 grid of replica meshes, driven by frame-rate independent exponential damping ($1 - e^{-10 \cdot dt}$) and friction decay ($e^{-4 \cdot dt}$) with dynamic drag zoom pullback (0.92).
- **Custom Shaders**: Single unified GLSL `ShaderMaterial` with 7 transition modes (dissolve, chromatic aberration, value noise burn, wave warp, scanline wipe, glitch slice, mosaic crunch), optical hover zoom lens, pulsing neon cyan bloom, and light/dark theme adaptation.
- **HUD & Modal Overlay**: Zero-jank DOM overlay (`PlaygroundHUD.tsx`) synchronizing active cell counter, elapsed session stopwatch, switch counter, and reaction game, coupled with raycast click detection (threshold <8px) opening `SketchLightbox.tsx` with background canvas dimming (`uFade = 0.15`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | F01-BSP-Desktop-Layout | Recursive BSP mosaic algorithm for desktop ($W_{min}=130, H_{min}=100, W_{max}=360, H_{max}=280, X=1.4, gap=14$) | M1 | ORIGINAL_REQUEST §R1 |
| 2 | F02-Mobile-Masonry-Layout | 3-column normalized masonry layout for mobile viewports (<480px) | M1 | ORIGINAL_REQUEST §R1 |
| 3 | F03-Tablet-Responsive-Density | Dynamic grid density scaling for tablet viewports (768px) | M1 | ORIGINAL_REQUEST §R1 |
| 4 | F04-UV-Aspect-Ratio-Cover | GLSL `uRepeat` & `uOffset` UV aspect-ratio cover mapping for 5 sketch aspect ratios | M1 | ORIGINAL_REQUEST §R1 |
| 5 | F05-Dynamic-DPR-Clamping | Dynamic DPR scaling clamped to `Math.min(window.devicePixelRatio, 1.5)` | M1 | ORIGINAL_REQUEST §R1 |
| 6 | F06-48-Sketch-Texture-Loading | Texture loading and mipmapping for all 48 catalog images | M1 | ORIGINAL_REQUEST §R1 |
| 7 | F07-Window-Resize-Handling | Responsive canvas resize and layout regeneration on viewport resize | M1 | ORIGINAL_REQUEST §R1 |
| 8 | F08-Orthographic-Camera | Pixel-perfect orthographic projection matching window dimensions | M1 | ORIGINAL_REQUEST §R1 |
| 9 | F09-Pointer-Drag-Panning | Mouse drag with velocity tracking and momentum release | M2 | ORIGINAL_REQUEST §R2 |
| 10 | F10-Touch-Swipe-Physics | Multi-touch swipe and flick physics with non-blocking viewport scrolling | M2 | ORIGINAL_REQUEST §R2 |
| 11 | F11-Trackpad-Wheel-Inertia | Smooth continuous trackpad and mousewheel delta accumulation | M2 | ORIGINAL_REQUEST §R2 |
| 12 | F12-Exponential-Damping | Frame-rate independent exponential damping ($1 - e^{-10 \cdot dt}$) | M2 | ORIGINAL_REQUEST §R2 |
| 13 | F13-Friction-Decay | Exponential velocity friction decay ($e^{-4 \cdot dt}$) | M2 | ORIGINAL_REQUEST §R2 |
| 14 | F14-Toroidal-Grid-Wrapping | Dual-axis coordinate wrapping ($x - \text{round}(x / W_{pack}) \times W_{pack}$) over 3x3 replicas | M2 | ORIGINAL_REQUEST §R2 |
| 15 | F15-Dynamic-Drag-Zoom | Dynamic camera pullback zoom to 0.92 during active drag | M2 | ORIGINAL_REQUEST §R2 |
| 16 | F16-Idle-Ambient-Drift | Gentle continuous ambient drift when idle | M2 | ORIGINAL_REQUEST §R2 |
| 17 | F17-Shader-Cell-Block-Dissolve | GLSL Mode 0: Procedural cell block dissolve transition | M3 | ORIGINAL_REQUEST §R3 |
| 18 | F18-Shader-Chromatic-Aberration | GLSL Mode 1: RGB prism split with channel offsets on velocity/switch | M3 | ORIGINAL_REQUEST §R3 |
| 19 | F19-Shader-Noise-Burn | GLSL Mode 2: Value noise burn with electric cyan border | M3 | ORIGINAL_REQUEST §R3 |
| 20 | F20-Shader-Wave-Warp | GLSL Mode 3: Sine wave ripple warp distortion | M3 | ORIGINAL_REQUEST §R3 |
| 21 | F21-Shader-Scanline-Wipe | GLSL Mode 4: Horizontal interlaced scanline shutter wipe | M3 | ORIGINAL_REQUEST §R3 |
| 22 | F22-Shader-Glitch-Slice | GLSL Mode 5: Horizontal glitch slice jitter with RGB fringe | M3 | ORIGINAL_REQUEST §R3 |
| 23 | F23-Shader-Mosaic-Pixelation | GLSL Mode 6: Dynamic mosaic downsampling pixelation | M3 | ORIGINAL_REQUEST §R3 |
| 24 | F24-Shader-Hover-Optical-Lens | Dynamic hover magnification lens zooming UVs toward cursor | M3 | ORIGINAL_REQUEST §R3 |
| 25 | F25-Shader-Neon-Cyan-Pulse | Pulsing neon cyan bounding box with exponential bloom on hover | M3 | ORIGINAL_REQUEST §R3 |
| 26 | F26-Shader-Theme-Adaptation | Smooth light/dark mode adaptation via grayscale/luma uniform | M3 | ORIGINAL_REQUEST §R3 |
| 27 | F27-HUD-Active-Cell-Counter | Real-time active cell counter in HUD corner | M4 | ORIGINAL_REQUEST §R4 |
| 28 | F28-HUD-Elapsed-Stopwatch | Session elapsed time stopwatch formatted as MM:SS | M4 | ORIGINAL_REQUEST §R4 |
| 29 | F29-HUD-Switch-Counter | Total shader/theme switch counter with matrix hacker scramble | M4 | ORIGINAL_REQUEST §R4 |
| 30 | F30-HUD-Shift-LightsOut | SHIFT key and toggle pill trigger for LightsOut theme & reaction game | M4 | ORIGINAL_REQUEST §R4 |
| 31 | F31-Click-Drag-Discrimination | Click threshold discrimination (<8px) between drag drift and card click | M4 | ORIGINAL_REQUEST §R4 |
| 32 | F32-Lightbox-Modal-Integration | Card click opens `SketchLightbox` modal with canvas dimming (`uFade = 0.15`) | M4 | ORIGINAL_REQUEST §R4 |
| 33 | F33-Continuous-Animation-Loop | Modal open/close maintains continuous WebGL render loop without context loss | M4 | ORIGINAL_REQUEST §R4 |
| 34 | F34-E2E-60FPS-Fidelity-Audit | 60+ FPS verification, clean build (`npm run build`), and forensic audit | M5 | ORIGINAL_REQUEST §Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Test Infrastructure & Suite Setup | Automated test runner & Tiers 1-4 test suite (`TEST_READY.md`) | none | IN_PROGRESS |
| M1 | Procedural Mosaic Surface & Geometry | Three.js canvas, BSP/masonry layout, UV cover mapping, DPR scaling | M0 | PLANNED |
| M2 | Fluid 2D Momentum Drift & Navigation | Momentum physics, touch/trackpad drag, toroidal wrapping, dynamic zoom | M1 | PLANNED |
| M3 | Kinetic Shader Effects & Transitions | 7 GLSL transition shaders, hover magnification lens, neon bloom, theme | M1 | PLANNED |
| M4 | Responsive HUD & Modal Integration | HUD counters (cells, elapsed, switches, SHIFT), click threshold, lightbox | M2, M3 | PLANNED |
| M5 | E2E Test Pass & Adversarial Hardening | Pass 100% E2E tests (T1-T4), Tier 5 adversarial stress tests, audit, build | M1, M2, M3, M4 | PLANNED |

## Interface Contracts

### Mosaic Layout Generator ↔ Three.js Canvas
- **Function**: `generateMosaicLayout(viewportWidth: number, viewportHeight: number, sketches: SketchDef[]): MosaicLayoutResult`
- **Returns**: `{ cells: MosaicCell[], packWidth: number, packHeight: number }`
- **Cell Structure**:
  ```ts
  interface MosaicCell {
    id: string;
    sketch: SketchDef;
    x: number; // center x relative to pack center
    y: number; // center y relative to pack center
    width: number;
    height: number;
    aspectRatio: number;
    uRepeat: [number, number];
    uOffset: [number, number];
  }
  ```

### Momentum Physics Controller ↔ WebGL Render Loop
- **Function**: `createMomentumPhysics(options: PhysicsOptions): MomentumController`
- **Methods**:
  - `onPointerDown(x: number, y: number): void`
  - `onPointerMove(x: number, y: number): void`
  - `onPointerUp(): { wasClick: boolean, clickDistance: number }`
  - `onWheel(deltaX: number, deltaY: number): void`
  - `update(dt: number): { scrollX: number, scrollY: number, velocity: number, isDragging: boolean, zoom: number }`

### Kinetic Shader Material Contract
- **Uniforms**:
  - `uTexA: { value: THREE.Texture | null }`
  - `uTexB: { value: THREE.Texture | null }`
  - `uMix: { value: number }` (0.0 to 1.0)
  - `uTransType: { value: number }` (0 through 6)
  - `uRepeat: { value: THREE.Vector2 }`
  - `uOffset: { value: THREE.Vector2 }`
  - `uHover: { value: number }` (0.0 to 1.0)
  - `uHoverTime: { value: number }` (seconds)
  - `uNoiseAmt: { value: number }` (0.0 to 1.0)
  - `uLightsOut: { value: number }` (0.0 for light/normal, 1.0 for dark/lights-out)
  - `uFade: { value: number }` (1.0 default, 0.15 when modal active)

### HUD Synchronization Contract
- **Props in `PlaygroundHUD.tsx`**:
  ```ts
  interface PlaygroundHUDProps {
    cellCount: number;
    switchCount: number;
    lightsOut: boolean;
    onToggleLights: () => void;
    activeTitle?: string;
  }
  ```

## Code Layout
- `components/playground/PlaygroundCanvas.tsx`: Main Three.js canvas container and render loop coordinator
- `components/playground/shaders/tileShader.ts`: GLSL vertex and fragment shader definitions & uniforms
- `lib/playground/mosaicLayout.ts`: Recursive BSP and 3-column mobile masonry layout engine
- `lib/playground/momentumPhysics.ts`: Frame-rate independent 2D momentum, damping, toroidal wrap, and zoom physics
- `components/playground/PlaygroundHUD.tsx`: Responsive HUD overlay with cell count, elapsed time, switches, and SHIFT toggle
- `app/playground/PlaygroundClient.tsx`: Top-level client coordinator wiring WebGL canvas, HUD, LightsOut, and SketchLightbox
- `tests/e2e/playground/`: Automated E2E test suite (Tiers 1-4 + Tier 5 adversarial)
