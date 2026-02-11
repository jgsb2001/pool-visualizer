'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { useEnvironmentStore } from '@/hooks/useEnvironmentStore';
import { LIGHTING_PRESET_MAP } from '@/lib/lighting/presets';

/**
 * Poly Haven HDRI URLs (2k resolution for sharper backgrounds).
 * Loaded directly via Three.js native RGBELoader to bypass
 * the drei/three-stdlib `.image` compatibility bug.
 */
const HDRI_URLS: Record<string, string> = {
  park: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/rooitou_park_2k.hdr',
  dawn: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/kiara_1_dawn_2k.hdr',
  sunset: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/venice_sunset_2k.hdr',
  night: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/dikhololo_night_2k.hdr',
  forest: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/forest_slope_2k.hdr',
};

/**
 * Fallback gradient for when HDRI hasn't loaded yet.
 */
function createGradientTexture(topColor: number, bottomColor: number): THREE.DataTexture {
  const size = 512;
  const data = new Uint8Array(size * 4);
  const top = new THREE.Color(topColor);
  const bottom = new THREE.Color(bottomColor);

  for (let i = 0; i < size; i++) {
    const t = i / (size - 1);
    const r = Math.round((bottom.r * t + top.r * (1 - t)) * 255);
    const g = Math.round((bottom.g * t + top.g * (1 - t)) * 255);
    const b = Math.round((bottom.b * t + top.b * (1 - t)) * 255);
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, 1, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

const SKY_COLORS: Record<string, { top: number; bottom: number }> = {
  park: { top: 0x87ceeb, bottom: 0xc8e6c9 },
  dawn: { top: 0xffd6a0, bottom: 0xffe0b2 },
  sunset: { top: 0xff7043, bottom: 0xffcc80 },
  night: { top: 0x0d1b2a, bottom: 0x1b2838 },
  forest: { top: 0x6b9b7a, bottom: 0x8fbc8f },
};

/** Cache processed HDRI env maps to avoid redundant downloads */
const hdriCache = new Map<string, THREE.Texture>();

/**
 * Manages HDRI environment lighting and sky background.
 * Uses Three.js native RGBELoader + PMREMGenerator for image-based
 * lighting (IBL) with physically-accurate reflections.
 */
export function EnvironmentSetup() {
  const lightingPreset = useEnvironmentStore((s) => s.lightingPreset);
  const environmentPreset = useEnvironmentStore((s) => s.environmentPreset);
  const preset = LIGHTING_PRESET_MAP[lightingPreset];
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const currentEnvRef = useRef<string>('');

  // Tone mapping exposure
  useEffect(() => {
    gl.toneMappingExposure = preset.toneMappingExposure;
  }, [gl, preset.toneMappingExposure]);

  // Load HDRI and set as environment + background
  useEffect(() => {
    const presetKey = environmentPreset || 'park';
    if (currentEnvRef.current === presetKey) return;
    currentEnvRef.current = presetKey;

    const hdriUrl = HDRI_URLS[presetKey];
    const fallbackColors = SKY_COLORS[presetKey] ?? SKY_COLORS.park;
    const fallbackTex = createGradientTexture(fallbackColors.top, fallbackColors.bottom);
    scene.background = fallbackTex;

    if (!hdriUrl) return;

    // Use cached env map if available
    const cached = hdriCache.get(presetKey);
    if (cached) {
      scene.environment = cached;
      scene.background = cached;
      scene.backgroundBlurriness = 0.04;
      scene.backgroundIntensity = 0.8;
      fallbackTex.dispose();
      return;
    }

    // Load via Three.js native RGBELoader (avoids three-stdlib bug)
    const loader = new RGBELoader();
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();

    loader.load(
      hdriUrl,
      (hdrTexture) => {
        const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
        hdrTexture.dispose();
        pmremGenerator.dispose();

        hdriCache.set(presetKey, envMap);

        if (currentEnvRef.current === presetKey) {
          scene.environment = envMap;
          // Enable HDRI as background for realistic sky
          scene.background = envMap;
          scene.backgroundBlurriness = 0.15;
          scene.backgroundIntensity = 1.2;
          fallbackTex.dispose();
        }
      },
      undefined,
      () => {
        // Keep gradient fallback on error
        pmremGenerator.dispose();
      },
    );

    return () => {
      fallbackTex.dispose();
    };
  }, [environmentPreset, scene, gl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      scene.environment = null;
      scene.background = null;
    };
  }, [scene]);

  return (
    <>
      {/* Enhanced ambient light with subtle sky color */}
      <ambientLight
        intensity={preset.ambientIntensity * 0.5}
        color={preset.directionalColor}
      />

      {/* Hemisphere light for realistic sky/ground bounce lighting */}
      <hemisphereLight
        args={['#a8d5ff', '#8b7355', preset.ambientIntensity * 0.6]}
        position={[0, 50, 0]}
      />

      {/* Main directional sun with enhanced shadows */}
      {preset.directionalIntensity > 0 && (
        <directionalLight
          position={preset.directionalPosition}
          intensity={preset.directionalIntensity * 0.8}
          color={preset.directionalColor}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-near={0.1}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          shadow-bias={-0.0001}
          shadow-normalBias={0.02}
        />
      )}

      {/* Fill light for softer shadows */}
      {preset.directionalIntensity > 0.3 && (
        <directionalLight
          position={[
            -preset.directionalPosition[0] * 0.5,
            preset.directionalPosition[1] * 0.5,
            -preset.directionalPosition[2] * 0.5,
          ]}
          intensity={preset.directionalIntensity * 0.2}
          color={preset.directionalColor}
        />
      )}

      {/* Subtle rim light for depth */}
      {preset.directionalIntensity > 0.3 && (
        <directionalLight
          position={[
            preset.directionalPosition[0] * -0.8,
            preset.directionalPosition[1] * 0.3,
            preset.directionalPosition[2] * -0.8,
          ]}
          intensity={preset.directionalIntensity * 0.12}
          color="#c8dff5"
        />
      )}
    </>
  );
}
