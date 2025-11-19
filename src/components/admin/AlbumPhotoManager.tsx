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
import { secureImageLoader } from "@/lib/image-loader";

type Props = {
  album: Album;
  initialPhotos: Photo[];
};

export default function AlbumPhotoManager({ album: initialAlbum, initialPhotos }: Props) {
  const [album, setAlbum] = useState<Album>(initialAlbum);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isEditingAlbum, setIsEditingAlbum] = useState(false);
  const [editForm, setEditForm] = useState({
    title: initialAlbum.title,
    subtitle: initialAlbum.subtitle || "",
    quote: initialAlbum.quote || "",
    date: initialAlbum.date || "",
  });
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

    setUploading(true);
    setError(null);

    try {
      const files = Array.from(fileInput.files);
      const uploadedPhotos: Photo[] = [];

      // Upload files one by one to avoid payload size limits
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("photo", file);

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
          showError(data?.error || `Failed to upload ${file.name}`);
          continue; // Continue with other files
        }

        const data = (await res.json()) as { photos: Photo[]; csrfToken?: string };
        uploadedPhotos.push(...data.photos);

        // Update CSRF token if provided
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
      }

      if (uploadedPhotos.length > 0) {
        setPhotos((prev) => [...prev, ...uploadedPhotos]);
        form.reset();
        success(`Successfully uploaded ${uploadedPhotos.length} photo${uploadedPhotos.length === 1 ? "" : "s"}!`);
      } else {
        setError("No photos were uploaded successfully.");
      }
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

          const data = (await res.json()) as { ok: boolean; csrfToken?: string };
          setPhotos((prev) => prev.filter((p) => p.id !== photoId));

          // Update CSRF token if provided
          if (data.csrfToken) {
            setCsrfToken(data.csrfToken);
          }

          success("Photo deleted successfully!");
        } catch {
          showError("Something went wrong. Please try again.");
        }
      },
    });
  }

  async function handleUpdateAlbum(e: React.FormEvent) {
    e.preventDefault();

    if (!csrfToken) {
      showError("Security token not available. Please refresh the page.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/albums/${album.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        showError(data?.error || "Failed to update album.");
        return;
      }

      const data = (await res.json()) as { album: Album; csrfToken?: string };
      setAlbum(data.album);

      // Update CSRF token if provided
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }

      setIsEditingAlbum(false);
      success("Album updated successfully!");
    } catch {
      showError("Something went wrong. Please try again.");
    }
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
      {!isEditingAlbum ? (
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
            {album.quote && (
              <p className="mt-2 text-xs italic text-rose-500 dark:text-rose-300">
                "{album.quote}"
              </p>
            )}
            {album.date && (
              <p className="mt-1 text-xs text-rose-400 dark:text-rose-400">
                {album.date}
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
              onClick={() => setIsEditingAlbum(true)}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 underline-offset-4 hover:underline"
            >
              Edit album details
            </button>
            <button
              onClick={handleDeleteAlbum}
              className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline-offset-4 hover:underline"
            >
              Delete album
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdateAlbum} className="rounded-3xl border border-rose-100 bg-white p-6 shadow-[0_20px_45px_rgba(244,114,182,0.25)] dark:border-rose-900 dark:bg-slate-900 dark:shadow-[0_20px_45px_rgba(15,23,42,0.85)]">
          <h2 className="text-lg font-semibold text-rose-950 dark:text-rose-50 mb-4">Edit Album Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.2em] text-rose-400 dark:text-rose-300">
                Title
              </label>
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
                className="mt-1 w-full rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-950 outline-none ring-0 placeholder:text-rose-300 focus:border-rose-400 focus:bg-white focus:text-rose-950 focus:ring-2 focus:ring-rose-200 dark:border-rose-900 dark:bg-slate-800 dark:text-rose-50 dark:placeholder:text-slate-500 dark:focus:border-rose-400 dark:focus:bg-slate-800 dark:focus:text-rose-50 dark:focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.2em] text-rose-400 dark:text-rose-300">
                Subtitle (optional)
              </label>
              <input
                value={editForm.subtitle}
                onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-950 outline-none ring-0 placeholder:text-rose-300 focus:border-rose-400 focus:bg-white focus:text-rose-950 focus:ring-2 focus:ring-rose-200 dark:border-rose-900 dark:bg-slate-800 dark:text-rose-50 dark:placeholder:text-slate-500 dark:focus:border-rose-400 dark:focus:bg-slate-800 dark:focus:text-rose-50 dark:focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.2em] text-rose-400 dark:text-rose-300">
                Quote (optional)
              </label>
              <textarea
                value={editForm.quote}
                onChange={(e) => setEditForm({ ...editForm, quote: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-950 outline-none ring-0 placeholder:text-rose-300 focus:border-rose-400 focus:bg-white focus:text-rose-950 focus:ring-2 focus:ring-rose-200 dark:border-rose-900 dark:bg-slate-800 dark:text-rose-50 dark:placeholder:text-slate-500 dark:focus:border-rose-400 dark:focus:bg-slate-800 dark:focus:text-rose-50 dark:focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.2em] text-rose-400 dark:text-rose-300">
                Date (optional)
              </label>
              <input
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                type="date"
                className="mt-1 w-full rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-950 outline-none ring-0 placeholder:text-rose-300 focus:border-rose-400 focus:bg-white focus:text-rose-950 focus:ring-2 focus:ring-rose-200 dark:border-rose-900 dark:bg-slate-800 dark:text-rose-50 dark:placeholder:text-slate-500 dark:focus:border-rose-400 dark:focus:bg-slate-800 dark:focus:text-rose-50 dark:focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-300/60 transition hover:brightness-105 dark:from-rose-500 dark:via-pink-500 dark:to-fuchsia-500 dark:shadow-rose-900/70"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditingAlbum(false);
                setEditForm({
                  title: album.title,
                  subtitle: album.subtitle || "",
                  quote: album.quote || "",
                  date: album.date || "",
                });
              }}
              className="inline-flex items-center justify-center rounded-2xl border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-800 dark:text-rose-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

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
                    loader={secureImageLoader}
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
