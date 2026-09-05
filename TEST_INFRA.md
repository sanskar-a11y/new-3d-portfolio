# E2E Test Infra: WebGL Playground

## Test Philosophy
- Opaque-box, requirement-driven. Derived strictly from `ORIGINAL_REQUEST.md` (## 2026-09-05T07:03:07Z) and user-facing acceptance criteria.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Scenarios.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | F01-BSP-Desktop-Layout | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | F02-Mobile-Masonry-Layout | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | F03-Tablet-Responsive-Density | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 4 | F04-UV-Aspect-Ratio-Cover | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 5 | F05-Dynamic-DPR-Clamping | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 6 | F06-48-Sketch-Texture-Loading | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 7 | F07-Window-Resize-Handling | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 8 | F08-Orthographic-Camera | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 9 | F09-Pointer-Drag-Panning | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 10 | F10-Touch-Swipe-Physics | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 11 | F11-Trackpad-Wheel-Inertia | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 12 | F12-Exponential-Damping | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 13 | F13-Friction-Decay | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 14 | F14-Toroidal-Grid-Wrapping | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 15 | F15-Dynamic-Drag-Zoom | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 16 | F16-Idle-Ambient-Drift | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 17 | F17-Shader-Cell-Block-Dissolve | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 18 | F18-Shader-Chromatic-Aberration | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 19 | F19-Shader-Noise-Burn | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 20 | F20-Shader-Wave-Warp | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 21 | F21-Shader-Scanline-Wipe | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 22 | F22-Shader-Glitch-Slice | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 23 | F23-Shader-Mosaic-Pixelation | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 24 | F24-Shader-Hover-Optical-Lens | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 25 | F25-Shader-Neon-Cyan-Pulse | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 26 | F26-Shader-Theme-Adaptation | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 27 | F27-HUD-Active-Cell-Counter | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 28 | F28-HUD-Elapsed-Stopwatch | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 29 | F29-HUD-Switch-Counter | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 30 | F30-HUD-Shift-LightsOut | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 31 | F31-Click-Drag-Discrimination | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 32 | F32-Lightbox-Modal-Integration | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 33 | F33-Continuous-Animation-Loop | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 34 | F34-E2E-60FPS-Fidelity-Audit | Acceptance Criteria | 5 | 5 | ✓ |

## Test Architecture
- **Location**: `tests/e2e/playground/`
- **Runner**: Node.js test harness / Vitest / Playwright / Jest (or dedicated CLI test script `node tests/e2e/playground/run_suite.mjs` or `npm run test`)
- **Pass/Fail Semantics**: Exit code 0 on 100% test pass, non-zero on failure.
- **Directory Layout**:
  - `tests/e2e/playground/tier1_features.test.ts` (Feature coverage in isolation)
  - `tests/e2e/playground/tier2_boundary.test.ts` (Boundary value and extreme inputs)
  - `tests/e2e/playground/tier3_pairwise.test.ts` (Cross-feature interactions)
  - `tests/e2e/playground/tier4_realworld.test.ts` (End-to-end user workflows)
  - `tests/e2e/playground/tier5_adversarial.test.ts` (Stress, frame budget, memory)

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full Touch Drift, Rapid Flick & Infinite Wrap on Mobile | F02, F10, F12, F13, F14 | High |
| 2 | Desktop Momentum Drag with Kinetic Pullback Zoom & Idle Drift | F01, F09, F11, F15, F16 | Medium |
| 3 | Hover Inspection, Optical Zoom Lens & Neon Pulse Triggering | F24, F25, F08, F27 | Medium |
| 4 | Periodic & Interactive Shader Transitions with Chromatic Split | F17, F18, F19, F20, F21, F22, F23, F29 | High |
| 5 | Shift Reaction Game, LightsOut Theme Inversion & Switch HUD Sync | F26, F29, F30 | Medium |
| 6 | Drag vs. Click Discrimination, Lightbox Modal Open/Close & Continuity | F31, F32, F33, F08 | High |
| 7 | Multi-Viewport Resizing across Mobile, Tablet, Desktop with DPR Scaling | F01, F02, F03, F05, F07 | High |

## Coverage Thresholds
- Tier 1: ≥ 5 per feature (Total: 34 × 5 = 170 tests)
- Tier 2: ≥ 5 per feature where boundaries exist (Total: 34 × 5 = 170 tests)
- Tier 3: Pairwise coverage of major feature combinations (≥ 34 tests)
- Tier 4: ≥ 7 realistic application scenarios
- Tier 5: Adversarial stress and frame-rate budget verification
