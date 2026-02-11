import type { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Magic bytes for common image formats
const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
};

/**
 * Validates uploaded image files by checking:
 * 1. MIME type from file header magic bytes (not trusting client-provided MIME)
 * 2. File size limits
 * 3. Rejects non-image files
 */
export function validateImages(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }

  if (files.length > 4) {
    res.status(400).json({ error: 'Maximum 4 files allowed' });
    return;
  }

  for (const file of files) {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      cleanupFiles(files);
      res.status(400).json({
        error: `File ${file.originalname} exceeds 10MB limit`,
      });
      return;
    }

    // Validate by reading magic bytes from actual file data
    try {
      const buffer = fs.readFileSync(file.path);
      const detectedMime = detectMimeFromBytes(buffer);

      if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
        cleanupFiles(files);
        res.status(400).json({
          error: `File ${file.originalname} is not a valid image (detected: ${detectedMime || 'unknown'})`,
        });
        return;
      }
    } catch {
      cleanupFiles(files);
      res.status(500).json({ error: 'Failed to validate file' });
      return;
    }
  }

  next();
}

function detectMimeFromBytes(buffer: Buffer): string | null {
  for (const [mime, bytes] of Object.entries(MAGIC_BYTES)) {
    if (buffer.length >= bytes.length) {
      const matches = bytes.every((byte, i) => buffer[i] === byte);
      if (matches) return mime;
    }
  }
  return null;
}

function cleanupFiles(files: Express.Multer.File[]): void {
  for (const file of files) {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch {
      // Best effort cleanup
    }
  }
}
