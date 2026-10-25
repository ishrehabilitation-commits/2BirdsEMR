# 2Birds EMR

A calmer, faster home health EMR. Everything you need is one keystroke away
(press **⌘K** / **Ctrl+K** or **/**), reports live in one searchable place, and the
dashboard puts visits, unsigned orders, the physician hotlist and form audits in
front of you instead of behind menus.

> **Fictional data only.** This is a learning project and proof of concept. Never
> enter real patient information (PHI).

## What's here

| Page | What it does |
| --- | --- |
| **Today** (`/`) | Visits today, unsigned orders, open audits, notes to finish, physician hotlist, pinned reports |
| **Patients** | Instant search and status filters; each patient has a one-screen chart |
| **Schedule** | Seven-day view, color-coded by discipline, missed visits flagged |
| **Orders & hotlist** | Unsigned orders grouped by physician with phone/fax, aged in days |
| **Form audits** | Board of documentation fixes: needs fixing, in review, resolved |
| **Reports** | Eight plain-English reports, searchable by old names too ("485", "MVN"), sortable, CSV export, pin to dashboard |
| **Feedback** | Button on every page; with Supabase connected it's saved to the `feedback` table |

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no environment variables set, the app runs in
**demo mode** on built-in fake data, so it works immediately.

## Connect Supabase (optional, when you're ready for real logins)

1. In the Supabase dashboard, open **SQL Editor** and run, in order:
   - `supabase/migrations/20261025000000_initial_schema.sql` (tables + Row Level Security)
   - `supabase/seed.sql` (the same fake agency demo mode shows)
2. In **Project Settings → API Keys**, copy the project URL and the
   **publishable** key (or the legacy **anon** key).
3. Copy `.env.example` to `.env.local` and paste those two values. Never use the
   `secret` / `service_role` key in this app.
4. Restart `npm run dev`. You'll get a sign-in page; create an account and it
   joins the demo agency automatically (POC-only behavior, see the migration).

Regenerate the seed after changing `src/lib/demo-data.ts`:

```bash
npm run db:seed:generate
```

## Deploy to Vercel

1. In Vercel, **Add New → Project** and import this GitHub repo. Accept the
   defaults (framework: Next.js).
2. Deploy. With no environment variables it deploys in demo mode, which is
   perfect for showing people.
3. To switch to Supabase later, add `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` under **Settings → Environment
   Variables**, then redeploy.

## How the code is organized

```
src/app/(app)/        pages behind the sidebar (Today, Patients, Schedule, …)
src/app/login/        sign-in page (only used when Supabase is connected)
src/app/actions.ts    server actions: patient search, feedback
src/components/       sidebar, command palette, feedback dialog, UI pieces
src/lib/data.ts       loads data from Supabase, or demo data when not configured
src/lib/insights.ts   the math: hotlist, overdue orders, open audits, KPIs
src/lib/reports*.ts   report catalog (searchable) and report tables
src/lib/demo-data.ts  fictional agency used by demo mode and supabase/seed.sql
supabase/             SQL migration with RLS, generated seed
```

Stack: Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4,
Supabase (Postgres + Auth), cmdk, lucide icons.

## Ideas for next

- AI: "summarize this patient", plain-English report questions, note QA hints
- Personalization: sync pinned reports and layout to `user_preferences`
- Real workflows: mark audits resolved, log order signatures, drag to reschedule
