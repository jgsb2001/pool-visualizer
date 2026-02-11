import type { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

const MAX_DIMENSION = 1024;
const OUTPUT_FORMAT = 'png';

/**
 * Normalizes uploaded images:
 * - Resizes to MAX_DIMENSION x MAX_DIMENSION maximum
 * - Strips EXIF/metadata (security + privacy)
 * - Auto-orients based on EXIF rotation
 * - Converts to PNG for consistency
 * - Normalizes to sRGB color space
 *
 * Overwrites the original upload with the processed version.
 * Attaches normalized file paths to req.body.normalizedPaths.
 */
export async function normalizeImages(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const files = req.files as Express.Multer.File[];
  const normalizedPaths: string[] = [];

  try {
    for (const file of files) {
      const outputPath = path.join(
        path.dirname(file.path),
        `${path.basename(file.path, path.extname(file.path))}_norm.${OUTPUT_FORMAT}`,
      );

      await sharp(file.path)
        .rotate() // Auto-orient from EXIF
        .resize(MAX_DIMENSION, MAX_DIMENSION, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toColorspace('srgb')
        .png({ quality: 90 })
        .toFile(outputPath);

      // Remove original upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      normalizedPaths.push(outputPath);
    }

    req.body.normalizedPaths = normalizedPaths;
    next();
  } catch (err) {
    next(err);
  }
}
