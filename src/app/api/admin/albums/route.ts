import { NextResponse } from "next/server";
import { getAlbums, saveAlbums, slugify, type Album } from "@/lib/albums";
import { verifyCsrfToken, refreshCsrfToken } from "@/lib/csrf";
import { albumSchema } from "@/lib/validation-schemas";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RateLimitPresets,
} from "@/lib/rate-limit";
import { getVerifiedAdminSession } from "@/lib/dal";

export async function GET() {
  // Verify admin authentication
  try {
    await getVerifiedAdminSession();
  } catch {
    return NextResponse.json(
      { error: "Unauthorized: Admin authentication required" },
      { status: 403 }
    );
  }

  // Return all albums for verification purposes
  try {
    const albums = await getAlbums();
    return NextResponse.json({ albums });
  } catch (error) {
    console.error("Failed to fetch albums:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // Verify admin authentication
  try {
    await getVerifiedAdminSession();
  } catch {
    return NextResponse.json(
      { error: "Unauthorized: Admin authentication required" },
      { status: 403 }
    );
  }

  // Rate limiting check
  const rateLimitId = getRateLimitIdentifier(req);
  const rateLimitResult = checkRateLimit(
    `album-create:${rateLimitId}`,
    RateLimitPresets.ALBUM_OPERATIONS
  );

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        resetTime: rateLimitResult.resetTime,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(
            RateLimitPresets.ALBUM_OPERATIONS.maxRequests
          ),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.resetTime),
        },
      }
    );
  }

  // Verify CSRF token
  const csrfToken = req.headers.get("x-csrf-token");
  const isValidCsrf = await verifyCsrfToken(csrfToken);

  if (!isValidCsrf) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
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

    // Refresh CSRF token for next request
    const newCsrfToken = await refreshCsrfToken();

    return NextResponse.json({ album, csrfToken: newCsrfToken });
  } catch (error) {
    console.error("Failed to save albums:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save album",
      },
      { status: 500 }
    );
  }
}
