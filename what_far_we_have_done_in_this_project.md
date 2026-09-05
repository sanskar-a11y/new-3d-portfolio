# What Far We Have Done In This Project (Comprehensive Log & Architectural Roadmap)

This document is the definitive living memory, technical log, and architectural record of every feature designed, command executed, error debugged, and optimization implemented in building Sanskar's interactive 3D portfolio.

---

## Table of Contents
1. [Project Initialization & Next.js Architecture](#1-project-initialization--nextjs-architecture)
2. [Landing Page Isolation & Section Decoupling](#2-landing-page-isolation--section-decoupling)
3. [3D Model Layering, Spatial Positioning & Viewport Collision Fixes](#3-3d-model-layering-spatial-positioning--viewport-collision-fixes)
4. [3D Feline Model Evolution (Procedural Sculpting to GLTF Hybrid)](#4-3d-feline-model-evolution-procedural-sculpting-to-gltf-hybrid)
5. [Custom GLSL Shader Architecture & Multi-Mode Auto-Cycling](#5-custom-glsl-shader-architecture--multi-mode-auto-cycling)
6. [6-DOF Spring Physics, Whisker Aerodynamics & Organic Kinematics](#6-6-dof-spring-physics-whisker-aerodynamics--organic-kinematics)
7. [Preloader Overhaul & Synchronization Engine](#7-preloader-overhaul--synchronization-engine)
8. [Thermal Optimization, GPU Power Management & Zero-Allocation Render Loop](#8-thermal-optimization-gpu-power-management--zero-allocation-render-loop)
9. [Global Persistent Canvas Architecture & App Router Navigation](#9-global-persistent-canvas-architecture--app-router-navigation)
10. [Sub-Page Architecture & Interactive Features](#10-sub-page-architecture--interactive-features)
11. [Synthetic Web Audio Synthesizer Engine](#11-synthetic-web-audio-synthesizer-engine)
12. [WCAG AA Accessibility, Keyboard Navigation & Motion Preferences](#12-wcag-aa-accessibility-keyboard-navigation--motion-preferences)
13. [SEO, Structured Data & Metadata Architecture](#13-seo-structured-data--metadata-architecture)
14. [Repository Cleanliness, ESLint 9 Flat Config & Build Verification](#14-repository-cleanliness-eslint-9-flat-config--build-verification)
15. [Interactive WebGL Playground Animation Architecture & Yuta Abe Parity](#15-interactive-webgl-playground-animation-architecture--yuta-abe-parity)

---

## 1. Project Initialization & Next.js Architecture
* **User Command**: *"launch website"*
* **Technical Challenges**:
  - Initial setup experienced a Next.js App Router breaking build error: `The default export is not a React Component in "/page"`.
  - Incompatible component boundaries between React Server Components (RSC) and WebGL client components (`@react-three/fiber`, `@react-three/drei`).
* **Solutions & Implementations**:
  - Restructured `app/page.tsx` with clean Server Component wrappers and isolated client-side rendering boundaries (`'use client'`).
  - Established a unified tech stack: Next.js 15 App Router, React 19, TypeScript 5.9, Three.js (r185), React Three Fiber 9, React Three Drei 10, Framer Motion 12, GSAP 3.15, Lenis smooth scrolling, Tailwind CSS 4, and Zustand 5 state management.

---

## 2. Landing Page Isolation & Section Decoupling
* **User Command**: *"I just only want that 3D cat on the landing page nothing else not the projects do not think projects when I want navbar and the stuff that have navbar inside... remove the project from when we scroll down from a landing page I only see project in the project web page not on a landing page Also I don't want to see about section on my landing page..."*
* **Technical Challenges**:
  - The initial template was a monolithic one-page vertical scroll containing `Hero`, `About`, `Works`, `Projects`, and `Footer` in a single document.
  - Scrolling on the landing page caused involuntary viewport shifts that broke the immersive 3D canvas viewport.
* **Solutions & Implementations**:
  - Completely decoupled the landing page (`app/page.tsx`) into a standalone, full-screen interactive 3D WebGL viewport (`select-none overflow-hidden h-screen`).
  - Migrated content sections into dedicated, highly optimized Next.js App Router sub-routes:
    - `/about` (`app/about/page.tsx` & `AboutClient.tsx`)
    - `/projects` (`app/projects/page.tsx` & `ProjectsClient.tsx`)
    - `/playground` (`app/playground/page.tsx` & `PlaygroundClient.tsx`)
    - `/contact` (`app/contact/page.tsx` & `ContactClient.tsx`)
  - Cleaned up unneeded vertical scroll bars and eliminated scroll listeners on the home route.

---

## 3. 3D Model Layering, Spatial Positioning & Viewport Collision Fixes
* **User Command**: *"our navbar and our cat are merging together... lower the hero section and above section... reduce the size of 3D cat a little bit..."*
* **Technical Challenges**:
  - The 3D model geometry had an oversized bounding sphere that overlapped the fixed top `<Navbar>` on standard 1080p and laptop screens.
  - Aggressive pointer tracking pushed the cat cranium into the top HUD header.
* **Solutions & Implementations**:
  - Adjusted base mesh scale and normalized coordinates (`basePosY: -0.08` for desktop, `-0.06` for laptop viewports).
  - Implemented dynamic viewport-aware responsive scaling in `CatModel.tsx`:
    - Mobile (`viewport.width < 4.8`): `Math.max(2.6, Math.min(viewport.width * 0.68, 3.2))`
    - Tablet (`4.8 <= width < 7.5`): `4.2`
    - Laptop (`width >= 7.5 && height < 5.4`): `4.5`
    - Desktop: `Math.min(5.2, Math.max(4.5, viewport.width * 0.52))`
  - Added spatial constraints and clamped lerp damping to ensure the model stays perfectly centered without clipping header or footer UI chrome.

---

## 4. 3D Feline Model Evolution (Procedural Sculpting to GLTF Hybrid)
* **User Commands**:
  - *"I want this type of cat image not the one you created. This one is look so disgusting and so much very bad... take inspiration from yutaabe.com"*
  - *"The cat is too much round... I want a stylish edgy cat... origami diamond facets"*
* **Evolution Milestones**:
  1. **Phase 1 (Basic Sphere)**: Initial naive sphere mesh with basic wireframe material.
  2. **Phase 2 (Procedural Icosahedron Sculpting - Historical `lib/proceduralCatHead.ts`)**:
     - Programmatically deformed `THREE.IcosahedronGeometry(1.45, 3)` using vertex mathematical displacement functions.
     - Extruded angular cheekbones (`Math.exp(-pow(y + 0.12, 2)/0.06 - pow(z - 0.35, 2)/0.15)`), tapered jaw/chin profiles, extruded triangular muzzle pads, and carved almond eye sockets.
     - Sculpted 4-sided origami pyramid ears (`ConeGeometry(0.78, 1.75, 4, 1)` rotated at 45°).
  3. **Phase 3 (GLTF Low-Poly Model Integration with Dynamic Barycentrics - `/cat.glb`)**:
     - Upgraded to a production-grade 3D GLTF asset (`public/cat.glb`) representing a sleek, stylized feline silhouette (safely deprecating and removing the Phase 2 procedural prototype).
     - Extracted body mesh and eyeball sub-meshes at runtime.
     - Converted indexed geometry to non-indexed buffer geometry (`geometry.toNonIndexed()`) and dynamically injected 3-channel barycentric coordinates (`[1,0,0]`, `[0,1,0]`, `[0,0,1]` per triangle) into `barycentric` vertex attributes for GPU-accelerated single-pass wireframe edge rendering.
     - Preserved procedurally generated dynamic cubic Bézier whiskers for organic secondary physics.

---

## 5. Custom GLSL Shader Architecture & Multi-Mode Auto-Cycling
* **User Commands**:
  - *"Clean up the landing page — remove all neon colors, make it black and white, auto-cycle the transitions"*
  - *"remove the rough blueish area when hovering... make transition areas pop with electric energy"*
* **Shader Architecture (`CatShader` in `CatModel.tsx`)**:
  - **Vertex Shader Highlights**:
    - Barycentric coordinate pass-through (`varying vec3 vBarycentric`).
    - Ear vertex gravitational deformation via `uniform vec3 uEarDeform` masked by spatial height and width (`smoothstep(0.15, 0.35, position.y) * smoothstep(0.15, 0.30, abs(position.x))`).
    - Particle assembly dispersion intro: during loading exit, vertices expand along surface normals (`displacedPos += normal * (dispersion * 0.12)` where `dispersion = 1.0 - smoothstep(0.0, 1.0, uIntroProgress)`).
  - **Fragment Shader Modes**:
    - **Mode 0: Monochrome Faceted Low-Poly Wireframe**:
      - Anti-aliased single-pixel wireframe edges via derivative width `fwidth(min(min(bary.x, bary.y), bary.z))`.
      - Discrete stepped facet luminance (`floor(NdotL * 5.0) / 5.0`).
      - Subtle white-tinted Fresnel rim lighting (`pow(1.0 - dot(viewDir, normal), 3.0)`).
    - **Mode 1: World-Space 45° Rotated Halftone Dot Matrix**:
      - Surface-adhered procedural 2D dot grid computed in world space coordinates (`vWorldPosition.xy`).
      - 45-degree rotation matrix (`mat2(0.7071, -0.7071, 0.7071, 0.7071)`) for classic print-screen halftone aesthetics.
      - Dot radius modulated by dual key/fill directional lighting with `fwidth` screen-space anti-aliasing.
    - **Mode 2: Holographic LiDAR Photon Laser Sweep**:
      - Dynamic laser beam plane sweeping across the Y-axis (`sin(uTime * 1.4) * 1.6`).
      - Laser core pulse (`smoothstep(0.04, 0.0, abs(vWorldPosition.y - uScanY)) * 3.0`).
      - Trailing micro-line scan artifact (`sin(vWorldPosition.y * 120.0 - uTime * 20.0)`).
  - **Crossfade Energy & Interaction**:
    - Continuous auto-cycling (~36s full loop, ~12s per visual state).
    - Crossfade transition windows trigger an electric cyan-blue wireframe surge (`vec3(0.08, 0.55, 1.0)` with boosted line thickness `fwidth * 2.5`).
    - Screen-space corrected interactive hover glow tracking cursor proximity without distorting base geometry.

---

## 6. 6-DOF Spring Physics, Whisker Aerodynamics & Organic Kinematics
* **Architecture**:
  - Implemented an advanced 6-Degree-of-Freedom (6-DOF) 2nd-order spring-damper physics simulation executed every frame in `useFrame`:
    $$\mathbf{a}_{\text{pos}} = -k_{\text{pos}}(\mathbf{p} - \mathbf{p}_{\text{target}}) - c_{\text{pos}}\mathbf{v}_{\text{pos}}$$
    $$\mathbf{a}_{\text{rot}} = -k_{\text{rot}}(\mathbf{\theta} - \mathbf{\theta}_{\text{target}}) - c_{\text{rot}}\mathbf{\omega}_{\text{rot}}$$
  - **Critical Damping**: Tuned spring stiffness and damping constants ($k_{\text{pos}} = 350.0, c_{\text{pos}} = 37.5, k_{\text{rot}} = 300.0, c_{\text{rot}} = 34.6$) to eliminate artificial oscillation while preserving natural physical inertia.
  - **Fluid Head Tracking & Breathing**:
    - Pointer velocity & acceleration tracking ($v_x, v_y, a_x, a_y$).
    - Micro-breathing scale oscillation ($0.5\%$ sinus rhythm at $1.2\text{ rad/s}$).
    - Mobile gyroscope device orientation integration (`DeviceOrientationEvent` tilt-to-track).
  - **Eyeball Saccadic Tracking Lag**:
    - Independent 2nd-order spring for eyeball rotation and socket translation ($k_{\text{eye}} = 180.0, c_{\text{eye}} = 18.0$) to simulate lifelike visual saccades and gaze inertia.
  - **Multi-Node Cubic Bézier Whisker Elasticity**:
    - 6 dynamically simulated whisker lines (3 left, 3 right) originating from the muzzle.
    - Each whisker simulates a Mid Node and End Tip Node through spring-lag inertia, aerodynamic drag, multi-harmonic breath sway ($2.8\text{ rad/s}$), flutter ($5.4\text{ rad/s}$), and stochastic micro-twitch impulses ($26.0\text{ rad/s}$).
    - Evaluated at runtime into 24 cubic Bézier sub-segments with travelling wave ripples along the filament tip.

---

## 7. Preloader Overhaul & Synchronization Engine
* **User Commands**:
  - *"I am stuck on the preloader... My loader screen is just saying 000 percentage... loader is looks so cringe. I want the classic and good loader."*
  - *"animation takes too long to start and happens too fast"*
* **Technical Root Cause**:
  - `@react-three/drei`'s `useProgress()` tracked 0 download items for memory-generated procedural assets, hanging the loader at 000%.
  - Canvas mounting clock started while the preloader was active, causing the intro animation to finish before the overlay faded out.
* **Solutions & Implementations**:
  - Engineered a deterministic dual-phase progress controller in `components/ui/Preloader.tsx`:
    - Linear interpolation from `000` to `100` over ~750ms paired with an absolute fail-safe fallback timeout (1500ms).
    - Minimalist Japanese aesthetic: clean monospace typography (`Space_Mono`), ultra-thin progress bar, and elegant opacity exit transition.
  - Synchronized `CatModel.tsx` intro progress with `useAppStore.getState().isLoaded`.
  - The 3.5s particle coalescing animation begins at $0.0$ at the exact microsecond the preloader completes, delivering an impactful, cinematic entrance.

---

## 8. Thermal Optimization, GPU Power Management & Zero-Allocation Render Loop
* **User Command**: *"My laptop is getting so much heat also it. So what's the problem behind it?"*
* **Root Cause Analysis**:
  - Canvas recreation on every route change created orphaned WebGL contexts and GPU memory leaks.
  - Per-frame Vector3/Matrix object instantiations triggered frequent JavaScript garbage collection (GC) pauses and thermal throttling.
  - High-DPI screens rendered at unconstrained native resolution (3x-4x DPR), saturating mobile/laptop fill rates.
* **Engineering Solutions**:
  - **Persistent Global Canvas**: Promoted `CanvasWrapper` and `GlobalCanvas` into `app/layout.tsx`. The WebGL context stays alive permanently across client route changes.
  - **DPR Clamping**: Clamped rendering resolution to `dpr={[1, 1.5]}` on high-DPI displays with `powerPreference: 'high-performance'`.
  - **Zero-Allocation Render Loops**: Pre-allocated all scratchpad vectors (`_start`, `_rootArc`, `_idealMid`, `_idealEnd`, `_midInertia`, `_endInertia`, `_fMid`, `_fEnd`, `_tempVel`, `_bezierP`, `_bezierPNext`) statically outside the render component.
  - **Browser Tab Visibility Management**: Added `visibilitychange` listeners to pause WebGL frame loops, 2D canvas pixel animations (`PixelBackground.tsx`), and GSAP tickers when the tab is hidden or backgrounded, dropping CPU/GPU usage to 0%.
  - **Lenis Reflow Optimization**: Eliminated forced synchronous reflow (`getBoundingClientRect`) calls inside scroll listeners in `Works.tsx`.

---

## 9. Global Persistent Canvas Architecture & App Router Navigation
* **Architecture (`components/canvas/CanvasWrapper.tsx` & `GlobalCanvas.tsx`)**:
  - `CanvasWrapper` inspects the active pathname (`usePathname()`).
  - Automatically handles 3D model visibility and camera transitions:
    - Route `/`: Full interactive 3D Cat Model with real-time HUD telemetry.
    - Routes `/about`, `/contact`: Subtly desaturated background particle atmosphere (`AboutBackground.tsx`).
    - Routes `/projects`, `/playground`: Canvas smoothly hides or delegates rendering to specialized page graphics.
  - Seamless route crossfades powered by `TransitionProvider.tsx` and Framer Motion layout animations.

---

## 10. Sub-Page Architecture & Interactive Features

### A. About (`app/about/`)
- Interactive biography showcasing Sanskar's journey as a Creative Developer & AI Engineer.
- Interactive Skills Matrix with category filtering:
  - *Core Technologies*: Next.js, React, TypeScript, Python, Three.js, WebGL/GLSL, Tailwind CSS, GSAP, Node.js.
  - *AI & Engineering*: PyTorch, Hugging Face, LangChain, RAG Systems, OpenAI API, Gemini API, FastEmbed.
  - *Design & Creative*: UI/UX Architecture, 3D Shaders, Framer Motion, Kinetic Typography, Video Editing.
- Career Timeline: Hackathon victories (COER Hackathon Winner), high-impact open source repositories, freelance achievements on Fiverr and GitHub.

### B. Projects (`app/projects/`)
- Curated showcase of flagship engineering projects:
  - **Yuta Abe 3D Cat Portfolio**: Interactive WebGL 3D experience with 6-DOF physics, custom GLSL shaders, and zero-allocation animation loops.
  - **AI Automation & Intelligence Suite**: End-to-end Python/LLM pipeline for autonomous workflows, document ingestion, and multi-modal intelligence.
  - **Algorithmic Shader Laboratory**: Collection of real-time WebGL/GLSL fragment shaders exploring raymarching, Signed Distance Functions (SDFs), and volumetric lighting.
  - **Minimalist Luxury E-Commerce**: High-performance headless e-commerce store built with Next.js App Router, Tailwind CSS, and micro-interactions.
- Full keyboard accessible modal details with synthetic sound effects.

### C. Playground (`app/playground/`)
- Generative art catalog featuring **48 curated sketches** with interactive Lightbox zoom.
- Integrated **Lights Out** puzzle mini-game with custom HUD and reset logic.
- Custom Playground HUD with live performance stats and interactive filters.

### D. Contact (`app/contact/`)
- Clean, accessible contact channel with direct email links (`sanskarsharma923@gmail.com`), Fiverr profile, LinkedIn, and GitHub integration.
- Copy-to-clipboard functionality with synthetic audio feedback.

---

## 11. Synthetic Web Audio Synthesizer Engine
* **Architecture (`lib/audio.ts`)**:
  - 100% dependency-free Web Audio API synthesizer.
  - Generates a pristine synthetic glass clink sound using dual sine wave oscillators ($2200\text{ Hz}$ primary, $4400\text{ Hz}$ secondary overtone) with an exponential gain decay envelope ($350\text{ms}$).
  - Global audio mute toggle stored in memory and synced across UI components.
  - Zero external `.mp3`/`.wav` network requests or asset loading overhead.

---

## 12. WCAG AA Accessibility, Keyboard Navigation & Motion Preferences
* **Accessibility Implementations**:
  - **Reduced Motion Compliance**: Integrated `@media (prefers-reduced-motion: reduce)` in `globals.css` and `useReducedMotion()` in `TransitionProvider.tsx` to disable non-essential motion for vestibular-sensitive users.
  - **Contrast Ratios**: Refactored low-contrast text strings (`text-white/40` -> `text-white/70`, `text-gray-600` -> `text-gray-300`) to strictly achieve WCAG AA contrast ratio ($\ge 4.5:1$).
  - **Keyboard Navigation & Focus Rings**:
    - Explicit focus indicators (`focus-visible:ring-2 focus-visible:ring-white`).
    - Full keyboard triggers (`Enter`, `Space`) on interactive project cards and lightbox items.
    - ARIA attributes: `aria-current="page"`, `aria-label`, `aria-expanded`, `role="button"`.
  - **Screen Reader Hierarchy**: Added semantic `sr-only` `<h1>`, `<h2>`, and `<p>` SEO tags on the landing page so search engine crawlers and screen readers access complete portfolio information.

---

## 13. SEO, Structured Data & Metadata Architecture
* **Metadata & Schema.org (`app/layout.tsx`, `robots.ts`, `sitemap.ts`)**:
  - Dynamic canonical URL configuration targeting the production Vercel deployment.
  - Complete OpenGraph and Twitter card metadata with logo and description tags.
  - Embedded JSON-LD schema with `Person` and `WebSite` graph entities highlighting Sanskar's skills, social links, and creative engineering disciplines.
  - Auto-generated `robots.txt` and `sitemap.xml` routes.

---

## 14. Repository Cleanliness, ESLint 9 Flat Config & Build Verification
* **Repository Hygiene & Dead Code Removal**:
  - Removed stale backup files: `old_cat_model.tsx`, `original_cat_model.txt`.
  - Removed legacy unused config: `.eslintrc.json`.
  - Removed empty directory: `LAYKA BDAY/`.
  - Removed unreferenced dead components and hooks: `components/ui/AnimatedDivider.tsx`, `components/ui/TextReveal.tsx`, `components/ui/CustomCursor.tsx`, `components/sections/Footer.tsx`, `components/sections/Hero.tsx`, `hooks/use-mobile.ts`.
  - Removed obsolete dead library files: `lib/proceduralCatHead.ts` (replaced by `/cat.glb`), `lib/utils.ts` (unused `cn` utility).
  - Purged obsolete agent scratch folders while preserving active task contexts.
  - Cleaned `eslint.config.mjs` to modern flat config standards with zero unused imports and zero warnings.
* **Production Build Verification**:
  - `npm run lint`: **0 errors, 0 warnings**.
  - `npm run build`: **100% clean Next.js 15 production build with 8 static routes generated, 0 TypeScript errors, and zero broken module imports**.

---

## 15. Interactive WebGL Playground Animation Architecture & Yuta Abe Parity
* **User Command**: *"https://yutaabe.com/playground/ make our website playground animation like this and smooth for everyscreen size /teamwork-preview"*
* **Technical Challenges**:
  - Replicating the distinct kinetic drift, optical lens magnification, chromatic aberration glitches, and mosaic subdivision seen on `yutaabe.com/playground`.
  - Ensuring silky 60/120 FPS performance across mobile screens (<480px), tablets (768px), laptops (1024px), and ultra-wide desktops without WebGL context loss or frame hitching.
  - Supporting responsive touch gestures, multi-touch cancellation, pointer dragging, and trackpad wheel inertia with frame-rate independent physics and zero layout thrashing.
  - Seamlessly coordinating the WebGL scene with the Next.js App Router, monospace telemetry HUD (cells, elapsed timer, switch counter), Lights Out game state, and SketchLightbox modal.
* **Solutions & Implementations**:
  1. **Procedural Mosaic Subdivision Engine (`lib/playground/mosaicLayout.ts`)**:
     - Engineered dynamic Binary Space Partitioning (BSP) with aspect ratio constraints (`minTileW: 130`, `minTileH: 100`, `maxAspect: 1.4`) that procedurally divides canvas real estate into an organic masonry mosaic.
     - Implemented responsive adaptive layouts: single/dual-column masonry on mobile (<768px) and multi-column recursive BSP grids on desktop.
     - Device-pixel-ratio (DPR) clamped rendering ($1.0 \le \text{DPR} \le 2.0$) to eliminate GPU thermal throttling on high-density Retina and mobile displays.
  2. **Fluid 2D Momentum Physics & Inertia Engine (`lib/playground/momentumPhysics.ts`)**:
     - Designed a 2D spring-damper inertia simulation with exponential velocity integration:
       $$\mathbf{v}(t + \Delta t) = \mathbf{v}(t) \cdot e^{-\lambda \Delta t}$$
       $$\mathbf{x}(t + \Delta t) = \mathbf{x}(t) + \mathbf{v}(t) \cdot \Delta t$$
     - Dynamic drag zoom physics: canvas subtly scales out during high-velocity panning and eases back on release.
     - Toroidal infinite wrapping and bounded elastic bounce mechanics preventing edge snapping or disorientation.
     - Hardened event handling: `onPointerCancel` velocity clearing, multi-touch touch-action containment, and `NaN` timestamp sanitization.
  3. **Custom Kinetic GLSL Shader Suite (`components/playground/shaders/tileShader.ts`)**:
     - Custom vertex and fragment shaders featuring 7 dynamic transition modes:
       - **Mode 0: Pixelated Block Dissolve**: Screen-space procedural grid subdivision with pseudo-random thresholding.
       - **Mode 1: Chromatic Aberration RGB Glitch**: Bell-curve modulated color channel displacement ($R, G, B$ sampling offset).
       - **Mode 2: Simplex Noise Displacement**: Fractal Perlin/simplex gradient tearing.
       - **Mode 3: Directional Luminance Wipe**: Smooth angle-based threshold scanning.
       - **Mode 4: Radial Ripple Shockwave**: Trigonometric distance distortion radiating from pointer contact.
       - **Mode 5: Film Grain Crossfade**: Subtle analog film noise overlay.
       - **Mode 6: Curtain Split Reveal**: Dual-sided shutter reveal.
     - Optical lens zoom distortion on hover (`zoom = uHover * 0.07`).
     - Pulsing neon bloom border and dark-mode inverter triggered by the Lights Out mode.
  4. **Architecture Integration (`components/playground/PlaygroundCanvas.tsx` & `PlaygroundHUD.tsx`)**:
     - Isolated Three.js Canvas container mounting seamlessly into `app/playground/PlaygroundClient.tsx`.
     - Monospace HUD tracking live cell count, active session elapsed timer, and interactive switch triggers.
     - Integrated modal lightbox open/close without canvas de-allocation.
  5. **Adversarial Hardening & 5-Tier Verification Harness**:
     - Multi-tier testing suite (`tests/e2e/playground/run_suite.mjs`) verifying **393 tests across 5 tiers**:
       - *Tier 1: Feature Coverage* (170/170 passed)
       - *Tier 2: Boundary Value Analysis* (170/170 passed)
       - *Tier 3: Pairwise Cross-Feature Interactions* (35/35 passed)
       - *Tier 4: Real-World Workload Scenarios* (8/8 passed)
       - *Tier 5: Adversarial Stress & 10M-pixel Drift* (10/10 passed)
     - Stress tested against 10,000,000px scroll drift, extreme flick velocity, and rapid window resize without errors.
* **Production Build Verification**:
  - `npm run lint`: **0 errors, 0 warnings**.
  - `npm run build`: **Compiled successfully in 8.3s (Exit code 0)** with static route `/playground` generated cleanly.

