'use client';

import type { PoolShape } from '@/types/pool';
import { usePoolStore } from '@/hooks/usePoolStore';

const POOL_SHAPES: { value: PoolShape; label: string }[] = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'oval', label: 'Oval' },
  { value: 'circular', label: 'Circular' },
  { value: 'jellybean', label: 'Jellybean / Kidney' },
];

export function PoolShapeSelector() {
  const shape = usePoolStore((s) => s.shape);
  const setShape = usePoolStore((s) => s.setShape);

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-semibold text-gray-600">
        Pool Shape
      </label>
      <select
        value={shape}
        onChange={(e) => setShape(e.target.value as PoolShape)}
        className="w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-accent-primary focus:outline-none"
      >
        {POOL_SHAPES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
