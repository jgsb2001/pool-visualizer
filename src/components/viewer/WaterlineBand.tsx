'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { PoolShape } from '@/types/pool';
import { createWaterlineGeometry } from '@/lib/geometry/waterlineGeometry';
import { INCHES_TO_METERS } from '@/lib/constants';

export interface WaterlineMetadata {
  tilesAround: number;
  totalLength: number;
  perimeterPoints: THREE.Vector3[];
  arcLengths: number[];
  tileHeightMeters: number;
}

interface WaterlineBandProps {
  shape: PoolShape;
  length: number;
  width: number;
  tileWidthInches: number;
  tileHeightInches: number;
  tileTexture?: THREE.Texture | null;
  normalMap?: THREE.Texture | null;
  roughnessMap?: THREE.Texture | null;
  aoMap?: THREE.Texture | null;
  onGeometryCreated?: (data: WaterlineMetadata) => void;
}

/**
 * The waterline tile band — the primary visual element.
 * Uses arc-length UV mapping to guarantee tiles remain proportionally
 * correct (square tiles stay square) regardless of pool curvature.
 * When PBR maps are available, applies normal/roughness/AO for
 * physically accurate surface detail.
 */
export function WaterlineBand({
  shape,
  length,
  width,
  tileWidthInches,
  tileHeightInches,
  tileTexture,
  normalMap,
  roughnessMap,
  aoMap,
  onGeometryCreated,
}: WaterlineBandProps) {
  const tileWidthMeters = tileWidthInches * INCHES_TO_METERS;
  const tileHeightMeters = tileHeightInches * INCHES_TO_METERS;
  const callbackRef = useRef(onGeometryCreated);
  callbackRef.current = onGeometryCreated;

  const geometryResult = useMemo(() => {
    return createWaterlineGeometry(
      shape,
      length,
      width,
      tileWidthMeters,
      tileHeightMeters,
    );
  }, [shape, length, width, tileWidthMeters, tileHeightMeters]);

  // Fire the callback in useEffect (after render) to avoid setState-during-render
  useEffect(() => {
    callbackRef.current?.({
      tilesAround: geometryResult.tilesAround,
      totalLength: geometryResult.totalLength,
      perimeterPoints: geometryResult.perimeterPoints,
      arcLengths: geometryResult.arcLengths,
      tileHeightMeters,
    });
  }, [geometryResult, tileHeightMeters]);

  return (
    <mesh geometry={geometryResult.geometry}>
      <meshStandardMaterial
        key={`${tileTexture ? 'textured' : 'plain'}-${normalMap ? 'pbr' : 'flat'}`}
        map={tileTexture ?? null}
        normalMap={normalMap ?? undefined}
        normalScale={normalMap ? new THREE.Vector2(0.8, 0.8) : undefined}
        roughnessMap={roughnessMap ?? undefined}
        roughness={roughnessMap ? 1.0 : 0.3}
        aoMap={aoMap ?? undefined}
        aoMapIntensity={aoMap ? 0.6 : 0}
        color={tileTexture ? 0xffffff : 0xe0e0e0}
        metalness={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
