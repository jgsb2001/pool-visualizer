import { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { validateImages } from '../middleware/imageValidation';
import { normalizeImages } from '../middleware/imageNormalization';
import { handleInteriorUpload } from '../controllers/interiorController';

const uploadsDir = path.join(__dirname, '..', 'uploads');

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

export const router = Router();

// Upload and process interior texture
router.post(
  '/upload',
  upload.array('interior', 1),
  validateImages,
  normalizeImages,
  handleInteriorUpload,
);

// Serve processed interior textures
router.get('/:id/:filename', (req, res) => {
  const { id, filename } = req.params;
  const filePath = path.join(uploadsDir, id, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  res.sendFile(filePath);
});
