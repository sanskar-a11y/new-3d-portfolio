/**
 * Authoritative mathematical oracle for 2D Momentum Drift & Navigation (R2).
 * Directly derived from PROJECT.md, spec.md, and reference kinematics formulas.
 */

export interface PhysicsOptions {
  smoothingFactor?: number; // k in 1 - exp(-k * dt), default 10.0
  frictionFactor?: number;  // k in exp(-k * dt), default 4.0
  dragZoomPullback?: number;// zoom during drag, default 0.92
  clickThreshold?: number;  // click threshold in px, default 8.0
  wheelDamping?: number;    // wheel delta factor, default 0.75
  autoDriftSpeed?: number;  // subtle idle drift speed per frame, default 0.15
  maxVelocity?: number;     // maximum velocity cap, default 100.0
  minZoom?: number;         // minimum allowable zoom, default 0.85
  isTouch?: boolean;        // whether running in touch mode
}

export interface PhysicsState {
  scrollX: number;
  scrollY: number;
  targetX: number;
  targetY: number;
  velocity: number;
  isDragging: boolean;
  zoom: number;
  wrapX: number;
  wrapY: number;
}

export function computeToroidalWrap(scroll: number, packSize: number): number {
  if (packSize <= 0) return 0;
  return scroll - Math.round(scroll / packSize) * packSize;
}

export function computeExponentialDamping(current: number, target: number, k: number, dt: number): number {
  const factor = 1.0 - Math.exp(-k * Math.max(0, dt));
  return current + (target - current) * factor;
}

export function computeFrictionDecay(velocity: number, k: number, dt: number): number {
  return velocity * Math.exp(-k * Math.max(0, dt));
}

export function computeDynamicZoom(isDragging: boolean, velocity: number, pullback = 0.92, minZoom = 0.85): number {
  if (isDragging) {
    return pullback;
  }
  const velocityPullback = Math.min(velocity / 30.0, 0.10);
  const targetZoom = 1.0 - velocityPullback;
  return Math.max(minZoom, Math.min(1.0, targetZoom));
}

export class MomentumPhysicsOracle {
  private options: Required<PhysicsOptions>;
  private scrollX = 0;
  private scrollY = 0;
  private targetX = 0;
  private targetY = 0;
  private vx = 0;
  private vy = 0;
  private velocity = 0;
  private zoom = 1.0;
  private isDragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private lastPointerTime = 0;
  private totalDragDistance = 0;
  private isIdle = true;

  constructor(opts: PhysicsOptions = {}) {
    this.options = {
      smoothingFactor: opts.smoothingFactor ?? 10.0,
      frictionFactor: opts.frictionFactor ?? 4.0,
      dragZoomPullback: opts.dragZoomPullback ?? 0.92,
      clickThreshold: opts.clickThreshold ?? 8.0,
      wheelDamping: opts.wheelDamping ?? 0.75,
      autoDriftSpeed: opts.autoDriftSpeed ?? 0.15,
      maxVelocity: opts.maxVelocity ?? 100.0,
      minZoom: opts.minZoom ?? 0.85,
      isTouch: opts.isTouch ?? false,
    };
  }

  setOptions(opts: Partial<PhysicsOptions>) {
    Object.assign(this.options, opts);
  }

  onPointerDown(x: number, y: number, timeMs = performance.now()) {
    this.isDragging = true;
    this.isIdle = false;
    this.lastPointerX = isFinite(x) ? x : 0;
    this.lastPointerY = isFinite(y) ? y : 0;
    this.lastPointerTime = isFinite(timeMs) ? timeMs : performance.now();
    this.totalDragDistance = 0;
    this.vx = 0;
    this.vy = 0;
  }

  onPointerMove(x: number, y: number, timeMs = performance.now()) {
    if (!this.isDragging) return;
    const safeX = isFinite(x) ? x : this.lastPointerX;
    const safeY = isFinite(y) ? y : this.lastPointerY;
    const safeTime = isFinite(timeMs) ? timeMs : performance.now();
    const dx = safeX - this.lastPointerX;
    const dy = safeY - this.lastPointerY;
    const dt = Math.max(0.001, (safeTime - this.lastPointerTime) / 1000);

    this.totalDragDistance += Math.hypot(dx, dy);
    this.targetX += dx;
    this.targetY += dy;

    // Instantaneous velocity calculation (capped)
    const rawVx = dx / (dt * 60);
    const rawVy = dy / (dt * 60);
    const speed = Math.hypot(rawVx, rawVy);
    if (speed > this.options.maxVelocity) {
      const scale = this.options.maxVelocity / speed;
      this.vx = rawVx * scale;
      this.vy = rawVy * scale;
    } else {
      this.vx = rawVx;
      this.vy = rawVy;
    }

    this.lastPointerX = x;
    this.lastPointerY = y;
    this.lastPointerTime = timeMs;
  }

  onPointerUp(): { wasClick: boolean; clickDistance: number } {
    const wasClick = this.totalDragDistance < this.options.clickThreshold;
    const clickDistance = this.totalDragDistance;
    this.isDragging = false;
    return { wasClick, clickDistance };
  }

  onPointerCancel() {
    this.isDragging = false;
    this.vx = 0;
    this.vy = 0;
  }

  onWheel(deltaX: number, deltaY: number, shiftKey = false) {
    this.isIdle = false;
    let dx = deltaX;
    let dy = deltaY;
    if (shiftKey && deltaX === 0) {
      dx = deltaY;
      dy = 0;
    }

    this.targetX -= dx * this.options.wheelDamping;
    this.targetY -= dy * this.options.wheelDamping;
  }

  update(dt: number, packW = 1000, packH = 1000): PhysicsState {
    const safeDt = !isFinite(dt) || isNaN(dt) ? 0.016 : Math.max(0, Math.min(0.1, dt));
    if (!isFinite(this.targetX)) this.targetX = 0;
    if (!isFinite(this.targetY)) this.targetY = 0;
    if (!isFinite(this.vx)) this.vx = 0;
    if (!isFinite(this.vy)) this.vy = 0;

    // If not dragging, apply inertia and friction decay
    if (!this.isDragging) {
      this.targetX += this.vx;
      this.targetY += this.vy;

      const friction = Math.exp(-this.options.frictionFactor * safeDt);
      this.vx *= friction;
      this.vy *= friction;

      if (Math.abs(this.vx) < 0.001) this.vx = 0;
      if (Math.abs(this.vy) < 0.001) this.vy = 0;

      // Ambient idle drift on non-touch desktop when motion is quiet
      const speed = Math.hypot(this.vx, this.vy);
      if (speed < 0.05 && !this.options.isTouch) {
        this.targetY -= this.options.autoDriftSpeed;
      }
    }

    // Frame-rate independent exponential smoothing towards target
    const prevScrollX = this.scrollX;
    const prevScrollY = this.scrollY;
    this.scrollX = computeExponentialDamping(this.scrollX, this.targetX, this.options.smoothingFactor, safeDt);
    this.scrollY = computeExponentialDamping(this.scrollY, this.targetY, this.options.smoothingFactor, safeDt);

    // Track effective speed capped at maxVelocity
    const frameMotion = Math.hypot(this.scrollX - prevScrollX, this.scrollY - prevScrollY);
    this.velocity = Math.min(this.options.maxVelocity, this.velocity * 0.7 + frameMotion * 0.3);

    // Dynamic zoom interpolation
    const targetZoom = computeDynamicZoom(this.isDragging, this.velocity, this.options.dragZoomPullback, this.options.minZoom);
    const zoomLerp = 1.0 - Math.exp(-6.0 * safeDt);
    this.zoom += (targetZoom - this.zoom) * zoomLerp;

    // Toroidal wrapping
    const wrapX = computeToroidalWrap(this.scrollX, packW);
    const wrapY = computeToroidalWrap(this.scrollY, packH);

    return {
      scrollX: this.scrollX,
      scrollY: this.scrollY,
      targetX: this.targetX,
      targetY: this.targetY,
      velocity: this.velocity,
      isDragging: this.isDragging,
      zoom: this.zoom,
      wrapX,
      wrapY,
    };
  }

  getWrapCoordinates(packW: number, packH: number): { wrapX: number; wrapY: number } {
    return {
      wrapX: computeToroidalWrap(this.scrollX, packW),
      wrapY: computeToroidalWrap(this.scrollY, packH),
    };
  }

  reset(x = 0, y = 0) {
    this.scrollX = x;
    this.scrollY = y;
    this.targetX = x;
    this.targetY = y;
    this.vx = 0;
    this.vy = 0;
    this.velocity = 0;
    this.zoom = 1.0;
    this.isDragging = false;
    this.totalDragDistance = 0;
    this.isIdle = true;
  }

  getStats() {
    return {
      totalDragDistance: this.totalDragDistance,
      isDragging: this.isDragging,
      currentScroll: [this.scrollX, this.scrollY] as [number, number],
      targetScroll: [this.targetX, this.targetY] as [number, number],
      velocity: this.velocity,
      zoom: this.zoom,
    };
  }
}

export function createMomentumPhysics(options?: PhysicsOptions): MomentumPhysicsOracle {
  return new MomentumPhysicsOracle(options);
}
