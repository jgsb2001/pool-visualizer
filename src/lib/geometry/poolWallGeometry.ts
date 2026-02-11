import * as THREE from 'three';
import { calculateArcLengths } from './arcLength';

/**
 * Creates pool wall geometry below the waterline band.
 * Uses arc-length UV mapping (same approach as waterline) to prevent
 * texture stretching on curved wall sections.
 *
 * @param points - Perimeter points (reused from waterline geometry)
 * @param arcLengths - Pre-computed arc lengths at each point
 * @param totalLength - Total perimeter length
 * @param wallHeight - Height of the wall section (depth minus waterline height)
 * @param textureRepeatMeters - How many meters per texture repeat (for interior textures)
 */
export function createPoolWallGeometry(
  points: THREE.Vector3[],
  arcLengths: number[],
  totalLength: number,
  wallHeight: number,
  textureRepeatMeters: number = 1.0,
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= points.length; i++) {
    const idx = i % points.length;
    const point = points[idx];

    // Bottom vertex (at pool floor)
    vertices.push(point.x, -wallHeight, point.z);
    // Top vertex (at bottom of waterline band / Y=0)
    vertices.push(point.x, 0, point.z);

    // Arc-length based UVs to prevent stretching on curves
    const arcLen = i < points.length ? arcLengths[i] : totalLength;
    const u = arcLen / textureRepeatMeters;
    const v = wallHeight / textureRepeatMeters;

    uvs.push(u, 0);
    uvs.push(u, v);
  }

  for (let i = 0; i < points.length; i++) {
    const base = i * 2;
    const next = ((i + 1) % (points.length + 1)) * 2;

    indices.push(base, base + 1, next);
    indices.push(next, base + 1, next + 1);
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Convenience function that generates wall geometry from raw perimeter points.
 * Computes arc lengths internally if not provided.
 */
export function createPoolWallGeometryFromPoints(
  points: THREE.Vector3[],
  wallHeight: number,
  textureRepeatMeters: number = 1.0,
): THREE.BufferGeometry {
  const { arcLengths, totalLength } = calculateArcLengths(points);
  return createPoolWallGeometry(
    points,
    arcLengths,
    totalLength,
    wallHeight,
    textureRepeatMeters,
  );
}
