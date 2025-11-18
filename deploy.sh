#!/bin/bash

# Deployment script for Ludovica's Little Moments
# Run this in your terminal after installing and logging into Vercel CLI

echo "🎀 Deploying Ludovica's Little Moments to Vercel..."
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in
echo "📋 Checking Vercel login status..."
vercel whoami

echo ""
echo "🚀 Starting deployment..."
echo ""

# Deploy to Vercel
vercel --yes

echo ""
echo "✅ Initial deployment complete!"
echo ""
echo "⚙️  Now you need to set up environment variables:"
echo ""
echo "1. Set ADMIN_PASSWORD:"
echo "   vercel env add ADMIN_PASSWORD"
echo ""
echo "2. Set BLOB_READ_WRITE_TOKEN:"
echo "   First create a Blob store at: https://vercel.com/dashboard/stores"
echo "   Then run: vercel env add BLOB_READ_WRITE_TOKEN"
echo ""
echo "3. Set NODE_ENV:"
echo "   vercel env add NODE_ENV"
echo "   (Enter: production)"
echo ""
echo "4. Deploy to production with environment variables:"
echo "   vercel --prod"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
