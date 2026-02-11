import { apiUpload } from './apiClient';

interface ProcessedTile {
  id: string;
  diffuse: string;
  normal: string;
  roughness: string;
  ao: string;
}

interface TileUploadResponse {
  tiles: ProcessedTile[];
}

interface InteriorUploadResponse {
  interior: ProcessedTile;
}

/**
 * Upload tile images to the server for normalization and PBR map generation.
 * Files are validated, resized to 1024x1024 max, and PBR maps are generated.
 */
export async function uploadTileImages(
  files: File[],
): Promise<TileUploadResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append('tiles', file));

  const response = await apiUpload<TileUploadResponse>(
    '/api/tiles/upload',
    formData,
  );

  if (!response.ok) {
    throw new Error('Failed to upload tile images');
  }

  return response.data;
}

/**
 * Upload an interior texture image for normalization and PBR map generation.
 */
export async function uploadInteriorImage(
  file: File,
): Promise<InteriorUploadResponse> {
  const formData = new FormData();
  formData.append('interior', file);

  const response = await apiUpload<InteriorUploadResponse>(
    '/api/interior/upload',
    formData,
  );

  if (!response.ok) {
    throw new Error('Failed to upload interior image');
  }

  return response.data;
}
