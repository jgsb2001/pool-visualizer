'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { PoolShape } from '@/types/pool';
import { createPoolFloorGeometry } from '@/lib/geometry/poolFloorGeometry';

interface WaterSurfaceProps {
  shape: PoolShape;
  length: number;
  width: number;
  opacity: number;
}

/**
 * Custom water shader with:
 * - Vertex displacement for physically moving water surface
 * - Animated procedural normal perturbation for fine ripples
 * - Fresnel-based reflection/refraction blend
 * - Environment map reflections
 * - Depth-based absorption (deeper = darker)
 * - Subtle caustic pattern on the water surface
 *
 * Vertex displacement uses 3 octaves of Gerstner-inspired waves:
 *   displacement.y = sum(A_i * sin(dot(D_i, pos.xz) * freq_i + time * speed_i))
 * This physically moves the mesh vertices so the water silhouette ripples.
 *
 * Fragment normals add finer detail beyond what vertex displacement resolves,
 * creating the appearance of many small wavelets without needing extreme
 * vertex density.
 */
const waterVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWaveAmplitude;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec2 vUv;
  varying vec3 vViewDirection;

  /**
   * Multi-octave vertex displacement.
   * Each wave has a direction (D), frequency (f), amplitude (A), and speed (s).
   * Height = A * sin(dot(D, pos) * f + time * s)
   * dH/dx and dH/dz are used to compute the displaced normal analytically.
   */
  vec3 waveDisplacement(vec3 pos, float time) {
    float height = 0.0;
    float dhdx = 0.0;
    float dhdz = 0.0;

    // Wave 1: large gentle swell
    vec2 d1 = normalize(vec2(0.7, 0.3));
    float f1 = 1.8;
    float a1 = uWaveAmplitude * 1.0;
    float s1 = 0.6;
    float phase1 = dot(d1, pos.xz) * f1 + time * s1;
    height += a1 * sin(phase1);
    dhdx += a1 * f1 * d1.x * cos(phase1);
    dhdz += a1 * f1 * d1.y * cos(phase1);

    // Wave 2: medium cross-wave
    vec2 d2 = normalize(vec2(-0.4, 0.8));
    float f2 = 3.5;
    float a2 = uWaveAmplitude * 0.5;
    float s2 = 1.1;
    float phase2 = dot(d2, pos.xz) * f2 + time * s2;
    height += a2 * sin(phase2);
    dhdx += a2 * f2 * d2.x * cos(phase2);
    dhdz += a2 * f2 * d2.y * cos(phase2);

    // Wave 3: small choppy detail
    vec2 d3 = normalize(vec2(0.3, -0.9));
    float f3 = 6.0;
    float a3 = uWaveAmplitude * 0.25;
    float s3 = 1.8;
    float phase3 = dot(d3, pos.xz) * f3 + time * s3;
    height += a3 * sin(phase3);
    dhdx += a3 * f3 * d3.x * cos(phase3);
    dhdz += a3 * f3 * d3.y * cos(phase3);

    // Wave 4: very fine ripples
    vec2 d4 = normalize(vec2(0.9, 0.5));
    float f4 = 10.0;
    float a4 = uWaveAmplitude * 0.12;
    float s4 = 2.5;
    float phase4 = dot(d4, pos.xz) * f4 + time * s4;
    height += a4 * sin(phase4);
    dhdx += a4 * f4 * d4.x * cos(phase4);
    dhdz += a4 * f4 * d4.y * cos(phase4);

    return vec3(height, dhdx, dhdz);
  }

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);

    // Compute displacement and analytical normal
    vec3 wave = waveDisplacement(worldPos.xyz, uTime);
    worldPos.y += wave.x;

    // Analytical normal from wave derivatives: N = normalize(-dh/dx, 1, -dh/dz)
    vec3 displacedNormal = normalize(vec3(-wave.y, 1.0, -wave.z));
    vWorldNormal = normalize((modelMatrix * vec4(displacedNormal, 0.0)).xyz);

    vWorldPosition = worldPos.xyz;
    vUv = uv;

    vec4 mvPosition = viewMatrix * worldPos;
    vViewDirection = normalize(-mvPosition.xyz);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const waterFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uShallowColor;
  uniform vec3 uDeepColor;
  uniform sampler2D uEnvMap;
  uniform float uEnvMapIntensity;
  uniform bool uHasEnvMap;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec2 vUv;
  varying vec3 vViewDirection;

  /**
   * Generate fine-detail normal perturbation beyond vertex displacement.
   * These are high-frequency wavelets that add visual detail in the fragment
   * shader without requiring extreme mesh subdivision.
   */
  vec3 getDetailNormal(vec2 uv, float time) {
    // Fine ripple octave 1 — visible wavelets
    float w1x = sin(uv.x * 8.0 + time * 0.6) * cos(uv.y * 7.0 - time * 0.5);
    float w1y = cos(uv.x * 7.5 - time * 0.55) * sin(uv.y * 9.0 + time * 0.65);

    // Fine ripple octave 2 — medium detail
    float w2x = sin(uv.x * 15.0 + time * 0.9) * cos(uv.y * 13.0 + time * 0.8);
    float w2y = cos(uv.x * 14.0 - time * 0.85) * sin(uv.y * 16.0 - time * 0.95);

    // Fine ripple octave 3 — micro shimmer
    float w3x = sin(uv.x * 25.0 + time * 1.3) * cos(uv.y * 22.0 + time * 1.1);
    float w3y = cos(uv.x * 23.0 - time * 1.2) * sin(uv.y * 27.0 - time * 1.4);

    vec2 displacement = vec2(
      w1x * 0.02 + w2x * 0.01 + w3x * 0.005,
      w1y * 0.02 + w2y * 0.01 + w3y * 0.005
    );

    return normalize(vec3(displacement.x, displacement.y, 1.0));
  }

  /**
   * Sample an equirectangular environment map using a 3D direction vector.
   * Converts the direction to spherical coordinates → UV.
   * PMREM-processed env maps from Three.js use this projection.
   */
  vec3 sampleEnvMap(vec3 dir) {
    // Spherical coordinates: phi (azimuth), theta (elevation)
    float phi = atan(dir.z, dir.x);
    float theta = asin(clamp(dir.y, -1.0, 1.0));
    // Map to [0,1] UV range
    vec2 envUv = vec2(
      phi / (2.0 * 3.14159265) + 0.5,
      theta / 3.14159265 + 0.5
    );
    // Use slight LOD bias for softer reflections (water isn't a perfect mirror)
    return texture2D(uEnvMap, envUv, 1.5).rgb;
  }

  /**
   * Schlick's Fresnel approximation.
   * Water has F0 ~ 0.02 (index of refraction 1.33).
   */
  float fresnel(vec3 viewDir, vec3 normal) {
    float f0 = 0.02;
    float cosTheta = max(dot(viewDir, normal), 0.0);
    return f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0);
  }

  /**
   * Caustic-like pattern for surface shimmer.
   * Uses overlapping sine waves to create bright spots
   * that travel across the surface.
   */
  float caustics(vec2 uv, float time) {
    float c1 = sin(uv.x * 15.0 + time) * sin(uv.y * 15.0 + time * 1.3);
    float c2 = sin(uv.x * 10.0 - time * 0.7) * sin(uv.y * 12.0 + time * 0.9);
    float c3 = sin(uv.x * 18.0 + time * 0.5) * sin(uv.y * 20.0 - time * 0.8);
    return pow(max(c1 + c2 + c3, 0.0), 2.0) * 0.1;
  }

  void main() {
    vec2 scaledUv = vUv * 4.0;

    // Get fine detail normal perturbation
    vec3 detailNorm = getDetailNormal(scaledUv, uTime);

    // Combine vertex-displaced normal with fragment detail — stronger blend
    vec3 N = normalize(vWorldNormal + vec3(detailNorm.x, 0.0, detailNorm.y) * 0.5);

    // View direction in world space (from fragment to camera)
    vec3 V = normalize(cameraPosition - vWorldPosition);

    // Fresnel: controls reflection vs refraction ratio
    // Real water: nearly 100% reflective at grazing angles
    float F = fresnel(V, N);

    // Reflection from environment map
    vec3 reflectDir = reflect(-V, N);
    vec3 skyFallback = mix(vec3(0.5, 0.7, 0.9), vec3(0.85, 0.9, 0.95), max(reflectDir.y, 0.0));
    vec3 envReflection = uHasEnvMap
      ? sampleEnvMap(reflectDir) * uEnvMapIntensity
      : skyFallback;
    // Tint reflections slightly blue to simulate subsurface light absorption
    // Real pool water absorbs red/yellow light, making reflections appear cooler
    vec3 reflection = envReflection * vec3(0.85, 0.92, 1.0);

    // Water body color with depth-based absorption
    // Looking straight down = see pool floor color (shallow)
    // Looking at angle = see deep blue absorption
    float viewAngle = max(dot(V, vec3(0.0, 1.0, 0.0)), 0.0);
    float depthFactor = 1.0 - viewAngle;
    vec3 waterColor = mix(uShallowColor, uDeepColor, depthFactor * 0.6);

    // Subtle caustic shimmer on the surface
    float c = caustics(scaledUv, uTime);
    waterColor += vec3(c * 0.8, c * 0.9, c * 1.0) * 0.3;

    // Final blend: fresnel drives reflection at grazing angles
    // Cap at 0.75 so pool always retains some of its characteristic blue color
    float reflectionStrength = min(F, 0.75);
    vec3 finalColor = mix(waterColor, reflection, reflectionStrength);

    // Sun specular highlight — tight and bright
    vec3 sunDir = normalize(vec3(0.5, 1.0, 0.3));
    vec3 halfDir = normalize(V + sunDir);
    float spec = pow(max(dot(N, halfDir), 0.0), 512.0);
    finalColor += vec3(1.0, 0.98, 0.94) * spec * 0.8;

    // Secondary broader specular for softer sheen
    float softSpec = pow(max(dot(N, halfDir), 0.0), 32.0);
    finalColor += vec3(0.8, 0.85, 0.9) * softSpec * 0.08;

    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

/**
 * Realistic water surface with vertex-displaced waves, environment reflections,
 * fresnel blending, and caustic shimmer. The mesh geometry is subdivided enough
 * to show smooth wave displacement while fragment normals add fine detail.
 */
export function WaterSurface({
  shape,
  length,
  width,
  opacity,
}: WaterSurfaceProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { scene } = useThree();

  // Use higher-resolution geometry for smooth vertex displacement
  const geometry = useMemo(() => {
    const baseGeo = createPoolFloorGeometry(shape, length, width);

    // For rectangles, use a PlaneGeometry with more subdivisions
    if (shape === 'rectangle') {
      return new THREE.PlaneGeometry(length, width, 64, 64);
    }

    // For curved shapes, the ShapeGeometry may not have enough vertices
    // for smooth displacement — we can subdivide or accept the default 64 segments
    return baseGeo;
  }, [shape, length, width]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uWaveAmplitude: { value: 0.015 },
      uShallowColor: { value: new THREE.Color(0x8dd8d8) },
      uDeepColor: { value: new THREE.Color(0x2a7a8a) },
      uEnvMap: { value: null as THREE.Texture | null },
      uEnvMapIntensity: { value: 0.85 },
      uHasEnvMap: { value: false },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Animate water and sync env map
  useFrame((state) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uOpacity.value = opacity;

    // Grab the scene environment map for reflections
    if (scene.environment && materialRef.current.uniforms.uEnvMap.value !== scene.environment) {
      materialRef.current.uniforms.uEnvMap.value = scene.environment;
      materialRef.current.uniforms.uHasEnvMap.value = true;
      materialRef.current.needsUpdate = true;
    }
  });

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.02, 0]}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={waterVertexShader}
        fragmentShader={waterFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
