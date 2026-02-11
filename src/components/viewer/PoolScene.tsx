'use client';

import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneContent } from './SceneContent';
import { ExportButton } from '../ui/ExportButton';

/**
 * AAA-quality 3D scene with enhanced rendering settings.
 * All Three.js-dependent hooks and components go inside SceneContent.
 */
export function PoolScene() {
  return (
    <>
      <Canvas
        camera={{
          position: [10, 8, 12],
          fov: 50,
          near: 0.01,
          far: 200,
        }}
        shadows={{
          enabled: true,
          type: THREE.PCFSoftShadowMap,
        }}
        gl={{
          antialias: true,
          alpha: false,
          stencil: false,
          depth: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 2]}
        frameloop="always"
        style={{ width: '100%', height: '100%' }}
      >
        <SceneContent />
      </Canvas>
      {/* Export button outside Canvas so it doesn't need Three.js context */}
      <ExportButton />
    </>
  );
}
