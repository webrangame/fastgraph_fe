#!/bin/bash

# Vercel Deployment Script
echo "🚀 Starting Vercel deployment process..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run 'vercel login' first."
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📋 Don't forget to set your environment variables in the Vercel dashboard:"
echo "   - NEXT_PUBLIC_API_BASE_URL=https://jobaapi.hattonn.com/api/v1"
echo "   - NEXT_PUBLIC_AUTO_ORCHESTRATE_URL=https://fatgraph-prod-twu675cviq-uc.a.run.app"
echo "   - NODE_ENV=production"
