'use client';

import { useCallback, useRef } from 'react';
import { useInteriorStore } from '@/hooks/useInteriorStore';
import type { InteriorConfig } from '@/types/pool';

const INTERIOR_OPTIONS: { value: InteriorConfig['type']; label: string }[] = [
  { value: 'pebble-tec', label: 'Pebble Tec' },
  { value: 'plaster', label: 'Plaster' },
  { value: 'custom', label: 'Custom Upload' },
];

/**
 * Pool interior texture selector — Pebble Tec, Plaster, or custom upload.
 * Applied to floor + walls below the waterline.
 */
export function InteriorTextureSelector() {
  const config = useInteriorStore((s) => s.config);
  const customPreviewUrl = useInteriorStore((s) => s.customPreviewUrl);
  const setInteriorType = useInteriorStore((s) => s.setInteriorType);
  const setCustomImage = useInteriorStore((s) => s.setCustomImage);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as InteriorConfig['type'];
      if (value === 'custom') {
        inputRef.current?.click();
      } else {
        setInteriorType(value);
      }
    },
    [setInteriorType],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setCustomImage(img, dataUrl);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [setCustomImage],
  );

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-semibold text-gray-600">
        Pool Interior
      </label>
      <select
        value={config.type}
        onChange={handleTypeChange}
        className="w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-accent-primary focus:outline-none"
      >
        {INTERIOR_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {config.type === 'custom' && customPreviewUrl && (
        <div className="mt-2">
          <img
            src={customPreviewUrl}
            alt="Custom interior preview"
            className="h-16 w-full rounded-md border border-gray-200 object-cover"
          />
        </div>
      )}

      <p className="mt-1 text-xs text-gray-400">
        Applied to pool floor and walls below the waterline.
      </p>
    </div>
  );
}
