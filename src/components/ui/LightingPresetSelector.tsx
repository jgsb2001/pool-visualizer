'use client';

import { useEnvironmentStore } from '@/hooks/useEnvironmentStore';
import { LIGHTING_PRESET_MAP } from '@/lib/lighting/presets';
import type { LightingPresetName } from '@/types/environment';

const PRESETS: { name: LightingPresetName; label: string; icon: string }[] = [
  { name: 'bright', label: 'Midday', icon: 'Bright' },
  { name: 'morning', label: 'Morning', icon: 'Dawn' },
  { name: 'evening', label: 'Evening', icon: 'Dusk' },
  { name: 'night', label: 'Night', icon: 'Dark' },
];

export function LightingPresetSelector() {
  const lightingPreset = useEnvironmentStore((s) => s.lightingPreset);
  const setLightingPreset = useEnvironmentStore((s) => s.setLightingPreset);
  const setEnvironmentPreset = useEnvironmentStore(
    (s) => s.setEnvironmentPreset,
  );

  const handleSelect = (preset: LightingPresetName) => {
    setLightingPreset(preset);
    // Auto-select matching environment HDRI
    setEnvironmentPreset(LIGHTING_PRESET_MAP[preset].hdri);
  };

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-semibold text-gray-600">
        Lighting
      </label>
      <div className="grid grid-cols-4 gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => handleSelect(p.name)}
            className={`rounded-md px-2 py-2 text-xs font-medium transition-colors ${
              lightingPreset === p.name
                ? 'bg-accent-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="text-center">
              <div className="text-[10px] opacity-70">{p.icon}</div>
              <div>{p.label}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
