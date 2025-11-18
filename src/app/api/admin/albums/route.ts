import { NextResponse } from "next/server";
import { getAlbums, saveAlbums, slugify, type Album } from "@/lib/albums";
import {
  validateAlbumTitle,
  validateOptionalText,
} from "@/lib/validation";
import { verifyCsrfToken } from "@/lib/csrf";

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

  const body = await req.json().catch(() => null);
  if (!body || typeof body.title !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const title = body.title.trim();
  const subtitle = typeof body.subtitle === "string" ? body.subtitle.trim() : undefined;
  const quote = typeof body.quote === "string" ? body.quote.trim() : undefined;
  const date = typeof body.date === "string" && body.date.length ? body.date : undefined;

  // Validate title
  const titleValidation = validateAlbumTitle(title);
  if (!titleValidation.valid) {
    return NextResponse.json(
      { error: titleValidation.error },
      { status: 400 }
    );
  }

  // Validate optional fields
  const subtitleValidation = validateOptionalText(subtitle, 200);
  if (!subtitleValidation.valid) {
    return NextResponse.json(
      { error: subtitleValidation.error },
      { status: 400 }
    );
  }

  const quoteValidation = validateOptionalText(quote, 500);
  if (!quoteValidation.valid) {
    return NextResponse.json(
      { error: quoteValidation.error },
      { status: 400 }
    );
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
