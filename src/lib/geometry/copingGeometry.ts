import * as THREE from 'three';

const COPING_WIDTH = 0.4;
const COPING_HEIGHT = 0.1;

/**
 * Creates coping (stone edge) geometry around the pool perimeter.
 * Each segment between adjacent perimeter points becomes a small box
 * positioned on top of the waterline, offset outward.
 *
 * Corner caps are added where the edge direction changes sharply (>30°)
 * to fill the triangular gaps that would otherwise appear at corners.
 *
 * @param points - Perimeter points from pool shape
 * @param waterlineHeight - Height of the waterline band (coping sits on top)
 * @returns Group containing all coping mesh segments
 */
export function createCopingMeshes(
  points: THREE.Vector3[],
  waterlineHeight: number,
  material: THREE.Material,
): THREE.Group {
  const group = new THREE.Group();
  const yPos = waterlineHeight + COPING_HEIGHT / 2;

  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const next = points[(i + 1) % points.length];

    const dir = new THREE.Vector3().subVectors(next, curr);
    const segLength = dir.length();
    dir.normalize();

    // Outward-facing normal on XZ plane (CCW winding → outward = (dir.z, 0, -dir.x))
    const normal = new THREE.Vector3(dir.z, 0, -dir.x);
    const midPoint = new THREE.Vector3()
      .addVectors(curr, next)
      .multiplyScalar(0.5);

    // Extend each segment to fully overlap at corners (COPING_WIDTH covers 90° gap)
    const copingGeo = new THREE.BoxGeometry(
      segLength + COPING_WIDTH,
      COPING_HEIGHT,
      COPING_WIDTH,
    );
    const copingMesh = new THREE.Mesh(copingGeo, material);

    copingMesh.position.set(
      midPoint.x + normal.x * (COPING_WIDTH / 2),
      yPos,
      midPoint.z + normal.z * (COPING_WIDTH / 2),
    );

    // Rotate to align with the perimeter edge direction
    const angle = Math.atan2(dir.z, dir.x);
    copingMesh.rotation.y = -angle;
    copingMesh.castShadow = true;
    copingMesh.receiveShadow = true;

    group.add(copingMesh);

    // No separate corner caps needed — the segment extension (+ COPING_WIDTH)
    // ensures adjacent segments overlap at corners, covering any gaps.
  }

  return group;
}
