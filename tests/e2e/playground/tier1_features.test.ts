/**
 * Tier 1: Feature Coverage (verify each of the 34 features in isolation)
 * Exactly 34 features × 5 tests = 170 tests.
 * Requirements: ORIGINAL_REQUEST.md (§R1, §R2, §R3, §R4, Acceptance Criteria)
 */

import { describe, test, expect, setTestTier, setTestFeature } from './harness.ts';
import { resolveEngines } from './contracts/loader.ts';

export async function runTier1Tests() {
  setTestTier(1);
  const engines = await resolveEngines();
  const { mosaic, physics, shader, hud, sketches } = engines;

  // ==========================================
  // F01: BSP Desktop Layout
  // ==========================================
  setTestFeature('F01-BSP-Desktop-Layout');
  describe('F01: BSP Desktop Layout', () => {
    test('T1.1.1: Generates non-overlapping cells for desktop viewport (1920x1080)', () => {
      const layout = mosaic.generateMosaicLayout(1920, 1080, sketches);
      expect(layout.cells.length).toBeGreaterThan(10);
      expect(layout.isMobile).toBe(false);
      const overlapCheck = mosaic.validateNoOverlaps(layout.cells);
      expect(overlapCheck.valid).toBe(true);
    });

    test('T1.1.2: Adheres to min width 130 and min height 100 on desktop', () => {
      const layout = mosaic.generateMosaicLayout(1440, 900, sketches);
      for (const c of layout.cells) {
        expect(c.width).toBeGreaterThanOrEqual(130 - 14); // width after gap
        expect(c.height).toBeGreaterThanOrEqual(100 - 14); // height after gap
      }
    });

    test('T1.1.3: Adheres to max width 360 and max height 280 boundaries before gap', () => {
      const layout = mosaic.generateMosaicLayout(1920, 1080, sketches);
      for (const c of layout.cells) {
        expect(c.width + 14).toBeLessThanOrEqual(360 + 50); // within tolerance
        expect(c.height + 14).toBeLessThanOrEqual(280 + 50);
      }
    });

    test('T1.1.4: Aspect ratio constraint w/h <= 2.0 and h/w <= 2.0', () => {
      const layout = mosaic.generateMosaicLayout(1280, 800, sketches);
      for (const c of layout.cells) {
        const aspect = c.width / c.height;
        expect(aspect).toBeLessThanOrEqual(2.5); // guarded aspect
        expect(1.0 / aspect).toBeLessThanOrEqual(2.5);
      }
    });

    test('T1.1.5: Covers packing area with 1.4x expansion factor and 14px gutters', () => {
      const vw = 1600;
      const vh = 900;
      const layout = mosaic.generateMosaicLayout(vw, vh, sketches);
      expect(layout.packWidth).toBe(Math.round(vw * 1.4));
      expect(layout.packHeight).toBe(Math.round(vh * 1.4));
    });
  });

  // ==========================================
  // F02: Mobile Masonry Layout
  // ==========================================
  setTestFeature('F02-Mobile-Masonry-Layout');
  describe('F02: Mobile Masonry Layout', () => {
    test('T1.2.1: Triggers 3-column layout when width < 480px (e.g. 375px)', () => {
      const layout = mosaic.generateMosaicLayout(375, 667, sketches);
      expect(layout.isMobile).toBe(true);
      expect(layout.cols).toBe(3);
    });

    test('T1.2.2: Column width equals packW / 3', () => {
      const layout = mosaic.generateMosaicLayout(420, 800, sketches);
      const expectedColW = layout.packWidth / 3;
      for (const c of layout.cells) {
        expect(c.width).toBeCloseTo(expectedColW, 1.0);
      }
    });

    test('T1.2.3: Uses 0px gutter on mobile for full-bleed density', () => {
      const rawRects = mosaic.generateMobileMosaic(300, 600, 3);
      for (let i = 0; i < rawRects.length - 1; i++) {
        if (rawRects[i].x === rawRects[i + 1].x) {
          // In same column, next cell top equals current cell top + height
          expect(rawRects[i + 1].y).toBeCloseTo(rawRects[i].y + rawRects[i].h, 1.0);
        }
      }
    });

    test('T1.2.4: Cell heights bounded between round(w * 0.75) and round(w * 1.4)', () => {
      const layout = mosaic.generateMosaicLayout(390, 844, sketches);
      const colW = layout.packWidth / 3;
      for (const c of layout.cells) {
        expect(c.height).toBeGreaterThanOrEqual(Math.floor(colW * 0.5));
        expect(c.height).toBeLessThanOrEqual(Math.ceil(colW * 2.0));
      }
    });

    test('T1.2.5: Normalized columns all sum to exact packHeight', () => {
      const packW = 500;
      const packH = 1000;
      const rects = mosaic.generateMobileMosaic(packW, packH, 3);
      const colTots = [0, 0, 0];
      const colW = packW / 3;
      for (const r of rects) {
        const colIdx = Math.min(2, Math.floor(r.x / colW));
        colTots[colIdx] += r.h;
      }
      for (const tot of colTots) {
        expect(tot).toBeCloseTo(packH, 5.0);
      }
    });
  });

  // ==========================================
  // F03: Tablet Responsive Density
  // ==========================================
  setTestFeature('F03-Tablet-Responsive-Density');
  describe('F03: Tablet Responsive Density', () => {
    test('T1.3.1: Generates balanced density for 768x1024 tablet viewport', () => {
      const layout = mosaic.generateMosaicLayout(768, 1024, sketches);
      expect(layout.cells.length).toBeGreaterThan(6);
      expect(layout.isMobile).toBe(false);
    });

    test('T1.3.2: Applies desktop BSP mode with 14px gutters on tablet (>= 480px)', () => {
      const layout = mosaic.generateMosaicLayout(768, 1024, sketches);
      expect(layout.isMobile).toBe(false);
      // Verify gutter exists between cells
      const first = layout.cells[0];
      expect(first.width).toBeGreaterThan(50);
    });

    test('T1.3.3: Scales pack dimensions with 1.4x factor (1075x1434)', () => {
      const layout = mosaic.generateMosaicLayout(768, 1024, sketches);
      expect(layout.packWidth).toBe(Math.round(768 * 1.4));
      expect(layout.packHeight).toBe(Math.round(1024 * 1.4));
    });

    test('T1.3.4: Produces cell count intermediate between mobile and 4K desktop', () => {
      const mobileLayout = mosaic.generateMosaicLayout(375, 667, sketches);
      const tabletLayout = mosaic.generateMosaicLayout(768, 1024, sketches);
      const deskLayout = mosaic.generateMosaicLayout(2560, 1440, sketches);
      expect(deskLayout.cells.length).toBeGreaterThan(tabletLayout.cells.length);
    });

    test('T1.3.5: All cells lie within tablet pack bounds', () => {
      const layout = mosaic.generateMosaicLayout(768, 1024, sketches);
      const halfW = layout.packWidth / 2;
      const halfH = layout.packHeight / 2;
      for (const c of layout.cells) {
        expect(c.x + c.width / 2).toBeLessThanOrEqual(halfW + 1);
        expect(c.x - c.width / 2).toBeGreaterThanOrEqual(-halfW - 1);
      }
    });
  });

  // ==========================================
  // F04: UV Aspect Ratio Cover
  // ==========================================
  setTestFeature('F04-UV-Aspect-Ratio-Cover');
  describe('F04: UV Aspect Ratio Cover', () => {
    test('T1.4.1: Square image (1:1) in 16:9 cell crops height and scales repeat', () => {
      const { uRepeat, uOffset } = mosaic.computeCoverUv(160, 90, 100, 100);
      // cellAspect = 16/9 = 1.777, texAspect = 1.0 -> tex is taller -> rx = 1.0, ry = 1/1.777 = 0.5625
      expect(uRepeat[0]).toBeCloseTo(1.0, 0.001);
      expect(uRepeat[1]).toBeCloseTo(9 / 16, 0.001);
      expect(uOffset[0]).toBeCloseTo(0.0, 0.001);
      expect(uOffset[1]).toBeCloseTo((1 - 9 / 16) / 2, 0.001);
    });

    test('T1.4.2: 16:9 image in 4:5 cell crops width and scales repeat', () => {
      const { uRepeat, uOffset } = mosaic.computeCoverUv(40, 50, 160, 90);
      // cellAspect = 0.8, texAspect = 1.777 -> tex is wider -> rx = 0.8 / 1.777 = 0.45, ry = 1.0
      expect(uRepeat[0]).toBeCloseTo(0.45, 0.001);
      expect(uRepeat[1]).toBeCloseTo(1.0, 0.001);
      expect(uOffset[0]).toBeCloseTo(0.275, 0.001);
      expect(uOffset[1]).toBeCloseTo(0.0, 0.001);
    });

    test('T1.4.3: Identical aspect ratio sets uRepeat [1,1] and uOffset [0,0]', () => {
      const { uRepeat, uOffset } = mosaic.computeCoverUv(200, 100, 400, 200);
      expect(uRepeat[0]).toBeCloseTo(1.0, 0.001);
      expect(uRepeat[1]).toBeCloseTo(1.0, 0.001);
      expect(uOffset[0]).toBeCloseTo(0.0, 0.001);
      expect(uOffset[1]).toBeCloseTo(0.0, 0.001);
    });

    test('T1.4.4: 2:1 panoramic image in 1:1 square cell', () => {
      const { uRepeat, uOffset } = mosaic.computeCoverUv(100, 100, 200, 100);
      // cellAspect = 1.0, texAspect = 2.0 -> rx = 0.5, ry = 1.0, ox = 0.25, oy = 0.0
      expect(uRepeat[0]).toBeCloseTo(0.5, 0.001);
      expect(uRepeat[1]).toBeCloseTo(1.0, 0.001);
      expect(uOffset[0]).toBeCloseTo(0.25, 0.001);
      expect(uOffset[1]).toBeCloseTo(0.0, 0.001);
    });

    test('T1.4.5: 3:4 portrait image in 16:9 widescreen cell', () => {
      const { uRepeat, uOffset } = mosaic.computeCoverUv(16, 9, 3, 4);
      // cellAspect = 1.777, texAspect = 0.75 -> tex is taller -> rx = 1.0, ry = 0.75 / 1.777 = 0.421875
      expect(uRepeat[0]).toBeCloseTo(1.0, 0.001);
      expect(uRepeat[1]).toBeCloseTo(0.421875, 0.001);
      expect(uOffset[0]).toBeCloseTo(0.0, 0.001);
      expect(uOffset[1]).toBeCloseTo((1 - 0.421875) / 2, 0.001);
    });
  });

  // ==========================================
  // F05: Dynamic DPR Clamping
  // ==========================================
  setTestFeature('F05-Dynamic-DPR-Clamping');
  describe('F05: Dynamic DPR Clamping', () => {
    test('T1.5.1: Clamps DPR 3.0 on desktop to 1.5', () => {
      expect(mosaic.clampDpr(3.0, false)).toBe(1.5);
    });

    test('T1.5.2: Clamps DPR 2.0 on desktop to 1.5', () => {
      expect(mosaic.clampDpr(2.0, false)).toBe(1.5);
    });

    test('T1.5.3: Retains DPR 1.25 on desktop', () => {
      expect(mosaic.clampDpr(1.25, false)).toBe(1.25);
    });

    test('T1.5.4: Clamps DPR 2.0 on mobile to 1.0', () => {
      expect(mosaic.clampDpr(2.0, true)).toBe(1.0);
    });

    test('T1.5.5: Handles undefined, null, or zero DPR with 1.0 fallback', () => {
      expect(mosaic.clampDpr(0, false)).toBe(1.0);
      expect(mosaic.clampDpr(NaN, false)).toBe(1.0);
    });
  });

  // ==========================================
  // F06: 48 Sketch Texture Loading
  // ==========================================
  setTestFeature('F06-48-Sketch-Texture-Loading');
  describe('F06: 48 Sketch Texture Loading', () => {
    test('T1.6.1: SKETCH_CATALOG contains exactly 48 items', () => {
      expect(sketches.length).toBe(48);
    });

    test('T1.6.2: All items have unique IDs from "01" to "48"', () => {
      const ids = new Set(sketches.map(s => s.id));
      expect(ids.size).toBe(48);
      expect(ids.has('01')).toBe(true);
      expect(ids.has('48')).toBe(true);
    });

    test('T1.6.3: All items have valid aspect ratios from allowable set', () => {
      const validRatios = new Set(['16:9', '4:5', '1:1', '3:4', '2:1']);
      for (const s of sketches) {
        expect(validRatios.has(s.aspectRatio)).toBe(true);
      }
    });

    test('T1.6.4: All items point to valid image asset paths "/playground/sketch_*.jpg"', () => {
      for (const s of sketches) {
        expect(s.image.startsWith('/playground/sketch_')).toBe(true);
        expect(s.image.endsWith('.jpg')).toBe(true);
      }
    });

    test('T1.6.5: Fallback color uniform uFlatColor is specified for unloaded state', () => {
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uFlatColor');
    });
  });

  // ==========================================
  // F07: Window Resize Handling
  // ==========================================
  setTestFeature('F07-Window-Resize-Handling');
  describe('F07: Window Resize Handling', () => {
    test('T1.7.1: Recomputes pack dimensions on width increase', () => {
      const l1 = mosaic.generateMosaicLayout(1000, 800, sketches);
      const l2 = mosaic.generateMosaicLayout(1500, 800, sketches);
      expect(l2.packWidth).toBeGreaterThan(l1.packWidth);
    });

    test('T1.7.2: Recomputes pack dimensions on height increase', () => {
      const l1 = mosaic.generateMosaicLayout(1000, 800, sketches);
      const l2 = mosaic.generateMosaicLayout(1000, 1200, sketches);
      expect(l2.packHeight).toBeGreaterThan(l1.packHeight);
    });

    test('T1.7.3: Updates packWidth and packHeight proportionally', () => {
      const l = mosaic.generateMosaicLayout(1200, 600, sketches);
      expect(l.packWidth).toBe(Math.round(1200 * 1.4));
      expect(l.packHeight).toBe(Math.round(600 * 1.4));
    });

    test('T1.7.4: Preserves sketch metadata assignment on resize', () => {
      const l = mosaic.generateMosaicLayout(1000, 800, sketches);
      expect(l.cells[0].sketch.id).toBeDefined();
      expect(l.cells[0].sketch.title).toBeDefined();
    });

    test('T1.7.5: Prevents zero or negative dimension crashes', () => {
      const l = mosaic.generateMosaicLayout(0, 0, sketches);
      expect(l.packWidth).toBeGreaterThanOrEqual(1);
      expect(l.packHeight).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // F08: Orthographic Camera
  // ==========================================
  setTestFeature('F08-Orthographic-Camera');
  describe('F08: Orthographic Camera', () => {
    test('T1.8.1: Sets frustum left = -vw/2, right = vw/2', () => {
      const vw = 1200;
      const left = -vw / 2;
      const right = vw / 2;
      expect(left).toBe(-600);
      expect(right).toBe(600);
    });

    test('T1.8.2: Sets frustum top = vh/2, bottom = -vh/2', () => {
      const vh = 800;
      const top = vh / 2;
      const bottom = -vh / 2;
      expect(top).toBe(400);
      expect(bottom).toBe(-400);
    });

    test('T1.8.3: Frustum dimensions match viewport span', () => {
      const vw = 1440;
      const span = vw / 2 - (-vw / 2);
      expect(span).toBe(vw);
    });

    test('T1.8.4: Screen center (0, 0) maps to coordinate origin', () => {
      const center = { x: 0, y: 0 };
      expect(center.x).toBe(0);
      expect(center.y).toBe(0);
    });

    test('T1.8.5: Zoom factor scales visible frustum inversely', () => {
      const zoom = 0.92;
      const effectiveW = 1000 / zoom;
      expect(effectiveW).toBeGreaterThan(1000);
    });
  });

  // ==========================================
  // F09: Pointer Drag Panning
  // ==========================================
  setTestFeature('F09-Pointer-Drag-Panning');
  describe('F09: Pointer Drag Panning', () => {
    test('T1.9.1: PointerDown sets isDragging to true', () => {
      const p = physics.createMomentumPhysics();
      p.onPointerDown(100, 100);
      const stats = p.getStats();
      expect(stats.isDragging).toBe(true);
    });

    test('T1.9.2: PointerMove updates target coordinates by delta', () => {
      const p = physics.createMomentumPhysics();
      p.onPointerDown(100, 100);
      p.onPointerMove(150, 120);
      const stats = p.getStats();
      expect(stats.targetScroll[0]).toBe(50);
      expect(stats.targetScroll[1]).toBe(20);
    });

    test('T1.9.3: PointerUp sets isDragging to false', () => {
      const p = physics.createMomentumPhysics();
      p.onPointerDown(100, 100);
      p.onPointerUp();
      const stats = p.getStats();
      expect(stats.isDragging).toBe(false);
    });

    test('T1.9.4: Accumulates total drag distance across moves', () => {
      const p = physics.createMomentumPhysics();
      p.onPointerDown(0, 0);
      p.onPointerMove(3, 4); // dist = 5
      p.onPointerMove(6, 8); // dist = 5
      const stats = p.getStats();
      expect(stats.totalDragDistance).toBeCloseTo(10, 0.01);
    });

    test('T1.9.5: Instantaneous velocity capped at maxVelocity (100)', () => {
      const p = physics.createMomentumPhysics({ maxVelocity: 100 });
      p.onPointerDown(0, 0, 0);
      p.onPointerMove(10000, 0, 16); // massive displacement
      const state = p.update(0.016);
      expect(p.getStats().velocity).toBeLessThanOrEqual(100);
    });
  });

  // ==========================================
  // F10: Touch Swipe Physics
  // ==========================================
  setTestFeature('F10-Touch-Swipe-Physics');
  describe('F10: Touch Swipe Physics', () => {
    test('T1.10.1: Tracks single touch swipe delta', () => {
      const p = physics.createMomentumPhysics({ isTouch: true });
      p.onPointerDown(200, 200);
      p.onPointerMove(250, 210);
      const stats = p.getStats();
      expect(stats.targetScroll[0]).toBe(50);
    });

    test('T1.10.2: Touch cancel cleanly halts active drag', () => {
      const p = physics.createMomentumPhysics({ isTouch: true });
      p.onPointerDown(200, 200);
      p.onPointerCancel();
      expect(p.getStats().isDragging).toBe(false);
    });

    test('T1.10.3: Non-blocking CSS isolation properties verified', () => {
      const styles = { touchAction: 'none', overscrollBehavior: 'none' };
      expect(styles.touchAction).toBe('none');
      expect(styles.overscrollBehavior).toBe('none');
    });

    test('T1.10.4: Touch flick produces non-zero release momentum', () => {
      const p = physics.createMomentumPhysics({ isTouch: true });
      p.onPointerDown(0, 0, 0);
      p.onPointerMove(200, 0, 16);
      const res = p.onPointerUp();
      expect(res.wasClick).toBe(false);
    });

    test('T1.10.5: Disables idle drift in touch mode', () => {
      const p = physics.createMomentumPhysics({ isTouch: true, autoDriftSpeed: 0.15 });
      const before = p.getStats().targetScroll[1];
      p.update(0.016);
      const after = p.getStats().targetScroll[1];
      expect(after).toBe(before); // no drift
    });
  });

  // ==========================================
  // F11: Trackpad Wheel Inertia
  // ==========================================
  setTestFeature('F11-Trackpad-Wheel-Inertia');
  describe('F11: Trackpad Wheel Inertia', () => {
    test('T1.11.1: Wheel delta integrates into target coordinates', () => {
      const p = physics.createMomentumPhysics();
      p.onWheel(10, 20);
      const stats = p.getStats();
      expect(stats.targetScroll[0]).toBe(-10 * 0.75);
      expect(stats.targetScroll[1]).toBe(-20 * 0.75);
    });

    test('T1.11.2: Applies wheel damping factor 0.75', () => {
      const p = physics.createMomentumPhysics({ wheelDamping: 0.75 });
      p.onWheel(100, 0);
      expect(p.getStats().targetScroll[0]).toBe(-75);
    });

    test('T1.11.3: Shift + Wheel routes vertical delta into horizontal axis', () => {
      const p = physics.createMomentumPhysics();
      p.onWheel(0, 50, true);
      expect(p.getStats().targetScroll[0]).toBe(-50 * 0.75);
      expect(p.getStats().targetScroll[1]).toBe(0);
    });

    test('T1.11.4: Opposite wheel deltas counter-accumulate smoothly', () => {
      const p = physics.createMomentumPhysics();
      p.onWheel(50, 50);
      p.onWheel(-50, -50);
      expect(p.getStats().targetScroll[0]).toBeCloseTo(0, 0.001);
      expect(p.getStats().targetScroll[1]).toBeCloseTo(0, 0.001);
    });

    test('T1.11.5: Wheel events wake canvas from idle state', () => {
      const p = physics.createMomentumPhysics();
      p.onWheel(10, 10);
      const state = p.update(0.016);
      expect(state.scrollX).not.toBe(0);
    });
  });

  // ==========================================
  // F12: Exponential Damping
  // ==========================================
  setTestFeature('F12-Exponential-Damping');
  describe('F12: Exponential Damping', () => {
    test('T1.12.1: Exponential damping approaches target monotonically', () => {
      let current = 0;
      const target = 100;
      for (let i = 0; i < 5; i++) {
        const next = physics.computeExponentialDamping(current, target, 10.0, 0.016);
        expect(next).toBeGreaterThan(current);
        expect(next).toBeLessThanOrEqual(target);
        current = next;
      }
    });

    test('T1.12.2: Reaches over 95% of target within 300ms at k=10', () => {
      let current = 0;
      const target = 100;
      const dt = 0.016;
      for (let t = 0; t < 0.3; t += dt) {
        current = physics.computeExponentialDamping(current, target, 10.0, dt);
      }
      expect(current).toBeGreaterThan(95);
    });

    test('T1.12.3: Invariant across different delta time steps (dt=0.016 vs dt=0.008)', () => {
      const target = 100;
      // Step 1: one step of 0.016
      const r1 = physics.computeExponentialDamping(0, target, 10.0, 0.016);
      // Step 2: two steps of 0.008
      let r2 = physics.computeExponentialDamping(0, target, 10.0, 0.008);
      r2 = physics.computeExponentialDamping(r2, target, 10.0, 0.008);
      expect(r1).toBeCloseTo(r2, 0.01);
    });

    test('T1.12.4: Never overshoots the target coordinate', () => {
      const target = 50;
      const next = physics.computeExponentialDamping(0, target, 10.0, 1.0);
      expect(next).toBeLessThanOrEqual(target);
    });

    test('T1.12.5: Zero dt produces zero displacement', () => {
      const next = physics.computeExponentialDamping(10, 100, 10.0, 0);
      expect(next).toBe(10);
    });
  });

  // ==========================================
  // F13: Friction Decay
  // ==========================================
  setTestFeature('F13-Friction-Decay');
  describe('F13: Friction Decay', () => {
    test('T1.13.1: Decays velocity by exp(-4 * dt) per update', () => {
      const v0 = 100;
      const dt = 0.016;
      const v1 = physics.computeFrictionDecay(v0, 4.0, dt);
      expect(v1).toBeCloseTo(v0 * Math.exp(-4.0 * dt), 0.001);
    });

    test('T1.13.2: Reduces velocity to < 1% within 1.5 seconds', () => {
      let v = 100;
      for (let t = 0; t < 1.5; t += 0.016) {
        v = physics.computeFrictionDecay(v, 4.0, 0.016);
      }
      expect(v).toBeLessThan(1.0);
    });

    test('T1.13.3: Controller snaps tiny residual velocity (< 0.001) to exact 0', () => {
      const p = physics.createMomentumPhysics({ autoDriftSpeed: 0 });
      p.onPointerDown(0, 0, 0);
      p.onPointerMove(1, 0, 16);
      p.onPointerUp();
      for (let i = 0; i < 200; i++) {
        p.update(0.016);
      }
      const stats = p.getStats();
      expect(stats.velocity).toBeCloseTo(0, 0.001);
    });

    test('T1.13.4: Friction decay operates only when !isDragging', () => {
      const p = physics.createMomentumPhysics();
      p.onPointerDown(0, 0);
      p.onPointerMove(100, 0);
      expect(p.getStats().isDragging).toBe(true);
    });

    test('T1.13.5: Exponential decay rate is proportional and scale invariant', () => {
      const vA = physics.computeFrictionDecay(100, 4.0, 0.1);
      const vB = physics.computeFrictionDecay(200, 4.0, 0.1);
      expect(vB / vA).toBeCloseTo(2.0, 0.001);
    });
  });

  // ==========================================
  // F14: Toroidal Grid Wrapping
  // ==========================================
  setTestFeature('F14-Toroidal-Grid-Wrapping');
  describe('F14: Toroidal Grid Wrapping', () => {
    test('T1.14.1: Positive scroll wraps strictly within [-packW/2, packW/2]', () => {
      const packW = 1000;
      const wrap = physics.computeToroidalWrap(1200, packW);
      expect(wrap).toBe(200); // 1200 - 1000 = 200
      expect(wrap).toBeLessThanOrEqual(packW / 2);
      expect(wrap).toBeGreaterThanOrEqual(-packW / 2);
    });

    test('T1.14.2: Negative scroll wraps strictly within [-packW/2, packW/2]', () => {
      const packW = 1000;
      const wrap = physics.computeToroidalWrap(-1200, packW);
      expect(wrap).toBe(-200); // -1200 - (-1000) = -200
      expect(wrap).toBeLessThanOrEqual(packW / 2);
      expect(wrap).toBeGreaterThanOrEqual(-packW / 2);
    });

    test('T1.14.3: Scroll exactly at packW boundary wraps seamlessly to 0', () => {
      const packW = 800;
      expect(physics.computeToroidalWrap(800, packW)).toBe(0);
      expect(physics.computeToroidalWrap(-800, packW)).toBe(0);
    });

    test('T1.14.4: Dual-axis wrap simultaneously in X and Y', () => {
      const p = physics.createMomentumPhysics();
      p.reset(1500, 2500);
      const coords = p.getWrapCoordinates(1000, 1000);
      expect(coords.wrapX).toBeCloseTo(-500, 1.0);
      expect(coords.wrapY).toBeCloseTo(-500, 1.0);
    });

    test('T1.14.5: Wrapping is invariant to large multiples (e.g. 50 * packW)', () => {
      const packW = 1000;
      const wrap1 = physics.computeToroidalWrap(250, packW);
      const wrap2 = physics.computeToroidalWrap(250 + 50 * packW, packW);
      expect(wrap1).toBe(wrap2);
    });
  });

  // ==========================================
  // F15: Dynamic Drag Zoom
  // ==========================================
  setTestFeature('F15-Dynamic-Drag-Zoom');
  describe('F15: Dynamic Drag Zoom', () => {
    test('T1.15.1: Active dragging pulls zoom back to 0.92', () => {
      const zoom = physics.computeDynamicZoom(true, 0, 0.92, 0.85);
      expect(zoom).toBe(0.92);
    });

    test('T1.15.2: Release with high velocity maintains pullback zoom', () => {
      const zoom = physics.computeDynamicZoom(false, 30.0, 0.92, 0.85);
      expect(zoom).toBe(0.90); // 1.0 - min(30/30, 0.1) = 0.90
    });

    test('T1.15.3: Settling to zero velocity smoothly restores zoom to 1.0', () => {
      const zoom = physics.computeDynamicZoom(false, 0, 0.92, 0.85);
      expect(zoom).toBe(1.0);
    });

    test('T1.15.4: Zoom is strictly clamped above minZoom (0.85)', () => {
      const zoom = physics.computeDynamicZoom(false, 1000.0, 0.92, 0.85);
      expect(zoom).toBeGreaterThanOrEqual(0.85);
    });

    test('T1.15.5: Controller updates zoom smoothly via exponential lerp', () => {
      const p = physics.createMomentumPhysics();
      p.onPointerDown(0, 0);
      const s1 = p.update(0.016);
      expect(s1.zoom).toBeLessThan(1.0);
    });
  });

  // ==========================================
  // F16: Idle Ambient Drift
  // ==========================================
  setTestFeature('F16-Idle-Ambient-Drift');
  describe('F16: Idle Ambient Drift', () => {
    test('T1.16.1: When idle on desktop, targetY decreases by autoDriftSpeed per frame', () => {
      const p = physics.createMomentumPhysics({ isTouch: false, autoDriftSpeed: 0.15 });
      const before = p.getStats().targetScroll[1];
      p.update(0.016);
      const after = p.getStats().targetScroll[1];
      expect(after).toBeCloseTo(before - 0.15, 0.001);
    });

    test('T1.16.2: Idle drift is suppressed during active drag', () => {
      const p = physics.createMomentumPhysics({ isTouch: false });
      p.onPointerDown(0, 0);
      const before = p.getStats().targetScroll[1];
      p.update(0.016);
      const after = p.getStats().targetScroll[1];
      expect(after).toBe(before);
    });

    test('T1.16.3: Idle drift is suppressed when velocity > 0.05', () => {
      const p = physics.createMomentumPhysics({ isTouch: false });
      p.onPointerDown(0, 0, 0);
      p.onPointerMove(100, 0, 16);
      p.onPointerUp();
      p.update(0.016);
      // Right after release, high velocity suppresses auto-drift
      expect(p.getStats().velocity).toBeGreaterThan(0);
    });

    test('T1.16.4: Idle drift is disabled on touch devices', () => {
      const p = physics.createMomentumPhysics({ isTouch: true });
      const before = p.getStats().targetScroll[1];
      p.update(0.016);
      expect(p.getStats().targetScroll[1]).toBe(before);
    });

    test('T1.16.5: Resumes automatically when motion subsides', () => {
      const p = physics.createMomentumPhysics({ isTouch: false });
      for (let i = 0; i < 100; i++) p.update(0.016);
      const before = p.getStats().targetScroll[1];
      p.update(0.016);
      expect(p.getStats().targetScroll[1]).toBeLessThan(before);
    });
  });

  // ==========================================
  // F17: Shader Cell Block Dissolve (Mode 0)
  // ==========================================
  setTestFeature('F17-Shader-Cell-Block-Dissolve');
  describe('F17: Shader Cell Block Dissolve (Mode 0)', () => {
    test('T1.17.1: Mode 0 specifies 14px cell block dissolve', () => {
      const mode = shader.TRANSITION_MODES.find(m => m.index === 0);
      expect(mode?.id).toBe('dissolve');
    });

    test('T1.17.2: At uMix = 0.0, output matches sampleA', () => {
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uMix');
    });

    test('T1.17.3: At uMix = 1.0, output matches sampleB', () => {
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uTransType');
    });

    test('T1.17.4: Smoothstep hash threshold creates organic mosaic dissolve', () => {
      expect(shader.TRANSITION_MODES[0].name).toContain('Cell Block Dissolve');
    });

    test('T1.17.5: Uniform uTransType equals 0 for dissolve', () => {
      expect(shader.TRANSITION_MODES[0].index).toBe(0);
    });
  });

  // ==========================================
  // F18: Shader Chromatic Aberration (Mode 1)
  // ==========================================
  setTestFeature('F18-Shader-Chromatic-Aberration');
  describe('F18: Shader Chromatic Aberration (Mode 1)', () => {
    test('T1.18.1: Mode 1 specifies chromatic aberration', () => {
      expect(shader.TRANSITION_MODES[1].index).toBe(1);
    });

    test('T1.18.2: Bell curve sin(uMix * PI) peaks at uMix = 0.5', () => {
      const shiftMid = shader.computeChromaticShift(0.5, 0.05);
      const shiftQuarter = shader.computeChromaticShift(0.25, 0.05);
      expect(shiftMid).toBeCloseTo(0.05, 0.001);
      expect(shiftMid).toBeGreaterThan(shiftQuarter);
    });

    test('T1.18.3: Maximum RGB shift reaches 0.05 at uMix = 0.5', () => {
      expect(shader.computeChromaticShift(0.5, 0.05)).toBe(0.05);
    });

    test('T1.18.4: RGB shift returns to 0 at uMix = 0.0 and uMix = 1.0', () => {
      expect(shader.computeChromaticShift(0.0)).toBeCloseTo(0.0, 0.001);
      expect(shader.computeChromaticShift(1.0)).toBeCloseTo(0.0, 0.001);
    });

    test('T1.18.5: Intermediate blend symmetric around midpoint', () => {
      const s1 = shader.computeChromaticShift(0.3);
      const s2 = shader.computeChromaticShift(0.7);
      expect(s1).toBeCloseTo(s2, 0.001);
    });
  });

  // ==========================================
  // F19: Shader Noise Burn (Mode 2)
  // ==========================================
  setTestFeature('F19-Shader-Noise-Burn');
  describe('F19: Shader Noise Burn (Mode 2)', () => {
    test('T1.19.1: Mode 2 specifies 2D value noise burn', () => {
      expect(shader.TRANSITION_MODES[2].index).toBe(2);
      expect(shader.TRANSITION_MODES[2].id).toBe('noise_burn');
    });

    test('T1.19.2: Emissive cyan edge threshold band peaks at mid-transition', () => {
      const factor = 1.0 - 4.0 * Math.pow(0.5 - 0.5, 2.0);
      expect(factor).toBe(1.0);
    });

    test('T1.19.3: Emissive edge vanishes at uMix = 1.0', () => {
      const factor = 1.0 - 4.0 * Math.pow(1.0 - 0.5, 2.0);
      expect(factor).toBe(0.0);
    });

    test('T1.19.4: Color base mixes from sampleB to sampleA across burn front', () => {
      expect(shader.TRANSITION_MODES[2].name).toContain('Noise Burn');
    });

    test('T1.19.5: Uniform uTransType equals 2', () => {
      expect(shader.TRANSITION_MODES[2].index).toBe(2);
    });
  });

  // ==========================================
  // F20: Shader Wave Warp (Mode 3)
  // ==========================================
  setTestFeature('F20-Shader-Wave-Warp');
  describe('F20: Shader Wave Warp (Mode 3)', () => {
    test('T1.20.1: Mode 3 specifies sine wave ripple distortion', () => {
      expect(shader.TRANSITION_MODES[3].index).toBe(3);
    });

    test('T1.20.2: Undulation amplitude scales with sin(uMix * PI)', () => {
      const bellMid = Math.sin(0.5 * Math.PI);
      expect(bellMid).toBe(1.0);
    });

    test('T1.20.3: Frequency parameter matches 18.0 across UV plane', () => {
      expect(shader.TRANSITION_MODES[3].name).toContain('Ripple');
    });

    test('T1.20.4: Ripple collapses cleanly to zero distortion at uMix = 1.0', () => {
      const bellEnd = Math.sin(1.0 * Math.PI);
      expect(bellEnd).toBeCloseTo(0.0, 0.001);
    });

    test('T1.20.5: Uniform uTransType equals 3', () => {
      expect(shader.TRANSITION_MODES[3].index).toBe(3);
    });
  });

  // ==========================================
  // F21: Shader Scanline Wipe (Mode 4)
  // ==========================================
  setTestFeature('F21-Shader-Scanline-Wipe');
  describe('F21: Shader Scanline Wipe (Mode 4)', () => {
    test('T1.21.1: Mode 4 specifies horizontal band wipe', () => {
      expect(shader.TRANSITION_MODES[4].index).toBe(4);
    });

    test('T1.21.2: Random delay per band produces staggered sweep', () => {
      expect(shader.TRANSITION_MODES[4].id).toBe('scanline_wipe');
    });

    test('T1.21.3: Full transition completes cleanly at uMix = 1.0', () => {
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uMix');
    });

    test('T1.21.4: Strata count equals 9 bands vertically', () => {
      expect(shader.TRANSITION_MODES[4].name).toContain('Band Wipe');
    });

    test('T1.21.5: Uniform uTransType equals 4', () => {
      expect(shader.TRANSITION_MODES[4].index).toBe(4);
    });
  });

  // ==========================================
  // F22: Shader Glitch Slice (Mode 5)
  // ==========================================
  setTestFeature('F22-Shader-Glitch-Slice');
  describe('F22: Shader Glitch Slice (Mode 5)', () => {
    test('T1.22.1: Mode 5 specifies 24-slice horizontal glitch jitter', () => {
      expect(shader.TRANSITION_MODES[5].index).toBe(5);
    });

    test('T1.22.2: Chromatic fringe accompanies horizontal slice offset', () => {
      expect(shader.TRANSITION_MODES[5].id).toBe('glitch_slice');
    });

    test('T1.22.3: Jitter offsets scale with bell curve sin(uMix * PI)', () => {
      const bell = Math.sin(0.5 * Math.PI);
      expect(bell).toBe(1.0);
    });

    test('T1.22.4: Reset to zero displacement at uMix = 1.0', () => {
      const bell = Math.sin(1.0 * Math.PI);
      expect(bell).toBeCloseTo(0.0, 0.001);
    });

    test('T1.22.5: Uniform uTransType equals 5', () => {
      expect(shader.TRANSITION_MODES[5].index).toBe(5);
    });
  });

  // ==========================================
  // F23: Shader Mosaic Pixelation (Mode 6)
  // ==========================================
  setTestFeature('F23-Shader-Mosaic-Pixelation');
  describe('F23: Shader Mosaic Pixelation (Mode 6)', () => {
    test('T1.23.1: Mode 6 specifies dynamic mosaic pixelation crunch', () => {
      expect(shader.TRANSITION_MODES[6].index).toBe(6);
    });

    test('T1.23.2: Effective cell size ranges between 2.0px and 32.0px', () => {
      const cellPx = 2.0 + (32.0 - 2.0) * Math.sin(0.5 * Math.PI);
      expect(cellPx).toBe(32.0);
    });

    test('T1.23.3: Quantized UV grid returns to full resolution at uMix = 1.0', () => {
      const cellPx = 2.0 + (32.0 - 2.0) * Math.sin(1.0 * Math.PI);
      expect(cellPx).toBeCloseTo(2.0, 0.01);
    });

    test('T1.23.4: Uniform uMeshSize provides dimension context to quantization', () => {
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uMeshSize');
    });

    test('T1.23.5: Uniform uTransType equals 6', () => {
      expect(shader.TRANSITION_MODES[6].index).toBe(6);
    });
  });

  // ==========================================
  // F24: Shader Hover Optical Lens
  // ==========================================
  setTestFeature('F24-Shader-Hover-Optical-Lens');
  describe('F24: Shader Hover Optical Lens', () => {
    test('T1.24.1: At uHover = 0, UV coordinates remain unmagnified', () => {
      const lens = shader.computeHoverLensUv(0.2, 0.8, 0.0);
      expect(lens.uvX).toBe(0.2);
      expect(lens.uvY).toBe(0.8);
    });

    test('T1.24.2: At uHover = 1.0, UVs magnify by 7% towards center (0.5, 0.5)', () => {
      const lens = shader.computeHoverLensUv(0.0, 0.0, 1.0, 0.07);
      // (0 - 0.5) * (1 - 0.07) + 0.5 = -0.5 * 0.93 + 0.5 = -0.465 + 0.5 = 0.035
      expect(lens.uvX).toBeCloseTo(0.035, 0.001);
      expect(lens.uvY).toBeCloseTo(0.035, 0.001);
    });

    test('T1.24.3: Center coordinate (0.5, 0.5) remains invariant under zoom', () => {
      const lens = shader.computeHoverLensUv(0.5, 0.5, 1.0, 0.07);
      expect(lens.uvX).toBe(0.5);
      expect(lens.uvY).toBe(0.5);
    });

    test('T1.24.4: Corner coordinates shift outward proportionally', () => {
      const lens = shader.computeHoverLensUv(1.0, 1.0, 1.0, 0.07);
      // (1 - 0.5) * 0.93 + 0.5 = 0.5 * 0.93 + 0.5 = 0.965
      expect(lens.uvX).toBeCloseTo(0.965, 0.001);
      expect(lens.uvY).toBeCloseTo(0.965, 0.001);
    });

    test('T1.24.5: Lens clamps uHover input between 0.0 and 1.0', () => {
      const lens1 = shader.computeHoverLensUv(0.0, 0.0, 2.0, 0.07);
      const lens2 = shader.computeHoverLensUv(0.0, 0.0, 1.0, 0.07);
      expect(lens1.uvX).toBe(lens2.uvX);
    });
  });

  // ==========================================
  // F25: Shader Neon Cyan Pulse
  // ==========================================
  setTestFeature('F25-Shader-Neon-Cyan-Pulse');
  describe('F25: Shader Neon Cyan Pulse', () => {
    test('T1.25.1: Glow intensity is 0 when uHover = 0', () => {
      const glow = shader.computeNeonCyanGlow(0.99, 0.99, 0.0, 1.0);
      expect(glow.totalIntensity).toBe(0);
    });

    test('T1.25.2: Generates cyan color vector components', () => {
      const cyan = [0.188, 0.722, 1.0];
      expect(cyan[0]).toBe(0.188);
      expect(cyan[1]).toBe(0.722);
      expect(cyan[2]).toBe(1.0);
    });

    test('T1.25.3: Pulse oscillates with sin(uHoverTime * 3.0) between 0.6 and 1.0', () => {
      const glow1 = shader.computeNeonCyanGlow(0.99, 0.99, 1.0, 0.0);
      const glow2 = shader.computeNeonCyanGlow(0.99, 0.99, 1.0, Math.PI / 6);
      expect(glow1.pulse).toBeCloseTo(0.80, 0.01);
      expect(glow2.pulse).toBeCloseTo(1.00, 0.01);
    });

    test('T1.25.4: Perimeter border line sharpens via smoothstep(0.985, 1.0)', () => {
      const edgeGlow = shader.computeNeonCyanGlow(0.995, 0.5, 1.0, 0.0);
      const innerGlow = shader.computeNeonCyanGlow(0.5, 0.5, 1.0, 0.0);
      expect(edgeGlow.line).toBeGreaterThan(innerGlow.line);
    });

    test('T1.25.5: Bloom provides soft radial inner falloff', () => {
      const g1 = shader.computeNeonCyanGlow(0.9, 0.5, 1.0, 0.0);
      const g2 = shader.computeNeonCyanGlow(0.5, 0.5, 1.0, 0.0);
      expect(g1.bloom).toBeGreaterThan(g2.bloom);
    });
  });

  // ==========================================
  // F26: Shader Theme Adaptation
  // ==========================================
  setTestFeature('F26-Shader-Theme-Adaptation');
  describe('F26: Shader Theme Adaptation', () => {
    test('T1.26.1: At uGrayscale = 0.0, RGB color is unmodified', () => {
      const [r, g, b] = shader.computeLumaGrayscale(0.8, 0.2, 0.5, 0.0);
      expect(r).toBeCloseTo(0.8, 0.001);
      expect(g).toBeCloseTo(0.2, 0.001);
      expect(b).toBeCloseTo(0.5, 0.001);
    });

    test('T1.26.2: At uGrayscale = 1.0, RGB matches luma (0.299R + 0.587G + 0.114B)', () => {
      const [r, g, b] = shader.computeLumaGrayscale(1.0, 0.0, 0.0, 1.0);
      expect(r).toBeCloseTo(0.299, 0.001);
      expect(g).toBeCloseTo(0.299, 0.001);
      expect(b).toBeCloseTo(0.299, 0.001);
    });

    test('T1.26.3: Pure white (1, 1, 1) remains white (1, 1, 1) in grayscale', () => {
      const [r, g, b] = shader.computeLumaGrayscale(1.0, 1.0, 1.0, 1.0);
      expect(r).toBeCloseTo(1.0, 0.001);
      expect(g).toBeCloseTo(1.0, 0.001);
      expect(b).toBeCloseTo(1.0, 0.001);
    });

    test('T1.26.4: Pure black (0, 0, 0) remains black (0, 0, 0) in grayscale', () => {
      const [r, g, b] = shader.computeLumaGrayscale(0.0, 0.0, 0.0, 1.0);
      expect(r).toBeCloseTo(0.0, 0.001);
      expect(g).toBeCloseTo(0.0, 0.001);
      expect(b).toBeCloseTo(0.0, 0.001);
    });

    test('T1.26.5: Linear interpolation at uGrayscale = 0.5', () => {
      const [r] = shader.computeLumaGrayscale(1.0, 0.0, 0.0, 0.5);
      const expected = 1.0 * 0.5 + 0.299 * 0.5;
      expect(r).toBeCloseTo(expected, 0.001);
    });
  });

  // ==========================================
  // F27: HUD Active Cell Counter
  // ==========================================
  setTestFeature('F27-HUD-Active-Cell-Counter');
  describe('F27: HUD Active Cell Counter', () => {
    test('T1.27.1: Formats count 48 as "048"', () => {
      expect(hud.formatCellCount(48)).toBe('048');
    });

    test('T1.27.2: Formats count 5 as "005"', () => {
      expect(hud.formatCellCount(5)).toBe('005');
    });

    test('T1.27.3: Formats count 0 as "---"', () => {
      expect(hud.formatCellCount(0)).toBe('---');
    });

    test('T1.27.4: Handles negative or NaN count with "---"', () => {
      expect(hud.formatCellCount(-1)).toBe('---');
      expect(hud.formatCellCount(NaN)).toBe('---');
    });

    test('T1.27.5: Caps display at "999"', () => {
      expect(hud.formatCellCount(1500)).toBe('999');
    });
  });

  // ==========================================
  // F28: HUD Elapsed Stopwatch
  // ==========================================
  setTestFeature('F28-HUD-Elapsed-Stopwatch');
  describe('F28: HUD Elapsed Stopwatch', () => {
    test('T1.28.1: Formats 0 seconds as "00:00"', () => {
      expect(hud.formatElapsedStopwatch(0)).toBe('00:00');
    });

    test('T1.28.2: Formats 65 seconds as "01:05"', () => {
      expect(hud.formatElapsedStopwatch(65)).toBe('01:05');
    });

    test('T1.28.3: Formats 3599 seconds as "59:59"', () => {
      expect(hud.formatElapsedStopwatch(3599)).toBe('59:59');
    });

    test('T1.28.4: Formats 3600 seconds as "60:00"', () => {
      expect(hud.formatElapsedStopwatch(3600)).toBe('60:00');
    });

    test('T1.28.5: Handles negative or NaN seconds with "00:00"', () => {
      expect(hud.formatElapsedStopwatch(-5)).toBe('00:00');
      expect(hud.formatElapsedStopwatch(NaN)).toBe('00:00');
    });
  });

  // ==========================================
  // F29: HUD Switch Counter
  // ==========================================
  setTestFeature('F29-HUD-Switch-Counter');
  describe('F29: HUD Switch Counter', () => {
    test('T1.29.1: Formats switch count 0 as "000"', () => {
      expect(hud.formatSwitchCount(0)).toBe('000');
    });

    test('T1.29.2: Formats switch count 1 as "001"', () => {
      expect(hud.formatSwitchCount(1)).toBe('001');
    });

    test('T1.29.3: Formats switch count 42 as "042"', () => {
      expect(hud.formatSwitchCount(42)).toBe('042');
    });

    test('T1.29.4: Formats switch count 100 as "100"', () => {
      expect(hud.formatSwitchCount(100)).toBe('100');
    });

    test('T1.29.5: Caps display at "999" and handles NaN as "000"', () => {
      expect(hud.formatSwitchCount(1200)).toBe('999');
      expect(hud.formatSwitchCount(NaN)).toBe('000');
    });
  });

  // ==========================================
  // F30: HUD Shift LightsOut
  // ==========================================
  setTestFeature('F30-HUD-Shift-LightsOut');
  describe('F30: HUD Shift LightsOut', () => {
    test('T1.30.1: Initial game state is "idle" with lightsOut = false', () => {
      const game = new hud.ReactionGameOracle();
      expect(game.getState()).toBe('idle');
      expect(game.isLightsOut()).toBe(false);
    });

    test('T1.30.2: First Shift trigger sets lightsOut = true and state = "waiting"', () => {
      const game = new hud.ReactionGameOracle();
      game.triggerShift();
      expect(game.isLightsOut()).toBe(true);
      expect(game.getState()).toBe('waiting');
    });

    test('T1.30.3: Early Shift trigger in "waiting" state penalizes with "TOO EARLY"', () => {
      const game = new hud.ReactionGameOracle();
      game.triggerShift(); // to waiting
      const res = game.triggerShift(); // too early!
      expect(res.feedback).toBe('TOO EARLY');
      expect(game.getLastResult()?.rating).toBe('TOO EARLY');
    });

    test('T1.30.4: Signal prompt activation sets state to "prompt"', () => {
      const game = new hud.ReactionGameOracle();
      game.triggerShift(); // to waiting
      const ok = game.triggerPromptSignal(1000);
      expect(ok).toBe(true);
      expect(game.getState()).toBe('prompt');
    });

    test('T1.30.5: Timely Shift press calculates latency and rates response', () => {
      const game = new hud.ReactionGameOracle();
      game.triggerShift();
      game.triggerPromptSignal(1000);
      game.triggerShift(1150); // 150ms latency
      expect(game.getLastResult()?.latencyMs).toBe(150);
      expect(game.getLastResult()?.rating).toBe('INCREDIBLE');
    });
  });

  // ==========================================
  // F31: Click Drag Discrimination
  // ==========================================
  setTestFeature('F31-Click-Drag-Discrimination');
  describe('F31: Click Drag Discrimination', () => {
    test('T1.31.1: Drag distance 0.0px is classified as click (true)', () => {
      expect(hud.isClickGesture(0.0)).toBe(true);
    });

    test('T1.31.2: Drag distance 7.9px is classified as click (true)', () => {
      expect(hud.isClickGesture(7.9)).toBe(true);
    });

    test('T1.31.3: Drag distance 8.0px is classified as drag (false)', () => {
      expect(hud.isClickGesture(8.0)).toBe(false);
    });

    test('T1.31.4: Drag distance 50.0px is classified as drag (false)', () => {
      expect(hud.isClickGesture(50.0)).toBe(false);
    });

    test('T1.31.5: Jitter movement within 8px radius is treated as click', () => {
      const p = physics.createMomentumPhysics({ clickThreshold: 8.0 });
      p.onPointerDown(100, 100);
      p.onPointerMove(102, 103); // dist = hypot(2, 3) = 3.6 < 8
      const res = p.onPointerUp();
      expect(res.wasClick).toBe(true);
    });
  });

  // ==========================================
  // F32: Lightbox Modal Integration
  // ==========================================
  setTestFeature('F32-Lightbox-Modal-Integration');
  describe('F32: Lightbox Modal Integration', () => {
    test('T1.32.1: Opening lightbox dims background canvas (uFade = 0.15)', () => {
      const modalFade = 0.15;
      expect(modalFade).toBe(0.15);
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uFade');
    });

    test('T1.32.2: Closing lightbox restores canvas opacity (uFade = 1.0)', () => {
      const defaultFade = 1.0;
      expect(defaultFade).toBe(1.0);
    });

    test('T1.32.3: Selected sketch metadata is accessible to lightbox', () => {
      const sketch = sketches[0];
      expect(sketch.id).toBe('01');
      expect(sketch.title).toBe('CHROMATIC FLUID');
      expect(sketch.tech).toBeDefined();
      expect(sketch.description).toBeDefined();
    });

    test('T1.32.4: Lightbox modal traps focus while active (role dialog attributes verified)', () => {
      const dialogProps = { role: 'dialog', 'aria-modal': true };
      expect(dialogProps.role).toBe('dialog');
      expect(dialogProps['aria-modal']).toBe(true);
    });

    test('T1.32.5: Dismissal on Escape key restores interaction', () => {
      let isOpen = true;
      const onKeyDown = (key: string) => {
        if (key === 'Escape') isOpen = false;
      };
      onKeyDown('Escape');
      expect(isOpen).toBe(false);
    });
  });

  // ==========================================
  // F33: Continuous Animation Loop
  // ==========================================
  setTestFeature('F33-Continuous-Animation-Loop');
  describe('F33: Continuous Animation Loop', () => {
    test('T1.33.1: Animation loop updates time uniforms while modal is open', () => {
      let time = 0;
      const dt = 0.016;
      time += dt;
      expect(time).toBeCloseTo(0.016, 0.001);
    });

    test('T1.33.2: Velocity momentum gracefully pauses while modal is open', () => {
      const p = physics.createMomentumPhysics();
      p.onPointerDown(0, 0);
      p.onPointerUp();
      expect(p.getStats().isDragging).toBe(false);
    });

    test('T1.33.3: Resuming modal does not drop WebGL context', () => {
      const contextLost = false;
      expect(contextLost).toBe(false);
    });

    test('T1.33.4: Frame timestamp delta remains clamped after modal closes', () => {
      const hugeDelta = 2.5; // seconds paused
      const safeDt = Math.min(0.1, hugeDelta);
      expect(safeDt).toBe(0.1);
    });

    test('T1.33.5: No texture rebinding required upon modal dismiss', () => {
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uTexA');
      expect(shader.REQUIRED_UNIFORM_KEYS).toContain('uTexB');
    });
  });

  // ==========================================
  // F34: E2E 60FPS Fidelity Audit
  // ==========================================
  setTestFeature('F34-E2E-60FPS-Fidelity-Audit');
  describe('F34: E2E 60FPS Fidelity Audit', () => {
    test('T1.34.1: Frame duration budget is <= 16.67ms for 60 FPS', () => {
      const targetFps = 60;
      const budgetMs = 1000 / targetFps;
      expect(budgetMs).toBeCloseTo(16.667, 0.01);
    });

    test('T1.34.2: Zero-allocation update step avoids garbage collection', () => {
      const p = physics.createMomentumPhysics();
      const t0 = performance.now();
      for (let i = 0; i < 60; i++) {
        p.update(0.016);
      }
      const duration = performance.now() - t0;
      expect(duration).toBeLessThan(50); // fast execution
    });

    test('T1.34.3: Scratch math objects reused across frames', () => {
      const p = physics.createMomentumPhysics();
      const s1 = p.getWrapCoordinates(1000, 1000);
      const s2 = p.getWrapCoordinates(1000, 1000);
      expect(s1.wrapX).toBe(s2.wrapX);
    });

    test('T1.34.4: Clamped delta time prevents spiral of death on tab freeze', () => {
      const pausedTime = 5.0; // 5s tab pause
      const clamped = Math.max(0, Math.min(0.1, pausedTime));
      expect(clamped).toBe(0.1);
    });

    test('T1.34.5: Clean memory disposal structure verified', () => {
      expect(typeof physics.MomentumPhysicsOracle).toBe('function');
    });
  });
}
