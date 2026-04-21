@echo off
echo Switching to LIVE environment...

copy .env .env.backup >nul

(
echo VITE_SUPABASE_PROJECT_ID="lspjiypmdhltihqoaxnu"
echo VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcGppeXBtZGhsdGlocW9heG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MTA3MDIsImV4cCI6MjA4NDE4NjcwMn0.be1GQWFBrSpaJOxH4WrexAKlCRAANp2-XnSYj5nGcPE"
echo VITE_SUPABASE_URL="https://lspjiypmdhltihqoaxnu.supabase.co"
) > .env

echo LIVE environment configured
echo Building...

call npm run build

echo Restoring development .env...
move /Y .env.backup .env >nul

echo Build complete! Now run:
echo   npx cap sync android
echo   npx cap run android
