import { create } from 'zustand';
import type { LightingPresetName } from '@/types/environment';

interface EnvironmentState {
  lightingPreset: LightingPresetName;
  environmentPreset: string;

  setLightingPreset: (preset: LightingPresetName) => void;
  setEnvironmentPreset: (preset: string) => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  lightingPreset: 'bright',
  environmentPreset: 'park',

  setLightingPreset: (lightingPreset) => set({ lightingPreset }),
  setEnvironmentPreset: (environmentPreset) => set({ environmentPreset }),
}));
