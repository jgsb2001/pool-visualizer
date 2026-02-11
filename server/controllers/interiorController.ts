import type { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import { processTileImage } from '../services/imageProcessor';

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Handles interior texture upload processing.
 * Same pipeline as tiles but for pool interior (pebble tec / plaster) images.
 */
export async function handleInteriorUpload(
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

    // Process first image only (interior is a single texture)
    const result = await processTileImage(normalizedPaths[0], UPLOADS_DIR);

    res.json({ interior: result });
  } catch (err) {
    next(err);
  }
}
