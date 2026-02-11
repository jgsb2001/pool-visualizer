'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { usePoolStore } from '@/hooks/usePoolStore';
import { useEnvironmentStore } from '@/hooks/useEnvironmentStore';
import { useTileTexture } from '@/hooks/useTileTexture';
import { useTilePBR } from '@/hooks/useTilePBR';
import { useInteriorTexture } from '@/hooks/useInteriorTexture';
import { LIGHTING_PRESET_MAP } from '@/lib/lighting/presets';
import { INCHES_TO_METERS } from '@/lib/constants';
import { CameraControls } from './CameraControls';
import { EnvironmentSetup } from './EnvironmentSetup';
import { GroundPlane } from './GroundPlane';
import { PoolLights } from './PoolLights';
import { PoolShell } from './PoolShell';
import { WaterlineBand } from './WaterlineBand';
import { WaterSurface } from './WaterSurface';
import { PostProcessing } from './PostProcessing';
import { UnderwaterCaustics } from './UnderwaterCaustics';
import { RealisticPoolProps } from './RealisticPoolProps';
import { SkyDome } from './SkyDome';
import { VolumetricClouds } from './VolumetricClouds';
import { BackyardEnclosure } from './BackyardEnclosure';

interface WaterlineMetadata {
  tilesAround: number;
  totalLength: number;
  perimeterPoints: THREE.Vector3[];
  arcLengths: number[];
  tileHeightMeters: number;
}

/**
 * Inner scene content — must be inside <Canvas> so R3F hooks work.
 * Connects tile texture, interior texture, environment, and lighting.
 */
export function SceneContent() {
  const { shape, dimensions, tileSize, waterOpacity } = usePoolStore();
  const lightingPreset = useEnvironmentStore((s) => s.lightingPreset);
  const preset = LIGHTING_PRESET_MAP[lightingPreset];
  const scene = useThree((s) => s.scene);

  const [waterlineData, setWaterlineData] = useState<WaterlineMetadata | null>(
    null,
  );

  // Store scene reference for export button (outside Canvas)
  useEffect(() => {
    (window as any).__poolScene = scene;
    return () => {
      delete (window as any).__poolScene;
    };
  }, [scene]);

  // World radius: half-diagonal of pool+deck footprint
  // This drives camera framing and ground plane fade
  const worldRadius = useMemo(() => {
    const deckOffset = 0.42 + 2.5; // COPING_OUTER_OFFSET + DECK_WIDTH
    const totalLength = dimensions.lengthMeters + deckOffset * 2;
    const totalWidth = dimensions.widthMeters + deckOffset * 2;
    return Math.sqrt(totalLength * totalLength + totalWidth * totalWidth) / 2;
  }, [dimensions.lengthMeters, dimensions.widthMeters]);

  const { texture: tileTexture } = useTileTexture();
  const { normalMap, roughnessMap, aoMap } = useTilePBR();
  const interiorTexture = useInteriorTexture();

  // Deck sits at ground level (y=0) for natural appearance
  // Only the tile height determines vertical positioning
  const deckHeight = 0;

  const handleWaterlineGeometry = useCallback(
    (data: WaterlineMetadata) => {
      setWaterlineData(data);
    },
    [],
  );

  return (
    <>
      <CameraControls worldRadius={worldRadius} targetHeight={deckHeight} />

      {/* Volumetric clouds with realistic lighting */}
      <VolumetricClouds />

      {/* Enhanced atmospheric fog with realistic density */}
      <fog attach="fog" args={['#c8dff5', 60, 150]} />

      {/* HDRI environment for reflections AND background sky */}
      <Suspense fallback={null}>
        <EnvironmentSetup />
      </Suspense>

      {/* Pool lights for night mode */}
      <PoolLights enabled={preset.enablePoolLights} />

      {/* Pool geometry */}
      <WaterlineBand
        shape={shape}
        length={dimensions.lengthMeters}
        width={dimensions.widthMeters}
        tileWidthInches={tileSize.widthInches}
        tileHeightInches={tileSize.heightInches}
        tileTexture={tileTexture}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        aoMap={aoMap}
        onGeometryCreated={handleWaterlineGeometry}
      />

      <PoolShell
        shape={shape}
        length={dimensions.lengthMeters}
        width={dimensions.widthMeters}
        depth={dimensions.depthMeters}
        tileHeightInches={tileSize.heightInches}
        perimeterPoints={waterlineData?.perimeterPoints}
        arcLengths={waterlineData?.arcLengths}
        totalLength={waterlineData?.totalLength}
        interiorTexture={interiorTexture}
      />

      <WaterSurface
        shape={shape}
        length={dimensions.lengthMeters}
        width={dimensions.widthMeters}
        opacity={waterOpacity}
      />

      {/* Underwater caustic light patterns on pool floor */}
      <UnderwaterCaustics
        shape={shape}
        length={dimensions.lengthMeters}
        width={dimensions.widthMeters}
        depth={dimensions.depthMeters}
      />

      {/* In-ground surface with pool-shaped cutout */}
      <GroundPlane
        shape={shape}
        length={dimensions.lengthMeters}
        width={dimensions.widthMeters}
        height={deckHeight}
      />

      {/* Backyard enclosure (fences, walls, contained environment) */}
      <BackyardEnclosure
        poolLength={dimensions.lengthMeters}
        poolWidth={dimensions.widthMeters}
        deckHeight={deckHeight}
      />

      {/* Poolside props and furniture */}
      <RealisticPoolProps
        deckHeight={deckHeight}
        poolLength={dimensions.lengthMeters}
        poolWidth={dimensions.widthMeters}
      />

      {/* Post-processing: SSAO, Bloom, ToneMapping */}
      <PostProcessing />
    </>
  );
}
