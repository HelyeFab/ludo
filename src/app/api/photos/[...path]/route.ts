import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/session";

/**
 * Secure photo proxy - validates viewer or admin session before serving blob
 * This prevents direct blob URL access without authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  try {
    // Check authentication using iron-session
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return new NextResponse("Unauthorized - Please log in to view photos", {
        status: 401,
      });
    }

    // Get the blob URL from query parameter (passed by client)
    const blobUrl = request.nextUrl.searchParams.get("url");

    if (!blobUrl) {
      return new NextResponse("Missing blob URL parameter", { status: 400 });
    }

    // Validate that the URL is from Vercel Blob storage
    if (
      !blobUrl.includes("blob.vercel-storage.com") &&
      !blobUrl.includes("public.blob.vercel-storage.com")
    ) {
      return new NextResponse("Invalid blob URL", { status: 400 });
    }

    // Fetch the actual blob
    const blobResponse = await fetch(blobUrl, {
      cache: "no-store",
    });

    if (!blobResponse.ok) {
      console.error(
        `[PHOTO PROXY] Failed to fetch blob: ${blobResponse.status}`
      );
      return new NextResponse("Photo not found", { status: 404 });
    }

    // Return the blob with appropriate headers
    const headers = new Headers();
    headers.set(
      "Content-Type",
      blobResponse.headers.get("content-type") || "image/jpeg"
    );
    headers.set("Cache-Control", "private, max-age=3600"); // Cache for 1 hour per user
    headers.set("X-Content-Type-Options", "nosniff");

    return new NextResponse(blobResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[PHOTO PROXY] Error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
