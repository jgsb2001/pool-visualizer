'use client';

import { PoolShapeSelector } from './PoolShapeSelector';
import { PoolDimensionSliders } from './PoolDimensionSliders';
import { TileControls } from '@/components/tiles/TileControls';
import { InteriorTextureSelector } from '@/components/tiles/InteriorTextureSelector';
import { LightingPresetSelector } from './LightingPresetSelector';
import { EnvironmentSelector } from './EnvironmentSelector';

/**
 * Left sidebar containing all pool configuration controls.
 * Sections are added incrementally across phases.
 */
export function ControlPanel() {
  return (
    <aside className="flex w-sidebar shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white/95 p-5 shadow-lg">
      <h1 className="mb-2 text-xl font-bold text-gray-800">
        Pool Tile Visualizer
      </h1>
      <p className="mb-4 rounded-md bg-indigo-50 px-3 py-2 text-xs text-accent-primary">
        Upload waterline tiles, adjust pool settings, and explore in 3D.
        Scroll to zoom in/out.
      </p>

      <div className="border-b border-gray-100 pb-4">
        <PoolShapeSelector />
      </div>

      <div className="border-b border-gray-100 py-4">
        <PoolDimensionSliders />
      </div>

      <div className="border-b border-gray-100 py-4">
        <TileControls />
      </div>

      <div className="border-b border-gray-100 py-4">
        <InteriorTextureSelector />
      </div>

      <div className="py-4">
        <LightingPresetSelector />
        <EnvironmentSelector />
      </div>
    </aside>
  );
}
