import sharp from 'sharp';
import * as path from 'path';

/**
 * Generates PBR texture maps from a diffuse image.
 * These are algorithmic approximations — suitable for tile textures
 * where surface detail can be inferred from luminance.
 */

/**
 * Normal map via Sobel filter.
 * Converts the image to a grayscale height map, then computes
 * surface normals from the gradient at each pixel.
 *
 * Output: RGB image where R/G encode surface direction, B encodes height.
 * Flat surface = (127, 127, 255) which is normal pointing straight up.
 */
export async function generateNormalMap(
  inputPath: string,
  outputDir: string,
): Promise<string> {
  const outputPath = path.join(outputDir, `${getBaseName(inputPath)}_normal.png`);

  const { data, info } = await sharp(inputPath)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const normalData = Buffer.alloc(width * height * 3);
  const strength = 2.0; // Normal map intensity

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Sample surrounding pixels (clamp at edges)
      const tl = getPixel(data, width, height, x - 1, y - 1);
      const t = getPixel(data, width, height, x, y - 1);
      const tr = getPixel(data, width, height, x + 1, y - 1);
      const l = getPixel(data, width, height, x - 1, y);
      const r = getPixel(data, width, height, x + 1, y);
      const bl = getPixel(data, width, height, x - 1, y + 1);
      const b = getPixel(data, width, height, x, y + 1);
      const br = getPixel(data, width, height, x + 1, y + 1);

      // Sobel kernels
      const gx = (tr + 2 * r + br) - (tl + 2 * l + bl);
      const gy = (bl + 2 * b + br) - (tl + 2 * t + tr);

      // Compute normal vector
      const nx = -gx * strength / 255;
      const ny = -gy * strength / 255;
      const nz = 1.0;

      // Normalize
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const rnx = nx / len;
      const rny = ny / len;
      const rnz = nz / len;

      // Map from [-1, 1] to [0, 255]
      const idx = (y * width + x) * 3;
      normalData[idx] = Math.round((rnx + 1) * 127.5);     // R
      normalData[idx + 1] = Math.round((rny + 1) * 127.5); // G
      normalData[idx + 2] = Math.round(rnz * 255);          // B
    }
  }

  await sharp(normalData, { raw: { width, height, channels: 3 } })
    .png()
    .toFile(outputPath);

  return outputPath;
}

/**
 * Roughness map — inverted luminance with slight blur.
 * Bright areas → smooth (low roughness), dark areas → rough.
 * Good heuristic for glazed ceramic tiles.
 */
export async function generateRoughnessMap(
  inputPath: string,
  outputDir: string,
): Promise<string> {
  const outputPath = path.join(outputDir, `${getBaseName(inputPath)}_roughness.png`);

  await sharp(inputPath)
    .grayscale()
    .blur(1.5)
    .negate()
    .linear(0.7, 76.5) // Compress range: output = 0.7 * input + 76.5
    .png()
    .toFile(outputPath);

  return outputPath;
}

/**
 * Ambient occlusion — blurred self-occlusion approximation.
 * Heavy blur of grayscale, then multiply with original.
 */
export async function generateAOMap(
  inputPath: string,
  outputDir: string,
): Promise<string> {
  const outputPath = path.join(outputDir, `${getBaseName(inputPath)}_ao.png`);

  // Create heavily blurred version
  const blurred = await sharp(inputPath)
    .grayscale()
    .blur(10)
    .toBuffer();

  // Multiply with original grayscale
  const original = await sharp(inputPath)
    .grayscale()
    .toBuffer();

  // Composite: multiply blend
  await sharp(original)
    .composite([
      {
        input: blurred,
        blend: 'multiply',
      },
    ])
    .linear(1.3, 0) // Brighten slightly to avoid too-dark AO
    .png()
    .toFile(outputPath);

  return outputPath;
}

function getPixel(
  data: Buffer,
  width: number,
  height: number,
  x: number,
  y: number,
): number {
  const cx = Math.max(0, Math.min(width - 1, x));
  const cy = Math.max(0, Math.min(height - 1, y));
  return data[cy * width + cx];
}

function getBaseName(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}
