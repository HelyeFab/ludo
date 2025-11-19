/**
 * Converts a direct Vercel Blob URL to a proxied URL that requires authentication
 * @param blobUrl - The original blob URL from Vercel storage
 * @returns Proxied URL that checks authentication before serving
 */
export function getSecurePhotoUrl(blobUrl: string): string {
  // Encode the blob URL to pass as query parameter
  const encodedUrl = encodeURIComponent(blobUrl);
  return `/api/photos/secure?url=${encodedUrl}`;
}

/**
 * Gets the original blob URL from a secure photo URL
 * @param secureUrl - The proxied URL
 * @returns Original blob URL or null if invalid
 */
export function getOriginalBlobUrl(secureUrl: string): string | null {
  try {
    const url = new URL(secureUrl, "http://localhost");
    return url.searchParams.get("url");
  } catch {
    return null;
  }
}
