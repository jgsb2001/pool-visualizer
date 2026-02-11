import type { TileSize, GroutConfig } from '@/types/pool';
import type { LightingPreset } from '@/types/environment';

export const INCHES_TO_METERS = 0.0254;

export const TILE_SIZE_PRESETS: TileSize[] = [
  { widthInches: 1, heightInches: 1, label: '1" × 1"' },
  { widthInches: 2, heightInches: 1, label: '2" × 1"' },
  { widthInches: 2, heightInches: 2, label: '2" × 2"' },
  { widthInches: 3, heightInches: 3, label: '3" × 3"' },
  { widthInches: 4, heightInches: 4, label: '4" × 4"' },
  { widthInches: 6, heightInches: 6, label: '6" × 6"' },
];

export const GROUT_SIZE_PRESETS = [
  { value: 1 / 16, label: '1/16"' },
  { value: 1 / 8, label: '1/8"' },
  { value: 3 / 16, label: '3/16"' },
  { value: 1 / 4, label: '1/4"' },
] as const;

export const DEFAULT_GROUT: GroutConfig = {
  sizeInches: 1 / 8,
  color: '#C0C0C0',
};

export const DEFAULT_TILE_SIZE: TileSize = {
  widthInches: 6,
  heightInches: 6,
  label: '6" × 6"',
};

export const POOL_DEFAULTS = {
  lengthMeters: 12,
  widthMeters: 6,
  depthMeters: 1.8,
  waterOpacity: 0.6,
} as const;

export const TILE_TEXTURE_RESOLUTION = 256;
export const REPEATING_STRIP_TILE_COUNT = 32;
export const MAX_UPLOAD_TILES = 4;
export const MAX_IMAGE_DIMENSION = 1024;

export const PERIMETER_SEGMENTS = 128;

export const LIGHTING_PRESETS: LightingPreset[] = [
  {
    name: 'bright',
    label: 'Bright Midday',
    hdri: 'midday.hdr',
    ambientIntensity: 0.6,
    directionalIntensity: 1.0,
    directionalPosition: [10, 20, 10],
    directionalColor: '#ffffff',
    enablePoolLights: false,
    toneMappingExposure: 1.0,
  },
  {
    name: 'morning',
    label: 'Early Morning',
    hdri: 'morning.hdr',
    ambientIntensity: 0.4,
    directionalIntensity: 0.7,
    directionalPosition: [20, 8, 5],
    directionalColor: '#ffe0b2',
    enablePoolLights: false,
    toneMappingExposure: 0.8,
  },
  {
    name: 'evening',
    label: 'Evening',
    hdri: 'evening.hdr',
    ambientIntensity: 0.3,
    directionalIntensity: 0.6,
    directionalPosition: [-20, 6, -5],
    directionalColor: '#ff8a65',
    enablePoolLights: false,
    toneMappingExposure: 0.7,
  },
  {
    name: 'night',
    label: 'Night',
    hdri: 'night.hdr',
    ambientIntensity: 0.1,
    directionalIntensity: 0.0,
    directionalPosition: [0, 20, 0],
    directionalColor: '#1a237e',
    enablePoolLights: true,
    toneMappingExposure: 0.3,
  },
];
