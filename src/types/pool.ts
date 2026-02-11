export type PoolShape = 'rectangle' | 'oval' | 'circular' | 'jellybean';

export interface PoolDimensions {
  lengthMeters: number;
  widthMeters: number;
  depthMeters: number;
}

export interface TileSize {
  widthInches: number;
  heightInches: number;
  label: string;
}

export interface GroutConfig {
  sizeInches: number;
  color: string;
}

export interface InteriorConfig {
  type: 'pebble-tec' | 'plaster' | 'custom';
  customTextureUrl?: string;
}

export interface PoolConfig {
  shape: PoolShape;
  dimensions: PoolDimensions;
  tileSize: TileSize;
  grout: GroutConfig;
  interior: InteriorConfig;
  waterOpacity: number;
}
