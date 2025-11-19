"use client";

import { useState, useEffect } from "react";
import type { Album } from "@/lib/albums";
import Link from "next/link";

type Props = {
  initialAlbums: Album[];
};

export default function AdminDashboard({ initialAlbums }: Props) {
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [quote, setQuote] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Fetch CSRF token on mount
  useEffect(() => {
    fetch("/api/admin/csrf")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch CSRF token: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        } else {
          console.error("No CSRF token in response:", data);
          setError("Failed to initialize security token");
        }
      })
      .catch((err) => {
        console.error("CSRF token fetch error:", err);
        setError("Failed to initialize security token");
      });
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  async function handleCreateAlbum(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!csrfToken) {
      setError("Security token not available. Please refresh the page.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/albums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ title, subtitle, quote, date }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error || "Could not create album.");
        return;
      }

      const data = (await res.json()) as { album: Album; csrfToken?: string };

      // Update CSRF token if provided
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }

      // Add album to local state immediately
      setAlbums((prev) => [...prev, data.album]);

      // Clear form
      setTitle("");
      setSubtitle("");
      setQuote("");
      setDate("");

      // Wait a bit for blob propagation, then navigate
      // User can also manually click "Manage photos"
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to album management page
      window.location.href = `/admin/albums/${data.album.id}`;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-[0_20px_45px_rgba(244,114,182,0.25)] dark:border-rose-900 dark:bg-slate-900 dark:shadow-[0_20px_45px_rgba(15,23,42,0.85)]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-rose-950 dark:text-rose-50">
              Create a new moment
            </h1>
            <p className="mt-1 text-sm text-rose-700/80 dark:text-rose-100/70">
              Each album is a little story from Ludovica 27s life.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-medium text-rose-400 hover:text-rose-600 dark:text-rose-500 dark:hover:text-rose-300 underline-offset-4 hover:underline whitespace-nowrap"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleCreateAlbum} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-rose-400 dark:text-rose-300">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-950 outline-none ring-0 placeholder:text-rose-300 focus:border-rose-400 focus:bg-white focus:text-rose-950 focus:ring-2 focus:ring-rose-200 dark:border-rose-900 dark:bg-slate-800 dark:text-rose-50 dark:placeholder:text-slate-500 dark:focus:border-rose-400 dark:focus:bg-slate-800 dark:focus:text-rose-50 dark:focus:ring-rose-500"
              placeholder="First day at the beach"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-rose-400 dark:text-rose-300">
              Subtitle (optional)
            </label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-950 outline-none ring-0 placeholder:text-rose-300 focus:border-rose-400 focus:bg-white focus:text-rose-950 focus:ring-2 focus:ring-rose-200 dark:border-rose-900 dark:bg-slate-800 dark:text-rose-50 dark:placeholder:text-slate-500 dark:focus:border-rose-400 dark:focus:bg-slate-800 dark:focus:text-rose-50 dark:focus:ring-rose-500"
              placeholder="Tiny toes, big waves"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-rose-400 dark:text-rose-300">
              Date (optional)
            </label>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              className="mt-1 w-full rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-950 outline-none ring-0 placeholder:text-rose-300 focus:border-rose-400 focus:bg-white focus:text-rose-950 focus:ring-2 focus:ring-rose-200 dark:border-rose-900 dark:bg-slate-800 dark:text-rose-50 dark:placeholder:text-slate-500 dark:focus:border-rose-400 dark:focus:bg-slate-800 dark:focus:text-rose-50 dark:focus:ring-rose-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-rose-400 dark:text-rose-300">
              Quote (optional)
            </label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-950 outline-none ring-0 placeholder:text-rose-300 focus:border-rose-400 focus:bg-white focus:text-rose-950 focus:ring-2 focus:ring-rose-200 dark:border-rose-900 dark:bg-slate-800 dark:text-rose-50 dark:placeholder:text-slate-500 dark:focus:border-rose-400 dark:focus:bg-slate-800 dark:focus:text-rose-50 dark:focus:ring-rose-500"
              placeholder="“She is made of stardust and bedtime stories.”"
            />
          </div>

          {error && (
            <p className="md:col-span-2 text-xs text-rose-500 dark:text-rose-300">
              {error}
            </p>
          )}

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-300/60 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 dark:from-rose-500 dark:via-pink-500 dark:to-fuchsia-500 dark:shadow-rose-900/70"
            >
              {loading ? "Creating..." : "Create album"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-rose-500 dark:text-rose-300">
            Existing moments
          </h2>
          <p className="text-xs text-rose-400/80 dark:text-rose-200/60">
            {albums.length === 0
              ? "No albums yet. Start with the very first moment."
              : `${albums.length} album${albums.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {albums.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50 p-6 text-sm text-rose-500 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-200">
            Once you create an album, it will appear here so you can add photos.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {albums.map((album) => (
              <div
                key={album.id}
                className="group flex flex-col justify-between rounded-3xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100 transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(244,114,182,0.4)] dark:border-rose-900 dark:bg-slate-900 dark:shadow-slate-900"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-rose-950 dark:text-rose-50">
                    {album.title}
                  </h3>
                  {album.subtitle && (
                    <p className="text-xs text-rose-500 dark:text-rose-300">
                      {album.subtitle}
                    </p>
                  )}
                  {album.date && (
                    <p className="text-[11px] uppercase tracking-[0.2em] text-rose-300 dark:text-rose-500">
                      {album.date}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <Link
                    href={`/albums/${album.slug}`}
                    className="text-xs font-medium text-rose-500 underline-offset-4 hover:underline dark:text-rose-300"
                  >
                    View public page
                  </Link>
                  <Link
                    href={`/admin/albums/${album.id}`}
                    className="text-xs font-semibold text-rose-700 underline-offset-4 group-hover:underline dark:text-rose-200"
                  >
                    Manage photos
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
