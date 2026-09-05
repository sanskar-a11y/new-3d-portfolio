/**
 * Authoritative specification oracle for HUD Telemetry & Modal Integration (R4).
 * Directly derived from PROJECT.md, spec.md, and PlaygroundHUD / LightsOut specifications.
 */

export type ReactionGameState = 'idle' | 'waiting' | 'prompt' | 'result';

export interface ReactionResult {
  latencyMs: number;
  rating: 'INCREDIBLE' | 'FAST' | 'GOOD' | 'SLOW' | 'TOO EARLY';
}

/**
 * Formats active cell counter to 3-digit zero-padded string.
 */
export function formatCellCount(count: number): string {
  if (isNaN(count) || count <= 0) return '---';
  return Math.min(999, Math.floor(count)).toString().padStart(3, '0');
}

/**
 * Formats elapsed seconds to MM:SS string.
 */
export function formatElapsedStopwatch(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSec = Math.floor(seconds);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
  const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
  return `${minsStr}:${secsStr}`;
}

/**
 * Formats switch counter to 3-digit zero-padded string.
 */
export function formatSwitchCount(count: number): string {
  if (isNaN(count) || count < 0) return '000';
  return Math.min(999, Math.floor(count)).toString().padStart(3, '0');
}

/**
 * Rates reaction time latency.
 */
export function rateReactionLatency(latencyMs: number): ReactionResult['rating'] {
  if (latencyMs < 0) return 'TOO EARLY';
  if (latencyMs < 200) return 'INCREDIBLE';
  if (latencyMs < 300) return 'FAST';
  if (latencyMs < 500) return 'GOOD';
  return 'SLOW';
}

/**
 * State machine for the SHIFT LightsOut reaction time game.
 */
export class ReactionGameOracle {
  private state: ReactionGameState = 'idle';
  private promptStartTime = 0;
  private lastResult: ReactionResult | null = null;
  private lightsOut = false;

  getState(): ReactionGameState {
    return this.state;
  }

  isLightsOut(): boolean {
    return this.lightsOut;
  }

  getLastResult(): ReactionResult | null {
    return this.lastResult;
  }

  // User presses shift or clicks toggle button
  triggerShift(now = performance.now()): { stateChanged: boolean; feedback?: string } {
    if (this.state === 'idle') {
      this.lightsOut = true;
      this.state = 'waiting';
      return { stateChanged: true, feedback: 'LIGHTS OUT, WAIT FOR SIGNAL' };
    }

    if (this.state === 'waiting') {
      // Early press penalty
      this.state = 'result';
      this.lastResult = { latencyMs: -1, rating: 'TOO EARLY' };
      return { stateChanged: true, feedback: 'TOO EARLY' };
    }

    if (this.state === 'prompt') {
      const latency = Math.max(1, now - this.promptStartTime);
      const rating = rateReactionLatency(latency);
      this.state = 'result';
      this.lastResult = { latencyMs: latency, rating };
      return { stateChanged: true, feedback: `${Math.round(latency)}ms - ${rating}` };
    }

    if (this.state === 'result') {
      // Reset to idle
      this.reset();
      return { stateChanged: true, feedback: 'RESET' };
    }

    return { stateChanged: false };
  }

  // Random timer triggers the signal
  triggerPromptSignal(now = performance.now()): boolean {
    if (this.state === 'waiting') {
      this.state = 'prompt';
      this.promptStartTime = now;
      return true;
    }
    return false;
  }

  toggleLightsOnly(): boolean {
    this.lightsOut = !this.lightsOut;
    return this.lightsOut;
  }

  reset() {
    this.state = 'idle';
    this.promptStartTime = 0;
    this.lastResult = null;
  }
}

/**
 * Click discrimination filter: Distance < 8px is click, >= 8px is drag.
 */
export function isClickGesture(totalDragDistance: number, threshold = 8.0): boolean {
  return totalDragDistance < threshold;
}
