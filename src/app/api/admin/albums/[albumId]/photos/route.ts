import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import {
  getAlbumById,
  getPhotosForAlbum,
  savePhotosForAlbum,
  type Photo,
} from "@/lib/albums";
import { validateImageFiles, sanitizeFilename } from "@/lib/validation";
import { verifyCsrfToken } from "@/lib/csrf";

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
  const entries = formData.getAll("photos");

  // Convert to File array and validate
  const files: File[] = [];
  for (const entry of entries) {
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

  // Upload each file
  for (const file of files) {
    const safeName = sanitizeFilename(file.name);
    const blobPath = `albums/${albumId}/${crypto.randomUUID()}-${safeName}`;

    try {
      const { url } = await put(blobPath, file, {
        access: "public",
        addRandomSuffix: true, // Security: prevent path prediction
      });

      newPhotos.push({
        id: crypto.randomUUID(),
        albumId,
        url,
        blobPath,
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

  // Delete from Vercel Blob storage
  try {
    await del(photoToDelete.url);
  } catch (error) {
    console.error("Failed to delete photo from blob storage:", error);
    // Continue anyway - we'll remove it from the index
  }

  // Remove from photos list
  const updatedPhotos = photos.filter((p) => p.id !== photoId);
  await savePhotosForAlbum(albumId, updatedPhotos);

  return NextResponse.json({ ok: true });
}
