import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/session";
import sharp from "sharp";

/**
 * Optimized photo proxy with image resizing and format conversion
 * Validates authentication and serves optimized images
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get parameters
    const blobUrl = request.nextUrl.searchParams.get("url");
    const width = parseInt(request.nextUrl.searchParams.get("w") || "1200");
    const quality = parseInt(request.nextUrl.searchParams.get("q") || "75");

    if (!blobUrl) {
      return new NextResponse("Missing URL parameter", { status: 400 });
    }

    // Validate blob URL
    if (
      !blobUrl.includes("blob.vercel-storage.com") &&
      !blobUrl.includes("public.blob.vercel-storage.com")
    ) {
      return new NextResponse("Invalid blob URL", { status: 400 });
    }

    // Fetch the original image
    const blobResponse = await fetch(blobUrl);

    if (!blobResponse.ok) {
      return new NextResponse("Photo not found", { status: 404 });
    }

    // Get image buffer
    const buffer = await blobResponse.arrayBuffer();

    // Optimize image with sharp
    const optimizedBuffer = await sharp(Buffer.from(buffer))
      .resize(width, null, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .webp({ quality })
      .toBuffer();

    // Return optimized image
    return new NextResponse(new Uint8Array(optimizedBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[PHOTO OPTIMIZED] Error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
