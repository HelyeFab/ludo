import type { ImageLoaderProps } from "next/image";

/**
 * Custom image loader for Next.js Image component
 * Routes all image requests through our authenticated photo proxy
 */
export function secureImageLoader({ src, width, quality }: ImageLoaderProps) {
  // If src is already our proxy URL, extract the blob URL
  const url = new URL(src, "https://placeholder.com");
  const blobUrl = url.searchParams.get("url") || src;

  // Build the proxy URL with Next.js optimization parameters
  const params = new URLSearchParams({
    url: blobUrl,
    w: width.toString(),
    q: (quality || 75).toString(),
  });

  return `/api/photos/optimized?${params.toString()}`;
}
