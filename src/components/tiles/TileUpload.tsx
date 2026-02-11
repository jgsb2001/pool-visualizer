'use client';

import { useCallback, useRef } from 'react';
import { useTileStore } from '@/hooks/useTileStore';
import { uploadTileImages } from '@/services/tileApi';
import { MAX_UPLOAD_TILES } from '@/lib/constants';

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Tile image uploader — accepts up to 4 tile images.
 * Loads images as HTMLImageElement for canvas compositing,
 * creates preview URLs for the thumbnail grid, and uploads
 * to the server for PBR map generation (normal, roughness, AO).
 */
export function TileUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const tileImages = useTileStore((s) => s.tileImages);
  const addTileImages = useTileStore((s) => s.addTileImages);
  const clearTileImages = useTileStore((s) => s.clearTileImages);
  const updatePBRMaps = useTileStore((s) => s.updatePBRMaps);

  const remainingSlots = MAX_UPLOAD_TILES - tileImages.length;

  const handleFiles = useCallback(
    (files: FileList) => {
      const filesToProcess = Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .slice(0, remainingSlots);

      if (filesToProcess.length === 0) return;

      // Generate client-side IDs for immediate preview
      const clientIds: string[] = [];

      const promises = filesToProcess.map(
        (file, idx) =>
          new Promise<{ id: string; previewUrl: string; element: HTMLImageElement; file: File }>(
            (resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                const img = new Image();
                img.onload = () => {
                  const id = generateId();
                  clientIds[idx] = id;
                  resolve({
                    id,
                    previewUrl: dataUrl,
                    element: img,
                    file,
                  });
                };
                img.onerror = reject;
                img.src = dataUrl;
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            },
          ),
      );

      Promise.all(promises).then((loaded) => {
        // Add to store immediately for preview
        addTileImages(loaded.map(({ id, previewUrl, element }) => ({ id, previewUrl, element })));

        // Upload to server for PBR map generation (async, non-blocking)
        uploadTileImages(loaded.map((l) => l.file))
          .then((response) => {
            // Map server results back to client tile IDs
            response.tiles.forEach((serverTile, idx) => {
              if (idx < loaded.length) {
                updatePBRMaps(loaded[idx].id, {
                  normal: serverTile.normal,
                  roughness: serverTile.roughness,
                  ao: serverTile.ao,
                });
              }
            });
          })
          .catch(() => {
            // PBR map generation failed — tiles still work without them
          });
      });
    },
    [addTileImages, updatePBRMaps, remainingSlots],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
      // Reset input so the same file can be re-selected
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [handleFiles],
  );

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-semibold text-gray-600">
        Waterline Tiles ({tileImages.length}/{MAX_UPLOAD_TILES})
      </label>

      <div
        className="cursor-pointer rounded-lg border-2 border-dashed border-accent-primary bg-indigo-50 px-4 py-3 text-center transition-colors hover:border-accent-secondary hover:bg-indigo-100"
        onClick={() => inputRef.current?.click()}
      >
        <span className="text-sm font-semibold text-accent-primary">
          Choose Tile Images
        </span>
        <p className="mt-1 text-xs text-gray-400">
          {remainingSlots > 0
            ? `Up to ${remainingSlots} more image${remainingSlots > 1 ? 's' : ''}`
            : 'Maximum reached'}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
        disabled={remainingSlots <= 0}
      />

      {tileImages.length > 0 && (
        <button
          onClick={clearTileImages}
          className="mt-2 text-xs text-red-500 hover:text-red-700"
        >
          Clear all tiles
        </button>
      )}
    </div>
  );
}
