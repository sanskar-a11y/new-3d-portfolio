/**
 * Authoritative mathematical oracle for WebGL Mosaic Surface Generation (R1).
 * Directly derived from PROJECT.md, spec.md, and reference implementation math.
 */

import { type SketchDef, SKETCH_CATALOG } from '../../../../components/playground/sketches.ts';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MosaicCell {
  id: string;
  sketch: SketchDef;
  x: number; // center x relative to pack center
  y: number; // center y relative to pack center
  width: number;
  height: number;
  aspectRatio: number;
  uRepeat: [number, number];
  uOffset: [number, number];
  // Additional bounds for geometric verification
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface MosaicLayoutResult {
  cells: MosaicCell[];
  packWidth: number;
  packHeight: number;
  isMobile: boolean;
  cols?: number;
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
};

/**
 * Recursive Binary Space Partitioning (BSP) generator for desktop & tablet.
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
  depth = 0,
  deterministicSeed = 42
): Rect[] {
  // Guard against non-positive, NaN, or non-finite inputs
  if (!isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) return [];

  const canSplitW = w >= minW * 2;
  const canSplitH = h >= minH * 2;

  if (!canSplitW && !canSplitH) {
    return [{ x, y, w, h }];
  }

  const aspect = w / h;
  const forceSplitW = aspect > 2.0 && canSplitW;
  const forceSplitH = (1.0 / aspect) > 2.0 && canSplitH;
  const overMaxW = w > maxW && canSplitW;
  const overMaxH = h > maxH && canSplitH;

  // Pseudo-random deterministic generator based on coordinates & depth
  const pseudoRand = (offset: number) => {
    const v = Math.sin(x * 12.9898 + y * 78.233 + depth * 37.719 + offset * 19.113 + deterministicSeed) * 43758.5453;
    return v - Math.floor(v);
  };

  if (!forceSplitW && !forceSplitH && !overMaxW && !overMaxH) {
    const sizeFactor = Math.max(w / minW, h / minH);
    const splitProb = Math.min(0.95, 0.45 + sizeFactor * 0.08 - depth * 0.05);
    if (pseudoRand(1) > splitProb) {
      return [{ x, y, w, h }];
    }
  }

  let splitVertical: boolean;
  if (forceSplitW || overMaxW) {
    splitVertical = true;
  } else if (forceSplitH || overMaxH) {
    splitVertical = false;
  } else if (canSplitW && canSplitH) {
    splitVertical = pseudoRand(2) < w / (w + h);
  } else {
    splitVertical = canSplitW;
  }

  const splitRatio = 0.4 + pseudoRand(3) * 0.2;

  if (splitVertical) {
    const splitW = Math.max(minW, Math.min(w - minW, Math.round(w * splitRatio)));
    return [
      ...splitMosaic(x, y, splitW, h, minW, minH, maxW, maxH, depth + 1, deterministicSeed),
      ...splitMosaic(x + splitW, y, w - splitW, h, minW, minH, maxW, maxH, depth + 1, deterministicSeed)
    ];
  } else {
    const splitH = Math.max(minH, Math.min(h - minH, Math.round(h * splitRatio)));
    return [
      ...splitMosaic(x, y, w, splitH, minW, minH, maxW, maxH, depth + 1, deterministicSeed),
      ...splitMosaic(x, y + splitH, w, h - splitH, minW, minH, maxW, maxH, depth + 1, deterministicSeed)
    ];
  }
}

/**
 * 3-Column normalized vertical masonry layout for mobile viewports (<480px).
 */
export function generateMobileMosaic(totalW: number, totalH: number, cols = 3): Rect[] {
  if (!isFinite(totalW) || !isFinite(totalH) || totalW <= 0 || totalH <= 0) return [];
  const colW = totalW / cols;
  const minCellH = Math.max(50, Math.round(colW * 0.75));
  const maxCellH = Math.round(colW * 1.4);
  const cells: Rect[] = [];

  for (let c = 0; c < cols; c++) {
    const colX = c * colW;
    const heights: number[] = [];
    let accumulated = 0;

    let rowIdx = 0;
    while (accumulated < totalH * 0.95) {
      // Deterministic pseudo-random variation per column
      const r = (Math.sin(c * 17.3 + rowIdx * 31.7) + 1.0) / 2.0;
      const h = minCellH + r * (maxCellH - minCellH);
      heights.push(h);
      accumulated += h;
      rowIdx++;
    }

    // Normalize heights so each column matches totalH exactly
    const scale = totalH / accumulated;
    let currentY = 0;
    for (const rawH of heights) {
      const h = Math.round(rawH * scale);
      cells.push({ x: colX, y: currentY, w: colW, h });
      currentY += h;
    }
  }

  return cells;
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
  if (cellWidth <= 0 || cellHeight <= 0 || textureWidth <= 0 || textureHeight <= 0) {
    return { uRepeat: [1.0, 1.0], uOffset: [0.0, 0.0] };
  }

  const cellAspect = cellWidth / cellHeight;
  const texAspect = textureWidth / textureHeight;

  if (texAspect > cellAspect) {
    // Image is wider than cell -> fit height, crop width
    const rx = cellAspect / texAspect;
    const ry = 1.0;
    const ox = (1.0 - rx) / 2.0;
    const oy = 0.0;
    return { uRepeat: [rx, ry], uOffset: [ox, oy] };
  } else {
    // Image is taller than cell -> fit width, crop height
    const rx = 1.0;
    const ry = texAspect / cellAspect;
    const ox = 0.0;
    const oy = (1.0 - ry) / 2.0;
    return { uRepeat: [rx, ry], uOffset: [ox, oy] };
  }
}

/**
 * Device Pixel Ratio clamping oracle.
 * Max 1.5 on desktop, 1.0 on mobile to prevent GPU thermal throttling.
 */
export function clampDpr(dpr: number, isMobile = false): number {
  if (!dpr || isNaN(dpr) || dpr <= 0) return 1.0;
  if (isMobile) {
    return Math.min(dpr, 1.0);
  }
  return Math.min(dpr, 1.5);
}

/**
 * Master layout generator oracle meeting PROJECT.md interface contract.
 */
export function generateMosaicLayout(
  viewportWidth: number,
  viewportHeight: number,
  sketches: SketchDef[] = SKETCH_CATALOG
): MosaicLayoutResult {
  const safeW = !isFinite(viewportWidth) || viewportWidth <= 0 ? 1000 : viewportWidth;
  const safeH = !isFinite(viewportHeight) || viewportHeight <= 0 ? 800 : viewportHeight;
  const isMobile = safeW < 480;

  const packWidth = Math.round(safeW * 1.4);
  const packHeight = Math.round(safeH * 1.4);
  const gap = isMobile ? 0 : 14;

  let rawRects: Rect[];
  if (isMobile) {
    rawRects = generateMobileMosaic(packWidth, packHeight, 3);
  } else {
    rawRects = splitMosaic(0, 0, packWidth, packHeight, 130, 100, 360, 280);
  }

  const halfPackW = packWidth / 2;
  const halfPackH = packHeight / 2;

  const cells: MosaicCell[] = rawRects.map((r, i) => {
    const sketch = sketches[i % sketches.length];
    const texAspect = ASPECT_RATIOS[sketch.aspectRatio] || 1.0;
    const cellW = Math.max(1, r.w - gap);
    const cellH = Math.max(1, r.h - gap);
    const { uRepeat, uOffset } = computeCoverUv(cellW, cellH, texAspect, 1.0);

    // Center coordinates relative to pack center
    const cx = r.x + r.w / 2 - halfPackW;
    const cy = r.y + r.h / 2 - halfPackH;

    return {
      id: `${sketch.id}-${i}`,
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
    };
  });

  return {
    cells,
    packWidth,
    packHeight,
    isMobile,
    cols: isMobile ? 3 : undefined,
  };
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
  );
}

/**
 * Validates that no two cells in the generated layout overlap.
 */
export function validateNoOverlaps(cells: { left: number; top: number; width: number; height: number }[]): {
  valid: boolean;
  overlaps: Array<[number, number]>;
} {
  const overlaps: Array<[number, number]> = [];
  for (let i = 0; i < cells.length; i++) {
    const r1: Rect = { x: cells[i].left, y: cells[i].top, w: cells[i].width, h: cells[i].height };
    for (let j = i + 1; j < cells.length; j++) {
      const r2: Rect = { x: cells[j].left, y: cells[j].top, w: cells[j].width, h: cells[j].height };
      if (checkRectOverlap(r1, r2)) {
        overlaps.push([i, j]);
      }
    }
  }
  return { valid: overlaps.length === 0, overlaps };
}
