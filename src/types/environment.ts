export type LightingPresetName = 'bright' | 'morning' | 'evening' | 'night';

export interface LightingPreset {
  name: LightingPresetName;
  label: string;
  hdri: string;
  ambientIntensity: number;
  directionalIntensity: number;
  directionalPosition: [number, number, number];
  directionalColor: string;
  enablePoolLights: boolean;
  toneMappingExposure: number;
}

export interface EnvironmentOption {
  id: string;
  label: string;
  hdriFile: string;
  thumbnailUrl: string;
}
