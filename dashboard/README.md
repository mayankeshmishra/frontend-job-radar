# Frontend Job Radar Dashboard

Private Next.js dashboard for viewing and managing jobs discovered by the job monitor.

## Features

- Email and password authentication via Supabase Auth
- Job table with search, status, and source filters
- Statistics cards for total, new, applied, and ignored jobs
- Apply, mark applied, and ignore actions with optimistic updates
- Responsive layout: table on desktop, cards on mobile
- Toast notifications for success and error states

## Stack

- Next.js App Router
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- Supabase Auth and PostgreSQL

## Project Structure

```
dashboard/
├── app/
│   ├── dashboard/          # Protected jobs dashboard
│   ├── login/              # Authentication page
│   ├── layout.tsx
│   └── page.tsx            # Redirects to /dashboard
├── components/
│   ├── JobTable.tsx
│   ├── JobFilters.tsx
│   ├── StatsCards.tsx
│   ├── DashboardClient.tsx
│   ├── LoginForm.tsx
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── env.ts              # Environment validation (Zod)
│   ├── jobs.ts             # Server-side job fetching
│   ├── supabase.ts
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── types/
│   └── job.ts
└── middleware.ts           # Auth guard for /dashboard
```

## Prerequisites

- Node.js 22+
- Supabase project with the jobs table and status migration applied
- Supabase Auth user (email/password)

## Setup

1. Install dependencies:

```bash
cd dashboard
npm ci
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Add your Supabase credentials to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these values in Supabase under **Settings → API**. Use the **anon/public** key, not the service role key.

4. Run the database migration for dashboard status columns:

```bash
# File: supabase/migrations/003_add_job_status_columns.sql
```

Run this in the Supabase SQL Editor if you have not already.

5. Create a Supabase Auth user:

- Open **Authentication → Users** in Supabase
- Add a user with email and password

6. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |

## Deployment (Vercel)

1. Import the repository and set the root directory to `dashboard`
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

## Security

- `/dashboard` requires authentication
- Unauthenticated users are redirected to `/login`
- Authenticated users visiting `/login` are redirected to `/dashboard`
- Row Level Security policies allow authenticated users to read and update jobs

## License

ISC
