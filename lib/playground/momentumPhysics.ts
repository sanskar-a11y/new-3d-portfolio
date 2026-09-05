export interface PhysicsOptions {
  packWidth?: number
  packHeight?: number
  smoothingFactor?: number // k in 1 - exp(-k * dt), default 10.0
  frictionFactor?: number // k in exp(-k * dt), default 4.0
  dragZoomPullback?: number // zoom during drag, default 0.92
  clickThreshold?: number // click threshold in px, default 8.0
  wheelDamping?: number // wheel delta factor, default 0.75
  autoDriftSpeed?: number // subtle idle drift speed per frame, default 0.15
  maxVelocity?: number // maximum velocity cap, default 100.0
  minZoom?: number // minimum allowable zoom, default 0.85
  isTouch?: boolean // whether running in touch mode
  autoDrift?: boolean
}

export interface MomentumState {
  scrollX: number
  scrollY: number
  targetX: number
  targetY: number
  velocity: number
  isDragging: boolean
  zoom: number
  wrapX: number
  wrapY: number
}

export type PhysicsState = MomentumState

/**
 * Computes dual-axis toroidal wrap coordinate.
 */
export function computeToroidalWrap(scroll: number, packSize: number): number {
  if (!Number.isFinite(scroll) || !Number.isFinite(packSize) || packSize <= 0) return 0
  return scroll - Math.round(scroll / packSize) * packSize
}

/**
 * Computes frame-rate independent exponential damping.
 */
export function computeExponentialDamping(
  current: number,
  target: number,
  k: number,
  dt: number
): number {
  const safeDt = Math.max(0, Number.isFinite(dt) ? dt : 0.016)
  const safeK = Math.max(0, Number.isFinite(k) ? k : 10.0)
  const factor = 1.0 - Math.exp(-safeK * safeDt)
  return current + (target - current) * factor
}

/**
 * Computes exponential friction decay on velocity.
 */
export function computeFrictionDecay(
  velocity: number,
  k: number,
  dt: number
): number {
  const safeDt = Math.max(0, Number.isFinite(dt) ? dt : 0.016)
  const safeK = Math.max(0, Number.isFinite(k) ? k : 4.0)
  return velocity * Math.exp(-safeK * safeDt)
}

/**
 * Computes dynamic camera pullback zoom.
 */
export function computeDynamicZoom(
  isDragging: boolean,
  velocity: number,
  pullback = 0.92,
  minZoom = 0.85
): number {
  if (isDragging) {
    return pullback
  }
  const safeVel = Math.max(0, Number.isFinite(velocity) ? velocity : 0)
  const velocityPullback = Math.min(safeVel / 30.0, 0.1)
  const targetZoom = 1.0 - velocityPullback
  return Math.max(minZoom, Math.min(1.0, targetZoom))
}

export class MomentumPhysicsController {
  public options: Required<PhysicsOptions>
  private scrollX = 0
  private scrollY = 0
  private targetX = 0
  private targetY = 0
  private vx = 0
  private vy = 0
  private velocity = 0
  private zoom = 1.0
  private isDragging = false
  private lastPointerX = 0
  private lastPointerY = 0
  private lastPointerTime = 0
  private totalDragDistance = 0
  private isIdle = true

  constructor(opts: Partial<PhysicsOptions> = {}) {
    const safeOpts = opts ?? {}
    this.options = {
      packWidth: Math.max(10, safeOpts?.packWidth ?? 1000),
      packHeight: Math.max(10, safeOpts?.packHeight ?? 1000),
      smoothingFactor: safeOpts?.smoothingFactor ?? 10.0,
      frictionFactor: safeOpts?.frictionFactor ?? 4.0,
      dragZoomPullback: safeOpts?.dragZoomPullback ?? 0.92,
      clickThreshold: safeOpts?.clickThreshold ?? 8.0,
      wheelDamping: safeOpts?.wheelDamping ?? 0.75,
      autoDriftSpeed: safeOpts?.autoDriftSpeed ?? 0.15,
      maxVelocity: safeOpts?.maxVelocity ?? 100.0,
      minZoom: safeOpts?.minZoom ?? 0.85,
      isTouch: safeOpts?.isTouch ?? false,
      autoDrift: safeOpts?.autoDrift ?? true,
    }
  }

  setOptions(opts: Partial<PhysicsOptions>) {
    Object.assign(this.options, opts)
  }

  setDimensions(w: number, h: number) {
    this.options.packWidth = Math.max(10, Number.isFinite(w) ? w : 1000)
    this.options.packHeight = Math.max(10, Number.isFinite(h) ? h : 1000)
  }

  setAutoDrift(enabled: boolean) {
    this.options.autoDrift = enabled
  }

  setIsTouch(touch: boolean) {
    this.options.isTouch = touch
  }

  onPointerDown(x: number, y: number, timeMs = performance.now()) {
    this.isDragging = true
    this.isIdle = false
    this.lastPointerX = Number.isFinite(x) ? x : 0
    this.lastPointerY = Number.isFinite(y) ? y : 0
    this.lastPointerTime = Number.isFinite(timeMs) ? timeMs : performance.now()
    this.totalDragDistance = 0
    this.vx = 0
    this.vy = 0
  }

  onPointerMove(x: number, y: number, timeMs = performance.now()) {
    if (!this.isDragging) return
    const safeX = Number.isFinite(x) ? x : this.lastPointerX
    const safeY = Number.isFinite(y) ? y : this.lastPointerY
    const safeTime = Number.isFinite(timeMs) ? timeMs : performance.now()
    const dx = safeX - this.lastPointerX
    const dy = safeY - this.lastPointerY
    const dt = Math.max(0.001, (safeTime - this.lastPointerTime) / 1000)

    this.totalDragDistance += Math.hypot(dx, dy)
    this.targetX += dx
    this.targetY += dy

    // Instantaneous velocity calculation strictly capped to maxVelocity
    const rawVx = dx / (dt * 60)
    const rawVy = dy / (dt * 60)
    let speed = Math.hypot(rawVx, rawVy)
    speed = Math.min(100, Math.min(this.options.maxVelocity, speed))
    const rawSpeed = Math.hypot(rawVx, rawVy)
    if (rawSpeed > 0) {
      const scale = speed / rawSpeed
      this.vx = rawVx * scale
      this.vy = rawVy * scale
    } else {
      this.vx = 0
      this.vy = 0
    }

    this.lastPointerX = safeX
    this.lastPointerY = safeY
    this.lastPointerTime = safeTime
  }

  onPointerUp(_x?: number, _y?: number): { wasClick: boolean; clickDistance: number } {
    const wasClick = this.totalDragDistance < this.options.clickThreshold
    const clickDistance = this.totalDragDistance
    this.isDragging = false
    return { wasClick, clickDistance }
  }

  onPointerCancel() {
    this.isDragging = false
    this.targetX = this.scrollX
    this.targetY = this.scrollY
    this.vx = 0
    this.vy = 0
    this.velocity = 0
  }

  onWheel(deltaX: number, deltaY: number, shiftKey = false) {
    this.isIdle = false
    const safeDx = Number.isFinite(deltaX) ? deltaX : 0
    const safeDy = Number.isFinite(deltaY) ? deltaY : 0
    let dx = safeDx
    let dy = safeDy
    if (shiftKey && dx === 0) {
      dx = dy
      dy = 0
    }

    this.targetX -= dx * this.options.wheelDamping
    this.targetY -= dy * this.options.wheelDamping
  }

  update(dt: number, packW = this.options.packWidth, packH = this.options.packHeight): MomentumState {
    const safeDt = Number.isFinite(dt) && dt > 0 ? Math.min(0.1, dt) : 0.016
    if (!Number.isFinite(this.targetX)) this.targetX = Number.isFinite(this.scrollX) ? this.scrollX : 0
    if (!Number.isFinite(this.targetY)) this.targetY = Number.isFinite(this.scrollY) ? this.scrollY : 0
    if (!Number.isFinite(this.scrollX)) this.scrollX = 0
    if (!Number.isFinite(this.scrollY)) this.scrollY = 0
    if (!Number.isFinite(this.vx)) this.vx = 0
    if (!Number.isFinite(this.vy)) this.vy = 0
    if (!Number.isFinite(this.velocity)) this.velocity = 0
    if (!Number.isFinite(this.zoom)) this.zoom = 1.0

    if (!this.isDragging) {
      this.targetX += this.vx
      this.targetY += this.vy

      const friction = Math.exp(-this.options.frictionFactor * safeDt)
      this.vx *= friction
      this.vy *= friction

      if (Math.abs(this.vx) < 0.001) this.vx = 0
      if (Math.abs(this.vy) < 0.001) this.vy = 0

      // Ambient idle drift on non-touch desktop when motion is quiet
      const currentSpeed = Math.hypot(this.vx, this.vy)
      if (currentSpeed < 0.05 && !this.options.isTouch && this.options.autoDrift) {
        this.targetY -= this.options.autoDriftSpeed
      }
    }

    // Frame-rate independent exponential smoothing towards target
    const prevScrollX = this.scrollX
    const prevScrollY = this.scrollY
    this.scrollX = computeExponentialDamping(this.scrollX, this.targetX, this.options.smoothingFactor, safeDt)
    this.scrollY = computeExponentialDamping(this.scrollY, this.targetY, this.options.smoothingFactor, safeDt)

    // Track effective velocity
    const frameMotion = Math.hypot(this.scrollX - prevScrollX, this.scrollY - prevScrollY)
    this.velocity = Math.min(this.options.maxVelocity, this.velocity * 0.7 + frameMotion * 0.3)

    // Dynamic zoom interpolation
    const targetZoom = computeDynamicZoom(
      this.isDragging,
      this.velocity,
      this.options.dragZoomPullback,
      this.options.minZoom
    )
    const zoomLerp = 1.0 - Math.exp(-6.0 * safeDt)
    this.zoom += (targetZoom - this.zoom) * zoomLerp

    // Toroidal wrapping
    const wrapX = computeToroidalWrap(this.scrollX, packW)
    const wrapY = computeToroidalWrap(this.scrollY, packH)

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
    }
  }

  getWrapCoordinates(
    packW = this.options.packWidth,
    packH = this.options.packHeight
  ): { wrapX: number; wrapY: number; x: number; y: number } {
    const wrapX = computeToroidalWrap(this.scrollX, packW)
    const wrapY = computeToroidalWrap(this.scrollY, packH)
    return {
      wrapX,
      wrapY,
      x: wrapX,
      y: wrapY,
    }
  }

  reset(x = 0, y = 0) {
    this.scrollX = Number.isFinite(x) ? x : 0
    this.scrollY = Number.isFinite(y) ? y : 0
    this.targetX = this.scrollX
    this.targetY = this.scrollY
    this.vx = 0
    this.vy = 0
    this.velocity = 0
    this.zoom = 1.0
    this.isDragging = false
    this.totalDragDistance = 0
    this.isIdle = true
  }

  getStats(): MomentumState & {
    totalDragDistance: number
    currentScroll: [number, number]
    targetScroll: [number, number]
  } {
    const state = this.getState()
    return {
      ...state,
      totalDragDistance: this.totalDragDistance,
      currentScroll: [this.scrollX, this.scrollY] as [number, number],
      targetScroll: [this.targetX, this.targetY] as [number, number],
    }
  }

  getState(): MomentumState {
    const wrapX = computeToroidalWrap(this.scrollX, this.options.packWidth)
    const wrapY = computeToroidalWrap(this.scrollY, this.options.packHeight)
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
    }
  }
}

export type MomentumController = MomentumPhysicsController
export const MomentumPhysicsOracle = MomentumPhysicsController

export function getWrapCoordinates(
  scrollX: number,
  scrollY: number,
  packW = 1000,
  packH = 1000
): { wrapX: number; wrapY: number; x: number; y: number } {
  const wrapX = computeToroidalWrap(scrollX, packW)
  const wrapY = computeToroidalWrap(scrollY, packH)
  return { wrapX, wrapY, x: wrapX, y: wrapY }
}

export function createMomentumPhysics(options: Partial<PhysicsOptions> = {}): MomentumPhysicsController {
  return new MomentumPhysicsController(options ?? {})
}
