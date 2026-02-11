import type { LightingPreset, LightingPresetName } from '@/types/environment';

/**
 * Lighting presets map time-of-day to specific lighting configurations.
 * Each preset controls ambient light, directional light, sun position,
 * pool lights, and tone mapping exposure.
 */
export const LIGHTING_PRESET_MAP: Record<LightingPresetName, LightingPreset> = {
  bright: {
    name: 'bright',
    label: 'Bright Midday',
    hdri: 'park',
    ambientIntensity: 0.7,
    directionalIntensity: 1.5,
    directionalPosition: [12, 25, 8],
    directionalColor: '#fffef8',
    enablePoolLights: false,
    toneMappingExposure: 1.1,
  },
  morning: {
    name: 'morning',
    label: 'Early Morning',
    hdri: 'dawn',
    ambientIntensity: 0.4,
    directionalIntensity: 0.8,
    directionalPosition: [20, 8, 5],
    directionalColor: '#ffe0b2',
    enablePoolLights: false,
    toneMappingExposure: 0.8,
  },
  evening: {
    name: 'evening',
    label: 'Evening',
    hdri: 'sunset',
    ambientIntensity: 0.3,
    directionalIntensity: 0.6,
    directionalPosition: [-20, 6, -5],
    directionalColor: '#ff8a65',
    enablePoolLights: true,
    toneMappingExposure: 0.7,
  },
  night: {
    name: 'night',
    label: 'Night',
    hdri: 'night',
    ambientIntensity: 0.08,
    directionalIntensity: 0.05,
    directionalPosition: [0, 20, 0],
    directionalColor: '#b0c4de',
    enablePoolLights: true,
    toneMappingExposure: 0.3,
  },
};

/**
 * drei environment preset names that map to our lighting presets.
 * These are built-in HDRI presets available in @react-three/drei.
 * Can be replaced with custom HDRI files (public/environments/*.hdr).
 */
export const ENVIRONMENT_PRESETS = [
  { id: 'park', label: 'Suburban Park', dreiPreset: 'park' },
  { id: 'dawn', label: 'Dawn Garden', dreiPreset: 'dawn' },
  { id: 'sunset', label: 'Golden Sunset', dreiPreset: 'sunset' },
  { id: 'night', label: 'Night Sky', dreiPreset: 'night' },
  { id: 'forest', label: 'Forest Path', dreiPreset: 'forest' },
] as const;
