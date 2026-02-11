import * as THREE from 'three';

export interface ArcLengthResult {
  /** Cumulative arc length at each point index (starting at 0) */
  arcLengths: number[];
  /** Total perimeter length (includes closing segment back to first point) */
  totalLength: number;
}

/**
 * Computes cumulative arc lengths along a closed loop of perimeter points.
 * This is the foundation for arc-length UV mapping, which ensures tiles
 * maintain consistent size regardless of surface curvature.
 *
 * @param points - Ordered perimeter points forming a closed loop
 * @returns Arc lengths at each point index and total perimeter length
 */
export function calculateArcLengths(points: THREE.Vector3[]): ArcLengthResult {
  const arcLengths: number[] = [0];
  let totalLength = 0;

  for (let i = 1; i < points.length; i++) {
    const dist = points[i].distanceTo(points[i - 1]);
    totalLength += dist;
    arcLengths.push(totalLength);
  }

  // Add distance for the closing segment (last point back to first)
  const closingDist = points[0].distanceTo(points[points.length - 1]);
  totalLength += closingDist;

  return { arcLengths, totalLength };
}
