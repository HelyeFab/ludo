import { NextResponse } from "next/server";
import {
  getAlbumById,
  getPhotosForAlbum,
  savePhotosForAlbum,
  type Photo,
} from "@/lib/albums";
import { validateImageFiles, sanitizeFilename } from "@/lib/validation";
import { verifyCsrfToken } from "@/lib/csrf";
import { uploadToB2, deleteFromB2 } from "@/lib/b2-storage";

// Configure route to accept larger file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

export async function POST(
  req: Request,
  { params }: { params: Promise<{ albumId: string }> },
) {
  // Await params (Next.js 16 requirement)
  const { albumId } = await params;

  // Verify CSRF token from header
  const csrfToken = req.headers.get("x-csrf-token");
  const isValidCsrf = await verifyCsrfToken(csrfToken);

  if (!isValidCsrf) {
    return NextResponse.json(
      { error: "Invalid CSRF token" },
      { status: 403 }
    );
  }
  const album = await getAlbumById(albumId);

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const formData = await req.formData();

  // Support both single photo and multiple photos upload
  const photoEntry = formData.get("photo");
  const photosEntries = formData.getAll("photos");

  // Convert to File array and validate
  const files: File[] = [];

  if (photoEntry instanceof File) {
    files.push(photoEntry);
  }

  for (const entry of photosEntries) {
    if (entry instanceof File) {
      files.push(entry);
    }
  }

  // Validate all files
  const validation = validateImageFiles(files);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const existing = await getPhotosForAlbum(albumId);
  const newPhotos: Photo[] = [];

  // Upload each file to Backblaze B2
  for (const file of files) {
    try {
      const photoId = crypto.randomUUID();
      const safeName = sanitizeFilename(file.name);
      const path = `albums/${albumId}/${photoId}-${safeName}`;

      const { downloadUrl } = await uploadToB2(file, path);

      newPhotos.push({
        id: photoId,
        albumId,
        url: downloadUrl,
        blobPath: path,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to upload file:", error);
      return NextResponse.json(
        { error: `Failed to upload ${file.name}` },
        { status: 500 }
      );
    }
  }

  const allPhotos = [...existing, ...newPhotos];
  await savePhotosForAlbum(albumId, allPhotos);

  return NextResponse.json({ photos: newPhotos });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ albumId: string }> },
) {
  const { albumId } = await params;

  // Verify CSRF token
  const csrfToken = req.headers.get("x-csrf-token");
  const isValidCsrf = await verifyCsrfToken(csrfToken);

  if (!isValidCsrf) {
    return NextResponse.json(
      { error: "Invalid CSRF token" },
      { status: 403 }
    );
  }

  const album = await getAlbumById(albumId);
  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const photoId = body?.photoId;

  if (!photoId || typeof photoId !== "string") {
    return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
  }

  const photos = await getPhotosForAlbum(albumId);
  const photoToDelete = photos.find((p) => p.id === photoId);

  if (!photoToDelete) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  // Delete from Backblaze B2
  try {
    await deleteFromB2(photoToDelete.blobPath);
  } catch (error) {
    console.error("Failed to delete photo from B2:", error);
    // Continue anyway - we'll remove it from the index
  }

  // Remove from photos list
  const updatedPhotos = photos.filter((p) => p.id !== photoId);
  await savePhotosForAlbum(albumId, updatedPhotos);

  return NextResponse.json({ ok: true });
}
