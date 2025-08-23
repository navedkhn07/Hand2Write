# Hand_2_Write (React + Supabase)

This is a starter scaffold for **Hand_2_Write** — a platform connecting disabled students with verified writers.

## Features
- Register / Login (Supabase Auth)
- Profiles for Disabled students and Writers
- Add exam info (students)
- Select Writer (creates notification)
- Writer sees notifications and can Accept/Reject
- Supabase Realtime used for notifications (subscription)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Supabase project at https://supabase.com and note your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
3. Create the database tables using the provided `supabase_schema.sql`.
4. Copy `.env.example` to `.env` and fill your Supabase keys:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Run the dev server:
   ```bash
   npm run dev
   ```

