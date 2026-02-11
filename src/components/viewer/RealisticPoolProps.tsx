'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface PoolPropsProps {
  deckHeight: number;
  poolLength: number;
  poolWidth: number;
}

/**
 * AAA-quality poolside props with photorealistic materials matching
 * the quality of the pool water and tiles.
 */
export function RealisticPoolProps({ deckHeight, poolLength, poolWidth }: PoolPropsProps) {
  // Load high-quality PBR texture sets (same workflow as deck/tiles)
  const loadPBRSet = (folder: string) => {
    const loader = new THREE.TextureLoader();
    const configure = (tex: THREE.Texture, isSRGB: boolean) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      if (isSRGB) tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 16;
      return tex;
    };

    return {
      diffuse: configure(loader.load(`/textures/${folder}/diff.jpg`), true),
      normal: configure(loader.load(`/textures/${folder}/nor_gl.jpg`), false),
      roughness: configure(loader.load(`/textures/${folder}/rough.jpg`), false),
      ao: configure(loader.load(`/textures/${folder}/ao.jpg`), false),
    };
  };

  const deckTextures = useMemo(() => loadPBRSet('deck'), []);
  const grassTextures = useMemo(() => loadPBRSet('grass'), []);

  // High-quality lounge chair with realistic cushions
  const loungeChairGeometry = useMemo(() => {
    const group = new THREE.Group();

    // Frame (use deck texture for wood-like appearance)
    const frameGeom = new THREE.BoxGeometry(0.65, 0.05, 1.9);
    const frame = new THREE.Mesh(frameGeom);
    frame.position.set(0, 0.35, 0);
    frame.castShadow = true;
    frame.receiveShadow = true;
    group.add(frame);

    // Cushion (segmented for realism)
    for (let i = 0; i < 3; i++) {
      const cushion = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.1, 0.55)
      );
      cushion.position.set(0, 0.4, -0.6 + i * 0.6);
      cushion.castShadow = true;
      cushion.receiveShadow = true;
      group.add(cushion);
    }

    // Backrest with recline
    const backrest = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.65, 0.12)
    );
    backrest.position.set(0, 0.62, -0.82);
    backrest.rotation.x = 0.35;
    backrest.castShadow = true;
    backrest.receiveShadow = true;
    group.add(backrest);

    // Metal legs
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.32, 12)
      );
      const x = (i % 2 === 0 ? -0.28 : 0.28);
      const z = (i < 2 ? -0.8 : 0.8);
      leg.position.set(x, 0.16, z);
      leg.castShadow = true;
      group.add(leg);
    }

    return group;
  }, []);

  // Market umbrella with realistic octagonal canopy
  const umbrellaGeometry = useMemo(() => {
    const group = new THREE.Group();

    // Wooden pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.05, 2.5, 20)
    );
    pole.position.set(0, 1.25, 0);
    pole.castShadow = true;
    pole.receiveShadow = true;
    group.add(pole);

    // Octagonal canopy (8-sided cone)
    const canopyGeom = new THREE.ConeGeometry(1.5, 0.6, 8, 1, false);
    const canopy = new THREE.Mesh(canopyGeom);
    canopy.position.set(0, 2.7, 0);
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    group.add(canopy);

    // Vent cap on top
    const vent = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.2, 8)
    );
    vent.position.set(0, 3.1, 0);
    vent.castShadow = true;
    group.add(vent);

    // Support ribs
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rib = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.015, 1.5)
      );
      rib.position.set(
        Math.cos(angle) * 0.75,
        2.55,
        Math.sin(angle) * 0.75
      );
      const tiltAngle = Math.atan2(0.3, 0.75);
      rib.rotation.set(tiltAngle, angle - Math.PI / 2, 0);
      rib.castShadow = true;
      group.add(rib);
    }

    return group;
  }, []);

  // Terracotta planter with realistic form
  const planterGeometry = useMemo(() => {
    const group = new THREE.Group();

    // Main pot body (tapered)
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.24, 0.5, 32)
    );
    pot.position.set(0, 0.25, 0);
    pot.castShadow = true;
    pot.receiveShadow = true;
    group.add(pot);

    // Decorative rim
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.025, 16, 32)
    );
    rim.position.set(0, 0.5, 0);
    rim.rotation.x = Math.PI / 2;
    rim.castShadow = true;
    rim.receiveShadow = true;
    group.add(rim);

    // Base ring
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.26, 0.03, 32)
    );
    base.position.set(0, 0.015, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    return group;
  }, []);

  // Realistic bushy plant (like boxwood or fern)
  const createPlant = useMemo(() => {
    const group = new THREE.Group();

    // Create a natural bush shape with clusters of foliage
    const clusters = 5;
    for (let c = 0; c < clusters; c++) {
      const clusterAngle = (c / clusters) * Math.PI * 2;
      const clusterRadius = 0.08 + Math.random() * 0.06;
      const clusterHeight = 0.45 + Math.random() * 0.15;

      // Multiple small leaf groups per cluster
      for (let l = 0; l < 3; l++) {
        const leafAngle = clusterAngle + (Math.random() - 0.5) * 0.8;
        const leafRadius = clusterRadius + (Math.random() - 0.5) * 0.04;

        // Simple sphere for each leaf cluster
        const leafCluster = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 8, 8)
        );
        leafCluster.position.set(
          Math.cos(leafAngle) * leafRadius,
          clusterHeight + (Math.random() - 0.5) * 0.1,
          Math.sin(leafAngle) * leafRadius
        );
        leafCluster.scale.set(
          0.8 + Math.random() * 0.4,
          1.0 + Math.random() * 0.3,
          0.8 + Math.random() * 0.4
        );
        leafCluster.castShadow = true;
        leafCluster.receiveShadow = true;
        group.add(leafCluster);
      }
    }

    // Central mass
    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 10)
    );
    center.position.y = 0.4;
    center.scale.set(1, 1.2, 1);
    center.castShadow = true;
    center.receiveShadow = true;
    group.add(center);

    // Base stems
    for (let i = 0; i < 3; i++) {
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.015, 0.5, 6)
      );
      const angle = (i / 3) * Math.PI * 2;
      stem.position.set(
        Math.cos(angle) * 0.03,
        0.25,
        Math.sin(angle) * 0.03
      );
      stem.castShadow = true;
      group.add(stem);
    }

    return group;
  }, []);

  // Materials with same quality as pool tiles
  const frameMaterial = new THREE.MeshStandardMaterial({
    map: deckTextures.diffuse,
    normalMap: deckTextures.normal,
    normalScale: new THREE.Vector2(1.5, 1.5),
    roughnessMap: deckTextures.roughness,
    roughness: 0.7,
    aoMap: deckTextures.ao,
    aoMapIntensity: 1.2,
    metalness: 0.0,
    envMapIntensity: 0.8,
  });

  const cushionMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8f4f8,
    roughness: 0.8,
    metalness: 0.0,
    envMapIntensity: 0.4,
  });

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.2,
    metalness: 0.9,
    envMapIntensity: 1.2,
  });

  const umbrellaFabricMaterial = new THREE.MeshStandardMaterial({
    color: 0xe85d33,
    roughness: 0.85,
    metalness: 0.0,
    envMapIntensity: 0.25,
    side: THREE.DoubleSide,
  });

  const woodMaterial = new THREE.MeshStandardMaterial({
    map: deckTextures.diffuse,
    normalMap: deckTextures.normal,
    normalScale: new THREE.Vector2(1.0, 1.0),
    roughnessMap: deckTextures.roughness,
    roughness: 0.75,
    aoMap: deckTextures.ao,
    aoMapIntensity: 1.0,
    metalness: 0.0,
    envMapIntensity: 0.6,
    color: 0x8b6f47,
  });

  const terracottaMaterial = new THREE.MeshStandardMaterial({
    color: 0xc97a5c,
    roughness: 0.95,
    metalness: 0.0,
    envMapIntensity: 0.2,
  });

  const plantMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a5a2f,
    roughness: 0.9,
    metalness: 0.0,
    envMapIntensity: 0.1,
  });

  const stemMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3c28,
    roughness: 0.85,
    metalness: 0.0,
    envMapIntensity: 0.2,
  });

  const tableMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.8,
    envMapIntensity: 1.5,
  });

  // Helper to apply material to group
  const applyMaterialToGroup = (group: THREE.Group, material: THREE.Material, childIndex?: number) => {
    if (childIndex !== undefined) {
      (group.children[childIndex] as THREE.Mesh).material = material;
    } else {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = material;
        }
      });
    }
  };

  return (
    <group>
      {/* Lounge Chair 1 */}
      <group position={[poolLength / 2 + 2.2, deckHeight, -1]} rotation={[0, Math.PI / 2, 0]}>
        <primitive object={loungeChairGeometry.clone()}>
          <primitive
            attach="children-0-material"
            object={frameMaterial}
          />
          {[1, 2, 3].map((i) => (
            <primitive
              key={i}
              attach={`children-${i}-material`}
              object={cushionMaterial}
            />
          ))}
          <primitive attach="children-4-material" object={cushionMaterial} />
          {[5, 6, 7, 8].map((i) => (
            <primitive
              key={i}
              attach={`children-${i}-material`}
              object={metalMaterial}
            />
          ))}
        </primitive>
      </group>

      {/* Lounge Chair 2 */}
      <group position={[poolLength / 2 + 2.2, deckHeight, 1.5]} rotation={[0, Math.PI / 2, 0]}>
        <primitive object={loungeChairGeometry.clone()}>
          <primitive attach="children-0-material" object={frameMaterial} />
          {[1, 2, 3].map((i) => (
            <primitive
              key={i}
              attach={`children-${i}-material`}
              object={cushionMaterial}
            />
          ))}
          <primitive attach="children-4-material" object={cushionMaterial} />
          {[5, 6, 7, 8].map((i) => (
            <primitive
              key={i}
              attach={`children-${i}-material`}
              object={metalMaterial}
            />
          ))}
        </primitive>
      </group>

      {/* Umbrella */}
      <group position={[-poolLength / 2 - 2.8, deckHeight, 0]}>
        {/* Pole */}
        <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.045, 0.05, 2.5, 20]} />
          <meshStandardMaterial {...woodMaterial} />
        </mesh>
        {/* Canopy */}
        <mesh position={[0, 2.7, 0]} castShadow receiveShadow>
          <coneGeometry args={[1.5, 0.6, 8, 1, false]} />
          <meshStandardMaterial {...umbrellaFabricMaterial} />
        </mesh>
        {/* Vent cap */}
        <mesh position={[0, 3.1, 0]} castShadow>
          <coneGeometry args={[0.15, 0.2, 8]} />
          <meshStandardMaterial {...umbrellaFabricMaterial} />
        </mesh>
        {/* Support ribs */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const tiltAngle = Math.atan2(0.3, 0.75);
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 0.75,
                2.55,
                Math.sin(angle) * 0.75
              ]}
              rotation={[tiltAngle, angle - Math.PI / 2, 0]}
              castShadow
            >
              <boxGeometry args={[0.015, 0.015, 1.5]} />
              <meshStandardMaterial {...metalMaterial} />
            </mesh>
          );
        })}
      </group>

      {/* Planter 1 with Plant */}
      <group position={[poolLength / 2 + 2.8, deckHeight, poolWidth / 2 + 2.8]}>
        {/* Pot */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.24, 0.5, 32]} />
          <meshStandardMaterial {...terracottaMaterial} />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.3, 0.025, 16, 32]} />
          <meshStandardMaterial {...terracottaMaterial} />
        </mesh>
        {/* Base */}
        <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.03, 32]} />
          <meshStandardMaterial {...terracottaMaterial} />
        </mesh>
        {/* Plant */}
        <group position={[0, 0.35, 0]}>
          {createPlant.clone().children.map((child, i) => {
            const mesh = child as THREE.Mesh;
            const isStem = i >= createPlant.children.length - 3;
            return (
              <mesh
                key={i}
                position={mesh.position}
                rotation={mesh.rotation}
                scale={mesh.scale}
                castShadow
                receiveShadow
              >
                <primitive object={mesh.geometry} />
                <meshStandardMaterial {...(isStem ? stemMaterial : plantMaterial)} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* Planter 2 with Plant */}
      <group position={[-poolLength / 2 - 2.8, deckHeight, poolWidth / 2 + 2.8]}>
        {/* Pot */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.24, 0.5, 32]} />
          <meshStandardMaterial {...terracottaMaterial} />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.3, 0.025, 16, 32]} />
          <meshStandardMaterial {...terracottaMaterial} />
        </mesh>
        {/* Base */}
        <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.03, 32]} />
          <meshStandardMaterial {...terracottaMaterial} />
        </mesh>
        {/* Plant */}
        <group position={[0, 0.35, 0]}>
          {createPlant.clone().children.map((child, i) => {
            const mesh = child as THREE.Mesh;
            const isStem = i >= createPlant.children.length - 3;
            return (
              <mesh
                key={i}
                position={mesh.position}
                rotation={mesh.rotation}
                scale={mesh.scale}
                castShadow
                receiveShadow
              >
                <primitive object={mesh.geometry} />
                <meshStandardMaterial {...(isStem ? stemMaterial : plantMaterial)} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* Side Table */}
      <mesh position={[poolLength / 2 + 1.6, deckHeight + 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.6, 32]} />
        <meshStandardMaterial {...tableMaterial} />
      </mesh>
    </group>
  );
}
