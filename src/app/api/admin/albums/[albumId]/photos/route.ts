import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
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
