'use client';

import { usePoolStore } from '@/hooks/usePoolStore';

interface PoolLightsProps {
  enabled: boolean;
}

/**
 * Underwater pool lights for night mode.
 * 4 point lights positioned around the pool interior,
 * simulating built-in LED pool lighting.
 */
export function PoolLights({ enabled }: PoolLightsProps) {
  const dimensions = usePoolStore((s) => s.dimensions);

  if (!enabled) return null;

  const { lengthMeters, widthMeters, depthMeters } = dimensions;
  const lightY = -depthMeters * 0.3;
  const intensity = 3.0;
  const lightColor = '#4fc3f7';
  const distance = Math.max(lengthMeters, widthMeters) * 1.5;

  // Position lights at 4 cardinal points inside the pool walls
  const positions: [number, number, number][] = [
    [lengthMeters * 0.35, lightY, 0],
    [-lengthMeters * 0.35, lightY, 0],
    [0, lightY, widthMeters * 0.35],
    [0, lightY, -widthMeters * 0.35],
  ];

  return (
    <group>
      {positions.map((pos, i) => (
        <pointLight
          key={i}
          position={pos}
          intensity={intensity}
          color={lightColor}
          distance={distance}
          decay={2}
        />
      ))}
    </group>
  );
}
