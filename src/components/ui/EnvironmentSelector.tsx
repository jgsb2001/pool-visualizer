'use client';

import { useEnvironmentStore } from '@/hooks/useEnvironmentStore';
import { ENVIRONMENT_PRESETS } from '@/lib/lighting/presets';

export function EnvironmentSelector() {
  const environmentPreset = useEnvironmentStore((s) => s.environmentPreset);
  const setEnvironmentPreset = useEnvironmentStore(
    (s) => s.setEnvironmentPreset,
  );

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-semibold text-gray-600">
        Environment
      </label>
      <select
        value={environmentPreset}
        onChange={(e) => setEnvironmentPreset(e.target.value)}
        className="w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-accent-primary focus:outline-none"
      >
        {ENVIRONMENT_PRESETS.map((env) => (
          <option key={env.id} value={env.dreiPreset}>
            {env.label}
          </option>
        ))}
      </select>
    </div>
  );
}
