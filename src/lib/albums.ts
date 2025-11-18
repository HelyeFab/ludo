import { list, put } from "@vercel/blob";
import { verifyAdminAuth } from "./auth";

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

const ALBUMS_INDEX_KEY = "albums/index.json";

function photosKey(albumId: string) {
  return `albums/${albumId}/photos.json`;
}

export async function getAlbums(): Promise<Album[]> {
  const { blobs } = await list({ prefix: ALBUMS_INDEX_KEY, limit: 1 });

  if (!blobs.length) {
    return [];
  }

  const res = await fetch(blobs[0].downloadUrl, { cache: "no-store" });
  if (!res.ok) return [];

  const data = (await res.json()) as Album[];
  return Array.isArray(data) ? data : [];
}

export async function saveAlbums(albums: Album[]): Promise<void> {
  // Verify authentication at data access layer
  await verifyAdminAuth();

  await put(ALBUMS_INDEX_KEY, JSON.stringify(albums, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: true, // Security: prevent path prediction
  });
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
  const key = photosKey(albumId);
  const { blobs } = await list({ prefix: key, limit: 1 });

  if (!blobs.length) {
    return [];
  }

  const res = await fetch(blobs[0].downloadUrl, { cache: "no-store" });
  if (!res.ok) return [];

  const data = (await res.json()) as Photo[];
  return Array.isArray(data) ? data : [];
}

export async function savePhotosForAlbum(
  albumId: string,
  photos: Photo[],
): Promise<void> {
  // Verify authentication at data access layer
  await verifyAdminAuth();

  const key = photosKey(albumId);

  await put(key, JSON.stringify(photos, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: true, // Security: prevent path prediction
  });
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
