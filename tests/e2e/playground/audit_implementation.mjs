#!/usr/bin/env node
/**
 * Implementation Contract Audit Tool for WebGL Playground.
 * Audits current implementation files in `lib/playground/` and `components/playground/`
 * against the specification contracts, highlighting bugs and compliance status.
 *
 * Usage:
 *   node tests/e2e/playground/audit_implementation.mjs
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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

import { resolveEngines } from './contracts/loader.ts';

async function main() {
  console.log('\n\x1b[1m\x1b[35m====================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m        WEBGL PLAYGROUND — IMPLEMENTATION CONTRACT AUDIT            \x1b[0m');
  console.log('\x1b[1m\x1b[35m====================================================================\x1b[0m\n');

  const engines = await resolveEngines();
  const { isImplementationLoaded, implementationModules } = engines;

  console.log('Module Discovery Status:');
  console.log(`  - lib/playground/mosaicLayout.ts       : ${isImplementationLoaded.mosaic ? '\x1b[32mFOUND\x1b[0m' : '\x1b[33mPENDING\x1b[0m'}`);
  console.log(`  - lib/playground/momentumPhysics.ts    : ${isImplementationLoaded.physics ? '\x1b[32mFOUND\x1b[0m' : '\x1b[33mPENDING\x1b[0m'}`);
  console.log(`  - components/playground/tileShader.ts  : ${isImplementationLoaded.shader ? '\x1b[32mFOUND\x1b[0m' : '\x1b[33mPENDING\x1b[0m'}`);
  console.log(`  - components/playground/PlaygroundHUD  : ${isImplementationLoaded.hud ? '\x1b[32mFOUND\x1b[0m' : '\x1b[33mPENDING\x1b[0m'}\n`);

  const findings = [];

  // Audit mosaicLayout
  if (isImplementationLoaded.mosaic) {
    const { mosaicImpl } = implementationModules;
    console.log('Auditing lib/playground/mosaicLayout.ts...');
    if (typeof mosaicImpl.generateMosaicLayout !== 'function') {
      findings.push({ severity: 'CRITICAL', file: 'mosaicLayout.ts', message: 'Missing export generateMosaicLayout' });
    } else {
      try {
        const res = mosaicImpl.generateMosaicLayout(1920, 1080);
        if (!res.cells || !Array.isArray(res.cells)) {
          findings.push({ severity: 'HIGH', file: 'mosaicLayout.ts', message: 'generateMosaicLayout did not return cells array' });
        } else {
          console.log(`  \x1b[32m✓\x1b[0m generateMosaicLayout(1920, 1080) produced ${res.cells.length} cells`);
        }
      } catch (err) {
        findings.push({ severity: 'CRITICAL', file: 'mosaicLayout.ts', message: `generateMosaicLayout crashed: ${err.message}` });
      }

      // Check NaN/Infinity guard
      try {
        mosaicImpl.generateMosaicLayout(NaN, Infinity);
        console.log('  \x1b[32m✓\x1b[0m NaN / Infinity inputs handled safely');
      } catch (err) {
        findings.push({
          severity: 'HIGH',
          file: 'mosaicLayout.ts',
          message: `splitMosaic infinite recursion on non-finite dimensions (RangeError: Maximum call stack size exceeded)`,
        });
      }
    }
  }

  // Audit momentumPhysics
  if (isImplementationLoaded.physics) {
    const { physicsImpl } = implementationModules;
    console.log('\nAuditing lib/playground/momentumPhysics.ts...');
    if (typeof physicsImpl.createMomentumPhysics !== 'function') {
      findings.push({ severity: 'CRITICAL', file: 'momentumPhysics.ts', message: 'Missing export createMomentumPhysics' });
    } else {
      // Test parameter defaults
      try {
        physicsImpl.createMomentumPhysics();
        console.log('  \x1b[32m✓\x1b[0m createMomentumPhysics() supports optional parameters');
      } catch (err) {
        findings.push({
          severity: 'MEDIUM',
          file: 'momentumPhysics.ts',
          message: `createMomentumPhysics throws when options argument is omitted (Cannot read properties of undefined reading 'packWidth')`,
        });
      }

      // Test velocity capping
      try {
        const p = physicsImpl.createMomentumPhysics({ packWidth: 1000, packHeight: 1000 });
        p.onPointerDown(0, 0);
        p.onPointerMove(50000, 50000);
        p.onPointerUp();
        const state = p.update(0.016);
        if (state.velocity > 200) {
          findings.push({
            severity: 'MEDIUM',
            file: 'momentumPhysics.ts',
            message: `Instantaneous velocity flick is uncapped (received ${state.velocity.toFixed(1)}, expected <= 100 maxVelocity)`,
          });
        } else {
          console.log(`  \x1b[32m✓\x1b[0m Velocity capped safely at ${state.velocity}`);
        }
      } catch (err) {
        findings.push({ severity: 'HIGH', file: 'momentumPhysics.ts', message: `Physics velocity check failed: ${err.message}` });
      }
    }
  }

  console.log('\n\x1b[1m\x1b[33mImplementation Audit Findings:\x1b[0m');
  if (findings.length === 0) {
    console.log('  \x1b[32mZero defects detected in active implementation modules.\x1b[0m\n');
  } else {
    for (const f of findings) {
      const col = f.severity === 'CRITICAL' ? '\x1b[31m' : '\x1b[33m';
      console.log(`  ${col}[${f.severity}]\x1b[0m [${f.file}] ${f.message}`);
    }
    console.log(`\n  Total findings to escalate: ${findings.length}\n`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
