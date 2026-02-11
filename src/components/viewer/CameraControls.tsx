'use client';

import { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraControlsProps {
  /** Half-diagonal of the pool+deck footprint — drives max zoom-out */
  worldRadius?: number;
  /** Y-position of the deck/ground plane — camera orbits around this height */
  targetHeight?: number;
}

/**
 * Camera orbit controls that auto-frame to show the pool with ~25% padding.
 * minDistance=0.05 allows zooming to within 5cm of the tile surface.
 * maxDistance is computed from the pool size so the world stays contained.
 * Orbits around the deck height to prevent floating appearance.
 */
export function CameraControls({ worldRadius = 10, targetHeight = 0 }: CameraControlsProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);
  const hasFramed = useRef(false);

  // Max distance: enough to see the full pool + deck + some grass
  const maxDist = Math.max(worldRadius * 2.2, 8);

  // Auto-frame the pool on first mount
  useEffect(() => {
    if (hasFramed.current) return;
    hasFramed.current = true;

    // Position camera to show the full pool from a 3/4 angle
    // Target is at deck height so pool appears grounded
    const dist = worldRadius * 1.6;
    camera.position.set(dist * 0.7, targetHeight + dist * 0.55, dist * 0.85);
    camera.lookAt(0, targetHeight, 0);
    camera.updateProjectionMatrix();
  }, [camera, worldRadius, targetHeight]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={0.05}
      maxDistance={maxDist}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.1}
      target={[0, targetHeight, 0]}
      makeDefault
    />
  );
}
