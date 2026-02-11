'use client';

import { EffectComposer, SSAO, Bloom, ToneMapping, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';

/**
 * AAA-quality post-processing stack for photorealistic rendering.
 *
 * - SSAO: Enhanced ambient occlusion for micro-shadows
 * - Bloom: Realistic lens bloom on bright surfaces and water
 * - ToneMapping: AGX tone mapping for cinematic color response
 * - ChromaticAberration: Subtle lens distortion for realism
 * - Vignette: Natural camera vignetting effect
 */
export function PostProcessing() {
  return (
    <EffectComposer multisampling={8} enableNormalPass>
      {/* Enhanced SSAO with higher quality settings */}
      <SSAO
        blendFunction={BlendFunction.MULTIPLY}
        samples={32}
        radius={0.08}
        intensity={3.5}
        luminanceInfluence={0.5}
        bias={0.025}
        fade={0.01}
        color="#000000"
        resolutionScale={1.0}
        worldDistanceThreshold={0.3}
        worldDistanceFalloff={0.05}
        worldProximityThreshold={0.15}
        worldProximityFalloff={0.05}
      />

      {/* Enhanced bloom for water reflections and sunlight */}
      <Bloom
        intensity={0.35}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.6}
        mipmapBlur
        radius={0.8}
        levels={8}
      />

      {/* Subtle chromatic aberration for lens realism */}
      <ChromaticAberration
        offset={new THREE.Vector2(0.0008, 0.0008)}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Natural vignette effect */}
      <Vignette
        offset={0.3}
        darkness={0.5}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* AGX tone mapping for cinematic look */}
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  );
}
