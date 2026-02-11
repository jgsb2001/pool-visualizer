import { create } from 'zustand';
import type { PoolShape, PoolDimensions, TileSize, GroutConfig } from '@/types/pool';
import type { LightingPresetName } from '@/types/environment';
import {
  POOL_DEFAULTS,
  DEFAULT_TILE_SIZE,
  DEFAULT_GROUT,
} from '@/lib/constants';

interface PoolState {
  shape: PoolShape;
  dimensions: PoolDimensions;
  tileSize: TileSize;
  isCustomTileSize: boolean;
  grout: GroutConfig;
  waterOpacity: number;
  lightingPreset: LightingPresetName;

  setShape: (shape: PoolShape) => void;
  setDimensions: (dims: Partial<PoolDimensions>) => void;
  setTileSize: (size: TileSize) => void;
  setCustomTileSize: (widthInches: number, heightInches: number) => void;
  setIsCustomTileSize: (isCustom: boolean) => void;
  setGrout: (grout: Partial<GroutConfig>) => void;
  setWaterOpacity: (opacity: number) => void;
  setLightingPreset: (preset: LightingPresetName) => void;
}

export const usePoolStore = create<PoolState>((set) => ({
  shape: 'rectangle',
  dimensions: {
    lengthMeters: POOL_DEFAULTS.lengthMeters,
    widthMeters: POOL_DEFAULTS.widthMeters,
    depthMeters: POOL_DEFAULTS.depthMeters,
  },
  tileSize: DEFAULT_TILE_SIZE,
  isCustomTileSize: false,
  grout: { ...DEFAULT_GROUT },
  waterOpacity: POOL_DEFAULTS.waterOpacity,
  lightingPreset: 'bright',

  setShape: (shape) => set({ shape }),
  setDimensions: (dims) =>
    set((state) => ({
      dimensions: { ...state.dimensions, ...dims },
    })),
  setTileSize: (tileSize) => set({ tileSize, isCustomTileSize: false }),
  setCustomTileSize: (widthInches, heightInches) =>
    set({
      tileSize: {
        widthInches,
        heightInches,
        label: `${widthInches}" × ${heightInches}"`,
      },
      isCustomTileSize: true,
    }),
  setIsCustomTileSize: (isCustom) => set({ isCustomTileSize: isCustom }),
  setGrout: (grout) =>
    set((state) => ({
      grout: { ...state.grout, ...grout },
    })),
  setWaterOpacity: (waterOpacity) => set({ waterOpacity }),
  setLightingPreset: (lightingPreset) => set({ lightingPreset }),
}));
