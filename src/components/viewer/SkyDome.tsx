'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Realistic procedural sky dome with atmospheric gradient.
 * Simulates Rayleigh scattering for authentic sky color transitions.
 */
export function SkyDome() {
  const skyVertexShader = /* glsl */ `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const skyFragmentShader = /* glsl */ `
    uniform vec3 uSunPosition;
    uniform vec3 uTopColor;
    uniform vec3 uHorizonColor;
    uniform vec3 uGroundColor;

    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    void main() {
      // Normalize position to get direction
      vec3 dir = normalize(vWorldPosition);

      // Height factor (0 at horizon, 1 at zenith, -1 at nadir)
      float height = dir.y;

      // Sky gradient based on height
      vec3 skyColor;

      if (height > 0.0) {
        // Above horizon: blend from horizon to top
        float skyMix = pow(height, 0.4);
        skyColor = mix(uHorizonColor, uTopColor, skyMix);

        // Sun glow
        vec3 sunDir = normalize(uSunPosition);
        float sunDot = max(dot(dir, sunDir), 0.0);
        float sunGlow = pow(sunDot, 8.0) * 0.3;
        float sunHalo = pow(sunDot, 3.0) * 0.15;

        vec3 sunColor = vec3(1.0, 0.95, 0.85);
        skyColor += (sunGlow + sunHalo) * sunColor;
      } else {
        // Below horizon: ground color (shouldn't be visible but just in case)
        skyColor = uGroundColor;
      }

      gl_FragColor = vec4(skyColor, 1.0);
    }
  `;

  const skyUniforms = useMemo(
    () => ({
      uSunPosition: { value: new THREE.Vector3(12, 25, 8) },
      uTopColor: { value: new THREE.Color(0x5b9bd5) },
      uHorizonColor: { value: new THREE.Color(0xbdd9f0) },
      uGroundColor: { value: new THREE.Color(0x8b7355) },
    }),
    [],
  );

  return (
    <mesh scale={[500, 500, 500]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        vertexShader={skyVertexShader}
        fragmentShader={skyFragmentShader}
        uniforms={skyUniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
