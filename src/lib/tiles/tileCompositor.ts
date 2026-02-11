import type { TileCompositorParams } from '@/types/tiles';
import { createSeededRandom } from './seededRandom';

/**
 * Composites tile images into a repeating strip with grout lines.
 *
 * Strategy: Creates a canvas containing `tilesInStrip` tiles in a row,
 * with grout borders. The canvas is used as a repeating texture via
 * THREE.RepeatWrapping. For a pool with N tiles around, the texture
 * repeat is set to N/tilesInStrip.
 *
 * Grout is rendered by filling the canvas with grout color first,
 * then drawing each tile image into its cell with grout margins.
 *
 * @returns An offscreen canvas ready to be used as a Three.js texture source
 */
export function compositeTileStrip(params: TileCompositorParams): HTMLCanvasElement {
  const {
    images,
    tilesInStrip,
    tileWidthPixels,
    tileHeightPixels,
    groutSizePixels,
    groutColor,
    enableRotation,
    seed,
  } = params;

  if (images.length === 0) {
    // Return a 1x1 blank canvas if no images
    const blank = document.createElement('canvas');
    blank.width = 1;
    blank.height = 1;
    return blank;
  }

  const cellWidth = tileWidthPixels + groutSizePixels;
  const cellHeight = tileHeightPixels + groutSizePixels;
  const canvasWidth = tilesInStrip * cellWidth + groutSizePixels;
  const canvasHeight = cellHeight + groutSizePixels;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  // Fill entire canvas with grout color (grout lines appear as gaps between tiles)
  ctx.fillStyle = groutColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const rng = createSeededRandom(seed);

  for (let col = 0; col < tilesInStrip; col++) {
    // Pick a random tile image
    const imageIndex = Math.floor(rng() * images.length);
    const image = images[imageIndex];

    // Determine rotation (0, 90, 180, 270 degrees)
    const rotation = enableRotation ? Math.floor(rng() * 4) * 90 : 0;

    const x = groutSizePixels + col * cellWidth;
    const y = groutSizePixels;

    ctx.save();

    // Translate to center of the tile cell, rotate, then draw centered
    const centerX = x + tileWidthPixels / 2;
    const centerY = y + tileHeightPixels / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw tile image centered at origin
    // For non-square tiles with rotation, we swap width/height on 90/270
    const isRotated90 = rotation === 90 || rotation === 270;
    const drawWidth = isRotated90 ? tileHeightPixels : tileWidthPixels;
    const drawHeight = isRotated90 ? tileWidthPixels : tileHeightPixels;

    ctx.drawImage(
      image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
    );

    ctx.restore();
  }

  return canvas;
}

/**
 * Calculate grout size in pixels proportional to the real-world tile/grout ratio.
 * E.g., 1/8" grout on a 6" tile at 256px/tile = (0.125 / 6) * 256 ≈ 5.3px
 */
export function calculateGroutPixels(
  groutSizeInches: number,
  tileWidthInches: number,
  tileWidthPixels: number,
): number {
  return Math.max(1, Math.round((groutSizeInches / tileWidthInches) * tileWidthPixels));
}
