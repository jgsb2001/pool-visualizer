import { create } from 'zustand';
import type { InteriorConfig } from '@/types/pool';

interface InteriorState {
  config: InteriorConfig;
  customImageElement: HTMLImageElement | null;
  customPreviewUrl: string | null;

  setInteriorType: (type: InteriorConfig['type']) => void;
  setCustomImage: (element: HTMLImageElement, previewUrl: string) => void;
  clearCustomImage: () => void;
}

export const useInteriorStore = create<InteriorState>((set) => ({
  config: { type: 'pebble-tec' },
  customImageElement: null,
  customPreviewUrl: null,

  setInteriorType: (type) =>
    set((state) => ({
      config: {
        ...state.config,
        type,
      },
    })),

  setCustomImage: (element, previewUrl) =>
    set({
      config: { type: 'custom' },
      customImageElement: element,
      customPreviewUrl: previewUrl,
    }),

  clearCustomImage: () =>
    set((state) => ({
      customImageElement: null,
      customPreviewUrl: null,
      config: { ...state.config, type: 'pebble-tec' },
    })),
}));
