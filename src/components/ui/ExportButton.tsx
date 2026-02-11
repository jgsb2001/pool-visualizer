'use client';

import { useEffect, useState } from 'react';
import { exportSceneToGLTF } from '@/lib/export/exportScene';
import * as THREE from 'three';

// Export button component (used outside Canvas)
export function ExportButton() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if scene is available
    const checkScene = setInterval(() => {
      if ((window as any).__poolScene) {
        setIsReady(true);
        clearInterval(checkScene);
      }
    }, 100);

    return () => clearInterval(checkScene);
  }, []);

  const handleExport = () => {
    const scene = (window as any).__poolScene as THREE.Scene;
    if (scene) {
      exportSceneToGLTF(scene, 'pool-visualizer.glb');
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={!isReady}
      className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg z-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isReady ? 'Export 3D Scene (.glb)' : 'Loading...'}
    </button>
  );
}
