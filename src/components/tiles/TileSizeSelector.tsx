'use client';

import { useState } from 'react';
import { usePoolStore } from '@/hooks/usePoolStore';
import { TILE_SIZE_PRESETS } from '@/lib/constants';
import type { TileSize } from '@/types/pool';

/**
 * Tile size selector with preset dropdown and optional custom input.
 * Presets: 1x1, 2x1, 2x2, 3x3, 4x4, 6x6 inches.
 * Custom: user-specified width and height (0.5" to 12" range).
 */
export function TileSizeSelector() {
  const tileSize = usePoolStore((s) => s.tileSize);
  const isCustom = usePoolStore((s) => s.isCustomTileSize);
  const setTileSize = usePoolStore((s) => s.setTileSize);
  const setCustomTileSize = usePoolStore((s) => s.setCustomTileSize);
  const setIsCustomTileSize = usePoolStore((s) => s.setIsCustomTileSize);

  const [customWidth, setCustomWidth] = useState(4);
  const [customHeight, setCustomHeight] = useState(4);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setIsCustomTileSize(true);
      setCustomTileSize(customWidth, customHeight);
      return;
    }
    const preset = TILE_SIZE_PRESETS.find((p) => p.label === value);
    if (preset) {
      setTileSize(preset);
    }
  };

  const handleCustomChange = (w: number, h: number) => {
    const clampedW = Math.max(0.5, Math.min(12, w));
    const clampedH = Math.max(0.5, Math.min(12, h));
    setCustomWidth(clampedW);
    setCustomHeight(clampedH);
    setCustomTileSize(clampedW, clampedH);
  };

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-semibold text-gray-600">
        Tile Size
      </label>
      <select
        value={isCustom ? 'custom' : tileSize.label}
        onChange={handlePresetChange}
        className="w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-accent-primary focus:outline-none"
      >
        {TILE_SIZE_PRESETS.map((preset) => (
          <option key={preset.label} value={preset.label}>
            {preset.label}
          </option>
        ))}
        <option value="custom">Custom Size</option>
      </select>

      {isCustom && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Width (in)</label>
            <input
              type="number"
              min={0.5}
              max={12}
              step={0.25}
              value={customWidth}
              onChange={(e) =>
                handleCustomChange(parseFloat(e.target.value) || 0.5, customHeight)
              }
              className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
            />
          </div>
          <span className="mt-4 text-gray-400">x</span>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Height (in)</label>
            <input
              type="number"
              min={0.5}
              max={12}
              step={0.25}
              value={customHeight}
              onChange={(e) =>
                handleCustomChange(customWidth, parseFloat(e.target.value) || 0.5)
              }
              className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
            />
          </div>
        </div>
      )}

      <p className="mt-1 text-xs text-gray-400">
        Current: {tileSize.widthInches}&quot; x {tileSize.heightInches}&quot;
      </p>
    </div>
  );
}
