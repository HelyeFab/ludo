import Image from "next/image";
import Link from "next/link";
import { getAlbumBySlug, getPhotosForAlbum } from "@/lib/albums";

export const dynamic = "force-dynamic";

export default async function AlbumPage({
  params,
}: {
  params: { slug: string };
}) {
  const album = await getAlbumBySlug(params.slug);

  if (!album) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-rose-600 dark:text-rose-300">
          This moment could not be found.
        </p>
        <Link
          href="/"
          className="text-xs font-medium text-rose-500 underline-offset-4 hover:underline dark:text-rose-300"
        >
          ← Back to all moments
        </Link>
      </div>
    );
  }

  const photos = await getPhotosForAlbum(album.id);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-rose-100/80 bg-white/80 p-6 shadow-[0_22px_55px_rgba(244,114,182,0.25)] backdrop-blur dark:border-rose-900/60 dark:bg-slate-900/80 dark:shadow-[0_22px_55px_rgba(15,23,42,0.9)] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex-1 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-rose-300 dark:text-rose-500">
              {album.date || "A special day"}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-rose-950 dark:text-rose-50 sm:text-3xl">
              {album.title}
            </h1>
            {album.subtitle && (
              <p className="text-sm text-rose-600 dark:text-rose-200">
                {album.subtitle}
              </p>
            )}
            {album.quote && (
              <p className="mt-2 text-sm italic text-rose-400 dark:text-rose-300">
                {album.quote}
              </p>
            )}
          </div>
          <div className="flex flex-1 justify-end">
            <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/70 px-4 py-3 text-xs text-rose-500 shadow-sm shadow-rose-100/70 dark:border-rose-900 dark:bg-slate-950/70 dark:text-rose-200">
              <p className="font-medium">Tiny note</p>
              <p className="mt-1 text-[11px] leading-relaxed">
                Scroll slowly. Every photo is a tiny heartbeat from this day.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-[0.2em] text-rose-500 dark:text-rose-300">
            Photos
          </h2>
          <Link
            href="/"
            className="text-xs font-medium text-rose-500 underline-offset-4 hover:underline dark:text-rose-300"
          >
            ← Back to all moments
          </Link>
        </div>

        {photos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/60 p-6 text-sm text-rose-500 dark:border-rose-900 dark:bg-slate-900/80 dark:text-rose-200">
            No photos have been added yet. They will appear here as soon as the
            admin adds them.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-3xl border border-rose-100/80 bg-rose-50/60 shadow-sm shadow-rose-100/60 dark:border-rose-900/70 dark:bg-slate-900/80 dark:shadow-slate-900/80"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={photo.url}
                    alt={album.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
