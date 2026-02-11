import { create } from 'zustand';

interface TilePBRMaps {
  normal: string;
  roughness: string;
  ao: string;
}

interface TileImage {
  id: string;
  previewUrl: string;
  element: HTMLImageElement;
  pbrMaps?: TilePBRMaps;
}

interface TileState {
  tileImages: TileImage[];
  rotationEnabled: boolean;
  randomSeed: number;

  addTileImages: (images: TileImage[]) => void;
  removeTileImage: (id: string) => void;
  clearTileImages: () => void;
  toggleRotation: () => void;
  regenerate: () => void;
  updatePBRMaps: (id: string, pbrMaps: TilePBRMaps) => void;
}

export const useTileStore = create<TileState>((set) => ({
  tileImages: [],
  rotationEnabled: true,
  randomSeed: Date.now(),

  addTileImages: (images) =>
    set((state) => ({
      tileImages: [...state.tileImages, ...images].slice(0, 4),
    })),

  removeTileImage: (id) =>
    set((state) => ({
      tileImages: state.tileImages.filter((t) => t.id !== id),
    })),

  clearTileImages: () => set({ tileImages: [] }),

  toggleRotation: () =>
    set((state) => ({ rotationEnabled: !state.rotationEnabled })),

  regenerate: () => set({ randomSeed: Date.now() }),

  updatePBRMaps: (id, pbrMaps) =>
    set((state) => ({
      tileImages: state.tileImages.map((t) =>
        t.id === id ? { ...t, pbrMaps } : t,
      ),
    })),
}));
