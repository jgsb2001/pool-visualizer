'use client';

import { usePoolStore } from '@/hooks/usePoolStore';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

function SliderRow({ label, value, min, max, step, unit, onChange }: SliderRowProps) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-sm font-medium text-gray-600">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-accent-primary"
        />
        <span className="min-w-[60px] text-right text-sm font-semibold text-accent-primary">
          {value}
          {unit}
        </span>
      </div>
    </div>
  );
}

export function PoolDimensionSliders() {
  const dimensions = usePoolStore((s) => s.dimensions);
  const waterOpacity = usePoolStore((s) => s.waterOpacity);
  const setDimensions = usePoolStore((s) => s.setDimensions);
  const setWaterOpacity = usePoolStore((s) => s.setWaterOpacity);

  return (
    <div className="mb-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-600">
        Pool Dimensions
      </h3>
      <SliderRow
        label="Length (meters)"
        value={dimensions.lengthMeters}
        min={4}
        max={20}
        step={0.5}
        unit="m"
        onChange={(v) => setDimensions({ lengthMeters: v })}
      />
      <SliderRow
        label="Width (meters)"
        value={dimensions.widthMeters}
        min={2}
        max={12}
        step={0.5}
        unit="m"
        onChange={(v) => setDimensions({ widthMeters: v })}
      />
      <SliderRow
        label="Depth (meters)"
        value={dimensions.depthMeters}
        min={1}
        max={3}
        step={0.1}
        unit="m"
        onChange={(v) => setDimensions({ depthMeters: v })}
      />
      <SliderRow
        label="Water Opacity"
        value={waterOpacity}
        min={0.2}
        max={0.9}
        step={0.05}
        unit=""
        onChange={setWaterOpacity}
      />
    </div>
  );
}
