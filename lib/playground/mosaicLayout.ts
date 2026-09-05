import { type SketchDef, SKETCH_CATALOG } from '../../components/playground/sketches.ts'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface MosaicCell {
  id: string
  sketch: SketchDef
  x: number // center x relative to pack center
  y: number // center y relative to pack center
  width: number
  height: number
  aspectRatio: number
  uRepeat: [number, number]
  uOffset: [number, number]
  left: number
  top: number
  right: number
  bottom: number
}

export interface MosaicLayoutResult {
  cells: MosaicCell[]
  packWidth: number
  packHeight: number
  isMobile: boolean
  cols?: number
}

/**
 * Aspect ratio map for standard sketch catalog ratios.
 */
export const ASPECT_RATIOS: Record<string, number> = {
  '16:9': 16 / 9,
  '4:5': 4 / 5,
  '1:1': 1.0,
  '3:4': 3 / 4,
  '2:1': 2.0,
}

/**
 * Parses catalog aspect ratio strings into floating-point numbers.
 */
export function getNumericAspectRatio(aspectRatioStr?: string): number {
  if (aspectRatioStr && ASPECT_RATIOS[aspectRatioStr]) {
    return ASPECT_RATIOS[aspectRatioStr]
  }
  switch (aspectRatioStr) {
    case '16:9':
      return 16 / 9
    case '4:5':
      return 4 / 5
    case '1:1':
      return 1.0
    case '3:4':
      return 3 / 4
    case '2:1':
      return 2.0
    default:
      return 16 / 9
  }
}

/**
 * Computes UV scale and offset so that an image behaves as `object-fit: cover`
 * inside a plane with cellAspect = cellWidth / cellHeight.
 */
export function calculateCoverUV(
  imageAspect: number,
  cellAspect: number
): { uRepeat: [number, number]; uOffset: [number, number] } {
  const safeImgAspect = Math.max(0.001, Number.isFinite(imageAspect) ? imageAspect : 1.0)
  const safeCellAspect = Math.max(0.001, Number.isFinite(cellAspect) ? cellAspect : 1.0)

  if (safeImgAspect > safeCellAspect) {
    // Image is wider than cell -> scale X, center horizontally
    const rx = safeCellAspect / safeImgAspect
    const ry = 1.0
    const ox = (1.0 - rx) / 2.0
    const oy = 0.0
    return { uRepeat: [rx, ry], uOffset: [ox, oy] }
  } else {
    // Image is taller than cell -> scale Y, center vertically
    const rx = 1.0
    const ry = safeImgAspect / safeCellAspect
    const ox = 0.0
    const oy = (1.0 - ry) / 2.0
    return { uRepeat: [rx, ry], uOffset: [ox, oy] }
  }
}

/**
 * Calculates GLSL uRepeat and uOffset for cover fitting without stretching.
 */
export function computeCoverUv(
  cellWidth: number,
  cellHeight: number,
  textureWidth: number,
  textureHeight: number
): { uRepeat: [number, number]; uOffset: [number, number] } {
  if (
    !Number.isFinite(cellWidth) ||
    !Number.isFinite(cellHeight) ||
    !Number.isFinite(textureWidth) ||
    !Number.isFinite(textureHeight) ||
    cellWidth <= 0 ||
    cellHeight <= 0 ||
    textureWidth <= 0 ||
    textureHeight <= 0
  ) {
    return { uRepeat: [1.0, 1.0], uOffset: [0.0, 0.0] }
  }

  const cellAspect = cellWidth / cellHeight
  const texAspect = textureWidth / textureHeight

  if (texAspect > cellAspect) {
    const rx = cellAspect / texAspect
    const ry = 1.0
    const ox = (1.0 - rx) / 2.0
    const oy = 0.0
    return { uRepeat: [rx, ry], uOffset: [ox, oy] }
  } else {
    const rx = 1.0
    const ry = texAspect / cellAspect
    const ox = 0.0
    const oy = (1.0 - ry) / 2.0
    return { uRepeat: [rx, ry], uOffset: [ox, oy] }
  }
}

/**
 * Device Pixel Ratio clamping helper.
 * Max 1.5 on desktop, 1.0 on mobile to prevent GPU thermal throttling.
 */
export function clampDpr(dpr: number, isMobile = false): number {
  if (!dpr || !Number.isFinite(dpr) || dpr <= 0) return 1.0
  if (isMobile) {
    return Math.min(dpr, 1.0)
  }
  return Math.min(dpr, 1.5)
}

/**
 * 2D Recursive Binary Space Partitioning (BSP) for Desktop & Tablet viewports.
 */
export function splitMosaic(
  x: number,
  y: number,
  w: number,
  h: number,
  minW = 130,
  minH = 100,
  maxW = 360,
  maxH = 280,
  depth = 0
): Rect[] {
  // Guard against non-finite or non-positive dimensions
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return []
  }
  if (!Number.isFinite(x)) x = 0
  if (!Number.isFinite(y)) y = 0

  // Safety depth limit
  if (depth > 12) {
    return [{ x, y, w, h }]
  }

  const canSplitW = w >= minW * 2
  const canSplitH = h >= minH * 2

  // Base case: cannot subdivide further
  if (!canSplitW && !canSplitH) {
    return [{ x, y, w, h }]
  }

  const aspect = w / h
  const forceSplitW = aspect > 2.0 && canSplitW
  const forceSplitH = 1.0 / aspect > 2.0 && canSplitH
  const overMaxW = w > maxW && canSplitW
  const overMaxH = h > maxH && canSplitH

  // Stochastic early termination: large cells are more likely to split, deeper nodes less likely
  if (!forceSplitW && !forceSplitH && !overMaxW && !overMaxH) {
    const sizeFactor = Math.max(w / minW, h / minH)
    const splitProb = Math.min(0.95, 0.45 + sizeFactor * 0.08 - depth * 0.05)
    if (Math.random() > splitProb) {
      return [{ x, y, w, h }]
    }
  }

  // Determine split axis
  let splitVertical: boolean
  if (forceSplitW || overMaxW) {
    splitVertical = true
  } else if (forceSplitH || overMaxH) {
    splitVertical = false
  } else if (canSplitW && canSplitH) {
    splitVertical = Math.random() < w / (w + h)
  } else {
    splitVertical = canSplitW
  }

  // Golden-ratio jittered split ratio between 40% and 60%
  const splitRatio = 0.4 + Math.random() * 0.2

  if (splitVertical) {
    const splitW = Math.max(minW, Math.min(w - minW, Math.round(w * splitRatio)))
    return [
      ...splitMosaic(x, y, splitW, h, minW, minH, maxW, maxH, depth + 1),
      ...splitMosaic(x + splitW, y, w - splitW, h, minW, minH, maxW, maxH, depth + 1),
    ]
  } else {
    const splitH = Math.max(minH, Math.min(h - minH, Math.round(h * splitRatio)))
    return [
      ...splitMosaic(x, y, w, splitH, minW, minH, maxW, maxH, depth + 1),
      ...splitMosaic(x, y + splitH, w, h - splitH, minW, minH, maxW, maxH, depth + 1),
    ]
  }
}

/**
 * 3-Column Staggered Masonry Layout for Mobile (<480px).
 */
export function generateMobileMosaic(totalW: number, totalH: number, cols = 3): Rect[] {
  if (
    !Number.isFinite(totalW) ||
    !Number.isFinite(totalH) ||
    totalW <= 0 ||
    totalH <= 0
  ) {
    return []
  }

  const colW = totalW / cols
  const minCellH = Math.max(50, Math.round(colW * 0.75))
  const maxCellH = Math.round(colW * 1.4)
  const cells: Rect[] = []

  for (let c = 0; c < cols; c++) {
    const colX = c * colW
    const heights: number[] = []
    let accumulated = 0

    let rowIdx = 0
    while (accumulated < totalH * 0.95) {
      const r = (Math.sin(c * 17.3 + rowIdx * 31.7) + 1.0) / 2.0
      const h = minCellH + r * (maxCellH - minCellH)
      heights.push(h)
      accumulated += h
      rowIdx++
    }

    if (heights.length === 0) {
      heights.push(totalH)
      accumulated = totalH
    }

    // Normalize column cell heights so all columns perfectly match totalH
    const scale = totalH / accumulated
    let currentY = 0
    for (const rawH of heights) {
      const h = Math.round(rawH * scale)
      cells.push({ x: colX, y: currentY, w: colW, h })
      currentY += h
    }
  }

  return cells
}

/**
 * Geometric verification: Checks if two rectangles overlap.
 */
export function checkRectOverlap(r1: Rect, r2: Rect, tolerance = 0.001): boolean {
  return !(
    r1.x + r1.w <= r2.x + tolerance ||
    r2.x + r2.w <= r1.x + tolerance ||
    r1.y + r1.h <= r2.y + tolerance ||
    r2.y + r2.h <= r1.y + tolerance
  )
}

/**
 * Validates that no two cells in the generated layout overlap.
 */
export function validateNoOverlaps(
  cells: { left: number; top: number; width: number; height: number }[]
): {
  valid: boolean
  overlaps: Array<[number, number]>
} {
  const overlaps: Array<[number, number]> = []
  for (let i = 0; i < cells.length; i++) {
    const r1: Rect = { x: cells[i].left, y: cells[i].top, w: cells[i].width, h: cells[i].height }
    for (let j = i + 1; j < cells.length; j++) {
      const r2: Rect = { x: cells[j].left, y: cells[j].top, w: cells[j].width, h: cells[j].height }
      if (checkRectOverlap(r1, r2)) {
        overlaps.push([i, j])
      }
    }
  }
  return { valid: overlaps.length === 0, overlaps }
}

/**
 * Master Mosaic Layout Generator coordinating responsive BSP / Masonry partitioning,
 * padding gutters, cover UV mapping, and center-relative coordinates.
 */
export function generateMosaicLayout(
  viewportWidth: number,
  viewportHeight: number,
  sketches: SketchDef[] = SKETCH_CATALOG
): MosaicLayoutResult {
  const safeW = !Number.isFinite(viewportWidth) || viewportWidth <= 0 ? 1000 : viewportWidth
  const safeH = !Number.isFinite(viewportHeight) || viewportHeight <= 0 ? 800 : viewportHeight
  const isMobile = safeW < 480
  const expansionFactor = 1.4

  const packWidth = Math.max(300, Math.round(safeW * expansionFactor))
  const packHeight = Math.max(300, Math.round(safeH * expansionFactor))

  const gap = isMobile ? 0 : 14

  let rawRects: Rect[]
  if (isMobile) {
    rawRects = generateMobileMosaic(packWidth, packHeight, 3)
  } else {
    rawRects = splitMosaic(0, 0, packWidth, packHeight, 130, 100, 360, 280)
  }

  // Ensure we have a valid, non-empty set of rects
  if (rawRects.length === 0) {
    rawRects = [{ x: 0, y: 0, w: packWidth, h: packHeight }]
  }

  const halfPackW = packWidth / 2
  const halfPackH = packHeight / 2
  const totalSketches = sketches.length > 0 ? sketches.length : 1
  const sketchList = sketches.length > 0 ? sketches : SKETCH_CATALOG

  const cells: MosaicCell[] = rawRects.map((r, idx) => {
    const sketch = sketchList[idx % totalSketches]
    const texAspect = ASPECT_RATIOS[sketch?.aspectRatio] || 1.0
    const cellW = Math.max(1, r.w - gap)
    const cellH = Math.max(1, r.h - gap)
    const { uRepeat, uOffset } = computeCoverUv(cellW, cellH, texAspect, 1.0)

    const cx = r.x + r.w / 2 - halfPackW
    const cy = r.y + r.h / 2 - halfPackH

    return {
      id: `${sketch?.id || 'cell'}-${idx}`,
      sketch,
      x: cx,
      y: cy,
      width: cellW,
      height: cellH,
      aspectRatio: cellW / cellH,
      uRepeat,
      uOffset,
      left: r.x,
      top: r.y,
      right: r.x + r.w,
      bottom: r.y + r.h,
    }
  })

  return {
    cells,
    packWidth,
    packHeight,
    isMobile,
    cols: isMobile ? 3 : undefined,
  }
}
