import { useMemo } from 'react';
import * as THREE from 'three';
import { useInteriorStore } from './useInteriorStore';
import {
  createPebbleTecCanvas,
  createPlasterCanvas,
} from '@/lib/textures/proceduralInterior';

/**
 * Returns a tiling Three.js texture for the selected pool interior.
 * Supports built-in Pebble Tec, Plaster, and custom uploaded textures.
 */
export function useInteriorTexture(): THREE.Texture | null {
  const config = useInteriorStore((s) => s.config);
  const customImageElement = useInteriorStore((s) => s.customImageElement);

  const texture = useMemo(() => {
    let canvas: HTMLCanvasElement;

    switch (config.type) {
      case 'pebble-tec':
        canvas = createPebbleTecCanvas();
        break;
      case 'plaster':
        canvas = createPlasterCanvas();
        break;
      case 'custom': {
        if (!customImageElement) return null;
        // Draw uploaded image onto a canvas for texture consistency
        canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        ctx.drawImage(customImageElement, 0, 0, 512, 512);
        break;
      }
      default:
        return null;
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;

    return tex;
  }, [config.type, customImageElement]);

  return texture;
}
