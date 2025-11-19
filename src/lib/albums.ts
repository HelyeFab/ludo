import {
  saveAlbumsMetadata,
  loadAlbumsMetadata,
  savePhotosMetadata,
  loadPhotosMetadata,
} from "./local-storage";

export type Album = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  quote?: string;
  date?: string; // ISO string
  coverPhotoUrl?: string;
  coverPhotoBlobPath?: string;
  createdAt: string; // ISO string
};

export type Photo = {
  id: string;
  albumId: string;
  url: string;
  blobPath: string;
  createdAt: string; // ISO string
};

const ALBUMS_INDEX_PREFIX = "albums/index";

function photosKey(albumId: string) {
  return `albums/${albumId}/photos`;
}

export async function getAlbums(): Promise<Album[]> {
  const albums = await loadAlbumsMetadata();
  console.log("[DEBUG] Loaded albums from local storage:", albums.length);
  return albums;
}

export async function saveAlbums(albums: Album[]): Promise<void> {
  // Note: Authentication is verified by middleware and API routes
  console.log("[DEBUG] Saving albums:", albums.length, "albums");
  await saveAlbumsMetadata(albums);
  console.log("[DEBUG] Saved to local storage");
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const albums = await getAlbums();
  return albums.find((a) => a.slug === slug) ?? null;
}

export async function getAlbumById(id: string): Promise<Album | null> {
  const albums = await getAlbums();
  return albums.find((a) => a.id === id) ?? null;
}

export async function getPhotosForAlbum(albumId: string): Promise<Photo[]> {
  const photos = await loadPhotosMetadata(albumId);
  return photos;
}

export async function savePhotosForAlbum(
  albumId: string,
  photos: Photo[],
): Promise<void> {
  // Note: Authentication is verified by middleware and API routes
  await savePhotosMetadata(albumId, photos);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
