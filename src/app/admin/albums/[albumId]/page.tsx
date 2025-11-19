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
      <div className="space-y-4 p-6">
        <p className="text-sm text-rose-600 dark:text-rose-300">
          Album not found. This usually happens when blob storage is still syncing.
        </p>
        <p className="text-xs text-rose-400 dark:text-rose-400 font-mono">
          Looking for ID: {albumId}
        </p>
        <p className="text-xs text-rose-500 dark:text-rose-400">
          The page will automatically refresh in a moment...
        </p>
        <script dangerouslySetInnerHTML={{ __html: 'setTimeout(() => window.location.reload(), 3000);' }} />
        <div className="flex gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-2xl border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-800 dark:text-rose-300 dark:hover:bg-slate-700"
          >
            ← Back to all moments
          </Link>
        </div>
      </div>
    );
  }

  const photos = await getPhotosForAlbum(album.id);

  return <AlbumPhotoManager album={album} initialPhotos={photos} />;
}
