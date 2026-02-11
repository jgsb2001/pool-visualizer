import * as THREE from 'three';
import type { PoolShape } from '@/types/pool';
import { generatePoolPerimeterPoints } from './perimeterPoints';
import { calculateArcLengths } from './arcLength';
import { PERIMETER_SEGMENTS, REPEATING_STRIP_TILE_COUNT } from '@/lib/constants';

export interface WaterlineGeometryResult {
  geometry: THREE.BufferGeometry;
  /** Number of tiles that fit around the perimeter */
  tilesAround: number;
  /** Total perimeter length in meters */
  totalLength: number;
  /** The perimeter points used (for wall/coping reuse) */
  perimeterPoints: THREE.Vector3[];
  /** Arc lengths at each point */
  arcLengths: number[];
}

/**
 * Creates the waterline band geometry with arc-length-based UV mapping.
 *
 * UV mapping: u = arcLength / (tileWidth * stripTileCount). One full
 * texture strip (32 tiles) maps to u=[0,1]. RepeatWrapping tiles it
 * naturally around the pool. This keeps tiles square and proportional.
 *
 * The band faces INWARD (visible from inside the pool) with normals
 * pointing toward the pool center for correct lighting.
 */
export function createWaterlineGeometry(
  shape: PoolShape,
  length: number,
  width: number,
  tileWidthMeters: number,
  tileHeightMeters: number,
): WaterlineGeometryResult {
  const points = generatePoolPerimeterPoints(
    shape,
    length,
    width,
    PERIMETER_SEGMENTS,
  );
  const { arcLengths, totalLength } = calculateArcLengths(points);

  const tilesAround = Math.ceil(totalLength / tileWidthMeters);
  const bandHeight = tileHeightMeters;
  const stripWidthMeters = tileWidthMeters * REPEATING_STRIP_TILE_COUNT;

  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= points.length; i++) {
    const idx = i % points.length;
    const point = points[idx];

    const nextIdx = (idx + 1) % points.length;
    const nextPoint = points[nextIdx];

    const dir = new THREE.Vector3()
      .subVectors(nextPoint, point)
      .normalize();

    // Inward normal (toward pool center)
    // Perimeter points go CCW viewed from above, so inward = (-dir.z, 0, dir.x)
    const nx = -dir.z;
    const nz = dir.x;

    // Offset inward so tile band is clearly visible below the coping lip.
    // Coping inner edge sits at the perimeter, so we push tiles inward
    // enough to avoid z-fighting and to be visible from typical view angles.
    const offset = 0.01;

    // Bottom vertex (at Y=0)
    vertices.push(
      point.x + nx * offset,
      0,
      point.z + nz * offset,
    );
    normals.push(nx, 0, nz);

    // Top vertex (at Y=bandHeight)
    vertices.push(
      point.x + nx * offset,
      bandHeight,
      point.z + nz * offset,
    );
    normals.push(nx, 0, nz);

    // UV: u maps one full texture strip (REPEATING_STRIP_TILE_COUNT tiles)
    // to one unit, so the texture wraps naturally via RepeatWrapping.
    // u = arcLength / (tileWidth * stripCount) means tile N maps to u = N/stripCount.
    const arcLen = i < points.length ? arcLengths[i] : totalLength;
    const u = arcLen / stripWidthMeters;

    uvs.push(u, 0);
    uvs.push(u, 1);
  }

  // Triangle indices — winding for inward-facing front face
  for (let i = 0; i < points.length; i++) {
    const base = i * 2;
    const next = ((i + 1) % (points.length + 1)) * 2;

    indices.push(base, next, base + 1);
    indices.push(next, next + 1, base + 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setAttribute(
    'normal',
    new THREE.Float32BufferAttribute(normals, 3),
  );
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  return {
    geometry,
    tilesAround,
    totalLength,
    perimeterPoints: points,
    arcLengths,
  };
}
