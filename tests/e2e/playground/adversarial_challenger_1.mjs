#!/usr/bin/env node
/**
 * Adversarial Stress Harness by Challenger 1
 * Targets:
 *  - Coordinate wrap bounds over 10,000,000 px continuous scroll
 *  - Extreme velocity flicks (>50,000 px/s) to ensure strict clamping at 100 px/frame without NaN or runaway values
 *  - Rapid multi-touch swipe and pointercancel events
 *  - Zero NaN/Infinity coordinates under 0px or negative viewports
 *  - Direct comparison of lib/playground implementation vs test oracles
 */

import * as mosaicImpl from '../../../lib/playground/mosaicLayout.ts';
import * as physicsImpl from '../../../lib/playground/momentumPhysics.ts';
import * as mosaicOracle from './oracles/mosaicOracle.ts';
import * as physicsOracle from './oracles/physicsOracle.ts';
import { SKETCH_CATALOG } from '../../../components/playground/sketches.ts';

console.log('\n====================================================================');
console.log('       CHALLENGER 1: EMPIRICAL ADVERSARIAL STRESS HARNESS          ');
console.log('====================================================================\n');

let passCount = 0;
let failCount = 0;
const defects = [];

function assert(condition, message, defectDetails = null) {
  if (condition) {
    console.log(`  \x1b[32m✓ [PASS]\x1b[0m ${message}`);
    passCount++;
  } else {
    console.log(`  \x1b[31m✕ [FAIL]\x1b[0m ${message}`);
    failCount++;
    if (defectDetails) {
      defects.push(defectDetails);
    }
  }
}

async function runAdversarialTests() {
  console.log('\x1b[36m--- Section 1: 10,000,000 px Continuous Scroll & Toroidal Wrap Bounds ---\x1b[0m');
  {
    const packSizes = [100, 300, 1400, 2560, 3840];
    let allBoundsValidImpl = true;
    let allBoundsValidOracle = true;
    let maxAbsWrapImpl = 0;
    let maxAbsWrapOracle = 0;

    // Test extreme positions up to 10,000,000 px in steps of 100,000 px
    for (const pack of packSizes) {
      const halfPack = pack / 2;
      for (let s = -10000000; s <= 10000000; s += 250000) {
        const wImpl = physicsImpl.computeToroidalWrap(s, pack);
        const wOracle = physicsOracle.computeToroidalWrap(s, pack);

        if (!Number.isFinite(wImpl) || Math.abs(wImpl) > halfPack + 0.0001) {
          allBoundsValidImpl = false;
        }
        if (!Number.isFinite(wOracle) || Math.abs(wOracle) > halfPack + 0.0001) {
          allBoundsValidOracle = false;
        }
        maxAbsWrapImpl = Math.max(maxAbsWrapImpl, Math.abs(wImpl) / halfPack);
        maxAbsWrapOracle = Math.max(maxAbsWrapOracle, Math.abs(wOracle) / halfPack);
      }
    }

    assert(
      allBoundsValidImpl,
      `computeToroidalWrap (Impl) stays strictly within [-pack/2, pack/2] across ±10M px (max ratio: ${maxAbsWrapImpl.toFixed(4)})`,
      { module: 'lib/playground/momentumPhysics.ts', issue: 'Toroidal wrap exceeded pack/2 bound on implementation' }
    );
    assert(
      allBoundsValidOracle,
      `computeToroidalWrap (Oracle) stays strictly within [-pack/2, pack/2] across ±10M px (max ratio: ${maxAbsWrapOracle.toFixed(4)})`
    );

    // Continuous 10M px physics loop simulation (10,000 frames at 1000 px/step)
    const pImpl = physicsImpl.createMomentumPhysics({ packWidth: 1400, packHeight: 900, autoDrift: false });
    let frameWrapOk = true;
    let maxScrollX = 0;

    for (let f = 0; f < 10000; f++) {
      pImpl.onPointerDown(0, 0, f * 16);
      pImpl.onPointerMove(1000, 500, f * 16 + 16);
      pImpl.onPointerUp();
      const state = pImpl.update(0.016);
      maxScrollX = Math.max(maxScrollX, Math.abs(state.scrollX));

      if (
        !Number.isFinite(state.wrapX) ||
        !Number.isFinite(state.wrapY) ||
        Math.abs(state.wrapX) > 700.001 ||
        Math.abs(state.wrapY) > 450.001
      ) {
        frameWrapOk = false;
        break;
      }
    }

    assert(
      frameWrapOk && maxScrollX > 5000000,
      `Continuous multi-frame scrolling accumulated ${Math.round(maxScrollX)} px with all wrap coordinates bounded in [-pack/2, pack/2]`,
      { module: 'lib/playground/momentumPhysics.ts', issue: 'Continuous multi-frame wrap coordinate out of bounds' }
    );
  }

  console.log('\n\x1b[36m--- Section 2: Extreme Velocity Flicks (>50,000 px/s) Clamping & Stability ---\x1b[0m');
  {
    const flickVelocities = [
      { dx: 50000, dy: 0, dtMs: 1000, label: '50,000 px/s pure horizontal' },
      { dx: 0, dy: 100000, dtMs: 1000, label: '100,000 px/s pure vertical' },
      { dx: 100000, dy: 100000, dtMs: 1000, label: '141,421 px/s diagonal' },
      { dx: 500000, dy: 500000, dtMs: 16, label: 'Superhuman flick: 500k px in 16ms (~31.25M px/s)' },
      { dx: -1000000, dy: -1000000, dtMs: 1, label: 'Instantaneous shock: -1M px in 1ms' },
      { dx: 10000, dy: 10000, dtMs: 0, label: 'Zero-duration move (dt = 0ms)' },
    ];

    let allClampedImpl = true;
    let zeroNaNImpl = true;
    let allClampedOracle = true;
    let maxRecordedVel = 0;

    for (const flick of flickVelocities) {
      const p = physicsImpl.createMomentumPhysics({ maxVelocity: 100, packWidth: 1000, packHeight: 1000 });
      p.onPointerDown(0, 0, 0);
      p.onPointerMove(flick.dx, flick.dy, flick.dtMs);
      p.onPointerUp();
      const state = p.update(0.016);

      if (Number.isNaN(state.velocity) || Number.isNaN(state.scrollX) || Number.isNaN(state.scrollY)) {
        zeroNaNImpl = false;
      }
      if (state.velocity > 100.001) {
        allClampedImpl = false;
      }
      maxRecordedVel = Math.max(maxRecordedVel, state.velocity);

      // Also verify zoom stays bounded [0.85, 1.0]
      if (state.zoom < 0.849 || state.zoom > 1.001 || Number.isNaN(state.zoom)) {
        zeroNaNImpl = false;
      }
    }

    assert(
      allClampedImpl,
      `All extreme flick velocities clamped strictly <= 100 px/frame (max observed: ${maxRecordedVel.toFixed(2)})`,
      { module: 'lib/playground/momentumPhysics.ts', issue: 'Flick velocity exceeded 100 px/frame clamp' }
    );
    assert(
      zeroNaNImpl,
      'No NaN or runaway values during extreme flick shock injection',
      { module: 'lib/playground/momentumPhysics.ts', issue: 'NaN detected during extreme flick shock injection' }
    );

    // Momentum decay after superhuman flick (50 frames)
    const pDecay = physicsImpl.createMomentumPhysics({ maxVelocity: 100 });
    pDecay.onPointerDown(0, 0, 0);
    pDecay.onPointerMove(200000, 200000, 16);
    pDecay.onPointerUp();

    let runawayDetected = false;
    for (let f = 0; f < 100; f++) {
      const st = pDecay.update(0.016);
      if (!Number.isFinite(st.scrollX) || !Number.isFinite(st.velocity) || st.velocity > 100.001) {
        runawayDetected = true;
        break;
      }
    }
    assert(
      !runawayDetected,
      'Post-flick momentum decay converges smoothly without velocity runaway or coordinate explosion',
      { module: 'lib/playground/momentumPhysics.ts', issue: 'Post-flick momentum velocity runaway detected' }
    );
  }

  console.log('\n\x1b[36m--- Section 3: Rapid Multi-Touch Swipe & Pointercancel Robustness ---\x1b[0m');
  {
    // Test 3.1: Pointercancel event behavior
    const pCancel = physicsImpl.createMomentumPhysics();
    pCancel.onPointerDown(100, 100);
    pCancel.onPointerMove(300, 200);
    assert(pCancel.getStats().isDragging === true, 'Controller enters dragging state on pointerdown');

    pCancel.onPointerCancel();
    const afterCancel = pCancel.getStats();
    assert(
      afterCancel.isDragging === false,
      'onPointerCancel immediately resets isDragging to false',
      { module: 'lib/playground/momentumPhysics.ts', issue: 'isDragging was not reset on pointercancel' }
    );

    // After pointercancel, next update should not apply momentum flick
    const postCancelUpdate = pCancel.update(0.016);
    assert(
      postCancelUpdate.isDragging === false && postCancelUpdate.velocity < 5.0,
      `onPointerCancel clears drag velocity (velocity: ${postCancelUpdate.velocity.toFixed(3)})`,
      { module: 'lib/playground/momentumPhysics.ts', issue: 'Velocity not cleared after pointercancel' }
    );

    // Test 3.2: Rapid multi-touch alternating simulation
    // Simulates two fingers touching simultaneously and alternating moves
    const pMulti = physicsImpl.createMomentumPhysics({ isTouch: true });
    pMulti.onPointerDown(100, 100, 0);
    let multiTouchNaN = false;
    let maxMultiVel = 0;

    for (let i = 0; i < 50; i++) {
      // Finger 1 moves
      pMulti.onPointerMove(100 + i * 5, 100 + i * 2, i * 20);
      // Secondary touch disturbance at completely different coordinate
      pMulti.onPointerMove(400 - i * 3, 300 - i * 4, i * 20 + 5);
      const st = pMulti.update(0.016);
      maxMultiVel = Math.max(maxMultiVel, st.velocity);
      if (Number.isNaN(st.velocity) || Number.isNaN(st.scrollX)) {
        multiTouchNaN = true;
      }
    }
    pMulti.onPointerUp();
    pMulti.onPointerCancel();

    assert(!multiTouchNaN, 'Rapid multi-touch interleaved moves produce zero NaN values');
    assert(
      maxMultiVel <= 100.001,
      `Rapid multi-touch jump velocity remains clamped <= 100 px/frame (max: ${maxMultiVel.toFixed(2)})`
    );

    // Test 3.3: Back-to-back pointercancel spamming
    let spamCrashed = false;
    try {
      for (let i = 0; i < 100; i++) {
        pCancel.onPointerCancel();
      }
    } catch {
      spamCrashed = true;
    }
    assert(!spamCrashed, 'Spamming onPointerCancel 100 times does not throw or crash');
  }

  console.log('\n\x1b[36m--- Section 4: Non-Positive & Degenerate Viewport Dimensions (0px, Negative, NaN, Infinity) ---\x1b[0m');
  {
    const degenerateViewports = [
      { w: 0, h: 0, desc: '0x0 viewport' },
      { w: -1920, h: -1080, desc: 'Negative (-1920x-1080) viewport' },
      { w: -1, h: 800, desc: 'Negative width (-1x800) viewport' },
      { w: 1000, h: -500, desc: 'Negative height (1000x-500) viewport' },
      { w: NaN, h: 800, desc: 'NaN width (NaNx800) viewport' },
      { w: 1200, h: NaN, desc: 'NaN height (1200xNaN) viewport' },
      { w: Infinity, h: 900, desc: 'Infinity width (Infinityx900) viewport' },
      { w: 1200, h: -Infinity, desc: '-Infinity height (1200x-Infinity) viewport' },
      { w: 0.0001, h: 0.0001, desc: 'Sub-pixel micro-viewport (0.0001x0.0001)' },
    ];

    let allLayoutsSafe = true;
    let allCellsFinite = true;

    for (const vp of degenerateViewports) {
      const layout = mosaicImpl.generateMosaicLayout(vp.w, vp.h, SKETCH_CATALOG);

      if (
        !Number.isFinite(layout.packWidth) ||
        !Number.isFinite(layout.packHeight) ||
        layout.packWidth <= 0 ||
        layout.packHeight <= 0 ||
        !Array.isArray(layout.cells) ||
        layout.cells.length === 0
      ) {
        allLayoutsSafe = false;
        console.log(`    Layout failed on ${vp.desc}: packW=${layout.packWidth}, packH=${layout.packHeight}, cells=${layout.cells?.length}`);
      }

      for (const c of layout.cells) {
        if (
          !Number.isFinite(c.x) ||
          !Number.isFinite(c.y) ||
          !Number.isFinite(c.width) ||
          !Number.isFinite(c.height) ||
          !Number.isFinite(c.aspectRatio) ||
          !Number.isFinite(c.uRepeat[0]) ||
          !Number.isFinite(c.uRepeat[1]) ||
          !Number.isFinite(c.uOffset[0]) ||
          !Number.isFinite(c.uOffset[1]) ||
          c.width <= 0 ||
          c.height <= 0
        ) {
          allCellsFinite = false;
          console.log(`    Invalid cell on ${vp.desc}:`, c);
          break;
        }
      }
    }

    assert(
      allLayoutsSafe,
      'generateMosaicLayout safely handles all degenerate (0px, negative, NaN, Infinity) viewports with positive finite pack sizes',
      { module: 'lib/playground/mosaicLayout.ts', issue: 'generateMosaicLayout produced invalid pack sizes for degenerate viewports' }
    );
    assert(
      allCellsFinite,
      'All mosaic cells generated under degenerate viewports contain strictly finite positive dimensions and valid UV mappings',
      { module: 'lib/playground/mosaicLayout.ts', issue: 'Degenerate viewport generated NaN/infinite cell properties' }
    );

    // Also test splitMosaic directly with 0 and negative values
    const splitZero = mosaicImpl.splitMosaic(0, 0, 0, 0);
    const splitNeg = mosaicImpl.splitMosaic(0, 0, -100, -100);
    const splitNaN = mosaicImpl.splitMosaic(0, 0, NaN, Infinity);
    assert(
      Array.isArray(splitZero) && splitZero.length === 0,
      'splitMosaic(0, 0, 0, 0) safely returns empty array without recursion'
    );
    assert(
      Array.isArray(splitNeg) && splitNeg.length === 0,
      'splitMosaic with negative bounds safely returns empty array'
    );
    assert(
      Array.isArray(splitNaN) && splitNaN.length === 0,
      'splitMosaic with NaN/Infinity bounds safely returns empty array'
    );

    // Test generateMobileMosaic directly with degenerate values
    const mobileZero = mosaicImpl.generateMobileMosaic(0, 0);
    const mobileNeg = mosaicImpl.generateMobileMosaic(-500, -500);
    assert(
      Array.isArray(mobileZero) && mobileZero.length === 0,
      'generateMobileMosaic(0, 0) safely returns empty array'
    );
    assert(
      Array.isArray(mobileNeg) && mobileNeg.length === 0,
      'generateMobileMosaic(-500, -500) safely returns empty array'
    );

    // Test computeCoverUv directly with degenerate values
    const uvZero = mosaicImpl.computeCoverUv(0, 0, 0, 0);
    const uvNeg = mosaicImpl.computeCoverUv(-100, 100, 100, -100);
    const uvNaN = mosaicImpl.computeCoverUv(NaN, 100, 100, Infinity);
    assert(
      uvZero.uRepeat[0] === 1 && uvZero.uRepeat[1] === 1,
      'computeCoverUv(0, 0, 0, 0) falls back safely to identity UV [1, 1]'
    );
    assert(
      uvNeg.uRepeat[0] === 1 && uvNeg.uRepeat[1] === 1,
      'computeCoverUv with negative dimensions falls back safely to identity UV [1, 1]'
    );
    assert(
      uvNaN.uRepeat[0] === 1 && uvNaN.uRepeat[1] === 1,
      'computeCoverUv with NaN/Infinity dimensions falls back safely to identity UV [1, 1]'
    );
  }

  console.log('\n\x1b[36m--- Section 5: Deep Forensic Audit of Implementation Edge Cases ---\x1b[0m');
  {
    // Test 5.1: update(NaN) on MomentumPhysicsController
    const pNan = physicsImpl.createMomentumPhysics();
    pNan.onPointerDown(0, 0);
    pNan.onPointerMove(20, 20);
    pNan.onPointerUp();
    pNan.update(NaN);
    const nextAfterNan = pNan.update(0.016);

    const isNextFinite =
      Number.isFinite(nextAfterNan.scrollX) &&
      Number.isFinite(nextAfterNan.scrollY) &&
      Number.isFinite(nextAfterNan.targetX) &&
      Number.isFinite(nextAfterNan.targetY) &&
      Number.isFinite(nextAfterNan.velocity) &&
      Number.isFinite(nextAfterNan.zoom);

    assert(
      isNextFinite,
      'Controller recovers gracefully from update(NaN) without permanently corrupting state to NaN',
      {
        module: 'lib/playground/momentumPhysics.ts',
        issue: 'update(NaN) permanently corrupts all controller state (scrollX, scrollY, targetX, targetY, velocity, zoom) to NaN',
        severity: 'HIGH'
      }
    );

    // Test 5.2: onWheel(NaN, Infinity) on MomentumPhysicsController
    const pWheelNan = physicsImpl.createMomentumPhysics();
    pWheelNan.onWheel(NaN, Infinity);
    const wheelState = pWheelNan.update(0.016);
    const isWheelFinite =
      Number.isFinite(wheelState.scrollX) &&
      Number.isFinite(wheelState.scrollY) &&
      Number.isFinite(wheelState.targetX) &&
      Number.isFinite(wheelState.targetY) &&
      Number.isFinite(wheelState.velocity);

    assert(
      isWheelFinite,
      'Controller sanitizes onWheel(NaN, Infinity) without corrupting target coordinates to NaN',
      {
        module: 'lib/playground/momentumPhysics.ts',
        issue: 'onWheel(NaN, Infinity) does not sanitize input deltas, causing permanent targetX/targetY NaN corruption',
        severity: 'MEDIUM'
      }
    );

    // Test 5.3: setDimensions with non-positive values
    const pDims = physicsImpl.createMomentumPhysics();
    pDims.setDimensions(0, -500);
    const dimWrap = pDims.getWrapCoordinates();
    assert(
      pDims.options.packWidth >= 10 && pDims.options.packHeight >= 10,
      'setDimensions(0, -500) clamps packWidth/Height to >= 10px minimum',
      {
        module: 'lib/playground/momentumPhysics.ts',
        issue: 'setDimensions allowed non-positive pack dimensions',
        severity: 'LOW'
      }
    );
  }

  console.log('\n====================================================================');
  console.log(`EXECUTION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('====================================================================\n');

  if (defects.length > 0) {
    console.log('\x1b[31mDefects Detected by Adversarial Harness:\x1b[0m');
    for (const [idx, d] of defects.entries()) {
      console.log(`  ${idx + 1}. [${d.severity || 'HIGH'}] [${d.module}] ${d.issue}`);
    }
  }

  return { passCount, failCount, defects };
}

runAdversarialTests().then(res => {
  process.exit(res.failCount > 0 ? 1 : 0);
}).catch(err => {
  console.error('Fatal test error:', err);
  process.exit(2);
});
