import { getAlbumById, getPhotosForAlbum, getAlbums } from "@/lib/albums";
import AlbumPhotoManager from "@/components/admin/AlbumPhotoManager";
import Link from "next/link";
import { verifySessionDAL } from "@/lib/dal";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminAlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;

  // Verify authentication at data access layer
  const session = await verifySessionDAL();

  if (!session.isAuthenticated) {
    redirect(`/login?from=/admin/albums/${albumId}`);
  }

  const album = await getAlbumById(albumId);

  if (!album) {
    // Debug: log what albums exist
    const allAlbums = await getAlbums();
    console.log("[DEBUG] Album not found. Looking for ID:", albumId);
    console.log("[DEBUG] Available albums:", allAlbums.map(a => ({ id: a.id, title: a.title })));

    return (
      <div className="space-y-4">
        <p className="text-sm text-rose-600 dark:text-rose-300">
          Album not found.
        </p>
        <p className="text-xs text-rose-400 dark:text-rose-400">
          Looking for ID: {albumId}
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
