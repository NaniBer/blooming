#!/bin/bash

echo "🚀 Pre-deployment Checklist"
echo "================================"
echo ""

# Check if git working tree is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Error: Working tree is not clean. Please commit or stash changes."
  git status
  exit 1
fi

echo "✅ Git working tree is clean"
echo ""

# Run type checking
echo "📝 Running TypeScript type check..."
npm run build 2>&1 | grep -E "(error|Error|warning|Warning)"
if [ $? -eq 0 ]; then
  echo "❌ Type check failed"
  exit 1
fi
echo "✅ Type check passed"
echo ""

# Run tests
echo "🧪 Running tests..."
npm run test:run
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi
echo "✅ All tests passed"
echo ""

# Build for production
echo "🔨 Building for production..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Build successful"
echo ""

# Check dist folder
if [ ! -d "dist" ]; then
  echo "❌ Error: dist folder not found"
  exit 1
fi
echo "✅ dist folder created"
echo ""

# Check for environment variables
echo "⚙️  Checking environment variables..."
if [ -z "$VITE_SUPABASE_URL" ] && [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "⚠️  Warning: No Supabase environment variables found"
  echo "   App will use localStorage fallback"
else
  echo "✅ Supabase environment variables found"
fi
echo ""

echo "================================"
echo "🎉 Pre-deployment checks passed!"
echo ""
echo "Ready to deploy. Choose your deployment method:"
echo "1. Deploy to Vercel: npm run deploy:vercel"
echo "2. Deploy to Netlify: npm run deploy:netlify"
echo "3. Deploy to GitHub Pages: npm run deploy:github"
echo "4. Manual deployment: Upload 'dist' folder to your hosting provider"
echo ""
