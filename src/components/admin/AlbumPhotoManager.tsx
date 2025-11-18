"use client";

import { useState } from "react";
import type { Album, Photo } from "@/lib/albums";
import Image from "next/image";
import Link from "next/link";

type Props = {
  album: Album;
  initialPhotos: Photo[];
};

export default function AlbumPhotoManager({ album, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("photos") as HTMLInputElement | null;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setError("Please select at least one photo.");
      return;
    }

    const formData = new FormData(form);

    setUploading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/albums/${album.id}/photos`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error || "Upload failed. Please try again.");
        return;
      }

      const data = (await res.json()) as { photos: Photo[] };
      setPhotos((prev) => [...prev, ...data.photos]);
      form.reset();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-rose-400 dark:text-rose-300">
            Managing
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-rose-950 dark:text-rose-50">
            {album.title}
          </h1>
          {album.subtitle && (
            <p className="mt-1 text-sm text-rose-600 dark:text-rose-200">
              {album.subtitle}
            </p>
          )}
        </div>
        <Link
          href="/admin"
          className="text-xs font-medium text-rose-500 underline-offset-4 hover:underline dark:text-rose-300"
        >
          ← Back to all moments
        </Link>
      </div>

      <form
        onSubmit={handleUpload}
        className="rounded-3xl border border-rose-100/80 bg-white/70 p-5 shadow-[0_20px_45px_rgba(244,114,182,0.25)] backdrop-blur dark:border-rose-900/50 dark:bg-slate-900/80 dark:shadow-[0_20px_45px_rgba(15,23,42,0.85)]"
        encType="multipart/form-data"
      >
        <label className="block text-xs font-medium uppercase tracking-[0.2em] text-rose-400 dark:text-rose-300">
          Add photos
        </label>
        <p className="mt-1 text-xs text-rose-500/90 dark:text-rose-200/80">
          You can select multiple images at once.
        </p>

        <input
          name="photos"
          type="file"
          accept="image/*"
          multiple
          className="mt-3 block w-full cursor-pointer rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 px-3 py-3 text-xs text-rose-500 file:mr-4 file:rounded-xl file:border-0 file:bg-rose-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:border-rose-400 dark:border-rose-900 dark:bg-slate-900/80 dark:text-rose-200 dark:file:bg-rose-500"
        />

        {error && (
          <p className="mt-3 text-xs text-rose-500 dark:text-rose-300">{error}</p>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="mt-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-300/60 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 dark:from-rose-500 dark:via-pink-500 dark:to-fuchsia-500 dark:shadow-rose-900/70"
        >
          {uploading ? "Uploading..." : "Upload photos"}
        </button>
      </form>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-rose-500 dark:text-rose-300">
            Photos in this moment
          </h2>
          <p className="text-xs text-rose-400/80 dark:text-rose-200/60">
            {photos.length === 0
              ? "No photos yet. Add your first memory."
              : `${photos.length} photo${photos.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/60 p-6 text-sm text-rose-500 dark:border-rose-900 dark:bg-slate-900/80 dark:text-rose-200">
            Your photos will appear here once you upload them.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-3xl border border-rose-100/80 bg-rose-50/50 shadow-sm shadow-rose-100/60 dark:border-rose-900/70 dark:bg-slate-900/80 dark:shadow-slate-900/80"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={photo.url}
                    alt="Album photo"
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
