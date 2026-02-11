'use client';

import { useTileStore } from '@/hooks/useTileStore';

/**
 * 2x2 grid showing thumbnails of uploaded tile images.
 * Click the X on any thumbnail to remove it.
 */
export function TilePreviewGrid() {
  const tileImages = useTileStore((s) => s.tileImages);
  const removeTileImage = useTileStore((s) => s.removeTileImage);

  if (tileImages.length === 0) return null;

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {tileImages.map((tile) => (
        <div key={tile.id} className="group relative">
          <img
            src={tile.previewUrl}
            alt="Tile preview"
            className="h-20 w-full rounded-md border-2 border-gray-200 object-cover"
          />
          <button
            onClick={() => removeTileImage(tile.id)}
            className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white group-hover:flex"
            aria-label="Remove tile"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
