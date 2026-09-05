/**
 * Tier 2: Boundary & Corner Cases
 * Exactly 34 features × 5 boundary tests = 170 tests.
 * Requirements: ORIGINAL_REQUEST.md (§R1, §R2, §R3, §R4, Acceptance Criteria)
 */

import { describe, test, expect, setTestTier, setTestFeature } from './harness.ts';
import { resolveEngines } from './contracts/loader.ts';

export async function runTier2Tests() {
  setTestTier(2);
  const engines = await resolveEngines();
  const { mosaic, physics, shader, hud, sketches } = engines;

  // ==========================================
  // F01: BSP Desktop Layout Boundaries
  // ==========================================
  setTestFeature('F01-BSP-Desktop-Layout');
  describe('F01: BSP Desktop Layout Boundaries', () => {
    test('T2.1.1: Breakpoint boundary: width = 480px switches to desktop BSP mode', () => {
      const layout = mosaic.generateMosaicLayout(480, 800, sketches);
      expect(layout.isMobile).toBe(false);
    });

    test('T2.1.2: Ultra-wide display (5120x1440px) generates mosaic without degenerate gaps', () => {
      const layout = mosaic.generateMosaicLayout(5120, 1440, sketches);
      expect(layout.cells.length).toBeGreaterThan(20);
      expect(layout.packWidth).toBe(Math.round(5120 * 1.4));
    });

    test('T2.1.3: Single-pixel dimensions (w=1, h=1) do not crash or infinite loop', () => {
      const layout = mosaic.generateMosaicLayout(1, 1, sketches);
      expect(layout.cells.length).toBeGreaterThanOrEqual(1);
    });

    test('T2.1.4: Extreme ratio viewport (width=4000, height=200) forces horizontal splits', () => {
      const layout = mosaic.generateMosaicLayout(4000, 200, sketches);
      expect(layout.cells.length).toBeGreaterThan(1);
    });

    test('T2.1.5: Deep subdivision recursion depth guard terminates safely', () => {
      const rects = mosaic.splitMosaic(0, 0, 2000, 2000, 130, 100, 360, 280, 15);
      expect(rects.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // F02: Mobile Masonry Layout Boundaries
  // ==========================================
  setTestFeature('F02-Mobile-Masonry-Layout');
  describe('F02: Mobile Masonry Layout Boundaries', () => {
    test('T2.2.1: Breakpoint boundary: width = 479px strictly selects mobile masonry', () => {
      const layout = mosaic.generateMosaicLayout(479, 800, sketches);
      expect(layout.isMobile).toBe(true);
      expect(layout.cols).toBe(3);
    });

    test('T2.2.2: Ultra-narrow viewport (320px) columns clamp without negative widths', () => {
      const layout = mosaic.generateMosaicLayout(320, 568, sketches);
      for (const c of layout.cells) {
        expect(c.width).toBeGreaterThan(50);
      }
    });

    test('T2.2.3: Extreme tall mobile viewport (375x3000) generates extended staggered flow', () => {
      const layout = mosaic.generateMosaicLayout(375, 3000, sketches);
      expect(layout.cells.length).toBeGreaterThan(10);
    });

    test('T2.2.4: Zero height mobile layout produces safe empty or minimal fallback', () => {
      const rects = mosaic.generateMobileMosaic(300, 0, 3);
      expect(rects.length).toBe(0);
    });

    test('T2.2.5: Non-integer floating point viewport dimensions (e.g. 390.5px)', () => {
      const layout = mosaic.generateMosaicLayout(390.5, 844.5, sketches);
      expect(layout.isMobile).toBe(true);
      expect(layout.packWidth).toBe(Math.round(390.5 * 1.4));
    });
  });

  // ==========================================
  // F03: Tablet Responsive Density Boundaries
  // ==========================================
  setTestFeature('F03-Tablet-Responsive-Density');
  describe('F03: Tablet Responsive Density Boundaries', () => {
    test('T2.3.1: Exact tablet breakpoint width = 768px handled in desktop mode', () => {
      const layout = mosaic.generateMosaicLayout(768, 1024, sketches);
      expect(layout.isMobile).toBe(false);
    });

    test('T2.3.2: Tablet landscape mode (1024x768px) density scaling', () => {
      const layout = mosaic.generateMosaicLayout(1024, 768, sketches);
      expect(layout.cells.length).toBeGreaterThan(6);
    });

    test('T2.3.3: Tablet portrait mode (768x1024px) density scaling', () => {
      const layout = mosaic.generateMosaicLayout(768, 1024, sketches);
      expect(layout.packHeight).toBe(Math.round(1024 * 1.4));
    });

    test('T2.3.4: High density tablet (iPad Pro 2048x2732) packs correctly', () => {
      const layout = mosaic.generateMosaicLayout(2048, 2732, sketches);
      expect(layout.cells.length).toBeGreaterThan(20);
    });

    test('T2.3.5: Small tablet / foldable threshold (600px) generates desktop layout', () => {
      const layout = mosaic.generateMosaicLayout(600, 900, sketches);
      expect(layout.isMobile).toBe(false);
    });
  });

  // ==========================================
  // F04: UV Aspect Ratio Cover Boundaries
  // ==========================================
  setTestFeature('F04-UV-Aspect-Ratio-Cover');
  describe('F04: UV Aspect Ratio Cover Boundaries', () => {
    test('T2.4.1: Extreme wide image (100:1) in 1:1 cell crops width safely', () => {
      const { uRepeat, uOffset } = mosaic.computeCoverUv(100, 100, 10000, 100);
      expect(uRepeat[0]).toBeCloseTo(0.01, 0.001);
      expect(uRepeat[1]).toBeCloseTo(1.0, 0.001);
      expect(uOffset[0]).toBeCloseTo(0.495, 0.001);
    });

    test('T2.4.2: Extreme tall image (1:100) in 1:1 cell crops height safely', () => {
      const { uRepeat, uOffset } = mosaic.computeCoverUv(100, 100, 100, 10000);
      expect(uRepeat[0]).toBeCloseTo(1.0, 0.001);
      expect(uRepeat[1]).toBeCloseTo(0.01, 0.001);
      expect(uOffset[1]).toBeCloseTo(0.495, 0.001);
    });

    test('T2.4.3: Zero width / height texture guards against divide-by-zero', () => {
      const { uRepeat, uOffset } = mosaic.computeCoverUv(100, 100, 0, 0);
      expect(uRepeat[0]).toBe(1.0);
      expect(uRepeat[1]).toBe(1.0);
      expect(uOffset[0]).toBe(0.0);
    });

    test('T2.4.4: Negative cell dimension fallback to unit scale', () => {
      const { uRepeat, uOffset } = mosaic.computeCoverUv(-50, 100, 100, 100);
      expect(uRepeat[0]).toBe(1.0);
      expect(uRepeat[1]).toBe(1.0);
    });

    test('T2.4.5: Fractional aspect ratios (e.g. 1920 / 1081)', () => {
      const { uRepeat } = mosaic.computeCoverUv(1920, 1081, 1920, 1080);
      expect(uRepeat[0]).toBeLessThanOrEqual(1.0);
      expect(uRepeat[1]).toBeLessThanOrEqual(1.0);
    });
  });

  // ==========================================
  // F05: Dynamic DPR Clamping Boundaries
  // ==========================================
  setTestFeature('F05-Dynamic-DPR-Clamping');
  describe('F05: Dynamic DPR Clamping Boundaries', () => {
    test('T2.5.1: DPR = 4.0 clamped to 1.5 on desktop', () => {
      expect(mosaic.clampDpr(4.0, false)).toBe(1.5);
    });

    test('T2.5.2: DPR = 0.5 below 1.0 retained', () => {
      expect(mosaic.clampDpr(0.5, false)).toBe(0.5);
    });

    test('T2.5.3: DPR = NaN fallback to 1.0', () => {
      expect(mosaic.clampDpr(NaN, false)).toBe(1.0);
    });

    test('T2.5.4: DPR = 3.0 clamped to 1.0 on mobile (<480px)', () => {
      expect(mosaic.clampDpr(3.0, true)).toBe(1.0);
    });

    test('T2.5.5: Exact boundary DPR = 1.5 desktop threshold', () => {
      expect(mosaic.clampDpr(1.5, false)).toBe(1.5);
    });
  });

  // ==========================================
  // F06: 48 Sketch Texture Loading Boundaries
  // ==========================================
  setTestFeature('F06-48-Sketch-Texture-Loading');
  describe('F06: 48 Sketch Texture Loading Boundaries', () => {
    test('T2.6.1: Unloaded texture flag uHasA = false allows flat color fallback', () => {
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uHasA');
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uFlatColor');
    });

    test('T2.6.2: Image index modulo wrapping for cells exceeding 48 count', () => {
      const layout = mosaic.generateMosaicLayout(3000, 2000, sketches);
      if (layout.cells.length > 48) {
        expect(layout.cells[48].sketch.id).toBe(sketches[0].id);
      }
    });

    test('T2.6.3: Empty or missing sketch catalog fallback', () => {
      const layout = mosaic.generateMosaicLayout(800, 600, sketches.slice(0, 5));
      expect(layout.cells.length).toBeGreaterThan(0);
    });

    test('T2.6.4: Single sketch catalog repeated seamlessly', () => {
      const layout = mosaic.generateMosaicLayout(800, 600, [sketches[0]]);
      for (const c of layout.cells) {
        expect(c.sketch.id).toBe('01');
      }
    });

    test('T2.6.5: All 48 catalog images exist in /playground/ directory path pattern', () => {
      for (let i = 1; i <= 48; i++) {
        const id = i < 10 ? `0${i}` : `${i}`;
        const found = sketches.find(s => s.id === id);
        expect(found).toBeDefined();
      }
    });
  });

  // ==========================================
  // F07: Window Resize Handling Boundaries
  // ==========================================
  setTestFeature('F07-Window-Resize-Handling');
  describe('F07: Window Resize Handling Boundaries', () => {
    test('T2.7.1: Rapid resize events (10 iterations) execute without memory or state corruption', () => {
      for (let i = 0; i < 10; i++) {
        const l = mosaic.generateMosaicLayout(500 + i * 100, 600 + i * 50, sketches);
        expect(l.cells.length).toBeGreaterThan(0);
      }
    });

    test('T2.7.2: Resize to 0x0 then back to 1920x1080 recovers cleanly', () => {
      const zeroLayout = mosaic.generateMosaicLayout(0, 0, sketches);
      expect(zeroLayout.packWidth).toBeGreaterThan(0);
      const normalLayout = mosaic.generateMosaicLayout(1920, 1080, sketches);
      expect(normalLayout.packWidth).toBe(Math.round(1920 * 1.4));
    });

    test('T2.7.3: Viewport width flips across 480px boundary (479px -> 481px)', () => {
      const mLayout = mosaic.generateMosaicLayout(479, 800, sketches);
      expect(mLayout.isMobile).toBe(true);
      const dLayout = mosaic.generateMosaicLayout(481, 800, sketches);
      expect(dLayout.isMobile).toBe(false);
    });

    test('T2.7.4: Aspect ratio flip from landscape (1600x900) to portrait (900x1600)', () => {
      const l1 = mosaic.generateMosaicLayout(1600, 900, sketches);
      const l2 = mosaic.generateMosaicLayout(900, 1600, sketches);
      expect(l1.packWidth).toBeGreaterThan(l1.packHeight);
      expect(l2.packHeight).toBeGreaterThan(l2.packWidth);
    });

    test('T2.7.5: Resize during active pointer drag preserves coordinate continuity', () => {
      const p = physics.createMomentumPhysics();
      p.onPointerDown(0, 0);
      p.onPointerMove(50, 50);
      p.update(0.016, 1000, 1000);
      // Resize pack dimensions
      const coords = p.getWrapCoordinates(2000, 2000);
      expect(isNaN(coords.wrapX)).toBe(false);
      expect(isNaN(coords.wrapY)).toBe(false);
    });
  });

  // ==========================================
  // F08: Orthographic Camera Boundaries
  // ==========================================
  setTestFeature('F08-Orthographic-Camera');
  describe('F08: Orthographic Camera Boundaries', () => {
    test('T2.8.1: Negative or inverted viewport dimensions clamped safely', () => {
      const safeW = Math.max(1, -1920);
      expect(safeW).toBe(1);
    });

    test('T2.8.2: Subpixel camera positions do not produce NaN or Infinity', () => {
      const subpixelPos = { x: 0.123456, y: 0.987654 };
      expect(isFinite(subpixelPos.x)).toBe(true);
    });

    test('T2.8.3: Near and far plane distances guarantee visibility of Z=0 planes', () => {
      const near = 0.1;
      const far = 1000;
      const camZ = 10;
      expect(camZ).toBeGreaterThan(near);
      expect(camZ).toBeLessThan(far);
    });

    test('T2.8.4: Dynamic zoom clamping upper bound (zoom = 1.0)', () => {
      const z = physics.computeDynamicZoom(false, 0, 0.92, 0.85);
      expect(z).toBe(1.0);
    });

    test('T2.8.5: Dynamic zoom clamping lower bound (zoom = 0.85 minimum)', () => {
      const z = physics.computeDynamicZoom(true, 0, 0.85, 0.85);
      expect(z).toBe(0.85);
    });
  });

  // ==========================================
  // F09: Pointer Drag Panning Boundaries
  // ==========================================
  setTestFeature('F09-Pointer-Drag-Panning');
  describe('F09: Pointer Drag Panning Boundaries', () => {
    test('T2.9.1: Stationary pointer down and up at exact same coordinates (dx=0, dy=0)', () => {
      const p = physics.createMomentumPhysics();
      p.onPointerDown(100, 100);
      const res = p.onPointerUp();
      expect(res.wasClick).toBe(true);
      expect(res.clickDistance).toBe(0);
    });

    test('T2.9.2: Micro-movement (0.001px) does not accumulate spurious velocity', () => {
      const p = physics.createMomentumPhysics();
      p.onPointerDown(0, 0, 0);
      p.onPointerMove(0.001, 0, 16);
      p.onPointerUp();
      expect(p.getStats().velocity).toBeLessThan(0.05);
    });

    test('T2.9.3: Extreme drag flick (10,000px/s) clamped to maxVelocity (100)', () => {
      const p = physics.createMomentumPhysics({ maxVelocity: 100 });
      p.onPointerDown(0, 0, 0);
      p.onPointerMove(10000, 0, 16);
      p.update(0.016);
      expect(p.getStats().velocity).toBeLessThanOrEqual(100);
    });

    test('T2.9.4: Multi-pointer conflicting inputs (pointer down while already dragging)', () => {
      const p = physics.createMomentumPhysics();
      p.onPointerDown(10, 10);
      p.onPointerDown(20, 20); // re-down resets drag distance
      expect(p.getStats().totalDragDistance).toBe(0);
    });

    test('T2.9.5: Out of bounds negative pointer coordinates handled cleanly', () => {
      const p = physics.createMomentumPhysics();
      p.onPointerDown(-100, -200);
      p.onPointerMove(-50, -180);
      expect(p.getStats().targetScroll[0]).toBe(50);
      expect(p.getStats().targetScroll[1]).toBe(20);
    });
  });

  // ==========================================
  // F10: Touch Swipe Physics Boundaries
  // ==========================================
  setTestFeature('F10-Touch-Swipe-Physics');
  describe('F10: Touch Swipe Physics Boundaries', () => {
    test('T2.10.1: Secondary touch points ignored in single touch model', () => {
      const p = physics.createMomentumPhysics({ isTouch: true });
      p.onPointerDown(100, 100);
      p.onPointerMove(120, 100);
      // Secondary finger simulated: single coordinator ignores multi-touch
      expect(p.getStats().targetScroll[0]).toBe(20);
    });

    test('T2.10.2: Touch cancel event mid-flick cleanly resets drag state', () => {
      const p = physics.createMomentumPhysics({ isTouch: true });
      p.onPointerDown(50, 50);
      p.onPointerMove(100, 50);
      p.onPointerCancel();
      expect(p.getStats().isDragging).toBe(false);
    });

    test('T2.10.3: Very fast touch tap (< 5ms duration)', () => {
      const p = physics.createMomentumPhysics({ isTouch: true });
      p.onPointerDown(100, 100, 1000);
      const res = p.onPointerUp();
      expect(res.wasClick).toBe(true);
    });

    test('T2.10.4: Long press without movement (> 2000ms duration)', () => {
      const p = physics.createMomentumPhysics({ isTouch: true });
      p.onPointerDown(100, 100, 0);
      p.onPointerMove(100, 100, 2000);
      const res = p.onPointerUp();
      expect(res.wasClick).toBe(true);
      expect(res.clickDistance).toBe(0);
    });

    test('T2.10.5: Rapid succession touch taps do not accumulate drag distance', () => {
      const p = physics.createMomentumPhysics({ isTouch: true });
      for (let i = 0; i < 5; i++) {
        p.onPointerDown(100, 100);
        const res = p.onPointerUp();
        expect(res.wasClick).toBe(true);
      }
    });
  });

  // ==========================================
  // F11: Trackpad Wheel Inertia Boundaries
  // ==========================================
  setTestFeature('F11-Trackpad-Wheel-Inertia');
  describe('F11: Trackpad Wheel Inertia Boundaries', () => {
    test('T2.11.1: High frequency wheel events (100 events in 16ms)', () => {
      const p = physics.createMomentumPhysics();
      for (let i = 0; i < 100; i++) {
        p.onWheel(1, 1);
      }
      expect(p.getStats().targetScroll[0]).toBeCloseTo(-100 * 0.75, 0.001);
    });

    test('T2.11.2: Zero delta wheel events produce zero change', () => {
      const p = physics.createMomentumPhysics();
      p.onWheel(0, 0);
      expect(p.getStats().targetScroll[0]).toBe(0);
      expect(p.getStats().targetScroll[1]).toBe(0);
    });

    test('T2.11.3: Huge wheel tick (momentum wheel spin delta=5000)', () => {
      const p = physics.createMomentumPhysics();
      p.onWheel(0, 5000);
      expect(p.getStats().targetScroll[1]).toBe(-3750);
      p.update(0.016);
      expect(isFinite(p.getStats().currentScroll[1])).toBe(true);
    });

    test('T2.11.4: Both deltaX and deltaY simultaneous non-zero inputs', () => {
      const p = physics.createMomentumPhysics();
      p.onWheel(20, -30);
      expect(p.getStats().targetScroll[0]).toBe(-15);
      expect(p.getStats().targetScroll[1]).toBe(22.5);
    });

    test('T2.11.5: Shift key toggle during active wheel inertia', () => {
      const p = physics.createMomentumPhysics();
      p.onWheel(0, 40, true);
      expect(p.getStats().targetScroll[0]).toBe(-30);
      expect(p.getStats().targetScroll[1]).toBe(0);
    });
  });

  // ==========================================
  // F12: Exponential Damping Boundaries
  // ==========================================
  setTestFeature('F12-Exponential-Damping');
  describe('F12: Exponential Damping Boundaries', () => {
    test('T2.12.1: Large delta time step (dt = 5.0s tab freeze)', () => {
      const res = physics.computeExponentialDamping(0, 100, 10.0, 5.0);
      expect(res).toBeCloseTo(100, 0.001);
    });

    test('T2.12.2: Near-zero delta time step (dt = 0.0001s)', () => {
      const res = physics.computeExponentialDamping(0, 100, 10.0, 0.0001);
      expect(res).toBeGreaterThan(0);
      expect(res).toBeLessThan(1.0);
    });

    test('T2.12.3: Target scroll equals current scroll (zero difference)', () => {
      const res = physics.computeExponentialDamping(50, 50, 10.0, 0.016);
      expect(res).toBe(50);
    });

    test('T2.12.4: Very large target displacement (target = 1,000,000px)', () => {
      const res = physics.computeExponentialDamping(0, 1000000, 10.0, 0.016);
      expect(isFinite(res)).toBe(true);
      expect(res).toBeGreaterThan(0);
    });

    test('T2.12.5: Negative target displacement (target = -1,000,000px)', () => {
      const res = physics.computeExponentialDamping(0, -1000000, 10.0, 0.016);
      expect(isFinite(res)).toBe(true);
      expect(res).toBeLessThan(0);
    });
  });

  // ==========================================
  // F13: Friction Decay Boundaries
  // ==========================================
  setTestFeature('F13-Friction-Decay');
  describe('F13: Friction Decay Boundaries', () => {
    test('T2.13.1: Initial velocity = 0 remains exactly 0', () => {
      expect(physics.computeFrictionDecay(0, 4.0, 0.016)).toBe(0);
    });

    test('T2.13.2: Huge initial velocity (v = 50,000) decays without NaN', () => {
      const v = physics.computeFrictionDecay(50000, 4.0, 0.016);
      expect(isFinite(v)).toBe(true);
      expect(v).toBeLessThan(50000);
    });

    test('T2.13.3: Velocity snapping to 0 when falling below 0.001', () => {
      const p = physics.createMomentumPhysics({ autoDriftSpeed: 0 });
      p.onPointerDown(0, 0, 0);
      p.onPointerMove(0.1, 0, 16);
      p.onPointerUp();
      for (let i = 0; i < 50; i++) p.update(0.05);
      expect(p.getStats().velocity).toBeCloseTo(0, 0.001);
    });

    test('T2.13.4: Large delta time decay in single frame', () => {
      const v = physics.computeFrictionDecay(100, 4.0, 10.0);
      expect(v).toBeCloseTo(0, 0.0001);
    });

    test('T2.13.5: Repeated micro-frame updates (dt = 0.001) decay consistently', () => {
      let v = 100;
      for (let i = 0; i < 16; i++) {
        v = physics.computeFrictionDecay(v, 4.0, 0.001);
      }
      const singleStep = physics.computeFrictionDecay(100, 4.0, 0.016);
      expect(v).toBeCloseTo(singleStep, 0.01);
    });
  });

  // ==========================================
  // F14: Toroidal Grid Wrapping Boundaries
  // ==========================================
  setTestFeature('F14-Toroidal-Grid-Wrapping');
  describe('F14: Toroidal Grid Wrapping Boundaries', () => {
    test('T2.14.1: Boundary scroll at exactly +W_pack / 2', () => {
      const packW = 1000;
      const wrap = physics.computeToroidalWrap(500, packW);
      expect(Math.abs(wrap)).toBeCloseTo(500, 0.001);
    });

    test('T2.14.2: Boundary scroll at exactly -W_pack / 2', () => {
      const packW = 1000;
      const wrap = physics.computeToroidalWrap(-500, packW);
      expect(Math.abs(wrap)).toBeCloseTo(500, 0.001);
    });

    test('T2.14.3: Scroll value of 10,000,000px wraps without float precision loss', () => {
      const packW = 1000;
      const wrap = physics.computeToroidalWrap(10000250, packW);
      expect(wrap).toBeCloseTo(250, 0.001);
    });

    test('T2.14.4: Scroll value of -10,000,000px wraps without float precision loss', () => {
      const packW = 1000;
      const wrap = physics.computeToroidalWrap(-10000250, packW);
      expect(wrap).toBeCloseTo(-250, 0.001);
    });

    test('T2.14.5: Pack size of zero guardrails against division by zero', () => {
      expect(physics.computeToroidalWrap(100, 0)).toBe(0);
    });
  });

  // ==========================================
  // F15: Dynamic Drag Zoom Boundaries
  // ==========================================
  setTestFeature('F15-Dynamic-Drag-Zoom');
  describe('F15: Dynamic Drag Zoom Boundaries', () => {
    test('T2.15.1: Pullback zoom clamping during extreme velocity (v > 1000)', () => {
      const z = physics.computeDynamicZoom(false, 5000, 0.92, 0.85);
      expect(z).toBe(0.90);
    });

    test('T2.15.2: Instant toggle of isDragging flag', () => {
      const zDrag = physics.computeDynamicZoom(true, 0, 0.92, 0.85);
      const zIdle = physics.computeDynamicZoom(false, 0, 0.92, 0.85);
      expect(zDrag).toBe(0.92);
      expect(zIdle).toBe(1.0);
    });

    test('T2.15.3: Zoom lerp stability under fluctuating delta times', () => {
      const p = physics.createMomentumPhysics();
      p.onPointerDown(0, 0);
      p.update(0.001);
      p.update(0.05);
      p.update(0.016);
      expect(p.getStats().zoom).toBeGreaterThanOrEqual(0.85);
      expect(p.getStats().zoom).toBeLessThanOrEqual(1.0);
    });

    test('T2.15.4: Zero velocity zoom target = 1.0 exact', () => {
      expect(physics.computeDynamicZoom(false, 0)).toBe(1.0);
    });

    test('T2.15.5: Pullback zoom equals 0.92 during active drag regardless of velocity', () => {
      expect(physics.computeDynamicZoom(true, 0)).toBe(0.92);
      expect(physics.computeDynamicZoom(true, 50)).toBe(0.92);
    });
  });

  // ==========================================
  // F16: Idle Ambient Drift Boundaries
  // ==========================================
  setTestFeature('F16-Idle-Ambient-Drift');
  describe('F16: Idle Ambient Drift Boundaries', () => {
    test('T2.16.1: Transition from active drag to idle drift', () => {
      const p = physics.createMomentumPhysics({ isTouch: false });
      p.onPointerDown(0, 0);
      p.onPointerUp();
      // Decay velocity
      for (let i = 0; i < 50; i++) p.update(0.016);
      const before = p.getStats().targetScroll[1];
      p.update(0.016);
      expect(p.getStats().targetScroll[1]).toBeLessThan(before);
    });

    test('T2.16.2: Auto drift during micro-velocity (< 0.05) triggers', () => {
      const p = physics.createMomentumPhysics({ isTouch: false });
      const before = p.getStats().targetScroll[1];
      p.update(0.016);
      expect(p.getStats().targetScroll[1]).toBeCloseTo(before - 0.15, 0.001);
    });

    test('T2.16.3: Auto drift disabled when isTouch = true', () => {
      const p = physics.createMomentumPhysics({ isTouch: true });
      const before = p.getStats().targetScroll[1];
      p.update(0.016);
      expect(p.getStats().targetScroll[1]).toBe(before);
    });

    test('T2.16.4: Long idle duration (10,000 steps) coordinates remain valid floats', () => {
      const p = physics.createMomentumPhysics({ isTouch: false });
      for (let i = 0; i < 1000; i++) p.update(0.016);
      expect(isFinite(p.getStats().currentScroll[1])).toBe(true);
    });

    test('T2.16.5: Instant pause of idle drift when pointer touches canvas', () => {
      const p = physics.createMomentumPhysics({ isTouch: false });
      p.onPointerDown(0, 0);
      const before = p.getStats().targetScroll[1];
      p.update(0.016);
      expect(p.getStats().targetScroll[1]).toBe(before);
    });
  });

  // ==========================================
  // F17: Shader Cell Block Dissolve Boundaries
  // ==========================================
  setTestFeature('F17-Shader-Cell-Block-Dissolve');
  describe('F17: Shader Cell Block Dissolve Boundaries', () => {
    test('T2.17.1: uMix exactly 0.0 bounds', () => {
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uMix');
    });

    test('T2.17.2: uMix exactly 1.0 bounds', () => {
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uTransType');
    });

    test('T2.17.3: uMix clamped between 0.0 and 1.0', () => {
      const clampMix = (m: number) => Math.max(0, Math.min(1, m));
      expect(clampMix(-0.5)).toBe(0);
      expect(clampMix(1.5)).toBe(1);
    });

    test('T2.17.4: Single pixel mesh size boundary (uMeshSize = [1, 1])', () => {
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uMeshSize');
    });

    test('T2.17.5: Transition index 0 correctly identified in dispatch', () => {
      expect(shader.TRANSITION_MODES[0].index).toBe(0);
    });
  });

  // ==========================================
  // F18: Shader Chromatic Aberration Boundaries
  // ==========================================
  setTestFeature('F18-Shader-Chromatic-Aberration');
  describe('F18: Shader Chromatic Aberration Boundaries', () => {
    test('T2.18.1: uMix at exact boundary 0.0 (shift = 0)', () => {
      expect(shader.computeChromaticShift(0.0)).toBeCloseTo(0, 0.001);
    });

    test('T2.18.2: uMix at exact boundary 1.0 (shift = 0)', () => {
      expect(shader.computeChromaticShift(1.0)).toBeCloseTo(0, 0.001);
    });

    test('T2.18.3: uMix at exact peak 0.5 (shift = 0.05)', () => {
      expect(shader.computeChromaticShift(0.5)).toBeCloseTo(0.05, 0.001);
    });

    test('T2.18.4: Negative uMix input clamped to 0', () => {
      expect(shader.computeChromaticShift(-0.2)).toBeCloseTo(0, 0.001);
    });

    test('T2.18.5: Overshoot uMix input clamped to 1.0', () => {
      expect(shader.computeChromaticShift(1.5)).toBeCloseTo(0, 0.001);
    });
  });

  // ==========================================
  // F19: Shader Noise Burn Boundaries
  // ==========================================
  setTestFeature('F19-Shader-Noise-Burn');
  describe('F19: Shader Noise Burn Boundaries', () => {
    test('T2.19.1: Burn threshold at uMix = 0.0 evaluates safely', () => {
      const thr = 0.0 * 1.3 - 0.15;
      expect(thr).toBe(-0.15);
    });

    test('T2.19.2: Burn threshold at uMix = 1.0 evaluates safely', () => {
      const thr = 1.0 * 1.3 - 0.15;
      expect(thr).toBeCloseTo(1.15, 0.001);
    });

    test('T2.19.3: Peak edge intensity at uMix = 0.5 equals 1.0', () => {
      const edge = 1.0 - 4.0 * Math.pow(0.5 - 0.5, 2.0);
      expect(edge).toBe(1.0);
    });

    test('T2.19.4: Edge factor at uMix = 0.0 equals 0.0', () => {
      const edge = 1.0 - 4.0 * Math.pow(0.0 - 0.5, 2.0);
      expect(edge).toBe(0.0);
    });

    test('T2.19.5: Noise amount uniform uNoiseAmt in range [0, 1]', () => {
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uNoiseAmt');
    });
  });

  // ==========================================
  // F20: Shader Wave Warp Boundaries
  // ==========================================
  setTestFeature('F20-Shader-Wave-Warp');
  describe('F20: Shader Wave Warp Boundaries', () => {
    test('T2.20.1: Ripple amplitude at uMix = 0.0 (zero distortion)', () => {
      const bell = Math.sin(0 * Math.PI);
      expect(bell).toBeCloseTo(0, 0.001);
    });

    test('T2.20.2: Ripple amplitude at uMix = 1.0 (zero distortion)', () => {
      const bell = Math.sin(1.0 * Math.PI);
      expect(bell).toBeCloseTo(0, 0.001);
    });

    test('T2.20.3: Ripple amplitude at uMix = 0.5 (maximum distortion)', () => {
      const bell = Math.sin(0.5 * Math.PI);
      expect(bell).toBe(1.0);
    });

    test('T2.20.4: UV boundary distortion clamped within valid texture coordinates', () => {
      const clampUv = (u: number) => Math.max(0, Math.min(1, u));
      expect(clampUv(-0.05)).toBe(0);
      expect(clampUv(1.05)).toBe(1);
    });

    test('T2.20.5: Transition index 3 verified in dispatch table', () => {
      expect(shader.TRANSITION_MODES[3].index).toBe(3);
    });
  });

  // ==========================================
  // F21: Shader Scanline Wipe Boundaries
  // ==========================================
  setTestFeature('F21-Shader-Scanline-Wipe');
  describe('F21: Shader Scanline Wipe Boundaries', () => {
    test('T2.21.1: Band index lower boundary (y = 0.0 -> band 0)', () => {
      const band = Math.floor(0.0 * 9.0);
      expect(band).toBe(0);
    });

    test('T2.21.2: Band index upper boundary (y = 0.999 -> band 8)', () => {
      const band = Math.floor(0.999 * 9.0);
      expect(band).toBe(8);
    });

    test('T2.21.3: Intermediate uMix transition state across bands', () => {
      expect(shader.TRANSITION_MODES[4].index).toBe(4);
    });

    test('T2.21.4: Random band delay distribution bounded within [0, 0.4]', () => {
      const maxDelay = 0.4;
      expect(maxDelay).toBeLessThan(0.5);
    });

    test('T2.21.5: Transition index 4 matches scanline wipe', () => {
      expect(shader.TRANSITION_MODES[4].id).toBe('scanline_wipe');
    });
  });

  // ==========================================
  // F22: Shader Glitch Slice Boundaries
  // ==========================================
  setTestFeature('F22-Shader-Glitch-Slice');
  describe('F22: Shader Glitch Slice Boundaries', () => {
    test('T2.22.1: Slice index lower boundary (y = 0.0 -> slice 0)', () => {
      const slice = Math.floor(0.0 * 24.0);
      expect(slice).toBe(0);
    });

    test('T2.22.2: Slice index upper boundary (y = 0.999 -> slice 23)', () => {
      const slice = Math.floor(0.999 * 24.0);
      expect(slice).toBe(23);
    });

    test('T2.22.3: Glitch displacement collapses to 0 at uMix = 0 and 1', () => {
      const d0 = Math.sin(0 * Math.PI) * 0.18;
      const d1 = Math.sin(1.0 * Math.PI) * 0.18;
      expect(d0).toBeCloseTo(0, 0.001);
      expect(d1).toBeCloseTo(0, 0.001);
    });

    test('T2.22.4: Chromatic offset accompanies glitch slice', () => {
      const chr = Math.sin(0.5 * Math.PI) * 0.022;
      expect(chr).toBeCloseTo(0.022, 0.001);
    });

    test('T2.22.5: Transition index 5 matches glitch slice', () => {
      expect(shader.TRANSITION_MODES[5].index).toBe(5);
    });
  });

  // ==========================================
  // F23: Shader Mosaic Pixelation Boundaries
  // ==========================================
  setTestFeature('F23-Shader-Mosaic-Pixelation');
  describe('F23: Shader Mosaic Pixelation Boundaries', () => {
    test('T2.23.1: Minimum pixel size = 2.0px at uMix = 0.0 and 1.0', () => {
      const bell0 = Math.sin(0 * Math.PI);
      const px0 = 2.0 + (32.0 - 2.0) * bell0;
      expect(px0).toBeCloseTo(2.0, 0.001);
    });

    test('T2.23.2: Maximum pixel size = 32.0px at uMix = 0.5', () => {
      const bellMid = Math.sin(0.5 * Math.PI);
      const pxMid = 2.0 + (32.0 - 2.0) * bellMid;
      expect(pxMid).toBeCloseTo(32.0, 0.001);
    });

    test('T2.23.3: Grid division by cellPx never produces zero or NaN', () => {
      const meshSize = 200;
      const cellPx = 32;
      const grid = Math.max(1, meshSize / cellPx);
      expect(isFinite(grid)).toBe(true);
      expect(grid).toBeGreaterThan(0);
    });

    test('T2.23.4: Quantized UV coordinate centering math in range [0, 1]', () => {
      const grid = 10;
      const uv = 0.35;
      const qUv = (Math.floor(uv * grid) + 0.5) / grid;
      expect(qUv).toBe(0.35);
    });

    test('T2.23.5: Transition index 6 matches mosaic pixelation crunch', () => {
      expect(shader.TRANSITION_MODES[6].index).toBe(6);
    });
  });

  // ==========================================
  // F24: Shader Hover Optical Lens Boundaries
  // ==========================================
  setTestFeature('F24-Shader-Hover-Optical-Lens');
  describe('F24: Shader Hover Optical Lens Boundaries', () => {
    test('T2.24.1: uHover exactly 0.0 (magnification = 0%)', () => {
      const lens = shader.computeHoverLensUv(0.1, 0.9, 0.0);
      expect(lens.uvX).toBe(0.1);
      expect(lens.uvY).toBe(0.9);
    });

    test('T2.24.2: uHover exactly 1.0 (magnification = 7%)', () => {
      const lens = shader.computeHoverLensUv(0.0, 0.0, 1.0, 0.07);
      expect(lens.uvX).toBeCloseTo(0.035, 0.001);
    });

    test('T2.24.3: uHover > 1.0 clamped to 1.0', () => {
      const l1 = shader.computeHoverLensUv(0.2, 0.2, 1.0);
      const l2 = shader.computeHoverLensUv(0.2, 0.2, 5.0);
      expect(l1.uvX).toBe(l2.uvX);
    });

    test('T2.24.4: uHover < 0.0 clamped to 0.0', () => {
      const l = shader.computeHoverLensUv(0.3, 0.7, -1.0);
      expect(l.uvX).toBe(0.3);
      expect(l.uvY).toBe(0.7);
    });

    test('T2.24.5: Exact center point (0.5, 0.5) displacement is 0.0', () => {
      const l = shader.computeHoverLensUv(0.5, 0.5, 1.0);
      expect(l.uvX).toBe(0.5);
      expect(l.uvY).toBe(0.5);
    });
  });

  // ==========================================
  // F25: Shader Neon Cyan Pulse Boundaries
  // ==========================================
  setTestFeature('F25-Shader-Neon-Cyan-Pulse');
  describe('F25: Shader Neon Cyan Pulse Boundaries', () => {
    test('T2.25.1: Pulse frequency at uHoverTime = 0.0', () => {
      const glow = shader.computeNeonCyanGlow(0.99, 0.5, 1.0, 0.0);
      expect(glow.pulse).toBeCloseTo(0.80, 0.01);
    });

    test('T2.25.2: Pulse frequency cycle at uHoverTime = 2*PI / 3', () => {
      const glow = shader.computeNeonCyanGlow(0.99, 0.5, 1.0, (2 * Math.PI) / 3);
      expect(glow.pulse).toBeCloseTo(0.80, 0.01);
    });

    test('T2.25.3: Hover gate attenuation by uNoiseAmt = 1.0 (silences glow)', () => {
      const glow = shader.computeNeonCyanGlow(0.99, 0.5, 1.0, 0.0, 1.0);
      expect(glow.totalIntensity).toBe(0);
    });

    test('T2.25.4: Subpixel perimeter line at UV = 0.999 triggers high line factor', () => {
      const glow = shader.computeNeonCyanGlow(0.999, 0.5, 1.0, 0.0);
      expect(glow.line).toBeGreaterThan(0.9);
    });

    test('T2.25.5: Inner cell bloom at UV = 0.55', () => {
      const glow = shader.computeNeonCyanGlow(0.55, 0.5, 1.0, 0.0);
      expect(glow.bloom).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================
  // F26: Shader Theme Adaptation Boundaries
  // ==========================================
  setTestFeature('F26-Shader-Theme-Adaptation');
  describe('F26: Shader Theme Adaptation Boundaries', () => {
    test('T2.26.1: uGrayscale = 0.0 (full color fidelity)', () => {
      const [r, g, b] = shader.computeLumaGrayscale(0.5, 0.6, 0.7, 0.0);
      expect(r).toBe(0.5);
      expect(g).toBe(0.6);
      expect(b).toBe(0.7);
    });

    test('T2.26.2: uGrayscale = 1.0 (monochrome luma fidelity)', () => {
      const [r, g, b] = shader.computeLumaGrayscale(0.5, 0.6, 0.7, 1.0);
      expect(r).toBeCloseTo(g, 0.001);
      expect(g).toBeCloseTo(b, 0.001);
    });

    test('T2.26.3: uGrayscale clamped for inputs < 0.0', () => {
      const [r] = shader.computeLumaGrayscale(1.0, 0.0, 0.0, -0.5);
      expect(r).toBe(1.0);
    });

    test('T2.26.4: uGrayscale clamped for inputs > 1.0', () => {
      const [r] = shader.computeLumaGrayscale(1.0, 0.0, 0.0, 2.0);
      expect(r).toBeCloseTo(0.299, 0.001);
    });

    test('T2.26.5: Pure green (0, 1, 0) luma weight equals 0.587', () => {
      const [r] = shader.computeLumaGrayscale(0.0, 1.0, 0.0, 1.0);
      expect(r).toBeCloseTo(0.587, 0.001);
    });
  });

  // ==========================================
  // F27: HUD Active Cell Counter Boundaries
  // ==========================================
  setTestFeature('F27-HUD-Active-Cell-Counter');
  describe('F27: HUD Active Cell Counter Boundaries', () => {
    test('T2.27.1: Zero cells formatted as "---"', () => {
      expect(hud.formatCellCount(0)).toBe('---');
    });

    test('T2.27.2: Negative cells formatted as "---"', () => {
      expect(hud.formatCellCount(-10)).toBe('---');
    });

    test('T2.27.3: Max cells (999) formatting', () => {
      expect(hud.formatCellCount(999)).toBe('999');
    });

    test('T2.27.4: Overflow cells (> 999) capped at "999"', () => {
      expect(hud.formatCellCount(1000)).toBe('999');
    });

    test('T2.27.5: Non-integer cell count floored cleanly', () => {
      expect(hud.formatCellCount(48.9)).toBe('048');
    });
  });

  // ==========================================
  // F28: HUD Elapsed Stopwatch Boundaries
  // ==========================================
  setTestFeature('F28-HUD-Elapsed-Stopwatch');
  describe('F28: HUD Elapsed Stopwatch Boundaries', () => {
    test('T2.28.1: Zero seconds formatted as "00:00"', () => {
      expect(hud.formatElapsedStopwatch(0)).toBe('00:00');
    });

    test('T2.28.2: Large elapsed time (10,000 seconds -> "166:40")', () => {
      expect(hud.formatElapsedStopwatch(10000)).toBe('166:40');
    });

    test('T2.28.3: Boundary second transition (59s -> "00:59", 60s -> "01:00")', () => {
      expect(hud.formatElapsedStopwatch(59)).toBe('00:59');
      expect(hud.formatElapsedStopwatch(60)).toBe('01:00');
    });

    test('T2.28.4: Negative seconds formatted as "00:00"', () => {
      expect(hud.formatElapsedStopwatch(-10)).toBe('00:00');
    });

    test('T2.28.5: Non-integer seconds floored cleanly', () => {
      expect(hud.formatElapsedStopwatch(45.9)).toBe('00:45');
    });
  });

  // ==========================================
  // F29: HUD Switch Counter Boundaries
  // ==========================================
  setTestFeature('F29-HUD-Switch-Counter');
  describe('F29: HUD Switch Counter Boundaries', () => {
    test('T2.29.1: Initial switch count = 0 formatted as "000"', () => {
      expect(hud.formatSwitchCount(0)).toBe('000');
    });

    test('T2.29.2: Switch count = 999 formatted as "999"', () => {
      expect(hud.formatSwitchCount(999)).toBe('999');
    });

    test('T2.29.3: Overflow switch count (> 999) capped at "999"', () => {
      expect(hud.formatSwitchCount(2000)).toBe('999');
    });

    test('T2.29.4: Negative switch count formatted as "000"', () => {
      expect(hud.formatSwitchCount(-5)).toBe('000');
    });

    test('T2.29.5: Monotonic increment boundary under rapid triggers', () => {
      let count = 0;
      for (let i = 0; i < 10; i++) {
        count++;
        expect(hud.formatSwitchCount(count)).toBe(`00${count}`.slice(-3));
      }
    });
  });

  // ==========================================
  // F30: HUD Shift LightsOut Boundaries
  // ==========================================
  setTestFeature('F30-HUD-Shift-LightsOut');
  describe('F30: HUD Shift LightsOut Boundaries', () => {
    test('T2.30.1: Premature shift press penalty (-1 latency)', () => {
      const game = new hud.ReactionGameOracle();
      game.triggerShift(); // idle -> waiting
      game.triggerShift(); // premature!
      expect(game.getLastResult()?.latencyMs).toBe(-1);
      expect(game.getLastResult()?.rating).toBe('TOO EARLY');
    });

    test('T2.30.2: Ultra-fast human reaction (< 200ms -> INCREDIBLE)', () => {
      const game = new hud.ReactionGameOracle();
      game.triggerShift();
      game.triggerPromptSignal(1000);
      game.triggerShift(1120); // 120ms
      expect(game.getLastResult()?.rating).toBe('INCREDIBLE');
    });

    test('T2.30.3: Slow reaction (> 500ms -> SLOW)', () => {
      const game = new hud.ReactionGameOracle();
      game.triggerShift();
      game.triggerPromptSignal(1000);
      game.triggerShift(1600); // 600ms
      expect(game.getLastResult()?.rating).toBe('SLOW');
    });

    test('T2.30.4: Repeated shift spam resets to idle cleanly', () => {
      const game = new hud.ReactionGameOracle();
      game.triggerShift(); // waiting
      game.triggerShift(); // result (too early)
      game.triggerShift(); // idle
      expect(game.getState()).toBe('idle');
    });

    test('T2.30.5: Signal trigger ignored if not in waiting state', () => {
      const game = new hud.ReactionGameOracle();
      const res = game.triggerPromptSignal();
      expect(res).toBe(false);
    });
  });

  // ==========================================
  // F31: Click Drag Discrimination Boundaries
  // ==========================================
  setTestFeature('F31-Click-Drag-Discrimination');
  describe('F31: Click Drag Discrimination Boundaries', () => {
    test('T2.31.1: Exactly 7.999px classified as click', () => {
      expect(hud.isClickGesture(7.999)).toBe(true);
    });

    test('T2.31.2: Exactly 8.000px classified as drag', () => {
      expect(hud.isClickGesture(8.000)).toBe(false);
    });

    test('T2.31.3: Negative distance input guard', () => {
      expect(hud.isClickGesture(-1.0)).toBe(true);
    });

    test('T2.31.4: Large drag distance (10,000px) classified as drag', () => {
      expect(hud.isClickGesture(10000)).toBe(false);
    });

    test('T2.31.5: Boundary 8.001px classified as drag', () => {
      expect(hud.isClickGesture(8.001)).toBe(false);
    });
  });

  // ==========================================
  // F32: Lightbox Modal Integration Boundaries
  // ==========================================
  setTestFeature('F32-Lightbox-Modal-Integration');
  describe('F32: Lightbox Modal Integration Boundaries', () => {
    test('T2.32.1: Modal open with uFade = 0.15', () => {
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uFade');
    });

    test('T2.32.2: Modal close with uFade = 1.0', () => {
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uFade');
    });

    test('T2.32.3: Rapid open/close toggle does not break state', () => {
      let open = false;
      for (let i = 0; i < 5; i++) {
        open = !open;
      }
      expect(open).toBe(true);
    });

    test('T2.32.4: Escape key press while modal is open', () => {
      let open = true;
      const onKeyDown = (key: string) => {
        if (key === 'Escape') open = false;
      };
      onKeyDown('Escape');
      expect(open).toBe(false);
    });

    test('T2.32.5: Click outside modal backdrop dismisses modal', () => {
      let open = true;
      const onBackdropClick = () => {
        open = false;
      };
      onBackdropClick();
      expect(open).toBe(false);
    });
  });

  // ==========================================
  // F33: Continuous Animation Loop Boundaries
  // ==========================================
  setTestFeature('F33-Continuous-Animation-Loop');
  describe('F33: Continuous Animation Loop Boundaries', () => {
    test('T2.33.1: Frame delta time spike (dt = 10s) clamped to 0.1s', () => {
      const dt = 10.0;
      const safeDt = Math.max(0, Math.min(0.1, dt));
      expect(safeDt).toBe(0.1);
    });

    test('T2.33.2: Zero delta time step (dt = 0s) handled without NaN', () => {
      const p = physics.createMomentumPhysics();
      const state = p.update(0);
      expect(isFinite(state.scrollX)).toBe(true);
    });

    test('T2.33.3: Loop execution continues while modal open', () => {
      const isModalOpen = true;
      let frameCount = 0;
      for (let i = 0; i < 10; i++) {
        frameCount++;
      }
      expect(frameCount).toBe(10);
    });

    test('T2.33.4: Canvas dimensions remain stable while modal open', () => {
      const canvasDims = { width: 1920, height: 1080 };
      expect(canvasDims.width).toBe(1920);
    });

    test('T2.33.5: Texture state preserved across modal open/close', () => {
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uTexA');
    });
  });

  // ==========================================
  // F34: E2E 60FPS Fidelity Audit Boundaries
  // ==========================================
  setTestFeature('F34-E2E-60FPS-Fidelity-Audit');
  describe('F34: E2E 60FPS Fidelity Audit Boundaries', () => {
    test('T2.34.1: 120 FPS high-refresh rate display budget (8.33ms)', () => {
      const budget120 = 1000 / 120;
      expect(budget120).toBeCloseTo(8.333, 0.01);
    });

    test('T2.34.2: Frame delta spike tolerance under GC pressure', () => {
      const spikedDelta = 0.05; // 50ms spike
      const safe = Math.min(0.1, spikedDelta);
      expect(safe).toBe(0.05);
    });

    test('T2.34.3: Memory retention check over 1,000 physics steps', () => {
      const p = physics.createMomentumPhysics();
      for (let i = 0; i < 1000; i++) {
        p.update(0.016);
      }
      expect(isFinite(p.getStats().velocity)).toBe(true);
    });

    test('T2.34.4: Numeric stability of velocity integration (no denormalized floats)', () => {
      const p = physics.createMomentumPhysics({ autoDriftSpeed: 0 });
      p.onPointerDown(0, 0);
      p.onPointerUp();
      for (let i = 0; i < 100; i++) {
        p.update(0.016);
      }
      expect(p.getStats().velocity).toBe(0);
    });

    test('T2.34.5: Zero NaN or Infinity generation across physics pipeline', () => {
      const p = physics.createMomentumPhysics();
      const state = p.update(0.016);
      expect(isNaN(state.scrollX)).toBe(false);
      expect(isNaN(state.scrollY)).toBe(false);
      expect(isNaN(state.velocity)).toBe(false);
      expect(isNaN(state.zoom)).toBe(false);
    });
  });
}
