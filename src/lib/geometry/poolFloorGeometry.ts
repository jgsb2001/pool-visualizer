import * as THREE from 'three';
import type { PoolShape } from '@/types/pool';
import { generatePoolPerimeterPoints } from './perimeterPoints';

/**
 * Creates pool floor geometry with 30cm thickness to prevent seeing through.
 * Uses ExtrudeGeometry to create solid volume instead of flat plane.
 */
export function createPoolFloorGeometry(
  shape: PoolShape,
  length: number,
  width: number,
): THREE.BufferGeometry {
  const segments = 64;
  const effectiveLength = shape === 'circular' ? Math.min(length, width) : length;
  const effectiveWidth = shape === 'circular' ? Math.min(length, width) : width;

  let shape2D: THREE.Shape;

  if (shape === 'rectangle') {
    // Create rectangular shape
    shape2D = new THREE.Shape();
    shape2D.moveTo(-length / 2, -width / 2);
    shape2D.lineTo(length / 2, -width / 2);
    shape2D.lineTo(length / 2, width / 2);
    shape2D.lineTo(-length / 2, width / 2);
    shape2D.closePath();
  } else {
    // Create shape from perimeter points
    const points = generatePoolPerimeterPoints(
      shape,
      effectiveLength,
      effectiveWidth,
      segments,
    );
    shape2D = new THREE.Shape();
    shape2D.moveTo(points[0].x, points[0].z);
    for (let i = 1; i < points.length; i++) {
      shape2D.lineTo(points[i].x, points[i].z);
    }
    shape2D.closePath();
  }

  // Extrude shape downward by 30cm to create solid floor with thickness
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.3,
    bevelEnabled: false,
  };

  return new THREE.ExtrudeGeometry(shape2D, extrudeSettings);
}
