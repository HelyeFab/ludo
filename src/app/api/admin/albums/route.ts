import { NextResponse } from "next/server";
import { getAlbums, saveAlbums, slugify, type Album } from "@/lib/albums";
import { verifyCsrfToken } from "@/lib/csrf";
import { albumSchema } from "@/lib/validation-schemas";

export async function POST(req: Request) {
  // Verify CSRF token
  const csrfToken = req.headers.get("x-csrf-token");
  const isValidCsrf = await verifyCsrfToken(csrfToken);

  if (!isValidCsrf) {
    return NextResponse.json(
      { error: "Invalid CSRF token" },
      { status: 403 }
    );
  }

  // Parse and validate request body
  const body = await req.json().catch(() => null);

  const validationResult = albumSchema.safeParse(body);
  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return NextResponse.json(
      { error: firstError.message },
      { status: 400 }
    );
  }

  const { title, subtitle, quote, date } = validationResult.data;

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

  try {
    await saveAlbums(updated);
    return NextResponse.json({ album });
  } catch (error) {
    console.error("Failed to save albums:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save album" },
      { status: 500 }
    );
  }
}
