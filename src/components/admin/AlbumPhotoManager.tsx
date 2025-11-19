"use client";

import { useState, useEffect } from "react";
import type { Album, Photo } from "@/lib/albums";
import Image from "next/image";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Alert } from "@/components/ui/Alert";
import { useAlert } from "@/hooks/useAlert";
import { Button } from "@/components/ui/Button";
import { getSecurePhotoUrl } from "@/lib/photo-url";

type Props = {
  album: Album;
  initialPhotos: Photo[];
};

export default function AlbumPhotoManager({ album, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "danger" | "primary";
    onConfirm: () => void;
  } | null>(null);
  const { alerts, hideAlert, success, error: showError } = useAlert();

  // Fetch CSRF token on mount
  useEffect(() => {
    fetch("/api/admin/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => setError("Failed to initialize security token"));
  }, []);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("photos") as HTMLInputElement | null;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setError("Please select at least one photo.");
      return;
    }

    if (!csrfToken) {
      setError("Security token not available. Please refresh the page.");
      return;
    }

    const formData = new FormData(form);

    setUploading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/albums/${album.id}/photos`, {
        method: "POST",
        headers: {
          "x-csrf-token": csrfToken,
        },
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
      success(`Successfully uploaded ${data.photos.length} photo${data.photos.length === 1 ? "" : "s"}!`);
    } catch {
      setError("Something went wrong. Please try again.");
      showError("Failed to upload photos. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeletePhoto(photoId: string) {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Photo",
      message: "Are you sure you want to delete this photo? This action cannot be undone.",
      variant: "danger",
      onConfirm: async () => {
        setConfirmDialog(null);

        if (!csrfToken) {
          showError("Security token not available. Please refresh the page.");
          return;
        }

        try {
          const res = await fetch(`/api/admin/albums/${album.id}/photos`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-csrf-token": csrfToken,
            },
            body: JSON.stringify({ photoId }),
          });

          if (!res.ok) {
            const data = (await res.json().catch(() => null)) as
              | { error?: string }
              | null;
            showError(data?.error || "Failed to delete photo.");
            return;
          }

          setPhotos((prev) => prev.filter((p) => p.id !== photoId));
          success("Photo deleted successfully!");
        } catch {
          showError("Something went wrong. Please try again.");
        }
      },
    });
  }

  async function handleDeleteAlbum() {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Album",
      message: `Are you sure you want to delete "${album.title}"? This will delete all ${photos.length} photo${photos.length === 1 ? "" : "s"} in this album. This action cannot be undone.`,
      variant: "danger",
      onConfirm: async () => {
        setConfirmDialog(null);

        if (!csrfToken) {
          showError("Security token not available. Please refresh the page.");
          return;
        }

        try {
          const res = await fetch(`/api/admin/albums/${album.id}`, {
            method: "DELETE",
            headers: {
              "x-csrf-token": csrfToken,
            },
          });

          if (!res.ok) {
            const data = (await res.json().catch(() => null)) as
              | { error?: string }
              | null;
            showError(data?.error || "Failed to delete album.");
            return;
          }

          success("Album deleted successfully!");
          // Redirect to admin page after successful deletion
          setTimeout(() => {
            window.location.href = "/admin";
          }, 1500);
        } catch {
          showError("Something went wrong. Please try again.");
        }
      },
    });
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
        <div className="flex flex-col items-end gap-2">
          <Link
            href="/admin"
            className="text-xs font-medium text-rose-500 underline-offset-4 hover:underline dark:text-rose-300"
          >
            ← Back to all moments
          </Link>
          <button
            onClick={handleDeleteAlbum}
            className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline-offset-4 hover:underline"
          >
            Delete album
          </button>
        </div>
      </div>

      <form
        onSubmit={handleUpload}
        className="rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_20px_45px_rgba(244,114,182,0.25)] dark:border-rose-900 dark:bg-slate-900 dark:shadow-[0_20px_45px_rgba(15,23,42,0.85)]"
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
          className="mt-3 block w-full cursor-pointer rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-3 py-3 text-xs text-rose-500 file:mr-4 file:rounded-xl file:border-0 file:bg-rose-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:border-rose-400 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-200 dark:file:bg-rose-500"
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
          <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50 p-6 text-sm text-rose-500 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-200">
            Your photos will appear here once you upload them.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-3xl border border-rose-100 bg-rose-50 shadow-sm shadow-rose-100 dark:border-rose-900 dark:bg-slate-900 dark:shadow-slate-900"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={getSecurePhotoUrl(photo.url)}
                    alt="Album photo"
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-2.5 text-white shadow-lg transition-all hover:bg-red-600 hover:scale-110 active:scale-95"
                    aria-label="Delete photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          confirmLabel="Delete"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* Alert Toasts */}
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => hideAlert(alert.id)}
        />
      ))}
    </div>
  );
}
