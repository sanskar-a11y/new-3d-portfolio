import * as THREE from 'three'

export interface CatHeadGeometries {
  headGeometry: THREE.BufferGeometry
  wireframeGeometry: THREE.EdgesGeometry
  whiskerEdgesGeometry: THREE.BufferGeometry
  eyeballGeometry: THREE.BufferGeometry
}

/**
 * Procedurally sculpts an advanced 3D cyber cat head geometry.
 * Uses only core THREE.js APIs (no examples/jsm imports) for maximum compatibility.
 */
export function createAdvancedCatHeadGeometry(scaleFactor = 0.92): CatHeadGeometries {
  // 1. BASE CRANIUM — Detail 3 for crisp, bold, low-poly origami/diamond facets
  const baseHead = new THREE.IcosahedronGeometry(1.45, 3)
  const posAttr = baseHead.attributes.position as THREE.BufferAttribute
  const vertex = new THREE.Vector3()
  const normal = new THREE.Vector3()

  const leftEyeCenter = new THREE.Vector3(-0.54, 0.22, 1.18)
  const rightEyeCenter = new THREE.Vector3(0.54, 0.22, 1.18)
  const eyeSlantCos = Math.cos(0.314)
  const eyeSlantSin = Math.sin(0.314)

  for (let i = 0; i < posAttr.count; i++) {
    vertex.fromBufferAttribute(posAttr, i)
    normal.copy(vertex).normalize()

    const x = vertex.x
    const y = vertex.y
    const z = vertex.z

    // A. Sharp Angular Cheekbone Extrusion (Edgy & Defined)
    const cheekWeight = Math.exp(-Math.pow(y + 0.12, 2) / 0.06 - Math.pow(z - 0.35, 2) / 0.15)
    if (cheekWeight > 0.001) {
      vertex.x += Math.sign(x) * 0.36 * cheekWeight
      vertex.z += 0.14 * cheekWeight
    }

    // B. Sharp Jaw & Chin Tapering
    if (y < -0.28) {
      const taper = 1.0 - 0.45 * Math.pow(Math.abs(-0.28 - y) / 1.1, 1.3)
      vertex.x *= Math.max(0.25, taper)
      vertex.z *= Math.max(0.25, taper)
      if (y > -0.8 && z > 0) {
        vertex.z += Math.sin(((y + 0.8) / 0.52) * Math.PI) * 0.12
      }
    }

    // C. Forward Muzzle Extrusion (Sharp triangular profile, not round)
    if (z > 0) {
      const smoothZ = z < 0.8 ? (z + 0.2) / 1.0 : 1.0
      const muzzleWeight = Math.exp(-Math.pow(x, 2) / 0.18 - Math.pow(y + 0.18, 2) / 0.12) * Math.max(0, Math.min(1, smoothZ))
      vertex.z += 0.52 * muzzleWeight

      const leftPadDist = Math.sqrt(Math.pow(x + 0.32, 2) + Math.pow(y + 0.22, 2) + Math.pow(z - 1.35, 2))
      const rightPadDist = Math.sqrt(Math.pow(x - 0.32, 2) + Math.pow(y + 0.22, 2) + Math.pow(z - 1.35, 2))
      const padBump = 0.18 * (Math.exp(-Math.pow(leftPadDist, 2) / 0.03) + Math.exp(-Math.pow(rightPadDist, 2) / 0.03))
      vertex.z += padBump
    }

    // D. Almond Eye Socket Carving
    const isLeftEye = x < 0
    const eyeCenter = isLeftEye ? leftEyeCenter : rightEyeCenter
    const dx = Math.abs(x) - Math.abs(eyeCenter.x)
    const dy = y - eyeCenter.y
    const u = dx * eyeSlantCos - dy * eyeSlantSin
    const v = dx * eyeSlantSin + dy * eyeSlantCos

    const a = 0.28
    const b = 0.14
    const asymFactor = 1.0 - 0.25 * Math.sign(u)
    const rAlmond = Math.sqrt(Math.pow(u / a, 2) + Math.pow(v / (b * Math.max(0.1, asymFactor)), 2))

    if (z > 0.4 && rAlmond < 1.45) {
      if (rAlmond < 1.0) {
        const depth = -0.14 * (1.0 - Math.pow(rAlmond, 2))
        vertex.addScaledVector(normal, depth)
      } else {
        const rimElev = 0.09 * Math.sin((Math.PI * (rAlmond - 1.0)) / 0.45)
        vertex.addScaledVector(normal, rimElev)
      }
    }

    posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }
  baseHead.computeVertexNormals()

  // 2. EDGY ORIGAMI SCULPTED EARS (Large, bold 4-sided geometric pyramids)
  function createSculptedEar(isRight: boolean): THREE.BufferGeometry {
    const ear = new THREE.ConeGeometry(0.78, 1.75, 4, 1, false)
    const earPos = ear.attributes.position as THREE.BufferAttribute
    const v = new THREE.Vector3()

    for (let i = 0; i < earPos.count; i++) {
      v.fromBufferAttribute(earPos, i)
      const t = Math.max(0, Math.min(1, (v.y + 0.875) / 1.75))

      v.z -= 0.45 * Math.pow(t, 2)
      v.x += (isRight ? 1 : -1) * 0.32 * Math.pow(t, 1.4)

      if (v.z > 0) {
        const smoothVal = v.z < 0.4 ? (v.z + 0.05) / 0.45 : 1.0
        const cavity = Math.sin(Math.PI * t) * Math.max(0, Math.min(1, smoothVal))
        v.z -= 0.35 * cavity
      }

      earPos.setXYZ(i, v.x, v.y, v.z)
    }
    ear.computeVertexNormals()

    ear.rotateY(Math.PI / 4) // Rotate 4-sided pyramid so a flat diamond triangle faces front
    ear.rotateX(Math.PI / 13)
    ear.rotateZ(isRight ? -Math.PI / 10 : Math.PI / 10)
    ear.rotateY(isRight ? -Math.PI / 18 : Math.PI / 18)
    ear.translate(isRight ? 0.95 : -0.95, 1.45, -0.05)
    return ear
  }

  const leftEarGeo = createSculptedEar(false)
  const rightEarGeo = createSculptedEar(true)

  // 3. NOSE
  const noseGeo = new THREE.ConeGeometry(0.22, 0.36, 3)
  noseGeo.rotateY(Math.PI)
  noseGeo.rotateX(Math.PI / 2.2)
  noseGeo.translate(0, -0.14, 1.54)

  // 4. EYEBALLS
  const leftEyeGeo = new THREE.SphereGeometry(0.19, 16, 16)
  leftEyeGeo.scale(1.1, 0.92, 0.85)
  leftEyeGeo.rotateZ(Math.PI / 10)
  leftEyeGeo.translate(-0.54, 0.22, 1.15)

  const rightEyeGeo = new THREE.SphereGeometry(0.19, 16, 16)
  rightEyeGeo.scale(1.1, 0.92, 0.85)
  rightEyeGeo.rotateZ(-Math.PI / 10)
  rightEyeGeo.translate(0.54, 0.22, 1.15)

  // 5. MANUAL MERGE (no mergeGeometries import needed)
  function manualMerge(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    // Convert all to non-indexed first
    const nonIndexed = geometries.map(g => g.index ? g.toNonIndexed() : g)
    
    let totalVerts = 0
    for (const g of nonIndexed) {
      totalVerts += g.attributes.position.count
    }

    const positions = new Float32Array(totalVerts * 3)
    const normals = new Float32Array(totalVerts * 3)
    let offset = 0

    for (const g of nonIndexed) {
      const pos = g.attributes.position as THREE.BufferAttribute
      const norm = g.attributes.normal as THREE.BufferAttribute
      for (let i = 0; i < pos.count; i++) {
        positions[offset * 3 + 0] = pos.getX(i)
        positions[offset * 3 + 1] = pos.getY(i)
        positions[offset * 3 + 2] = pos.getZ(i)
        if (norm) {
          normals[offset * 3 + 0] = norm.getX(i)
          normals[offset * 3 + 1] = norm.getY(i)
          normals[offset * 3 + 2] = norm.getZ(i)
        }
        offset++
      }
    }

    const merged = new THREE.BufferGeometry()
    merged.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
    return merged
  }

  const mergedEyeballs = manualMerge([leftEyeGeo, rightEyeGeo])
  const mergedHead = manualMerge([baseHead, leftEarGeo, rightEarGeo, noseGeo])
  const finalHeadGeo = mergedHead.toNonIndexed()
  finalHeadGeo.computeVertexNormals()

  if (scaleFactor !== 1.0) {
    finalHeadGeo.scale(scaleFactor, scaleFactor, scaleFactor)
    mergedEyeballs.scale(scaleFactor, scaleFactor, scaleFactor)
  }

  const wireframeGeo = new THREE.EdgesGeometry(finalHeadGeo, 15)

  // 6. WHISKERS (Cubic Bézier Curves)
  const whiskerPoints: number[] = []

  function addWhiskerCurve(p0: number[], p1: number[], p2: number[], p3: number[]) {
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(p0[0], p0[1], p0[2]).multiplyScalar(scaleFactor),
      new THREE.Vector3(p1[0], p1[1], p1[2]).multiplyScalar(scaleFactor),
      new THREE.Vector3(p2[0], p2[1], p2[2]).multiplyScalar(scaleFactor),
      new THREE.Vector3(p3[0], p3[1], p3[2]).multiplyScalar(scaleFactor)
    )
    const pts = curve.getPoints(12)
    for (let i = 0; i < pts.length - 1; i++) {
      whiskerPoints.push(pts[i].x, pts[i].y, pts[i].z)
      whiskerPoints.push(pts[i + 1].x, pts[i + 1].y, pts[i + 1].z)
    }
  }

  const sides = [-1, 1]
  sides.forEach((side) => {
    const s = side
    addWhiskerCurve([0.35 * s, -0.12, 1.38], [0.85 * s, -0.05, 1.55], [1.9 * s, -0.1, 0.8], [2.7 * s, -0.2, 0.1])
    addWhiskerCurve([0.38 * s, -0.16, 1.36], [0.95 * s, -0.1, 1.52], [2.1 * s, -0.18, 0.7], [2.9 * s, -0.32, -0.05])
    addWhiskerCurve([0.4 * s, -0.2, 1.34], [1.05 * s, -0.15, 1.48], [2.3 * s, -0.25, 0.6], [3.1 * s, -0.45, -0.2])

    addWhiskerCurve([0.34 * s, -0.24, 1.33], [0.9 * s, -0.22, 1.45], [2.0 * s, -0.35, 0.55], [2.85 * s, -0.55, -0.15])
    addWhiskerCurve([0.36 * s, -0.28, 1.31], [1.0 * s, -0.28, 1.42], [2.2 * s, -0.45, 0.45], [3.05 * s, -0.68, -0.3])
    addWhiskerCurve([0.38 * s, -0.32, 1.29], [1.1 * s, -0.34, 1.38], [2.35 * s, -0.55, 0.35], [3.2 * s, -0.82, -0.45])

    addWhiskerCurve([0.48 * s, 0.45, 1.08], [0.75 * s, 0.75, 1.2], [1.3 * s, 1.1, 0.85], [1.75 * s, 1.35, 0.35])
    addWhiskerCurve([0.52 * s, 0.48, 1.05], [0.85 * s, 0.82, 1.15], [1.45 * s, 1.2, 0.75], [1.95 * s, 1.48, 0.2])
  })

  const whiskerGeo = new THREE.BufferGeometry()
  whiskerGeo.setAttribute('position', new THREE.Float32BufferAttribute(whiskerPoints, 3))

  return {
    headGeometry: finalHeadGeo,
    wireframeGeometry: wireframeGeo,
    whiskerEdgesGeometry: whiskerGeo,
    eyeballGeometry: mergedEyeballs,
  }
}
