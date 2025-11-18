import Link from "next/link";
import { getAlbums } from "@/lib/albums";

export const dynamic = "force-dynamic";

export default async function Home() {
  const albums = await getAlbums();

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-rose-100/80 bg-white/80 p-6 shadow-[0_22px_55px_rgba(244,114,182,0.25)] backdrop-blur dark:border-rose-900/60 dark:bg-slate-900/80 dark:shadow-[0_22px_55px_rgba(15,23,42,0.9)] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex-1 space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-rose-400 dark:text-rose-300">
              A tiny life in big moments
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-rose-950 dark:text-rose-50 sm:text-4xl">
              Ludovica&apos;s little moments
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-rose-700/90 dark:text-rose-100/80">
              A living album filled with soft giggles, bedtime stories, and first
              adventures. Each page is a new chapter in Ludovica&apos;s story.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-rose-500 dark:text-rose-200">
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-rose-500 shadow-sm shadow-rose-100/70 dark:bg-slate-800 dark:text-rose-200 dark:shadow-slate-900/80">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                Growing library of moments
              </span>
              {albums.length > 0 && (
                <span>
                  {albums.length} album{albums.length === 1 ? "" : "s"} so far
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-1 justify-center">
            <div className="relative flex h-44 w-44 rotate-3 items-center justify-center rounded-[2.2rem] bg-gradient-to-br from-rose-300 via-pink-300 to-fuchsia-300 shadow-[0_26px_70px_rgba(244,114,182,0.65)] dark:from-rose-500 dark:via-pink-500 dark:to-fuchsia-500 dark:shadow-[0_26px_70px_rgba(15,23,42,0.95)]">
              <div className="absolute -left-6 -top-4 h-10 w-10 rounded-2xl border border-rose-100 bg-white/90 text-center text-[10px] font-medium text-rose-500 shadow-md shadow-rose-200/70 dark:border-rose-900 dark:bg-slate-900/90 dark:text-rose-200 dark:shadow-slate-900/90">
                <div className="pt-1.5 leading-tight">
                  tiny
                  <br />
                  steps
                </div>
              </div>
              <div className="absolute -right-5 bottom-1 rounded-2xl bg-white/90 px-3 py-1 text-[10px] font-medium text-rose-500 shadow-md shadow-rose-200/70 dark:bg-slate-900/90 dark:text-rose-200 dark:shadow-slate-900/90">
                new album
              </div>
              <div className="flex h-[80%] w-[80%] items-center justify-center rounded-[1.9rem] border border-rose-100 bg-rose-50/70 text-center text-xs font-medium text-rose-700 shadow-inner shadow-rose-200/60 dark:border-rose-900 dark:bg-slate-950/70 dark:text-rose-100">
                A world
                <br />
                made just
                <br />
                for her.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-[0.2em] text-rose-500 dark:text-rose-300">
            Albums
          </h2>
          <p className="text-xs text-rose-400/90 dark:text-rose-200/70">
            {albums.length === 0
              ? "No moments yet. The very first one is waiting."
              : "Flip through the chapters of her story."}
          </p>
        </div>

        {albums.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/60 p-6 text-sm text-rose-500 dark:border-rose-900 dark:bg-slate-900/80 dark:text-rose-200">
            Once the first album is created in the admin, it will appear here
            for everyone to see.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/albums/${album.slug}`}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-rose-100 bg-white/80 p-4 shadow-sm shadow-rose-100/70 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(244,114,182,0.5)] dark:border-rose-900/60 dark:bg-slate-900/80 dark:shadow-[0_24px_60px_rgba(15,23,42,0.95)]"
              >
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-rose-300 dark:text-rose-500">
                    {album.date || "A special day"}
                  </p>
                  <h3 className="text-sm font-semibold text-rose-950 dark:text-rose-50">
                    {album.title}
                  </h3>
                  {album.subtitle && (
                    <p className="text-xs text-rose-500 dark:text-rose-300">
                      {album.subtitle}
                    </p>
                  )}
                  {album.quote && (
                    <p className="mt-1 line-clamp-2 text-xs italic text-rose-400 dark:text-rose-300">
                      {album.quote}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-rose-500/90 dark:text-rose-200/80">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    Open album
                  </span>
                  <span className="translate-x-0 text-[10px] tracking-[0.2em] text-rose-300 transition group-hover:translate-x-1 group-hover:text-rose-400 dark:text-rose-500">
                    VIEW
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
