# Set Environment Variables - Step by Step

Run these commands one at a time in your terminal:

## 1. SESSION_SECRET

```bash
vercel env add SESSION_SECRET production
```

**Paste when prompted:**
```
DFw1KJJ23I8TGaUuy0a8KFQTHzsIdpyrfyTB771NNS8=
```

---

## 2. ADMIN_PASSWORD

```bash
vercel env add ADMIN_PASSWORD production
```

**Paste when prompted:**
```
$2b$10$rKXJ3zE4QY7M8.vN9L2dKOqHWxF8XKq9ZPvU3.xC5GzQR4hW8Tz5W
```

---

## 3. VIEWER_PASSWORD

```bash
vercel env add VIEWER_PASSWORD production
```

**Paste when prompted:**
```
$2b$10$8HkZN2yF7Lp3QM.wR6sEJuTgPxK9CWq2NZvS4.yB6DzPQ3iX9Vy4Y
```

---

## 4. NODE_ENV

```bash
vercel env add NODE_ENV production
```

**Paste when prompted:**
```
production
```

---

## 5. Verify All Variables Are Set

```bash
vercel env ls
```

**Should show:**
- BLOB_READ_WRITE_TOKEN ✅ (already set)
- SESSION_SECRET ✅
- ADMIN_PASSWORD ✅
- VIEWER_PASSWORD ✅
- NODE_ENV ✅

---

## 6. Deploy to Production

```bash
vercel --prod
```

**This will:**
- Build your app
- Deploy to production
- Give you a URL

---

## 7. Test Deployment

Visit your deployment URL and verify:

1. **Redirects to /enter** ✅
   - Enter password: `family123`

2. **Can access admin** ✅
   - Go to `/login`
   - Enter password: `admin213`

3. **Photos are secure** ✅
   - Open DevTools → Network tab
   - Photo URLs should be `/api/photos/secure?url=...`

4. **Security headers present** ✅
   - DevTools → Network → Click any request → Headers
   - Look for `x-frame-options`, `content-security-policy`, etc.

---

## Troubleshooting

**If `vercel env add` times out:**
- Press Ctrl+C
- Try again
- Or use Vercel dashboard: https://vercel.com/dashboard

**If deployment fails:**
```bash
vercel logs --prod
```

**To update a variable:**
```bash
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

---

**Ready!** Just copy-paste the commands above and you'll be deployed in ~5 minutes! 🚀
