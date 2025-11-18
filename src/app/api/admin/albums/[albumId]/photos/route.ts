import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put } from "@vercel/blob";
import {
  getAlbumById,
  getPhotosForAlbum,
  savePhotosForAlbum,
  type Photo,
} from "@/lib/albums";

export async function POST(
  req: Request,
  { params }: { params: { albumId: string } },
) {
  const cookieStore = cookies();
  const auth = cookieStore.get("admin_auth");

  if (!auth || auth.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const albumId = params.albumId;
  const album = await getAlbumById(albumId);

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const files = formData.getAll("photos");

  if (!files.length) {
    return NextResponse.json({ error: "No photos uploaded" }, { status: 400 });
  }

  const existing = await getPhotosForAlbum(albumId);

  const newPhotos: Photo[] = [];

  for (const entry of files) {
    if (!(entry instanceof File)) continue;

    const safeName = entry.name.replace(/[^a-zA-Z0-9.]+/g, "-");
    const blobPath = `albums/${albumId}/${crypto.randomUUID()}-${safeName}`;

    const { url } = await put(blobPath, entry, {
      access: "public",
      addRandomSuffix: false,
    });

    newPhotos.push({
      id: crypto.randomUUID(),
      albumId,
      url,
      blobPath,
      createdAt: new Date().toISOString(),
    });
  }

  const allPhotos = [...existing, ...newPhotos];
  await savePhotosForAlbum(albumId, allPhotos);

  return NextResponse.json({ photos: newPhotos });
}
