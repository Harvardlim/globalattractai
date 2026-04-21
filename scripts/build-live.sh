#!/bin/bash
# Build script for Android app targeting LIVE/Production environment
# Usage: bash scripts/build-live.sh

echo "🔄 Switching to LIVE environment..."

# Backup current .env
cp .env .env.backup

# Write LIVE environment variables
cat > .env << 'EOF'
VITE_SUPABASE_PROJECT_ID="lspjiypmdhltihqoaxnu"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcGppeXBtZGhsdGlocW9heG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MTA3MDIsImV4cCI6MjA4NDE4NjcwMn0.be1GQWFBrSpaJOxH4WrexAKlCRAANp2-XnSYj5nGcPE"
VITE_SUPABASE_URL="https://lspjiypmdhltihqoaxnu.supabase.co"
EOF

echo "✅ LIVE environment configured"
echo "📦 Building..."

npm run build

echo "🔄 Restoring development .env..."
mv .env.backup .env

echo "✅ Build complete! Now run:"
echo "   npx cap sync android"
echo "   npx cap run android"
