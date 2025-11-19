/**
 * Storage adapter that uses B2 if configured, otherwise falls back to Vercel Blob
 */

import { put } from "@vercel/blob";
import { uploadToB2, deleteFromB2 } from "./b2-storage";

const isB2Configured = () => {
  return !!(
    process.env.B2_APPLICATION_KEY_ID &&
    process.env.B2_APPLICATION_KEY &&
    process.env.B2_BUCKET_NAME
  );
};

export async function uploadPhoto(
  file: File,
  path: string
): Promise<{ url: string; blobPath: string }> {
  if (isB2Configured()) {
    // Use Backblaze B2
    const { downloadUrl } = await uploadToB2(file, path);
    return { url: downloadUrl, blobPath: path };
  } else {
    // Fall back to Vercel Blob
    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return { url: blob.url, blobPath: blob.url };
  }
}

export async function deletePhoto(
  url: string,
  blobPath: string
): Promise<void> {
  // Check if this is a Vercel Blob URL (legacy or fallback)
  if (
    url.includes("blob.vercel-storage.com") ||
    url.includes("public.blob.vercel-storage.com")
  ) {
    const { del } = await import("@vercel/blob");
    await del(url);
  } else {
    // Delete from B2
    await deleteFromB2(blobPath);
  }
}
