'use client';

import { TileUpload } from './TileUpload';
import { TilePreviewGrid } from './TilePreviewGrid';
import { TileSizeSelector } from './TileSizeSelector';
import { GroutSettings } from './GroutSettings';
import { useTileStore } from '@/hooks/useTileStore';

/**
 * Container for all tile-related controls:
 * upload, preview, size selection, grout, and randomization options.
 */
export function TileControls() {
  const rotationEnabled = useTileStore((s) => s.rotationEnabled);
  const toggleRotation = useTileStore((s) => s.toggleRotation);
  const regenerate = useTileStore((s) => s.regenerate);
  const tileImages = useTileStore((s) => s.tileImages);

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-600">
        Tile Settings
      </h3>

      <TileUpload />
      <TilePreviewGrid />
      <TileSizeSelector />
      <GroutSettings />

      <div className="flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={rotationEnabled}
            onChange={toggleRotation}
            className="rounded accent-accent-primary"
          />
          Auto-rotate tiles
        </label>
      </div>

      {tileImages.length > 0 && (
        <button
          onClick={regenerate}
          className="mt-3 w-full rounded-md bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
        >
          Randomize Tile Placement
        </button>
      )}
    </div>
  );
}
