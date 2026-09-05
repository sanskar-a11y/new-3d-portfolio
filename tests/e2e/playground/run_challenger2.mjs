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
import { runChallenger2Tests } from './challenger2_adversarial.ts';

async function main() {
  console.log('\n\x1b[1m\x1b[35m====================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m       CHALLENGER 2: ADVERSARIAL STRESS & EMPIRICAL VERIFICATION    \x1b[0m');
  console.log('\x1b[1m\x1b[35m====================================================================\x1b[0m\n');

  registry.clear();
  registry.startSuiteTimer();

  await runChallenger2Tests();

  const summary = registry.getSummary();

  console.log('\n\x1b[1m\x1b[32m====================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[32m                 CHALLENGER 2 TEST EXECUTION SUMMARY                \x1b[0m');
  console.log('\x1b[1m\x1b[32m====================================================================\x1b[0m\n');

  for (const [feat, counts] of Object.entries(summary.featureCounts)) {
    const statusColor = counts.failed === 0 ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✕\x1b[0m';
    console.log(`    ${statusColor} ${feat.padEnd(45)} : \x1b[1m${counts.passed} / ${counts.total} passed\x1b[0m`);
  }

  console.log('\n  \x1b[1mTotal Execution Metrics:\x1b[0m');
  console.log(`    Total Tests  : \x1b[1m${summary.total}\x1b[0m`);
  console.log(`    Passed       : \x1b[32m\x1b[1m${summary.passed}\x1b[0m`);
  console.log(`    Failed       : ${summary.failed === 0 ? '\x1b[32m0\x1b[0m' : `\x1b[31m\x1b[1m${summary.failed}\x1b[0m`}`);
  console.log(`    Duration     : \x1b[33m${summary.durationMs.toFixed(2)} ms\x1b[0m`);
  console.log(`    Pass Rate    : \x1b[1m${((summary.passed / summary.total) * 100).toFixed(1)}%\x1b[0m\n`);

  if (summary.failed === 0) {
    console.log('\x1b[1m\x1b[42m\x1b[30m  ALL CHALLENGER 2 ADVERSARIAL TESTS PASSED (EXIT 0)  \x1b[0m\n');
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
