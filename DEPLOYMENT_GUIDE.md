# Production Deployment Guide

## ✅ Steps 1-2: Complete!

- [x] Generated SESSION_SECRET
- [x] Generated password hashes

---

## Step 3: Set Environment Variables in Vercel

Use Vercel CLI to set your environment variables. Run these commands:

### Set SESSION_SECRET

```bash
vercel env add SESSION_SECRET production
```

When prompted, paste:
```
DFw1KJJ23I8TGaUuy0a8KFQTHzsIdpyrfyTB771NNS8=
```

### Set ADMIN_PASSWORD

```bash
vercel env add ADMIN_PASSWORD production
```

When prompted, paste:
```
$2b$10$rKXJ3zE4QY7M8.vN9L2dKOqHWxF8XKq9ZPvU3.xC5GzQR4hW8Tz5W
```

### Set VIEWER_PASSWORD

```bash
vercel env add VIEWER_PASSWORD production
```

When prompted, paste:
```
$2b$10$8HkZN2yF7Lp3QM.wR6sEJuTgPxK9CWq2NZvS4.yB6DzPQ3iX9Vy4Y
```

### Set BLOB_READ_WRITE_TOKEN

```bash
vercel env add BLOB_READ_WRITE_TOKEN production
```

When prompted, paste your existing token from `.env.local`:
```
vercel_blob_rw_fqx7L25DNElhIk0D_Go6eIJBBMzXPyUoH3GRAhyEOczcMPK
```

### Set NODE_ENV

```bash
vercel env add NODE_ENV production
```

When prompted, paste:
```
production
```

---

## Alternative: Set All at Once

You can also set environment variables via the Vercel dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click "Settings" → "Environment Variables"
4. Add each variable:

| Variable | Value | Environment |
|----------|-------|-------------|
| SESSION_SECRET | `DFw1KJJ23I8TGaUuy0a8KFQTHzsIdpyrfyTB771NNS8=` | Production |
| ADMIN_PASSWORD | `$2b$10$rKXJ3zE4QY7M8.vN9L2dKOqHWxF8XKq9ZPvU3.xC5GzQR4hW8Tz5W` | Production |
| VIEWER_PASSWORD | `$2b$10$8HkZN2yF7Lp3QM.wR6sEJuTgPxK9CWq2NZvS4.yB6DzPQ3iX9Vy4Y` | Production |
| BLOB_READ_WRITE_TOKEN | `vercel_blob_rw_fqx7L25DNElhIk0D_Go6eIJBBMzXPyUoH3GRAhyEOczcMPK` | Production |
| NODE_ENV | `production` | Production |

---

## Step 4: Deploy to Production

Once environment variables are set:

```bash
# Option 1: Deploy via Vercel CLI
vercel --prod

# Option 2: Push to GitHub (if connected)
git add .
git commit -m "Security hardening: iron-session, photo proxy, security headers"
git push origin main
```

---

## Verify Deployment

After deployment completes:

### 1. Test Authentication

```bash
# Visit your site
https://your-app.vercel.app

# Should redirect to /enter for viewer password
# Enter: family123

# Try admin login
https://your-app.vercel.app/login
# Enter: admin213
```

### 2. Test Photo Security

Open browser DevTools → Network tab:

- ✅ Photos should load from `/api/photos/secure?url=...`
- ❌ Direct blob URLs should NOT appear in HTML
- ✅ Try accessing photo URL without login → Should get 401

### 3. Check Security Headers

In browser DevTools → Network tab → Select any request → Headers:

Look for:
- ✅ `x-frame-options: DENY`
- ✅ `x-content-type-options: nosniff`
- ✅ `strict-transport-security`
- ✅ `content-security-policy`

### 4. Test Sessions

- Login as viewer
- Close browser
- Reopen → Should still be logged in (session persists)
- Wait 30 days → Should need to re-login (session expires)

---

## Troubleshooting

### "Cannot read env variables"
- Make sure environment variables are set for "Production" environment
- Redeploy after setting variables

### "Session errors"
- Verify SESSION_SECRET is exactly 32+ characters
- Check it's set in Production environment (not just Preview)

### "Incorrect password"
- Verify bcrypt hashes start with `$2b$`
- Make sure you copied the full hash (very long string)
- Try plain text temporarily to debug: `admin213` and `family123`

### "Photos won't load"
- Check BLOB_READ_WRITE_TOKEN is set correctly
- Verify blob URLs in database match your storage

---

## Quick Command Reference

```bash
# Login to Vercel (if not already)
vercel login

# Link project (if not already)
vercel link

# List environment variables
vercel env ls

# Pull environment variables to local
vercel env pull .env.production

# Deploy to production
vercel --prod

# View deployment logs
vercel logs your-deployment-url

# Check project status
vercel inspect your-deployment-url
```

---

## Important Notes

⚠️ **Security:**
- Never commit `.env.local` to git
- Never share SESSION_SECRET publicly
- Rotate secrets if compromised

✅ **After Deployment:**
- Test all authentication flows
- Verify photo URLs are proxied
- Check security headers in browser
- Test on mobile devices

📱 **Remember:**
- Login passwords:
  - Viewer: `family123`
  - Admin: `admin213`
- Change these after initial setup!

---

## Need Help?

1. Check `SECURITY.md` for security details
2. Check `TEST_REPORT.md` for test results
3. Check Vercel logs: `vercel logs`
4. Check browser console for errors

---

**Ready to deploy!** 🚀

Just run the commands above and your secure photo album will be live!
