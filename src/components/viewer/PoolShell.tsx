'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { PoolShape } from '@/types/pool';
import { createPoolFloorGeometry } from '@/lib/geometry/poolFloorGeometry';
import { createPoolWallGeometry } from '@/lib/geometry/poolWallGeometry';
import { createCopingMeshes } from '@/lib/geometry/copingGeometry';
import { INCHES_TO_METERS } from '@/lib/constants';

interface PoolShellProps {
  shape: PoolShape;
  length: number;
  width: number;
  depth: number;
  tileHeightInches: number;
  perimeterPoints?: THREE.Vector3[];
  arcLengths?: number[];
  totalLength?: number;
  interiorTexture?: THREE.Texture | null;
}

/**
 * Load real PBR marble textures for coping from public/textures/coping/.
 * Uses photoscanned marble from Poly Haven (CC0 licensed).
 * Returns a MeshStandardMaterial with full PBR maps.
 */
function createCopingMaterial(): THREE.MeshStandardMaterial {
  const loader = new THREE.TextureLoader();

  const configure = (tex: THREE.Texture, isSRGB: boolean): THREE.Texture => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    if (isSRGB) {
      tex.colorSpace = THREE.SRGBColorSpace;
    }
    tex.anisotropy = 16;
    return tex;
  };

  return new THREE.MeshStandardMaterial({
    map: configure(loader.load('/textures/coping/diff.jpg'), true),
    normalMap: configure(loader.load('/textures/coping/nor_gl.jpg'), false),
    normalScale: new THREE.Vector2(1.0, 1.0),
    roughnessMap: configure(loader.load('/textures/coping/rough.jpg'), false),
    roughness: 1.0,
    aoMap: configure(loader.load('/textures/coping/ao.jpg'), false),
    aoMapIntensity: 0.6,
    metalness: 0.0,
    envMapIntensity: 0.6,
  });
}

const copingMaterial = createCopingMaterial();

/**
 * Pool structural elements: floor, walls (below waterline), and coping (stone edge).
 * All use PBR materials with physically plausible roughness/metalness values.
 * When an interior texture is provided, it's applied to both floor and walls.
 */
export function PoolShell({
  shape,
  length,
  width,
  depth,
  tileHeightInches,
  perimeterPoints,
  arcLengths,
  totalLength,
  interiorTexture,
}: PoolShellProps) {
  const waterlineHeight = tileHeightInches * INCHES_TO_METERS;
  const wallHeight = depth - waterlineHeight;

  const floorGeometry = useMemo(
    () => createPoolFloorGeometry(shape, length, width),
    [shape, length, width],
  );

  const wallGeometry = useMemo(() => {
    if (!perimeterPoints || !arcLengths || totalLength === undefined) return null;
    return createPoolWallGeometry(
      perimeterPoints,
      arcLengths,
      totalLength,
      wallHeight,
    );
  }, [perimeterPoints, arcLengths, totalLength, wallHeight]);

  const copingGroup = useMemo(() => {
    if (!perimeterPoints) return null;
    return createCopingMeshes(perimeterPoints, waterlineHeight, copingMaterial);
  }, [perimeterPoints, waterlineHeight]);

  // Configure interior texture repeat for consistent texel density
  const floorMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: interiorTexture ? 0xffffff : 0x4a90a4,
      roughness: 0.8,
      metalness: 0.0,
      side: THREE.DoubleSide, // Render both sides of extruded geometry
    });
    if (interiorTexture) {
      const floorTex = interiorTexture.clone();
      // Repeat at ~1 meter per texture tile for consistent density
      floorTex.repeat.set(length, width);
      floorTex.needsUpdate = true;
      mat.map = floorTex;
    }
    return mat;
  }, [interiorTexture, length, width]);

  const wallMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: interiorTexture ? 0xffffff : 0x5aa5ba,
      roughness: 0.7,
      metalness: 0.0,
      side: THREE.FrontSide,
    });
    if (interiorTexture) {
      const wallTex = interiorTexture.clone();
      wallTex.needsUpdate = true;
      mat.map = wallTex;
    }
    return mat;
  }, [interiorTexture]);

  return (
    <group>
      {/* Pool floor - now with 30cm thickness from ExtrudeGeometry */}
      <mesh
        geometry={floorGeometry}
        material={floorMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -depth, 0]}
      />

      {/* Pool walls below waterline */}
      {wallGeometry && (
        <mesh
          geometry={wallGeometry}
          material={wallMaterial}
          position={[0, 0, 0]}
        />
      )}

      {/* Coping (stone edge) */}
      {copingGroup && <primitive object={copingGroup} />}
    </group>
  );
}
