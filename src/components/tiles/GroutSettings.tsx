'use client';

import { usePoolStore } from '@/hooks/usePoolStore';
import { GROUT_SIZE_PRESETS } from '@/lib/constants';

/**
 * Grout size and color configuration.
 * Preset sizes: 1/16", 1/8", 3/16", 1/4".
 * Color picker with default medium gray.
 */
export function GroutSettings() {
  const grout = usePoolStore((s) => s.grout);
  const setGrout = usePoolStore((s) => s.setGrout);

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-semibold text-gray-600">
        Grout
      </label>

      <div className="mb-2 flex flex-wrap gap-1">
        {GROUT_SIZE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setGrout({ sizeInches: preset.value })}
            className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
              grout.sizeInches === preset.value
                ? 'border-accent-primary bg-accent-primary text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">Color:</label>
        <input
          type="color"
          value={grout.color}
          onChange={(e) => setGrout({ color: e.target.value })}
          className="h-7 w-10 cursor-pointer rounded border border-gray-200"
        />
        <span className="text-xs text-gray-400">{grout.color}</span>
      </div>
    </div>
  );
}
