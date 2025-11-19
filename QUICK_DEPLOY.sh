#!/bin/bash

# Quick Deployment Script for Ludo Photo Album
# Run this to deploy to Vercel production

set -e

echo "🚀 Ludo Photo Album - Production Deployment"
echo "==========================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Check if logged in
echo "📋 Checking Vercel login status..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel"
    echo "Run: vercel login"
    exit 1
fi

echo "✅ Logged in to Vercel"
echo ""

# Set environment variables
echo "🔐 Setting environment variables..."
echo ""

echo "Setting SESSION_SECRET..."
echo "DFw1KJJ23I8TGaUuy0a8KFQTHzsIdpyrfyTB771NNS8=" | vercel env add SESSION_SECRET production --yes || true

echo "Setting ADMIN_PASSWORD..."
echo "\$2b\$10\$rKXJ3zE4QY7M8.vN9L2dKOqHWxF8XKq9ZPvU3.xC5GzQR4hW8Tz5W" | vercel env add ADMIN_PASSWORD production --yes || true

echo "Setting VIEWER_PASSWORD..."
echo "\$2b\$10\$8HkZN2yF7Lp3QM.wR6sEJuTgPxK9CWq2NZvS4.yB6DzPQ3iX9Vy4Y" | vercel env add VIEWER_PASSWORD production --yes || true

echo "Setting BLOB_READ_WRITE_TOKEN..."
echo "vercel_blob_rw_fqx7L25DNElhIk0D_Go6eIJBBMzXPyUoH3GRAhyEOczcMPK" | vercel env add BLOB_READ_WRITE_TOKEN production --yes || true

echo "Setting NODE_ENV..."
echo "production" | vercel env add NODE_ENV production --yes || true

echo ""
echo "✅ Environment variables set!"
echo ""

# Deploy
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Visit your deployment URL"
echo "2. Test viewer password: family123"
echo "3. Test admin password: admin213"
echo "4. Verify photos require authentication"
echo "5. Check security headers in browser DevTools"
echo ""
echo "🎉 Your secure photo album is live!"
