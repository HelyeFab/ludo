# Upload Size Limit Issue (413 Error)

**Date:** 2025-11-19
**Status:** ⚠️ KNOWN LIMITATION

## Problem

Users experiencing 413 (Content Too Large) errors when uploading photos to production at `https://ludoiaccarino.com`.

## Root Cause

**Vercel Hosting Limitations:**
- Vercel Hobby plan has a **4.5MB request body limit**
- This limit is AFTER FormData encoding, which increases file size by ~33%
- Effective limit: **~3.3MB original file size**
- Files larger than this cannot be uploaded through Next.js API routes on Vercel

**Current Architecture:**
1. User selects photo in browser
2. Photo is sent to Next.js API route (`/api/admin/albums/[albumId]/photos`)
3. Next.js receives FormData and forwards to B2 storage
4. B2 returns URL, Next.js returns to client

**Problem:** Step 2 hits Vercel's 4.5MB body limit before reaching B2.

## Current Mitigations

✅ **Frontend already uploads sequentially** (one file at a time)
✅ **Increased Vercel function memory** to 3008MB in `vercel.json`
✅ **B2 storage configured** for unlimited uploads (once file reaches backend)

## Why It Still Fails

Even with sequential uploads, **a single photo over ~3.3MB** will fail because:
- The file must pass through Next.js API route
- Vercel enforces body size limit BEFORE Next.js code runs
- No configuration can bypass this on Hobby plan

## Solutions

### Option 1: Upgrade Vercel Plan (Easiest)
Upgrade to Vercel Pro plan:
- Body limit: **100MB** (vs 4.5MB on Hobby)
- Cost: $20/month
- No code changes needed
- **Recommended for production use**

### Option 2: Client-Side Image Compression (Medium Effort)
Compress images in the browser before upload:

```typescript
// Install: npm install browser-image-compression
import imageCompression from 'browser-image-compression';

async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 2, // Target 2MB max
    maxWidthOrHeight: 2048, // Max dimension
    useWebWorker: true,
  };
  return await imageCompression(file, options);
}
```

**Pros:** Works on Hobby plan, faster uploads
**Cons:** Reduces image quality, adds complexity

### Option 3: Direct B2 Upload with Presigned URLs (Complex)
Bypass Next.js entirely for uploads:

1. Client requests presigned URL from Next.js
2. Client uploads directly to B2 using presigned URL
3. Client notifies Next.js of completion

**Pros:** No size limits, fastest uploads
**Cons:** Major refactor, more complex security model

### Option 4: Different Host
Deploy to platform with higher limits:
- Railway: 100MB limit on free tier
- Fly.io: 100MB limit
- Self-hosted: No limits

**Pros:** No cost increase, higher limits
**Cons:** Migration effort, different platform

## Immediate Workaround

For now, users can:
1. **Compress photos before upload** using:
   - macOS Preview: Open image → File → Export → Reduce Quality
   - Windows Paint: Open image → Resize → Save
   - Online: [TinyPNG](https://tinypng.com), [Squoosh](https://squoosh.app)

2. **Target ~2-3MB per file** to stay safely under limit

## Recommended Solution

**For ludoiaccarino.com production:**

Upgrade to Vercel Pro plan ($20/month):
```bash
# In Vercel dashboard:
Settings → Plan → Upgrade to Pro
```

This provides:
- 100MB body limit (vs 4.5MB)
- Better performance
- Commercial support
- No code changes needed

## Files Modified

- `vercel.json` - Increased function memory to 3008MB
- Frontend already uploads sequentially (no changes needed)

## Testing

Local development (npm run dev) has NO size limits because it runs on Node.js directly.

Production (vercel.com) has the 4.5MB limit mentioned above.

## Status

⚠️ This is a hosting platform limitation, not a bug in the code. The application works correctly in local development and on platforms with higher limits.

**Action Required:** Choose one of the solutions above based on priorities (cost vs. effort vs. image quality).
