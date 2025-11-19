import { put, list } from "@vercel/blob";

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
  // Get all blobs with the prefix (not just 1)
  const { blobs } = await list({ prefix: ALBUMS_INDEX_PREFIX });

  if (!blobs.length) {
    return [];
  }

  // Sort by uploadedAt descending to get the newest file
  const sortedBlobs = blobs.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  const res = await fetch(sortedBlobs[0].downloadUrl, { cache: "no-store" });
  if (!res.ok) {
    return [];
  }

  const data = (await res.json()) as Album[];
  return Array.isArray(data) ? data : [];
}

export async function saveAlbums(albums: Album[]): Promise<void> {
  // Note: Authentication is verified by middleware and API routes
  await put(ALBUMS_INDEX_PREFIX + ".json", JSON.stringify(albums, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: true,
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
  // Get all blobs with the prefix (not just 1)
  const { blobs } = await list({ prefix: key });

  if (!blobs.length) {
    return [];
  }

  // Sort by uploadedAt descending to get the newest file
  const sortedBlobs = blobs.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  const res = await fetch(sortedBlobs[0].downloadUrl, { cache: "no-store" });
  if (!res.ok) return [];

  const data = (await res.json()) as Photo[];
  return Array.isArray(data) ? data : [];
}

export async function savePhotosForAlbum(
  albumId: string,
  photos: Photo[],
): Promise<void> {
  // Note: Authentication is verified by middleware and API routes
  const key = photosKey(albumId);
  await put(key, JSON.stringify(photos, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: true,
  });
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
