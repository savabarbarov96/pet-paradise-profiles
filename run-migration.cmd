@echo off
echo Pet Paradise Database Migration Helper
echo ===================================
echo.
echo This script will help you run the migration to fix the database schema.
echo Make sure you have the Supabase CLI installed and configured.
echo.

echo Checking if Supabase CLI is installed...
where supabase > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Supabase CLI not found. Please install it first:
  echo npm install -g supabase
  exit /b 1
)

echo Supabase CLI found.
echo.
echo Running database migration...
echo.

cd /d "%~dp0"
supabase db reset

echo.
echo Migration complete!
echo.
echo If you see any errors, please check the Supabase CLI documentation
echo or run the SQL migration manually from:
echo ./supabase/migrations/20240601000000_fix_pet_profiles.sql
echo.
pause 