# Supabase Setup Guide

This guide will help you set up Supabase for Blooming.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name your project (e.g., "Blooming")
4. Choose a region (pick closest to your users)
5. Choose a strong password (save it!)
6. Click "Create new project"
7. Wait 1-2 minutes for project to be ready

## Step 2: Get Your Credentials

1. Once ready, go to your project dashboard
2. Navigate to **Settings → API**
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your editor

3. Replace the placeholders:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

4. (Optional) Add Telegram Bot Token:
   - Go to [@BotFather](https://t.me/BotFather) on Telegram
   - Create a bot: `/newbot`
   - Copy the bot token
   - Add to `.env`: `VITE_TELEGRAM_BOT_TOKEN=your-bot-token`

## Step 4: Run Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. Verify all tables were created successfully

## Step 5: Enable Email Auth (for Telegram Integration)

1. Go to **Authentication → Providers**
2. Enable "Email" provider
3. (Optional) Disable email confirmation if testing

## Step 6: Test the Connection

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open browser console (F12)

3. If you see "Missing Supabase environment variables":
   - Make sure `.env` file exists
   - Check that values are correct
   - Restart dev server

4. If no errors:
   - Your Supabase client is ready!

## Step 7: Update Code to Use Supabase

The following files have been created/updated to use Supabase:

### Created Files:
- `src/lib/supabase.ts` - Supabase client configuration
- `src/types/supabase.ts` - TypeScript types for database
- `supabase/schema.sql` - Database schema

### Next Steps:
1. Update `LogWorkoutPage.tsx` to save workouts to Supabase
2. Update `HistoryPage.tsx` to fetch workouts from Supabase
3. Update `SchedulerPage.tsx` to save plans to Supabase
4. Update `HomePage.tsx` to fetch plans from Supabase
5. Add Telegram auth integration
6. Test all features with Supabase

## Troubleshooting

### Error: "Missing Supabase environment variables"
**Solution:**
- Make sure `.env` file exists in project root
- Check that variables are named correctly (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- Restart your dev server after creating `.env`

### Error: "Invalid API Key"
**Solution:**
- Double-check you copied the correct key (not the service_role key)
- Go to Supabase Settings → API and verify the values

### Error: "Table does not exist"
**Solution:**
- Run the SQL schema in Supabase SQL Editor
- Check for errors in the SQL output
- Verify all tables were created

### Error: "Row level security policy violation"
**Solution:**
- Make sure user is authenticated before making queries
- Check that RLS policies are correctly configured
- Test with different user accounts

## Security Notes

- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Users can only access their own data
- ✅ Environment variables are in `.env` (not committed to Git)
- ✅ `.env` is in `.gitignore`
- ⚠️ Never commit `.env` to version control
- ⚠️ Never share your anon key publicly
- ⚠️ Keep your Supabase password secure

## Next Steps After Setup

1. Implement Telegram auth with signature verification
2. Update all pages to use Supabase instead of localStorage
3. Add loading states for Supabase operations
4. Test with multiple users
5. Deploy to production

## Useful Links

- Supabase Dashboard: https://supabase.com/dashboard
- SQL Editor: https://supabase.com/dashboard/project/_/sql
- Database Tables: https://supabase.com/dashboard/project/_/editor
- Authentication: https://supabase.com/dashboard/project/_/auth/providers

## Support

- Supabase Docs: https://supabase.com/docs
- Discord Community: https://discord.gg/supabase
- GitHub Issues: https://github.com/supabase/supabase-js/issues
