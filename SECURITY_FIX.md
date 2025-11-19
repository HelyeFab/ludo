# 🔒 Security Fix - Viewer Isolation

**Date:** 2025-11-19
**Severity:** CRITICAL
**Status:** ✅ FIXED

## Vulnerability Description

**Issue:** Viewers could access admin dashboard and admin API endpoints despite having only viewer-level permissions.

**Root Cause:**
- Middleware only checked for session cookie existence, not the user's role
- Admin API routes did not verify that the authenticated user has the "admin" role
- Both admin and viewer sessions use the same `ludo_session` cookie, so middleware couldn't distinguish between them

## Impact

- Viewers could access `/admin` dashboard page
- Viewers could access `/api/admin/csrf` to get CSRF tokens
- However, viewers were correctly blocked from actual mutations (creating/updating/deleting) by CSRF validation

**Risk Level:** HIGH - UI exposure but data protected by CSRF

## Fix Applied

### 1. Admin Page Role Check (`src/app/admin/page.tsx`)
```typescript
// Before (vulnerable):
if (!session.isAuthenticated) {
  redirect("/login?from=/admin");
}

// After (secure):
if (!session.isAuthenticated || session.role !== "admin") {
  redirect("/login?from=/admin");
}
```

### 2. Admin API Routes - Added `getVerifiedAdminSession()`

Updated all admin API routes to verify admin role:
- `src/app/api/admin/csrf/route.ts`
- `src/app/api/admin/albums/route.ts` (GET, POST)
- `src/app/api/admin/albums/[albumId]/route.ts` (PATCH, DELETE)
- `src/app/api/admin/albums/[albumId]/photos/route.ts` (POST, DELETE)

Example fix:
```typescript
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

  // ... rest of handler
}
```

## Testing

Created comprehensive viewer isolation test: `/tmp/test-viewer-isolation.sh`

### Test Results - BEFORE Fix
```
[3/5] Trying to access /admin as viewer...
❌ FAIL: Viewer can access admin dashboard! (HTTP 200)
   This is a SECURITY ISSUE!

[4/5] Trying to get CSRF token as viewer...
❌ FAIL: Viewer can access CSRF endpoint! (HTTP 200)
```

### Test Results - AFTER Fix
```
[1/5] Viewer login successful ✅
[2/5] Viewer can access homepage ✅
[3/5] Viewer BLOCKED from admin dashboard ✅
[4/5] Viewer BLOCKED from CSRF endpoint ✅
[5/5] Viewer BLOCKED from creating albums ✅

✅ Viewer isolation verified!
```

### Full Test Suite
```
Total Tests: 14
Passed: 14
Failed: 0
Success Rate: 100%
```

## Files Modified

1. `src/app/admin/page.tsx` - Added role check
2. `src/app/api/admin/csrf/route.ts` - Added admin verification
3. `src/app/api/admin/albums/route.ts` - Added admin verification (GET, POST)
4. `src/app/api/admin/albums/[albumId]/route.ts` - Added admin verification (PATCH, DELETE)
5. `src/app/api/admin/albums/[albumId]/photos/route.ts` - Added admin verification (POST, DELETE)

## Security Best Practices Applied

✅ **Defense in Depth** - Both page-level and API-level checks
✅ **Role-Based Access Control** - Verify user role, not just authentication
✅ **Least Privilege** - Viewers can only access public pages
✅ **Fail Secure** - Default to deny if role check fails

## Deployment

All fixes are committed and ready for deployment. No environment variable changes required.

```bash
# Build and test locally
npm run build

# Deploy to production
vercel --prod
```

## Verification in Production

After deployment, verify viewer isolation:

1. Login as viewer with family password
2. Try to access `/admin` - should redirect to login
3. Try to access `/api/admin/csrf` - should return 403
4. Confirm viewers can still access home page and albums

**Status:** ✅ READY FOR PRODUCTION
