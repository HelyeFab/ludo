import fs from "fs/promises";
import path from "path";
import { sanitizeFilename } from "./validation";

const STORAGE_ROOT = path.join(process.cwd(), "storage");
const PHOTOS_DIR = path.join(STORAGE_ROOT, "photos");
const ALBUMS_DIR = path.join(STORAGE_ROOT, "albums");

/**
 * Ensure storage directories exist
 */
async function ensureDirectories() {
  await fs.mkdir(PHOTOS_DIR, { recursive: true });
  await fs.mkdir(ALBUMS_DIR, { recursive: true });
}

/**
 * Save a photo file to local storage
 * @param albumId - Album ID
 * @param file - File to save
 * @returns Photo ID and path
 */
export async function savePhoto(
  albumId: string,
  file: File
): Promise<{ id: string; path: string; filename: string }> {
  await ensureDirectories();

  const photoId = crypto.randomUUID();
  const safeName = sanitizeFilename(file.name);
  const filename = `${photoId}-${safeName}`;
  const albumDir = path.join(PHOTOS_DIR, albumId);

  // Create album directory if it doesn't exist
  await fs.mkdir(albumDir, { recursive: true });

  const filePath = path.join(albumDir, filename);

  // Convert File to Buffer and save
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Return path relative to PHOTOS_DIR for URL construction
  return {
    id: photoId,
    path: `/storage/photos/${albumId}/${filename}`,
    filename,
  };
}

/**
 * Delete a photo from local storage
 * @param photoPath - Photo path (e.g., /storage/photos/album-id/photo.jpg)
 */
export async function deletePhoto(photoPath: string): Promise<void> {
  try {
    // Extract relative path from URL path
    const relativePath = photoPath.replace(/^\/storage\/photos\//, "");
    const filePath = path.join(PHOTOS_DIR, relativePath);
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Failed to delete photo:", photoPath, error);
    // Don't throw - photo might already be deleted
  }
}

/**
 * Delete all photos in an album
 * @param albumId - Album ID
 */
export async function deleteAlbumPhotos(albumId: string): Promise<void> {
  try {
    const albumDir = path.join(PHOTOS_DIR, albumId);
    await fs.rm(albumDir, { recursive: true, force: true });
  } catch (error) {
    console.error("Failed to delete album photos:", albumId, error);
  }
}

/**
 * Get photo file from local storage
 * @param photoPath - Photo path
 * @returns File buffer and content type
 */
export async function getPhoto(
  photoPath: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const relativePath = photoPath.replace(/^\/storage\/photos\//, "");
    const filePath = path.join(PHOTOS_DIR, relativePath);
    const buffer = await fs.readFile(filePath);

    // Determine content type from extension
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".avif": "image/avif",
    };

    const contentType = contentTypeMap[ext] || "image/jpeg";

    return { buffer, contentType };
  } catch (error) {
    console.error("Failed to get photo:", photoPath, error);
    return null;
  }
}

/**
 * Save albums metadata to local storage
 */
export async function saveAlbumsMetadata(albums: any[]): Promise<void> {
  await ensureDirectories();
  const filePath = path.join(ALBUMS_DIR, "albums.json");
  await fs.writeFile(filePath, JSON.stringify(albums, null, 2));
}

/**
 * Load albums metadata from local storage
 */
export async function loadAlbumsMetadata(): Promise<any[]> {
  try {
    await ensureDirectories();
    const filePath = path.join(ALBUMS_DIR, "albums.json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet
    return [];
  }
}

/**
 * Save photos metadata for an album
 */
export async function savePhotosMetadata(
  albumId: string,
  photos: any[]
): Promise<void> {
  await ensureDirectories();
  const filePath = path.join(ALBUMS_DIR, `${albumId}-photos.json`);
  await fs.writeFile(filePath, JSON.stringify(photos, null, 2));
}

/**
 * Load photos metadata for an album
 */
export async function loadPhotosMetadata(albumId: string): Promise<any[]> {
  try {
    await ensureDirectories();
    const filePath = path.join(ALBUMS_DIR, `${albumId}-photos.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet
    return [];
  }
}
