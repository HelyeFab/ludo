import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import {
  getAlbumById,
  getAlbums,
  saveAlbums,
  getPhotosForAlbum,
} from "@/lib/albums";
import { verifyCsrfToken } from "@/lib/csrf";
import { albumSchema } from "@/lib/validation-schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ albumId: string }> }
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

  // Parse and validate request body
  const body = await req.json().catch(() => null);

  const validationResult = albumSchema.safeParse(body);
  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return NextResponse.json(
      { error: firstError.message },
      { status: 400 }
    );
  }

  const { title, subtitle, quote, date } = validationResult.data;

  const albums = await getAlbums();
  const albumIndex = albums.findIndex((a) => a.id === albumId);

  if (albumIndex === -1) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  // Update album
  const updatedAlbum = {
    ...albums[albumIndex],
    title,
    subtitle,
    quote,
    date,
  };

  albums[albumIndex] = updatedAlbum;

  try {
    await saveAlbums(albums);
    return NextResponse.json({ album: updatedAlbum });
  } catch (error) {
    console.error("Failed to update album:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update album" },
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

  // Get all photos in the album
  const photos = await getPhotosForAlbum(albumId);

  // Delete all photos from blob storage
  for (const photo of photos) {
    try {
      await del(photo.url);
    } catch (error) {
      console.error("Failed to delete photo:", photo.url, error);
      // Continue deleting other photos
    }
  }

  // Delete cover photo if it exists
  if (album.coverPhotoUrl) {
    try {
      await del(album.coverPhotoUrl);
    } catch (error) {
      console.error("Failed to delete cover photo:", album.coverPhotoUrl, error);
    }
  }

  // Remove album from albums list
  const allAlbums = await getAlbums();
  const updatedAlbums = allAlbums.filter((a) => a.id !== albumId);
  await saveAlbums(updatedAlbums);

  return NextResponse.json({ ok: true });
}
