import * as ImageManipulator from 'expo-image-manipulator';
import { Paths, File } from 'expo-file-system';

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.8;

export interface ProcessedImage {
  uri: string;
  base64: string;
  width: number;
  height: number;
}

/**
 * Process a camera capture for API submission:
 * - Resize to max 1024px on longest side
 * - Convert to JPEG at 0.8 quality
 * - Save to cache directory (overwrites previous)
 * - Return base64 for API call
 */
export async function processImage(sourceUri: string): Promise<ProcessedImage> {
  // Resize and convert to JPEG
  const result = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: MAX_DIMENSION } }],
    {
      compress: JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  // Save to cache directory (delete existing first to allow overwrite)
  const cachedFile = new File(Paths.cache, 'processed_capture.jpg');
  if (cachedFile.exists) {
    await cachedFile.delete();
  }
  const sourceFile = new File(result.uri);
  await sourceFile.copy(cachedFile);

  return {
    uri: cachedFile.uri,
    base64: result.base64!,
    width: result.width,
    height: result.height,
  };
}

