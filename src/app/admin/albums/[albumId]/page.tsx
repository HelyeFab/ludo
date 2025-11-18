import { getAlbumById, getPhotosForAlbum } from "@/lib/albums";
import AlbumPhotoManager from "@/components/admin/AlbumPhotoManager";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAlbumPage({
  params,
}: {
  params: { albumId: string };
}) {
  const album = await getAlbumById(params.albumId);

  if (!album) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-rose-600 dark:text-rose-300">
          Album not found.
        </p>
        <Link
          href="/admin"
          className="text-xs font-medium text-rose-500 underline-offset-4 hover:underline dark:text-rose-300"
        >
          ← Back to all moments
        </Link>
      </div>
    );
  }

  const photos = await getPhotosForAlbum(album.id);

  return <AlbumPhotoManager album={album} initialPhotos={photos} />;
}
