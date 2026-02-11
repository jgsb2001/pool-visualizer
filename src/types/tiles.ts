export interface UploadedTile {
  id: string;
  file: File;
  previewUrl: string;
  imageElement: HTMLImageElement | null;
}

export interface ProcessedTile {
  id: string;
  diffuseUrl: string;
  normalUrl: string;
  roughnessUrl: string;
}

export interface TileCompositorParams {
  images: HTMLImageElement[];
  tilesInStrip: number;
  tileWidthPixels: number;
  tileHeightPixels: number;
  groutSizePixels: number;
  groutColor: string;
  enableRotation: boolean;
  seed: number;
}
