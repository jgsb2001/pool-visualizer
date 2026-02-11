import * as THREE from 'three';

/**
 * Compute tangent vectors for a BufferGeometry.
 * Tangents are required for normal mapping and parallax occlusion mapping.
 *
 * Uses the MikkTSpace algorithm (simplified version) which ensures
 * tangent-space calculations are consistent with texture baking tools.
 *
 * The tangent attribute has 4 components: (x, y, z, w)
 * - x, y, z: tangent direction in object space
 * - w: handedness (+1 or -1) for computing the bitangent
 */
export function computeTangents(geometry: THREE.BufferGeometry): void {
  const index = geometry.index;
  const attributes = geometry.attributes;

  if (!attributes.position || !attributes.normal || !attributes.uv) {
    console.warn('Geometry is missing required attributes for tangent computation');
    return;
  }

  const positions = attributes.position;
  const normals = attributes.normal;
  const uvs = attributes.uv;

  const nVertices = positions.count;

  if (!geometry.hasAttribute('tangent')) {
    geometry.setAttribute(
      'tangent',
      new THREE.BufferAttribute(new Float32Array(4 * nVertices), 4),
    );
  }

  const tangents = geometry.getAttribute('tangent');

  const tan1: THREE.Vector3[] = [];
  const tan2: THREE.Vector3[] = [];

  for (let i = 0; i < nVertices; i++) {
    tan1[i] = new THREE.Vector3();
    tan2[i] = new THREE.Vector3();
  }

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();

  const uvA = new THREE.Vector2();
  const uvB = new THREE.Vector2();
  const uvC = new THREE.Vector2();

  const sdir = new THREE.Vector3();
  const tdir = new THREE.Vector3();

  function handleTriangle(a: number, b: number, c: number) {
    vA.fromBufferAttribute(positions, a);
    vB.fromBufferAttribute(positions, b);
    vC.fromBufferAttribute(positions, c);

    uvA.fromBufferAttribute(uvs, a);
    uvB.fromBufferAttribute(uvs, b);
    uvC.fromBufferAttribute(uvs, c);

    const x1 = vB.x - vA.x;
    const x2 = vC.x - vA.x;
    const y1 = vB.y - vA.y;
    const y2 = vC.y - vA.y;
    const z1 = vB.z - vA.z;
    const z2 = vC.z - vA.z;

    const s1 = uvB.x - uvA.x;
    const s2 = uvC.x - uvA.x;
    const t1 = uvB.y - uvA.y;
    const t2 = uvC.y - uvA.y;

    const r = 1.0 / (s1 * t2 - s2 * t1);

    sdir.set(
      (t2 * x1 - t1 * x2) * r,
      (t2 * y1 - t1 * y2) * r,
      (t2 * z1 - t1 * z2) * r,
    );

    tdir.set(
      (s1 * x2 - s2 * x1) * r,
      (s1 * y2 - s2 * y1) * r,
      (s1 * z2 - s2 * z1) * r,
    );

    tan1[a].add(sdir);
    tan1[b].add(sdir);
    tan1[c].add(sdir);

    tan2[a].add(tdir);
    tan2[b].add(tdir);
    tan2[c].add(tdir);
  }

  if (index) {
    // Indexed geometry
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i + 0);
      const b = index.getX(i + 1);
      const c = index.getX(i + 2);
      handleTriangle(a, b, c);
    }
  } else {
    // Non-indexed geometry
    for (let i = 0; i < positions.count; i += 3) {
      handleTriangle(i + 0, i + 1, i + 2);
    }
  }

  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const n = new THREE.Vector3();

  function setTangent(i: number) {
    n.fromBufferAttribute(normals, i);
    const t = tan1[i];

    // Gram-Schmidt orthogonalize
    tmp.copy(t);
    tmp.sub(n.multiplyScalar(n.dot(t))).normalize();

    // Calculate handedness
    tmp2.crossVectors(n, t);
    const test = tmp2.dot(tan2[i]);
    const w = test < 0.0 ? -1.0 : 1.0;

    tangents.setXYZW(i, tmp.x, tmp.y, tmp.z, w);
  }

  for (let i = 0; i < nVertices; i++) {
    setTangent(i);
  }
}
