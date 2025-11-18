# 🚀 Deployment Guide for Vercel

## Method 1: Deploy via Vercel Dashboard (Recommended)

This is the easiest method and gives you full control over your deployment settings.

### Step 1: Go to Vercel
Visit: https://vercel.com/new

### Step 2: Import Your GitHub Repository
1. Click "Import Git Repository"
2. Search for `HelyeFab/ludo` or paste the URL: https://github.com/HelyeFab/ludo
3. Click "Import"

### Step 3: Configure Your Project
1. **Project Name**: `ludo` (or your preferred name)
2. **Framework Preset**: Next.js (should auto-detect)
3. **Root Directory**: `./` (leave as default)
4. **Build Command**: `npm run build` (auto-configured)
5. **Output Directory**: `.next` (auto-configured)

### Step 4: Add Environment Variables
Click "Environment Variables" and add the following:

| Name | Value | Notes |
|------|-------|-------|
| `ADMIN_PASSWORD` | `your_secure_password` | Choose a strong password for admin access |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_xxxxx` | See instructions below |
| `NODE_ENV` | `production` | Set to production |

#### Getting Your Blob Storage Token:

Before deploying, you need to set up Vercel Blob storage:

1. Go to your Vercel Dashboard
2. Click on "Storage" in the sidebar
3. Click "Create Database" → Select "Blob"
4. Give it a name (e.g., "ludo-photos")
5. Click "Create"
6. Once created, go to the ".env.local" tab
7. Copy the `BLOB_READ_WRITE_TOKEN` value
8. Paste it in the environment variables during deployment

### Step 5: Deploy!
1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. You'll get a URL like: `https://ludo-xyz123.vercel.app`

### Step 6: Test Your Deployment
1. Visit your new URL
2. Test the health endpoint: `https://your-app.vercel.app/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`
3. Go to `/admin` and log in with your `ADMIN_PASSWORD`
4. Create your first album
5. Upload some photos!

---

## Method 2: Deploy via Vercel CLI

If you prefer using the command line:

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

Or use npx (no installation needed):

```bash
npx vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser for authentication.

### Step 3: Deploy

From your project directory:

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No
- **What's your project's name?** ludo (or your choice)
- **In which directory is your code located?** ./
- **Want to modify settings?** No

### Step 4: Add Environment Variables

You can add environment variables in two ways:

**Option A: Via CLI**
```bash
vercel env add ADMIN_PASSWORD
# Enter your password when prompted

vercel env add BLOB_READ_WRITE_TOKEN
# Paste your token when prompted

vercel env add NODE_ENV
# Enter: production
```

**Option B: Via Dashboard**
1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Add the variables as shown in Method 1

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

This deploys to production with your environment variables.

---

## Method 3: Connect Vercel Blob After Deployment

If you deployed without setting up Blob storage first:

1. Go to your project in Vercel Dashboard
2. Click "Storage" tab
3. Click "Connect Store" → "Create New" → "Blob"
4. Follow the wizard to create a new Blob store
5. Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` to your environment variables
6. The deployment will automatically redeploy with the new variable

---

## Post-Deployment Checklist

After your first deployment:

- [ ] Visit your production URL
- [ ] Test `/api/health` endpoint
- [ ] Verify Blob storage connection
- [ ] Log in to `/admin`
- [ ] Create a test album
- [ ] Upload test photos
- [ ] View the album on the public page
- [ ] Set up custom domain (optional)

---

## Environment Variables Reference

All required environment variables:

```env
# Required
ADMIN_PASSWORD=your_secure_password_here
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx

# Recommended
NODE_ENV=production
```

---

## Troubleshooting

### Build Fails

**Error: "ADMIN_PASSWORD is not configured"**
- Add the environment variable in Vercel dashboard
- Redeploy the project

**Error: "Module not found"**
- Clear build cache in Vercel dashboard
- Redeploy

### Runtime Errors

**"Unauthorized" when accessing admin**
- Check that `ADMIN_PASSWORD` is set correctly
- Try logging out and back in
- Clear browser cookies

**Image uploads fail**
- Verify `BLOB_READ_WRITE_TOKEN` is correct
- Check Blob store is active in Vercel dashboard
- Check file size is under 10MB

**CSRF token errors**
- This is normal on first load
- Refresh the page to get a new token
- Check that cookies are enabled

---

## Custom Domain Setup (Optional)

To use your own domain:

1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Add your domain (e.g., `ludovica.example.com`)
4. Follow DNS configuration instructions
5. Vercel will automatically provision SSL certificate

---

## Monitoring Your App

Vercel provides built-in monitoring:

- **Analytics**: View page views and performance
- **Logs**: Check runtime logs for errors
- **Functions**: Monitor API route performance
- **Blob**: Track storage usage

Access these from your project dashboard.

---

## Updating Your App

To deploy updates:

1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Vercel will automatically detect the push and redeploy

Or manually redeploy:
```bash
vercel --prod
```

---

## Need Help?

- Vercel Documentation: https://vercel.com/docs
- Vercel Blob Docs: https://vercel.com/docs/storage/vercel-blob
- Project Issues: https://github.com/HelyeFab/ludo/issues

---

Happy deploying! 🎉
