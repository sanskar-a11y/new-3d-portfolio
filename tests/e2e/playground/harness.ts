/**
 * Lightweight, high-precision test harness for WebGL Playground E2E testing.
 * Provides Jest/Playwright/Vitest-compatible syntax (describe, test/it, expect)
 * with zero external dependencies and structured reporting.
 */

export interface TestResult {
  suite: string;
  name: string;
  tier: number;
  feature?: string;
  passed: boolean;
  error?: Error | string;
  durationMs: number;
}

export interface SuiteSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  tierCounts: Record<number, { total: number; passed: number; failed: number }>;
  featureCounts: Record<string, { total: number; passed: number; failed: number }>;
}

class TestRegistry {
  private currentSuite = 'Default';
  private currentTier = 1;
  private currentFeature = '';
  private results: TestResult[] = [];
  private startTime = 0;

  setSuite(name: string, tier = 1, feature = '') {
    this.currentSuite = name;
    this.currentTier = tier;
    this.currentFeature = feature;
  }

  setTier(tier: number) {
    this.currentTier = tier;
  }

  setFeature(feature: string) {
    this.currentFeature = feature;
  }

  startSuiteTimer() {
    this.startTime = performance.now();
  }

  recordResult(res: TestResult) {
    this.results.push(res);
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getCurrentSuite(): string {
    return this.currentSuite;
  }

  getCurrentTier(): number {
    return this.currentTier;
  }

  getCurrentFeature(): string {
    return this.currentFeature;
  }

  getSummary(): SuiteSummary {
    const total = this.results.length;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    const tierCounts: Record<number, { total: number; passed: number; failed: number }> = {};
    const featureCounts: Record<string, { total: number; passed: number; failed: number }> = {};

    for (const r of this.results) {
      if (r.passed) passed++;
      else failed++;

      if (!tierCounts[r.tier]) {
        tierCounts[r.tier] = { total: 0, passed: 0, failed: 0 };
      }
      tierCounts[r.tier].total++;
      if (r.passed) tierCounts[r.tier].passed++;
      else tierCounts[r.tier].failed++;

      if (r.feature) {
        if (!featureCounts[r.feature]) {
          featureCounts[r.feature] = { total: 0, passed: 0, failed: 0 };
        }
        featureCounts[r.feature].total++;
        if (r.passed) featureCounts[r.feature].passed++;
        else featureCounts[r.feature].failed++;
      }
    }

    const durationMs = performance.now() - this.startTime;
    return {
      total,
      passed,
      failed,
      skipped,
      durationMs,
      tierCounts,
      featureCounts,
    };
  }

  clear() {
    this.results = [];
    this.startTime = performance.now();
  }
}

export const registry = new TestRegistry();

export function describe(suiteName: string, fn: () => void | Promise<void>) {
  const previousSuite = registry.getCurrentSuite();
  registry.setSuite(suiteName, registry.getCurrentTier(), registry.getCurrentFeature());
  try {
    const result = fn();
    if (result && typeof (result as Promise<void>).then === 'function') {
      throw new Error(`Asynchronous describe() blocks are not supported. Put async calls in test()`);
    }
  } finally {
    registry.setSuite(previousSuite, registry.getCurrentTier(), registry.getCurrentFeature());
  }
}

export function setTestTier(tier: number) {
  registry.setTier(tier);
}

export function setTestFeature(feature: string) {
  registry.setFeature(feature);
}

export async function test(testName: string, fn: () => void | Promise<void>) {
  const suite = registry.getCurrentSuite();
  const tier = registry.getCurrentTier();
  const feature = registry.getCurrentFeature();
  const t0 = performance.now();
  let passed = true;
  let error: Error | string | undefined;

  try {
    await fn();
  } catch (err: any) {
    passed = false;
    error = err;
  }

  const durationMs = performance.now() - t0;
  registry.recordResult({
    suite,
    name: testName,
    tier,
    feature: feature || undefined,
    passed,
    error,
    durationMs,
  });

  if (!passed) {
    const errStr = error instanceof Error ? (error.stack || error.message) : String(error);
    console.error(`  \x1b[31m✕ [FAIL]\x1b[0m [Tier ${tier}] ${suite} -> ${testName}`);
    console.error(`    \x1b[33m${errStr}\x1b[0m`);
  }
}

export const it = test;

class Expectation<T = any> {
  private actual: T;
  private isNot: boolean;

  constructor(actual: T, isNot = false) {
    this.actual = actual;
    this.isNot = isNot;
  }

  get not(): Expectation<T> {
    return new Expectation(this.actual, !this.isNot);
  }

  toBe(expected: any) {
    const pass = Object.is(this.actual, expected);
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected ${String(this.actual)} ${this.isNot ? 'NOT to be' : 'to be'} ${String(expected)}`);
    }
  }

  toEqual(expected: any) {
    const pass = deepEqual(this.actual, expected);
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'NOT to equal' : 'to equal'} ${JSON.stringify(expected)}`);
    }
  }

  toBeCloseTo(expected: number, delta = 0.001) {
    if (typeof this.actual !== 'number') {
      throw new Error(`toBeCloseTo actual value must be a number, received: ${typeof this.actual}`);
    }
    const diff = Math.abs(this.actual - expected);
    const pass = diff <= delta;
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected ${this.actual} ${this.isNot ? 'NOT to be close to' : 'to be close to'} ${expected} (diff: ${diff}, delta: ${delta})`);
    }
  }

  toBeGreaterThan(expected: number) {
    const pass = (this.actual as any) > expected;
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected ${this.actual} ${this.isNot ? 'NOT to be >' : 'to be >'} ${expected}`);
    }
  }

  toBeGreaterThanOrEqual(expected: number) {
    const pass = (this.actual as any) >= expected;
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected ${this.actual} ${this.isNot ? 'NOT to be >=' : 'to be >='} ${expected}`);
    }
  }

  toBeLessThan(expected: number) {
    const pass = (this.actual as any) < expected;
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected ${this.actual} ${this.isNot ? 'NOT to be <' : 'to be <'} ${expected}`);
    }
  }

  toBeLessThanOrEqual(expected: number) {
    const pass = (this.actual as any) <= expected;
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected ${this.actual} ${this.isNot ? 'NOT to be <=' : 'to be <='} ${expected}`);
    }
  }

  toBeDefined() {
    const pass = this.actual !== undefined;
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected value ${this.isNot ? 'NOT to be defined' : 'to be defined'}, received undefined`);
    }
  }

  toBeUndefined() {
    const pass = this.actual === undefined;
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected value ${this.isNot ? 'NOT to be undefined' : 'to be undefined'}, received ${String(this.actual)}`);
    }
  }

  toBeNull() {
    const pass = this.actual === null;
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected value ${this.isNot ? 'NOT to be null' : 'to be null'}, received ${String(this.actual)}`);
    }
  }

  toBeTruthy() {
    const pass = Boolean(this.actual);
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected value ${this.isNot ? 'NOT to be truthy' : 'to be truthy'}, received ${String(this.actual)}`);
    }
  }

  toBeFalsy() {
    const pass = !this.actual;
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected value ${this.isNot ? 'NOT to be falsy' : 'to be falsy'}, received ${String(this.actual)}`);
    }
  }

  toContain(item: any) {
    let pass = false;
    if (typeof this.actual === 'string') {
      pass = this.actual.includes(item);
    } else if (Array.isArray(this.actual)) {
      pass = this.actual.includes(item);
    } else if (this.actual instanceof Set) {
      pass = this.actual.has(item);
    } else if (this.actual && typeof this.actual === 'object') {
      pass = item in this.actual;
    }
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'NOT to contain' : 'to contain'} ${JSON.stringify(item)}`);
    }
  }

  toHaveLength(length: number) {
    const actualLen = (this.actual as any)?.length;
    const pass = actualLen === length;
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected length ${this.isNot ? 'NOT to be' : 'to be'} ${length}, received ${actualLen}`);
    }
  }

  toThrow(expected?: string | RegExp) {
    if (typeof this.actual !== 'function') {
      throw new Error(`toThrow requires a function, received ${typeof this.actual}`);
    }
    let threw = false;
    let thrownError: any = null;
    try {
      (this.actual as Function)();
    } catch (err) {
      threw = true;
      thrownError = err;
    }

    if (!threw && !this.isNot) {
      throw new Error(`Expected function to throw, but it did not throw`);
    }
    if (threw && this.isNot) {
      throw new Error(`Expected function NOT to throw, but it threw: ${String(thrownError)}`);
    }

    if (threw && expected && !this.isNot) {
      const msg = thrownError instanceof Error ? thrownError.message : String(thrownError);
      if (typeof expected === 'string' && !msg.includes(expected)) {
        throw new Error(`Expected thrown error message to include "${expected}", got "${msg}"`);
      }
      if (expected instanceof RegExp && !expected.test(msg)) {
        throw new Error(`Expected thrown error message to match ${expected}, got "${msg}"`);
      }
    }
  }

  toMatch(pattern: RegExp) {
    if (typeof this.actual !== 'string') {
      throw new Error(`toMatch expects a string, received ${typeof this.actual}`);
    }
    const pass = pattern.test(this.actual);
    if (this.isNot ? pass : !pass) {
      throw new Error(`Expected "${this.actual}" ${this.isNot ? 'NOT to match' : 'to match'} ${pattern}`);
    }
  }
}

export function expect<T = any>(actual: T): Expectation<T> {
  return new Expectation(actual);
}

function deepEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null || typeof a !== 'object') return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const k of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!deepEqual(a[k], b[k])) return false;
  }

  return true;
}
