import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { generateNormalMap, generateRoughnessMap, generateAOMap } from './pbrGenerator';

interface ProcessedTileResult {
  id: string;
  diffuse: string;
  normal: string;
  roughness: string;
  ao: string;
}

/**
 * Full image processing pipeline for a single tile:
 * 1. Takes the normalized image path
 * 2. Generates PBR maps (normal, roughness, AO)
 * 3. Returns paths to all generated textures
 */
export async function processTileImage(
  normalizedPath: string,
  uploadsDir: string,
): Promise<ProcessedTileResult> {
  const id = uuidv4();
  const outputDir = path.join(uploadsDir, id);

  // Create output directory
  const fs = await import('fs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Copy normalized image as diffuse
  const diffusePath = path.join(outputDir, 'diffuse.png');
  fs.copyFileSync(normalizedPath, diffusePath);

  // Generate PBR maps in parallel
  const [normalPath, roughnessPath, aoPath] = await Promise.all([
    generateNormalMap(normalizedPath, outputDir),
    generateRoughnessMap(normalizedPath, outputDir),
    generateAOMap(normalizedPath, outputDir),
  ]);

  // Clean up the normalized temp file
  if (fs.existsSync(normalizedPath)) {
    fs.unlinkSync(normalizedPath);
  }

  return {
    id,
    diffuse: `/api/tiles/${id}/diffuse.png`,
    normal: `/api/tiles/${id}/${path.basename(normalPath)}`,
    roughness: `/api/tiles/${id}/${path.basename(roughnessPath)}`,
    ao: `/api/tiles/${id}/${path.basename(aoPath)}`,
  };
}
