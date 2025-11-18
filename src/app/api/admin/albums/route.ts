import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAlbums, saveAlbums, slugify, type Album } from "@/lib/albums";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const auth = cookieStore.get("admin_auth");

  if (!auth || auth.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.title !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const title = body.title.trim();
  const subtitle = typeof body.subtitle === "string" ? body.subtitle.trim() : undefined;
  const quote = typeof body.quote === "string" ? body.quote.trim() : undefined;
  const date = typeof body.date === "string" && body.date.length ? body.date : undefined;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const existing = await getAlbums();

  const baseSlug = slugify(title) || "album";
  let slug = baseSlug;
  let suffix = 1;
  while (existing.some((a) => a.slug === slug)) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const now = new Date().toISOString();

  const album: Album = {
    id: crypto.randomUUID(),
    slug,
    title,
    subtitle,
    quote,
    date,
    createdAt: now,
  };

  const updated = [...existing, album];
  await saveAlbums(updated);

  return NextResponse.json({ album });
}
