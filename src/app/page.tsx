import Link from "next/link";
import { getAlbums } from "@/lib/albums";

export const dynamic = "force-dynamic";

export default async function Home() {
  const albums = await getAlbums();

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-[rgb(var(--card-border))] bg-[rgb(var(--card-bg))] p-6 shadow-[0_8px_24px] shadow-[rgb(var(--card-shadow))] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex-1 space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-[rgb(var(--text-muted))]">
              A tiny life in big moments
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl">
              Ludovica&apos;s little moments
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-[rgb(var(--text-secondary)_/_0.9)]">
              A living album filled with soft giggles, bedtime stories, and first
              adventures. Each page is a new chapter in Ludovica&apos;s story.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[rgb(var(--text-secondary))]">
              <span className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--primary-50))] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[rgb(var(--text-secondary))] shadow-sm shadow-[rgb(var(--primary-100)_/_0.7)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--primary-400))]" />
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
            <div className="relative flex h-44 w-44 rotate-3 items-center justify-center rounded-[2.2rem] bg-gradient-to-br from-[rgb(var(--primary-300))] via-[rgb(var(--accent-via))] to-[rgb(var(--accent-to))] shadow-[0_12px_32px] shadow-[rgb(var(--card-shadow))]">
              <div className="absolute -left-6 -top-4 h-10 w-10 rounded-2xl border border-[rgb(var(--primary-100))] bg-[rgb(255_255_255_/_0.9)] text-center text-[10px] font-medium text-[rgb(var(--text-secondary))] shadow-md shadow-[rgb(var(--primary-200)_/_0.7)]">
                <div className="pt-1.5 leading-tight">
                  tiny
                  <br />
                  steps
                </div>
              </div>
              <div className="absolute -right-5 bottom-1 rounded-2xl bg-[rgb(255_255_255_/_0.9)] px-3 py-1 text-[10px] font-medium text-[rgb(var(--text-secondary))] shadow-md shadow-[rgb(var(--primary-200)_/_0.7)]">
                new album
              </div>
              <div className="flex h-[80%] w-[80%] items-center justify-center rounded-[1.9rem] border border-[rgb(var(--primary-100))] bg-[rgb(var(--primary-50)_/_0.7)] text-center text-xs font-medium text-[rgb(var(--text-secondary))] shadow-inner shadow-[rgb(var(--primary-200)_/_0.6)]">
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
          <h2 className="text-sm font-semibold tracking-[0.2em] text-[rgb(var(--text-secondary))]">
            Albums
          </h2>
          <p className="text-xs text-[rgb(var(--text-muted)_/_0.9)]">
            {albums.length === 0
              ? "No moments yet. The very first one is waiting."
              : "Flip through the chapters of her story."}
          </p>
        </div>

        {albums.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[rgb(var(--primary-200))] bg-[rgb(var(--primary-50)_/_0.6)] p-6 text-sm text-[rgb(var(--text-secondary))]">
            Once the first album is created in the admin, it will appear here
            for everyone to see.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/albums/${album.slug}`}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[rgb(var(--primary-100))] bg-[rgb(var(--card-bg))] p-4 shadow-sm shadow-[rgb(var(--primary-100)_/_0.7)] transition hover:-translate-y-1 hover:shadow-[0_12px_30px] hover:shadow-[rgb(var(--card-shadow-hover))]"
              >
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[rgb(var(--text-subtle))]">
                    {album.date || "A special day"}
                  </p>
                  <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                    {album.title}
                  </h3>
                  {album.subtitle && (
                    <p className="text-xs text-[rgb(var(--text-secondary))]">
                      {album.subtitle}
                    </p>
                  )}
                  {album.quote && (
                    <p className="mt-1 line-clamp-2 text-xs italic text-[rgb(var(--text-muted))]">
                      {album.quote}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-[rgb(var(--text-secondary)_/_0.9)]">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--primary-400))]" />
                    Open album
                  </span>
                  <span className="translate-x-0 text-[10px] tracking-[0.2em] text-[rgb(var(--text-subtle))] transition group-hover:translate-x-1 group-hover:text-[rgb(var(--text-muted))]">
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
