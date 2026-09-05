/**
 * Contract resolver and dynamic loader.
 * Seamlessly resolves authoritative specification oracles and project implementation modules.
 * Enables progressive milestone testability (M0 oracle verification + M1-M5 implementation auditing).
 */

import * as mosaicOracle from '../oracles/mosaicOracle.ts';
import * as physicsOracle from '../oracles/physicsOracle.ts';
import * as shaderOracle from '../oracles/shaderOracle.ts';
import * as hudOracle from '../oracles/hudOracle.ts';
import { type SketchDef, SKETCH_CATALOG } from '../../../../components/playground/sketches.ts';

export interface ResolvedPlaygroundEngines {
  mosaic: typeof mosaicOracle;
  physics: typeof physicsOracle;
  shader: typeof shaderOracle;
  hud: typeof hudOracle;
  sketches: SketchDef[];
  isImplementationLoaded: {
    mosaic: boolean;
    physics: boolean;
    shader: boolean;
    hud: boolean;
  };
  implementationModules: {
    mosaicImpl: any;
    physicsImpl: any;
    shaderImpl: any;
    hudImpl: any;
  };
}

let cachedEngines: ResolvedPlaygroundEngines | null = null;

export async function resolveEngines(forceImpl = false): Promise<ResolvedPlaygroundEngines> {
  if (cachedEngines && !forceImpl) return cachedEngines;

  let mosaicImpl: any = null;
  let physicsImpl: any = null;
  let shaderImpl: any = null;
  let hudImpl: any = null;

  try {
    mosaicImpl = await import('../../../../lib/playground/mosaicLayout.ts');
  } catch {
    // Not present
  }

  try {
    physicsImpl = await import('../../../../lib/playground/momentumPhysics.ts');
  } catch {
    // Not present
  }

  try {
    shaderImpl = await import('../../../../components/playground/shaders/tileShader.ts');
  } catch {
    // Not present
  }

  try {
    hudImpl = await import('../../../../components/playground/PlaygroundHUD.tsx');
  } catch {
    // Not present
  }

  cachedEngines = {
    // Pure authoritative specification oracles
    mosaic: mosaicOracle,
    physics: physicsOracle,
    shader: shaderOracle,
    hud: hudOracle,
    sketches: SKETCH_CATALOG,
    isImplementationLoaded: {
      mosaic: Boolean(mosaicImpl?.generateMosaicLayout),
      physics: Boolean(physicsImpl?.createMomentumPhysics),
      shader: Boolean(shaderImpl?.TILE_VERTEX_SHADER),
      hud: Boolean(hudImpl?.PlaygroundHUD),
    },
    implementationModules: {
      mosaicImpl,
      physicsImpl,
      shaderImpl,
      hudImpl,
    },
  };

  return cachedEngines;
}
