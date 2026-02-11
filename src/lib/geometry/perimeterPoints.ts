import * as THREE from 'three';
import type { PoolShape } from '@/types/pool';

/**
 * Generates perimeter points for a given pool shape.
 * Points lie on the XZ plane at Y=0 and form a closed loop (first point is NOT duplicated at end).
 *
 * @param shape - Pool shape type
 * @param length - Pool length in meters (X axis)
 * @param width - Pool width in meters (Z axis)
 * @param segments - Number of perimeter sample points (higher = smoother curves)
 * @returns Array of Vector3 points on the XZ plane
 */
export function generatePoolPerimeterPoints(
  shape: PoolShape,
  length: number,
  width: number,
  segments: number,
): THREE.Vector3[] {
  switch (shape) {
    case 'rectangle':
      return generateRectanglePoints(length, width, segments);
    case 'oval':
      return generateOvalPoints(length, width, segments);
    case 'circular':
      return generateOvalPoints(
        Math.min(length, width),
        Math.min(length, width),
        segments,
      );
    case 'jellybean':
      return generateJellybeanPoints(length, width, segments);
    default:
      return generateRectanglePoints(length, width, segments);
  }
}

function generateRectanglePoints(
  length: number,
  width: number,
  segments: number,
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const segPerSide = Math.floor(segments / 4);

  // Bottom edge (negative Z)
  for (let i = 0; i <= segPerSide; i++) {
    points.push(
      new THREE.Vector3(
        -length / 2 + (length * i) / segPerSide,
        0,
        -width / 2,
      ),
    );
  }
  // Right edge (positive X)
  for (let i = 1; i <= segPerSide; i++) {
    points.push(
      new THREE.Vector3(
        length / 2,
        0,
        -width / 2 + (width * i) / segPerSide,
      ),
    );
  }
  // Top edge (positive Z)
  for (let i = 1; i <= segPerSide; i++) {
    points.push(
      new THREE.Vector3(
        length / 2 - (length * i) / segPerSide,
        0,
        width / 2,
      ),
    );
  }
  // Left edge (negative X)
  for (let i = 1; i < segPerSide; i++) {
    points.push(
      new THREE.Vector3(
        -length / 2,
        0,
        width / 2 - (width * i) / segPerSide,
      ),
    );
  }

  return points;
}

function generateOvalPoints(
  length: number,
  width: number,
  segments: number,
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const a = length / 2; // semi-major axis
  const b = width / 2; // semi-minor axis

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(a * Math.cos(angle), 0, b * Math.sin(angle)));
  }

  return points;
}

function generateJellybeanPoints(
  length: number,
  width: number,
  segments: number,
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const bigRadius = width / 2;
  const smallRadius = width / 3;
  const bodyLength = length - bigRadius - smallRadius;

  const halfSegs = Math.floor(segments / 2);
  const quarterSegs = Math.floor(segments / 4);

  // Left semicircle (larger)
  for (let i = 0; i <= halfSegs; i++) {
    const angle = Math.PI / 2 + (i / halfSegs) * Math.PI;
    points.push(
      new THREE.Vector3(
        -bodyLength / 2 + bigRadius * Math.cos(angle),
        0,
        bigRadius * Math.sin(angle),
      ),
    );
  }

  // Bottom curve connecting to right side (kidney indent)
  const curveDepth = width * 0.15;
  for (let i = 1; i < quarterSegs; i++) {
    const t = i / quarterSegs;
    const x = -bodyLength / 2 + t * bodyLength;
    // Quadratic bezier for the indent
    const indent = 4 * t * (1 - t) * curveDepth;
    points.push(
      new THREE.Vector3(
        x,
        0,
        -bigRadius + (bigRadius - smallRadius) * t + indent,
      ),
    );
  }

  // Right semicircle (smaller)
  for (let i = 0; i <= halfSegs; i++) {
    const angle = -Math.PI / 2 + (i / halfSegs) * Math.PI;
    points.push(
      new THREE.Vector3(
        bodyLength / 2 + smallRadius * Math.cos(angle),
        0,
        smallRadius * Math.sin(angle),
      ),
    );
  }

  // Top curve connecting back to left side
  for (let i = 1; i < quarterSegs; i++) {
    const t = i / quarterSegs;
    const x = bodyLength / 2 - t * bodyLength;
    const bulge = 4 * t * (1 - t) * curveDepth * 0.5;
    points.push(
      new THREE.Vector3(
        x,
        0,
        smallRadius + (bigRadius - smallRadius) * t + bulge,
      ),
    );
  }

  return points;
}
