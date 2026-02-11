import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

/**
 * Export the entire Three.js scene to GLTF format for Blender/Unreal
 */
export function exportSceneToGLTF(scene: THREE.Scene, filename: string = 'pool-scene.glb') {
  const exporter = new GLTFExporter();

  const options = {
    binary: true, // Export as .glb (binary) instead of .gltf (JSON)
    embedImages: true, // Include all textures
    maxTextureSize: 4096, // Keep high-res textures
    includeCustomExtensions: true,
  };

  exporter.parse(
    scene,
    (result) => {
      if (result instanceof ArrayBuffer) {
        saveArrayBuffer(result, filename);
      } else {
        const output = JSON.stringify(result, null, 2);
        saveString(output, filename.replace('.glb', '.gltf'));
      }
    },
    (error) => {
      console.error('Export error:', error);
    },
    options
  );
}

function saveArrayBuffer(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function saveString(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
