'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface BackyardEnclosureProps {
  poolLength: number;
  poolWidth: number;
  deckHeight: number;
}

/**
 * Backyard enclosure with fencing, walls, and contained environment.
 * Creates a realistic suburban backyard setting like GTA V reference.
 */
export function BackyardEnclosure({ poolLength, poolWidth, deckHeight }: BackyardEnclosureProps) {
  // Calculate backyard dimensions (pool + deck + extra space)
  const yardLength = poolLength + 8; // 4m on each side
  const yardWidth = poolWidth + 8;

  // Load grass texture for ground plane
  const grassTextures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const configure = (tex: THREE.Texture, isSRGB: boolean) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      if (isSRGB) tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 16;
      // Scale texture to look natural on grass
      tex.repeat.set(yardLength * 0.5, yardWidth * 0.5);
      return tex;
    };

    return {
      diffuse: configure(loader.load('/textures/grass/diff.jpg'), true),
      normal: configure(loader.load('/textures/grass/nor_gl.jpg'), false),
      roughness: configure(loader.load('/textures/grass/rough.jpg'), false),
      ao: configure(loader.load('/textures/grass/ao.jpg'), false),
    };
  }, [yardLength, yardWidth]);

  // Load deck texture for fence posts
  const deckTextures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const configure = (tex: THREE.Texture, isSRGB: boolean) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      if (isSRGB) tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 16;
      return tex;
    };

    return {
      diffuse: configure(loader.load('/textures/deck/diff.jpg'), true),
      normal: configure(loader.load('/textures/deck/nor_gl.jpg'), false),
      roughness: configure(loader.load('/textures/deck/rough.jpg'), false),
    };
  }, []);

  // Fence/wall materials
  const fenceMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4c4a8,
    roughness: 0.85,
    metalness: 0.0,
    envMapIntensity: 0.3,
  });

  const woodPostMaterial = new THREE.MeshStandardMaterial({
    map: deckTextures.diffuse,
    normalMap: deckTextures.normal,
    roughnessMap: deckTextures.roughness,
    roughness: 0.8,
    metalness: 0.0,
    envMapIntensity: 0.4,
    color: 0x9b7653,
  });

  // House wall material (behind pool)
  const houseMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8dcc8,
    roughness: 0.9,
    metalness: 0.0,
    envMapIntensity: 0.2,
  });

  return (
    <group>
      {/* Left fence - vertical board fence */}
      <group position={[-yardLength / 2, deckHeight, 0]}>
        {/* Fence posts */}
        {Array.from({ length: 6 }).map((_, i) => {
          const z = -yardWidth / 2 + (i / 5) * yardWidth;
          return (
            <mesh key={i} position={[0, 1.2, z]} castShadow receiveShadow>
              <boxGeometry args={[0.12, 2.4, 0.12]} />
              <meshStandardMaterial {...woodPostMaterial} />
            </mesh>
          );
        })}
        {/* Fence boards */}
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.06, 2.0, yardWidth - 0.2]} />
          <meshStandardMaterial {...fenceMaterial} />
        </mesh>
        {/* Top rail */}
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.15, yardWidth]} />
          <meshStandardMaterial {...woodPostMaterial} />
        </mesh>
      </group>

      {/* Right fence */}
      <group position={[yardLength / 2, deckHeight, 0]}>
        {/* Fence posts */}
        {Array.from({ length: 6 }).map((_, i) => {
          const z = -yardWidth / 2 + (i / 5) * yardWidth;
          return (
            <mesh key={i} position={[0, 1.2, z]} castShadow receiveShadow>
              <boxGeometry args={[0.12, 2.4, 0.12]} />
              <meshStandardMaterial {...woodPostMaterial} />
            </mesh>
          );
        })}
        {/* Fence boards */}
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.06, 2.0, yardWidth - 0.2]} />
          <meshStandardMaterial {...fenceMaterial} />
        </mesh>
        {/* Top rail */}
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.15, yardWidth]} />
          <meshStandardMaterial {...woodPostMaterial} />
        </mesh>
      </group>

      {/* Front fence (partial - gate area) */}
      <group position={[0, deckHeight, yardWidth / 2]}>
        {/* Left section */}
        <group position={[-yardLength / 4, 0, 0]}>
          {/* Posts */}
          {Array.from({ length: 3 }).map((_, i) => {
            const x = -yardLength / 4 + (i / 2) * (yardLength / 2);
            return (
              <mesh key={i} position={[x, 1.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.12, 2.4, 0.12]} />
                <meshStandardMaterial {...woodPostMaterial} />
              </mesh>
            );
          })}
          {/* Boards */}
          <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[yardLength / 2 - 0.2, 2.0, 0.06]} />
            <meshStandardMaterial {...fenceMaterial} />
          </mesh>
          {/* Top rail */}
          <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[yardLength / 2, 0.15, 0.1]} />
            <meshStandardMaterial {...woodPostMaterial} />
          </mesh>
        </group>

        {/* Right section */}
        <group position={[yardLength / 4, 0, 0]}>
          {/* Posts */}
          {Array.from({ length: 3 }).map((_, i) => {
            const x = -yardLength / 4 + (i / 2) * (yardLength / 2);
            return (
              <mesh key={i} position={[x, 1.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.12, 2.4, 0.12]} />
                <meshStandardMaterial {...woodPostMaterial} />
              </mesh>
            );
          })}
          {/* Boards */}
          <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[yardLength / 2 - 0.2, 2.0, 0.06]} />
            <meshStandardMaterial {...fenceMaterial} />
          </mesh>
          {/* Top rail */}
          <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[yardLength / 2, 0.15, 0.1]} />
            <meshStandardMaterial {...woodPostMaterial} />
          </mesh>
        </group>
      </group>

      {/* Contained grass ground with HDRI environment reflections */}
      <mesh
        position={[0, deckHeight - 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[yardLength, yardWidth]} />
        <meshStandardMaterial
          map={grassTextures.diffuse}
          normalMap={grassTextures.normal}
          normalScale={new THREE.Vector2(1.5, 1.5)}
          roughnessMap={grassTextures.roughness}
          roughness={0.95}
          aoMap={grassTextures.ao}
          aoMapIntensity={1.5}
          metalness={0.0}
          envMapIntensity={0.4}
          color={0x7a9b6e}
        />
      </mesh>
    </group>
  );
}
