'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PoolShape } from '@/types/pool';
import { createPoolFloorGeometry } from '@/lib/geometry/poolFloorGeometry';

interface UnderwaterCausticsProps {
  shape: PoolShape;
  length: number;
  width: number;
  depth: number;
}

/**
 * Caustic projection shader — renders animated light patterns on the pool floor.
 * Simulates the focusing of light through a rippled water surface (caustics)
 * using a multi-layer sine wave network.
 *
 * The caustic intensity is computed by summing several crossed sine waves
 * at different frequencies, then sharpening the peaks with a power function.
 * This approximates how real water caustics form bright lines where
 * refracted light rays converge.
 *
 * Rendered as an additive-blended plane slightly above the pool floor
 * to avoid z-fighting.
 */
const causticVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const causticFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uCausticColor;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  /**
   * Multi-layer caustic pattern.
   * Uses 5 crossed sine wave pairs at different scales, angles, and speeds.
   * The result simulates the bright network of lines formed when sunlight
   * refracts through a wavy water surface and focuses on the pool floor.
   *
   * Each layer: sin(pos rotated by angle_i * freq_i + time * speed_i)
   *           * sin(pos rotated by angle_j * freq_j + time * speed_j)
   * Layers are accumulated and shaped with pow() for sharper caustic lines.
   */
  float causticPattern(vec2 pos, float time) {
    float result = 0.0;

    // Layer 1: slow, large-scale caustic network
    float c1 = sin(pos.x * 4.0 + pos.y * 2.5 + time * 0.4);
    float c2 = sin(pos.y * 4.5 - pos.x * 1.8 + time * 0.35);
    result += max(c1 * c2, 0.0);

    // Layer 2: medium frequency, different angle
    float c3 = sin(pos.x * 7.0 - pos.y * 5.0 + time * 0.6);
    float c4 = sin(pos.y * 8.0 + pos.x * 3.0 - time * 0.55);
    result += max(c3 * c4, 0.0) * 0.7;

    // Layer 3: fine detail
    float c5 = sin(pos.x * 12.0 + pos.y * 9.0 + time * 0.8);
    float c6 = sin(pos.y * 11.0 - pos.x * 8.0 - time * 0.7);
    result += max(c5 * c6, 0.0) * 0.4;

    // Layer 4: very fine shimmer
    float c7 = sin(pos.x * 18.0 - pos.y * 15.0 + time * 1.1);
    float c8 = sin(pos.y * 16.0 + pos.x * 14.0 + time * 0.9);
    result += max(c7 * c8, 0.0) * 0.25;

    // Layer 5: drifting larger pattern for variation
    float c9 = sin(pos.x * 2.5 + time * 0.2 + 1.5);
    float c10 = sin(pos.y * 3.0 - time * 0.25 + 0.8);
    result += max(c9 * c10, 0.0) * 0.5;

    // Normalize and sharpen peaks to create distinct caustic lines
    result = result / 2.85;
    return pow(result, 1.5);
  }

  void main() {
    // Use world-space XZ for tiling-independent caustic projection
    vec2 worldUv = vWorldPosition.xz;

    float caustic = causticPattern(worldUv, uTime);

    // Fade out near edges (optional, prevents hard cutoff)
    float edgeFade = smoothstep(0.0, 0.05, vUv.x) * smoothstep(0.0, 0.05, vUv.y)
                   * smoothstep(0.0, 0.05, 1.0 - vUv.x) * smoothstep(0.0, 0.05, 1.0 - vUv.y);

    float intensity = caustic * uIntensity * edgeFade;

    gl_FragColor = vec4(uCausticColor * intensity, intensity);
  }
`;

/**
 * Animated underwater caustic light patterns projected on the pool floor.
 * Uses additive blending so bright caustic lines add light to the floor
 * without obscuring the tile/interior texture beneath.
 */
export function UnderwaterCaustics({
  shape,
  length,
  width,
  depth,
}: UnderwaterCausticsProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(
    () => createPoolFloorGeometry(shape, length, width),
    [shape, length, width],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0.35 },
      uCausticColor: { value: new THREE.Color(0.6, 0.85, 1.0) },
    }),
    [],
  );

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -depth + 0.005, 0]}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={causticVertexShader}
        fragmentShader={causticFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
