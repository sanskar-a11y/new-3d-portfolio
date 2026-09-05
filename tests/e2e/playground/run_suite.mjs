#!/usr/bin/env node
/**
 * Master E2E Test Suite Runner: WebGL Playground
 * Self-contained, zero-dependency, automated test runner covering Tiers 1-5.
 *
 * Usage:
 *   node tests/e2e/playground/run_suite.mjs
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Auto-delegation wrapper: If not running with --experimental-strip-types, re-spawn
if (!process.execArgv.some(arg => arg.includes('strip-types'))) {
  const currentFilePath = fileURLToPath(import.meta.url);
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--no-warnings', currentFilePath, ...process.argv.slice(2)],
    {
      stdio: 'inherit',
      env: process.env,
    }
  );
  process.exit(result.status ?? 0);
}

// Strip-types is active; import TS test modules directly
import { registry } from './harness.ts';
import { runTier1Tests } from './tier1_features.test.ts';
import { runTier2Tests } from './tier2_boundary.test.ts';
import { runTier3Tests } from './tier3_pairwise.test.ts';
import { runTier4Tests } from './tier4_realworld.test.ts';
import { runTier5Tests } from './tier5_adversarial.test.ts';

async function main() {
  console.log('\n\x1b[1m\x1b[36m====================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m   INTERACTIVE WEBGL PLAYGROUND — E2E TEST SUITE (TIERS 1-5)        \x1b[0m');
  console.log('\x1b[1m\x1b[36m====================================================================\x1b[0m\n');

  registry.clear();
  registry.startSuiteTimer();

  console.log('\x1b[34m[1/5] Executing Tier 1: Feature Coverage (34 Features × 5 Tests)...\x1b[0m');
  await runTier1Tests();

  console.log('\x1b[34m[2/5] Executing Tier 2: Boundary & Corner Cases (34 Features × 5 Tests)...\x1b[0m');
  await runTier2Tests();

  console.log('\x1b[34m[3/5] Executing Tier 3: Cross-Feature Pairwise Interactions (35 Tests)...\x1b[0m');
  await runTier3Tests();

  console.log('\x1b[34m[4/5] Executing Tier 4: Real-World Workload Scenarios (8 Scenarios)...\x1b[0m');
  await runTier4Tests();

  console.log('\x1b[34m[5/5] Executing Tier 5: Adversarial Stress & Frame Budget (10 Tests)...\x1b[0m');
  await runTier5Tests();

  const summary = registry.getSummary();

  console.log('\n\x1b[1m\x1b[32m====================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[32m                         TEST EXECUTION SUMMARY                     \x1b[0m');
  console.log('\x1b[1m\x1b[32m====================================================================\x1b[0m\n');

  console.log('  \x1b[1mTier Breakdown:\x1b[0m');
  const tierNames = {
    1: 'Tier 1: Feature Coverage in Isolation',
    2: 'Tier 2: Boundary Value Analysis & Corner Cases',
    3: 'Tier 3: Pairwise Cross-Feature Interactions',
    4: 'Tier 4: Real-World Workload Scenarios',
    5: 'Tier 5: Adversarial Stress & Verification',
  };

  for (const [tier, counts] of Object.entries(summary.tierCounts)) {
    const name = tierNames[Number(tier)] || `Tier ${tier}`;
    const statusColor = counts.failed === 0 ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✕\x1b[0m';
    console.log(`    ${statusColor} ${name.padEnd(50)} : \x1b[1m${counts.passed} / ${counts.total} passed\x1b[0m`);
  }

  console.log('\n  \x1b[1mTotal Execution Metrics:\x1b[0m');
  console.log(`    Total Tests  : \x1b[1m${summary.total}\x1b[0m`);
  console.log(`    Passed       : \x1b[32m\x1b[1m${summary.passed}\x1b[0m`);
  console.log(`    Failed       : ${summary.failed === 0 ? '\x1b[32m0\x1b[0m' : `\x1b[31m\x1b[1m${summary.failed}\x1b[0m`}`);
  console.log(`    Duration     : \x1b[33m${summary.durationMs.toFixed(2)} ms\x1b[0m`);
  console.log(`    Pass Rate    : \x1b[1m${((summary.passed / summary.total) * 100).toFixed(1)}%\x1b[0m\n`);

  if (summary.failed === 0) {
    console.log('\x1b[1m\x1b[42m\x1b[30m  ALL 393 PLAYGROUND E2E TESTS PASSED SUCCESSFULLY (EXIT 0)  \x1b[0m\n');
    process.exit(0);
  } else {
    console.error(`\x1b[1m\x1b[41m\x1b[37m  ${summary.failed} TEST(S) FAILED (EXIT 1)  \x1b[0m\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\x1b[31mFatal test runner error:\x1b[0m', err);
  process.exit(1);
});
