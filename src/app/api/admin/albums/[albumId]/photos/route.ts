import { NextResponse } from "next/server";
import {
  getAlbumById,
  getPhotosForAlbum,
  savePhotosForAlbum,
  type Photo,
} from "@/lib/albums";
import {
  validateImageFiles,
  validateImageFilesDeep,
  sanitizeFilename,
} from "@/lib/validation";
import { verifyCsrfToken, refreshCsrfToken } from "@/lib/csrf";
import { uploadToB2, deleteFromB2 } from "@/lib/b2-storage";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RateLimitPresets,
} from "@/lib/rate-limit";

// Configure route to accept larger file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

export async function POST(
  req: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {
  // Await params (Next.js 16 requirement)
  const { albumId } = await params;

  // Rate limiting check
  const rateLimitId = getRateLimitIdentifier(req);
  const rateLimitResult = checkRateLimit(
    `photo-upload:${rateLimitId}`,
    RateLimitPresets.PHOTO_UPLOAD
  );

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many upload requests. Please try again later.",
        resetTime: rateLimitResult.resetTime,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(RateLimitPresets.PHOTO_UPLOAD.maxRequests),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.resetTime),
        },
      }
    );
  }

  // Verify CSRF token from header
  const csrfToken = req.headers.get("x-csrf-token");
  const isValidCsrf = await verifyCsrfToken(csrfToken);

  if (!isValidCsrf) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
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

  // Validate all files (basic checks)
  const validation = validateImageFiles(files);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Deep validation (magic bytes) - prevents MIME type spoofing
  const deepValidation = await validateImageFilesDeep(files);
  if (!deepValidation.valid) {
    return NextResponse.json({ error: deepValidation.error }, { status: 400 });
  }

  const existing = await getPhotosForAlbum(albumId);
  const newPhotos: Photo[] = [];
  const uploadedFiles: { path: string }[] = [];

  try {
    // Upload each file to Backblaze B2
    for (const file of files) {
      const photoId = crypto.randomUUID();
      const safeName = sanitizeFilename(file.name);
      const path = `albums/${albumId}/${photoId}-${safeName}`;

      const { downloadUrl } = await uploadToB2(file, path);

      // Track uploaded file for potential rollback
      uploadedFiles.push({ path });

      newPhotos.push({
        id: photoId,
        albumId,
        url: downloadUrl,
        blobPath: path,
        createdAt: new Date().toISOString(),
      });
    }

    // Save metadata only after all uploads succeed
    const allPhotos = [...existing, ...newPhotos];
    await savePhotosForAlbum(albumId, allPhotos);

    // Refresh CSRF token for next request
    const newCsrfToken = await refreshCsrfToken();

    return NextResponse.json({ photos: newPhotos, csrfToken: newCsrfToken });
  } catch (error) {
    // Transaction rollback: delete already uploaded files from B2
    console.error("Upload failed, rolling back:", error);

    for (const uploaded of uploadedFiles) {
      await deleteFromB2(uploaded.path).catch((err) =>
        console.error("Rollback delete failed:", uploaded.path, err)
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload photos. Please try again.",
      },
      { status: 500 }
    );
  }
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

  // Remove from photos list immediately
  const updatedPhotos = photos.filter((p) => p.id !== photoId);
  await savePhotosForAlbum(albumId, updatedPhotos);

  // Delete from storage asynchronously (non-blocking)
  // Fire and forget - log errors but don't fail the request
  Promise.resolve().then(async () => {
    try {
      // Check if this is a Vercel Blob URL (legacy photos)
      if (
        photoToDelete.url.includes("blob.vercel-storage.com") ||
        photoToDelete.url.includes("public.blob.vercel-storage.com")
      ) {
        // Delete from Vercel Blob
        const { del } = await import("@vercel/blob");
        await del(photoToDelete.url);
      } else {
        // Delete from B2
        await deleteFromB2(photoToDelete.blobPath);
      }
    } catch (error) {
      console.error("Async delete failed for photo:", photoToDelete.id, error);
    }
  });

  // Refresh CSRF token for next request
  const newCsrfToken = await refreshCsrfToken();

  return NextResponse.json({ ok: true, csrfToken: newCsrfToken });
}
