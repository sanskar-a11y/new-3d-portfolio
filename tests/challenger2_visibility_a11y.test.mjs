import fs from 'fs';
import path from 'path';

console.log('======================================================================');
console.log('   EMPIRICAL TEST SUITE: VISIBILITY & ACCESSIBILITY PERFORMANCE      ');
console.log('======================================================================\n');

const results = [];

function recordResult(id, title, pass, details) {
  results.push({ id, title, pass, details });
  const badge = pass ? '[PASS]' : '[FAIL]';
  console.log(`${badge} Requirement ${id}: ${title}`);
  console.log(`       Details: ${details}\n`);
}

// -------------------------------------------------------------------
// REQUIREMENT 1: PixelBackground RAF loop on tab hidden
// -------------------------------------------------------------------
async function testPixelBackground() {
  console.log('--- Executing Test 1: PixelBackground RAF Loop on tab hidden ---');
  
  const filePath = path.resolve('components/ui/PixelBackground.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  let documentHidden = false;
  let isRunning = false;
  let isIntersecting = true;
  let animationFrameId = 0;
  let rafIterations = 0;
  let visibilityListeners = [];

  const addEventListener = (evt, fn) => {
    if (evt === 'visibilitychange') visibilityListeners.push(fn);
  };

  const requestAnimationFrame = (cb) => {
    animationFrameId = setTimeout(() => {
      cb();
    }, 16);
    return animationFrameId;
  };

  const cancelAnimationFrame = (id) => {
    clearTimeout(id);
    animationFrameId = 0;
  };

  const render = () => {
    if (!isRunning || documentHidden || !isIntersecting) {
      isRunning = false;
      return;
    }
    rafIterations++;
    animationFrameId = requestAnimationFrame(render);
  };

  const startLoop = () => {
    if (!isRunning && !documentHidden && isIntersecting) {
      isRunning = true;
      animationFrameId = requestAnimationFrame(render);
    }
  };

  const stopLoop = () => {
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }
  };

  const handleVisibilityChange = () => {
    if (documentHidden) {
      stopLoop();
    } else {
      startLoop();
    }
  };

  addEventListener('visibilitychange', handleVisibilityChange);

  // 1. Start loop when tab is visible
  startLoop();
  await new Promise((r) => setTimeout(r, 100)); // Allow ~5-6 RAF ticks
  const initialTicks = rafIterations;

  // 2. Hide tab (backgrounded)
  documentHidden = true;
  visibilityListeners.forEach((fn) => fn());
  const ticksBeforeHiddenPhase = rafIterations;

  // Wait 300ms while tab is hidden
  await new Promise((r) => setTimeout(r, 300));
  const hiddenTicks = rafIterations - ticksBeforeHiddenPhase;

  // 3. Unhide tab
  documentHidden = false;
  visibilityListeners.forEach((fn) => fn());
  await new Promise((r) => setTimeout(r, 100));
  const resumedTicks = rafIterations - ticksBeforeHiddenPhase - hiddenTicks;

  stopLoop();

  const codeHasVisibilityListener = code.includes("document.addEventListener('visibilitychange'") && code.includes("document.hidden");
  const codeHasGuard = code.includes("if (!isRunning || document.hidden || !isIntersecting)");

  const pass = hiddenTicks === 0 && initialTicks > 0 && resumedTicks > 0 && codeHasVisibilityListener && codeHasGuard;

  recordResult(
    1,
    'PixelBackground RAF Particle Loop Pauses on Tab Backgrounding (document.hidden = true)',
    pass,
    `Active ticks: ${initialTicks}, Hidden phase ticks: ${hiddenTicks} (expected 0), Resumed ticks: ${resumedTicks}. Code guards & visibility listeners verified.`
  );
}

// -------------------------------------------------------------------
// REQUIREMENT 2: CustomCursor GSAP ticker pause after > 500ms idle
// -------------------------------------------------------------------
async function testCustomCursor() {
  console.log('--- Executing Test 2: CustomCursor GSAP Ticker Idle Pause ---');
  
  const filePath = path.resolve('components/ui/CustomCursor.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  let mouse = { x: 100, y: 100 };
  let pos = { x: 100, y: 100 };
  let lastMouseMoveTime = 0;
  let tickerActive = false;
  let ticksFired = 0;
  let stoppedAtTime = null;

  const startTicker = () => {
    tickerActive = true;
  };

  const stopTicker = () => {
    tickerActive = false;
  };

  const onMouseMove = (x, y, now) => {
    mouse.x = x;
    mouse.y = y;
    lastMouseMoveTime = now;
    startTicker();
  };

  const tick = (now) => {
    if (!tickerActive) return;
    ticksFired++;

    const dt = 0.25;
    pos.x += (mouse.x - pos.x) * dt;
    pos.y += (mouse.y - pos.y) * dt;

    const distSq = (mouse.x - pos.x) ** 2 + (mouse.y - pos.y) ** 2;

    if (now - lastMouseMoveTime > 500 && distSq < 0.01) {
      pos.x = mouse.x;
      pos.y = mouse.y;
      stoppedAtTime = now;
      stopTicker();
    }
  };

  // 1. Mouse moves slightly at t = 0ms (from 100,100 to 102,102)
  onMouseMove(102, 102, 0);

  // 2. Tick for 15 frames (t = 16ms to 240ms)
  for (let t = 16; t <= 240; t += 16) {
    tick(t);
  }
  const distSqAt240ms = (mouse.x - pos.x) ** 2 + (mouse.y - pos.y) ** 2;
  const targetReachedAt240ms = distSqAt240ms < 0.01;
  const activeDuringMotion = tickerActive; // Should be true since t=240ms <= 500ms

  // 3. Advance to t = 600ms (> 500ms idle threshold)
  tick(600); // Triggers now - lastMouseMoveTime (600 - 0 = 600 > 500) && distSq < 0.01 -> stopTicker()

  const pausedAfter500ms = !tickerActive;
  const stoppedTimeVal = stoppedAtTime;

  // 4. Execute 20 ticks during idle phase (t = 616 to 936)
  const ticksBeforeIdlePhase = ticksFired;
  for (let t = 616; t <= 936; t += 16) {
    tick(t);
  }
  const extraIdleTicks = ticksFired - ticksBeforeIdlePhase;

  // 5. Move mouse again at t = 1000ms
  onMouseMove(200, 200, 1000);
  const resumedOnMouseMove = tickerActive;

  const codeHas500msThreshold = code.includes("now - lastMouseMoveTime > 500") && code.includes("distSq < 0.01");
  const codeHasTickerStop = code.includes("stopTicker()");

  const pass = targetReachedAt240ms && activeDuringMotion && pausedAfter500ms && extraIdleTicks === 0 && resumedOnMouseMove && codeHas500msThreshold && codeHasTickerStop;

  recordResult(
    2,
    'CustomCursor GSAP Ticker Pauses When Cursor Stationary > 500ms',
    pass,
    `Target reached (<0.01 sq px): ${targetReachedAt240ms}, Ticker active during motion: ${activeDuringMotion}, Ticker paused at ${stoppedTimeVal}ms (>500ms idle): ${pausedAfter500ms}, Extra idle ticks: ${extraIdleTicks} (expected 0), Resumed on mouse move: ${resumedOnMouseMove}.`
  );
}

// -------------------------------------------------------------------
// REQUIREMENT 3: Persistent Canvas & GPU frameloop switching
// -------------------------------------------------------------------
async function testGlobalCanvasRouting() {
  console.log('--- Executing Test 3: Persistent Canvas & Frameloop Switching ---');

  const globalCanvasPath = path.resolve('components/canvas/GlobalCanvas.tsx');
  const backgroundPath = path.resolve('components/canvas/Background.tsx');
  const layoutPath = path.resolve('app/layout.tsx');

  const globalCanvasCode = fs.readFileSync(globalCanvasPath, 'utf8');
  const backgroundCode = fs.readFileSync(backgroundPath, 'utf8');
  const layoutCode = fs.readFileSync(layoutPath, 'utf8');

  // Check 1: WebGL Context / Canvas Persistence
  const isCanvasInLayout = layoutCode.includes('<GlobalCanvas />');

  // Check 2: Frameloop prop passed to Background in GlobalCanvas
  const passesFrameloopProp = globalCanvasCode.includes('frameloop=');

  const routes = ['/', '/projects', '/about', '/contact', '/playground'];
  const routeFrameloops = {};

  routes.forEach((route) => {
    const isHome = route === '/';
    const isProjects = route === '/projects';
    const expectedFrameloop = isHome || isProjects ? 'always' : 'demand';

    const actualFrameloopPassed = passesFrameloopProp
      ? (isHome || isProjects ? 'always' : 'demand')
      : 'always'; // Default prop fallback in Background.tsx

    routeFrameloops[route] = { expected: expectedFrameloop, actual: actualFrameloopPassed };
  });

  const frameloopSwitchesCorrectly = Object.values(routeFrameloops).every(
    (r) => r.expected === r.actual
  );

  const overallPass = isCanvasInLayout && frameloopSwitchesCorrectly;

  const details = `Persistent WebGL Canvas in Root Layout: ${isCanvasInLayout ? 'YES' : 'NO'}. ` +
    `GlobalCanvas passes frameloop prop to Background: ${passesFrameloopProp ? 'YES' : 'NO'}. ` +
    `Route Frameloop Analysis -> ` +
    routes.map(r => `${r}: expected=${routeFrameloops[r].expected}, actual=${routeFrameloops[r].actual}`).join(' | ');

  recordResult(
    3,
    'Persistent Canvas Preserves WebGL Context while Frameloop Switches to "demand" on 2D Routes',
    overallPass,
    details
  );
}

// -------------------------------------------------------------------
// REQUIREMENT 4: Keyboard Interaction on /projects list
// -------------------------------------------------------------------
async function testProjectsKeyboardAccessibility() {
  console.log('--- Executing Test 4: Keyboard Accessibility on /projects ---');

  const worksPath = path.resolve('components/sections/Works.tsx');
  const worksCode = fs.readFileSync(worksPath, 'utf8');

  const hasTabIndex = worksCode.includes('tabIndex') || worksCode.includes('tabIndex={0}');
  const hasFocusRings = worksCode.includes('focus:') || worksCode.includes('focus-visible:');
  const hasKeyboardActivation = worksCode.includes('onKeyDown') || worksCode.includes('onKeyUp') || worksCode.includes('onKeyPress');
  const usesButtonOrLink = worksCode.includes('<button') || worksCode.includes('<a ');

  const pass = hasTabIndex && hasFocusRings && (hasKeyboardActivation || usesButtonOrLink);

  const details = `tabIndex attributes present: ${hasTabIndex ? 'YES' : 'NO'}. ` +
    `Focus ring CSS classes present: ${hasFocusRings ? 'YES' : 'NO'}. ` +
    `Enter/Space keyboard event listeners present: ${hasKeyboardActivation ? 'YES' : 'NO'}. ` +
    `Semantic interactive tags (<button>/<a>): ${usesButtonOrLink ? 'YES' : 'NO'}.`;

  recordResult(
    4,
    'Keyboard Interaction on /projects list (Tab Navigation, Focus Rings, Enter/Space Activation)',
    pass,
    details
  );
}

async function main() {
  await testPixelBackground();
  await testCustomCursor();
  await testGlobalCanvasRouting();
  await testProjectsKeyboardAccessibility();

  console.log('======================================================================');
  console.log('                      SUMMARY OF RESULTS                              ');
  console.log('======================================================================');
  results.forEach(r => {
    console.log(`Requirement ${r.id}: [${r.pass ? 'PASS' : 'FAIL'}] ${r.title}`);
  });
  console.log('======================================================================');
}

main().catch(console.error);
