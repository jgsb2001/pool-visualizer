import { useMemo } from 'react';
import * as THREE from 'three';
import { useTileStore } from './useTileStore';
import { usePoolStore } from './usePoolStore';
import {
  compositeTileStrip,
  calculateGroutPixels,
} from '@/lib/tiles/tileCompositor';
import {
  TILE_TEXTURE_RESOLUTION,
  REPEATING_STRIP_TILE_COUNT,
} from '@/lib/constants';

interface TileTextureResult {
  texture: THREE.CanvasTexture | null;
  tilesInStrip: number;
}

/**
 * Creates a composited tile texture from uploaded images + grout settings.
 * Returns a repeating CanvasTexture that maps to the waterline band's UVs.
 *
 * The texture contains REPEATING_STRIP_TILE_COUNT tiles. The UV mapping
 * on the waterline uses u = arcLength / tileWidth, so the texture repeat
 * must be set to tilesAround / tilesInStrip to tile correctly.
 */
export function useTileTexture(): TileTextureResult {
  const tileImages = useTileStore((s) => s.tileImages);
  const rotationEnabled = useTileStore((s) => s.rotationEnabled);
  const randomSeed = useTileStore((s) => s.randomSeed);
  const tileSize = usePoolStore((s) => s.tileSize);
  const grout = usePoolStore((s) => s.grout);

  const texture = useMemo(() => {
    const imageElements = tileImages.map((t) => t.element);
    if (imageElements.length === 0) return null;

    // Calculate pixel-proportional grout size
    const tileWidthPx = TILE_TEXTURE_RESOLUTION;
    const tileHeightPx = Math.round(
      TILE_TEXTURE_RESOLUTION *
        (tileSize.heightInches / tileSize.widthInches),
    );
    const groutPx = calculateGroutPixels(
      grout.sizeInches,
      tileSize.widthInches,
      tileWidthPx,
    );

    const canvas = compositeTileStrip({
      images: imageElements,
      tilesInStrip: REPEATING_STRIP_TILE_COUNT,
      tileWidthPixels: tileWidthPx,
      tileHeightPixels: tileHeightPx,
      groutSizePixels: groutPx,
      groutColor: grout.color,
      enableRotation: rotationEnabled,
      seed: randomSeed,
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;

    return tex;
  }, [tileImages, rotationEnabled, randomSeed, tileSize, grout]);

  return { texture, tilesInStrip: REPEATING_STRIP_TILE_COUNT };
}
