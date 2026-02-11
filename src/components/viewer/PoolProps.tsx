'use client';

import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

interface PoolPropsProps {
  deckHeight: number;
  poolLength: number;
  poolWidth: number;
}

/**
 * Environmental props around the pool to create context like the GTA V scene.
 * Adds lounge chairs, umbrellas, planters, and other poolside objects.
 */
export function PoolProps({ deckHeight, poolLength, poolWidth }: PoolPropsProps) {
  // Calculate positions relative to pool size
  const deckRadius = Math.max(poolLength, poolWidth) / 2 + 3;

  // Simple lounge chair geometry
  const loungeChairGeometry = useMemo(() => {
    const group = new THREE.Group();

    // Base (lounger bed)
    const bed = new THREE.BoxGeometry(0.6, 0.08, 1.8);
    const bedMesh = new THREE.Mesh(bed);
    bedMesh.position.set(0, 0.35, 0);
    bedMesh.rotation.x = -0.2; // Slight recline
    group.add(bedMesh);

    // Back rest
    const backrest = new THREE.BoxGeometry(0.6, 0.7, 0.08);
    const backrestMesh = new THREE.Mesh(backrest);
    backrestMesh.position.set(0, 0.6, -0.8);
    backrestMesh.rotation.x = 0.3;
    group.add(backrestMesh);

    // Legs
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.CylinderGeometry(0.03, 0.03, 0.3);
      const legMesh = new THREE.Mesh(leg);
      const x = (i % 2 === 0 ? -0.25 : 0.25);
      const z = (i < 2 ? -0.7 : 0.7);
      legMesh.position.set(x, 0.15, z);
      group.add(legMesh);
    }

    return group;
  }, []);

  // Realistic umbrella geometry with detailed canopy
  const umbrellaGeometry = useMemo(() => {
    const group = new THREE.Group();

    // Wooden pole
    const pole = new THREE.CylinderGeometry(0.045, 0.05, 2.5, 16);
    const poleMesh = new THREE.Mesh(pole);
    poleMesh.position.set(0, 1.25, 0);
    poleMesh.castShadow = true;
    group.add(poleMesh);

    // Canopy with fabric drape (octagonal umbrella)
    const canopy = new THREE.CylinderGeometry(1.4, 1.2, 0.15, 8, 1, false);
    const canopyMesh = new THREE.Mesh(canopy);
    canopyMesh.position.set(0, 2.55, 0);
    canopyMesh.castShadow = true;
    canopyMesh.receiveShadow = true;
    group.add(canopyMesh);

    // Top cap
    const capGeometry = new THREE.ConeGeometry(0.08, 0.2, 8);
    const capMesh = new THREE.Mesh(capGeometry);
    capMesh.position.set(0, 2.7, 0);
    group.add(capMesh);

    return group;
  }, []);

  // Realistic planter box with terracotta texture
  const planterGeometry = useMemo(() => {
    const group = new THREE.Group();

    // Terracotta pot (tapered cylinder)
    const pot = new THREE.CylinderGeometry(0.28, 0.22, 0.45, 16);
    const potMesh = new THREE.Mesh(pot);
    potMesh.position.set(0, 0.225, 0);
    potMesh.castShadow = true;
    potMesh.receiveShadow = true;
    group.add(potMesh);

    // Rim detail
    const rim = new THREE.TorusGeometry(0.28, 0.02, 8, 16);
    const rimMesh = new THREE.Mesh(rim);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.set(0, 0.45, 0);
    group.add(rimMesh);

    return group;
  }, []);

  // Load grass texture for plants
  const grassTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/textures/grass/diff.jpg');
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Procedural fabric texture for umbrella
  const fabricTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base fabric color
    ctx.fillStyle = '#e85d33';
    ctx.fillRect(0, 0, size, size);

    // Fabric weave pattern
    const weaveSize = 4;
    for (let y = 0; y < size; y += weaveSize) {
      for (let x = 0; x < size; x += weaveSize) {
        const brightness = Math.random() * 20 - 10;
        const r = 232 + brightness;
        const g = 93 + brightness;
        const b = 51 + brightness;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, weaveSize, weaveSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, []);

  // Wood grain texture for pole (procedural)
  const woodTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Wood grain pattern
    const gradient = ctx.createLinearGradient(0, 0, size, 0);
    gradient.addColorStop(0, '#4a3528');
    gradient.addColorStop(0.3, '#5c4033');
    gradient.addColorStop(0.5, '#4a3528');
    gradient.addColorStop(0.7, '#5c4033');
    gradient.addColorStop(1, '#4a3528');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add grain noise
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const brightness = Math.random() * 30 - 15;
      ctx.fillStyle = `rgba(${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${Math.abs(brightness) / 100})`;
      ctx.fillRect(x, y, 1, Math.random() * 5);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  // Enhanced AAA-quality materials with realistic textures
  const chairMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f5f5,
    roughness: 0.35,
    metalness: 0.15,
    envMapIntensity: 0.8,
  });

  const umbrellaMaterial = new THREE.MeshStandardMaterial({
    map: fabricTexture,
    roughness: 0.85,
    metalness: 0.0,
    envMapIntensity: 0.2,
    side: THREE.DoubleSide,
  });

  const umbrellaPoleMateria = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.75,
    metalness: 0.0,
    envMapIntensity: 0.3,
  });

  // Terracotta texture (procedural)
  const terracottaTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base terracotta color
    ctx.fillStyle = '#b8694d';
    ctx.fillRect(0, 0, size, size);

    // Add clay texture variation
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const brightness = Math.random() * 40 - 20;
      const r = 184 + brightness;
      const g = 105 + brightness;
      const b = 77 + brightness;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
      const radius = Math.random() * 3;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Horizontal bands (pottery rings)
    for (let y = 0; y < size; y += 40 + Math.random() * 30) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  const planterMaterial = new THREE.MeshStandardMaterial({
    map: terracottaTexture,
    roughness: 0.9,
    metalness: 0.0,
    envMapIntensity: 0.25,
  });

  const plantMaterial = new THREE.MeshStandardMaterial({
    map: grassTexture,
    roughness: 0.95,
    metalness: 0.0,
    envMapIntensity: 0.1,
    side: THREE.DoubleSide,
  });

  const tableMaterial = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    roughness: 0.25,
    metalness: 0.6,
    envMapIntensity: 1.0,
  });

  // Realistic plant geometry with multiple leaves
  const createPlantFoliage = useMemo(() => {
    const group = new THREE.Group();

    // Create 6-8 leaves radiating from center
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const height = 0.5 + Math.random() * 0.3;

      // Leaf blade (ellipsoid)
      const leafGeometry = new THREE.SphereGeometry(0.15, 8, 8);
      leafGeometry.scale(1, 2.5, 0.3);

      const leaf = new THREE.Mesh(leafGeometry, plantMaterial);
      leaf.position.set(
        Math.cos(angle) * 0.15,
        height,
        Math.sin(angle) * 0.15
      );
      leaf.rotation.set(
        Math.random() * 0.3 - 0.15,
        angle,
        Math.PI / 4 + Math.random() * 0.2
      );
      leaf.castShadow = true;
      group.add(leaf);
    }

    // Center cluster
    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      plantMaterial
    );
    center.position.y = 0.5;
    center.scale.set(1, 1.5, 1);
    center.castShadow = true;
    group.add(center);

    return group;
  }, [plantMaterial]);

  return (
    <group>
      {/* Lounge chairs on one side */}
      <group position={[poolLength / 2 + 2, deckHeight, -1]} rotation={[0, Math.PI / 2, 0]}>
        <primitive object={loungeChairGeometry.clone()} />
        <meshStandardMaterial attach="material" {...chairMaterial} />
      </group>

      <group position={[poolLength / 2 + 2, deckHeight, 1.5]} rotation={[0, Math.PI / 2, 0]}>
        <primitive object={loungeChairGeometry.clone()} />
        <meshStandardMaterial attach="material" {...chairMaterial} />
      </group>

      {/* Umbrella with realistic materials */}
      <group position={[-poolLength / 2 - 2.5, deckHeight, 0]}>
        {/* Pole */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.05, 2.5, 16]} />
          <meshStandardMaterial {...umbrellaPoleMateria} />
        </mesh>
        {/* Canopy */}
        <mesh position={[0, 2.55, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.4, 1.2, 0.15, 8, 1, false]} />
          <meshStandardMaterial {...umbrellaMaterial} />
        </mesh>
        {/* Top cap */}
        <mesh position={[0, 2.7, 0]}>
          <coneGeometry args={[0.08, 0.2, 8]} />
          <meshStandardMaterial {...umbrellaPoleMateria} />
        </mesh>
      </group>

      {/* Realistic planters with foliage at corners */}
      <group position={[poolLength / 2 + 2.5, deckHeight, poolWidth / 2 + 2.5]}>
        {/* Terracotta pot */}
        <mesh position={[0, 0.225, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.28, 0.22, 0.45, 16]} />
          <meshStandardMaterial {...planterMaterial} />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.02, 8, 16]} />
          <meshStandardMaterial {...planterMaterial} />
        </mesh>
        {/* Plant foliage */}
        <primitive object={createPlantFoliage.clone()} position={[0, 0.15, 0]} />
      </group>

      <group position={[-poolLength / 2 - 2.5, deckHeight, poolWidth / 2 + 2.5]}>
        {/* Terracotta pot */}
        <mesh position={[0, 0.225, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.28, 0.22, 0.45, 16]} />
          <meshStandardMaterial {...planterMaterial} />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.02, 8, 16]} />
          <meshStandardMaterial {...planterMaterial} />
        </mesh>
        {/* Plant foliage */}
        <primitive object={createPlantFoliage.clone()} position={[0, 0.15, 0]} />
      </group>

      {/* Small side table with enhanced material */}
      <mesh position={[poolLength / 2 + 1.5, deckHeight + 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.5]} />
        <meshStandardMaterial {...tableMaterial} />
      </mesh>
    </group>
  );
}
