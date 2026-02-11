import type { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import { processTileImage } from '../services/imageProcessor';

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Handles tile image upload processing.
 * At this point in the pipeline:
 * - Files have been uploaded by multer
 * - Validated by imageValidation middleware
 * - Normalized by imageNormalization middleware
 *
 * This controller generates PBR maps and returns the processed tile data.
 */
export async function handleTileUpload(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const normalizedPaths: string[] = req.body.normalizedPaths || [];

    if (normalizedPaths.length === 0) {
      res.status(400).json({ error: 'No processed images available' });
      return;
    }

    const results = await Promise.all(
      normalizedPaths.map((filePath: string) =>
        processTileImage(filePath, UPLOADS_DIR),
      ),
    );

    res.json({ tiles: results });
  } catch (err) {
    next(err);
  }
}
