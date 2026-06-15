# Frontend Job Radar

Production-grade job monitoring platform for Senior/Lead Frontend Engineer roles. Continuously scans Greenhouse, Lever, and Workday job boards, filters for matching frontend roles, deduplicates via Supabase, and sends instant Telegram and email alerts.

Runs on GitHub Actions every 5 minutes.

## Features

- Multi-source collectors: Greenhouse, Lever, Workday
- Keyword-based filtering with include/exclude rules
- Supabase PostgreSQL deduplication
- Telegram and email (Resend) notifications
- Independent collector error handling
- Structured logging with Pino
- Strict TypeScript with Zod validation

## Architecture

```
GitHub Actions (every 5 min)
        │
        ▼
   src/index.ts
        │
   ┌────┴────┬──────────┬──────────┐
   ▼         ▼          ▼          ▼
Greenhouse  Lever    Workday   (LinkedIn — phase 2)
   │         │          │
   └────┬────┴──────────┘
        ▼
  filters/matcher.ts
        ▼
  services/jobProcessor.ts
        │
   ┌────┴────┐
   ▼         ▼
Supabase   Notifications
           (Telegram + Email)
```

## Prerequisites

- Node.js 22+
- Supabase project
- Telegram bot
- Resend account with verified domain
- GitHub repository (for scheduled runs)

## Local Setup

1. Clone the repository:

```bash
git clone <your-repo-url>
cd frontend-job-radar
```

2. Install dependencies:

```bash
npm ci
```

3. Copy environment variables:

```bash
cp .env.local.example .env.local
```

4. Fill in `.env.local` with your credentials (see sections below).

5. Build and run:

```bash
npm run build
npm start
```

For development without building:

```bash
npm run dev
```

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).

2. Open the SQL Editor and run the migration:

```bash
# File: supabase/migrations/001_create_jobs.sql
```

Or paste the SQL directly:

```sql
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_id text not null,
  title text not null,
  company text not null,
  location text,
  apply_url text not null,
  posted_at timestamptz,
  description text,
  discovered_at timestamptz not null default now(),
  unique (source, external_id)
);
```

3. Copy your project URL and **service role key** from **Settings → API**.

4. Add to `.env.local`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> Use the service role key for server-side writes. Never commit it or expose it in client code.

## Telegram Setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram and create a bot.

2. Copy the bot token.

3. Get your chat ID:
   - Message your bot
   - Visit `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Find `"chat":{"id": ...}` in the response

4. Add to `.env.local`:

```
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

## Resend Setup

1. Sign up at [resend.com](https://resend.com).

2. Verify your sending domain under **Domains**.

3. Create an API key under **API Keys**.

4. Add to `.env.local`:

```
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=alerts@yourdomain.com
EMAIL_TO=you@example.com
```

## Configuration

### Companies

Edit `config/companies.json` to add or remove monitored companies:

```json
{
  "greenhouse": ["stripe", "airbnb", "datadog", "confluent"],
  "lever": ["coinbase", "rippling", "atlassian"],
  "workday": [
    {
      "name": "Adobe",
      "tenant": "adobe",
      "instance": "wd5",
      "site": "External"
    }
  ]
}
```

Workday entries require `tenant`, `instance` (e.g. `wd5`), and `site` (career site slug).

### Keywords

Edit `config/keywords.json` to tune role matching:

- **include**: titles must contain at least one of these (case insensitive)
- **exclude**: titles containing these are rejected even if they match include

## GitHub Actions Setup

1. Push this repository to GitHub.

2. Go to **Settings → Secrets and variables → Actions**.

3. Add repository secrets:

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `TELEGRAM_CHAT_ID` | Telegram chat ID |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Verified sender address |
| `EMAIL_TO` | Alert recipient |

4. Enable GitHub Actions if not already enabled.

5. The workflow in `.github/workflows/monitor.yml` runs every 5 minutes (`*/5 * * * *`).

6. Trigger manually via **Actions → Job Monitor → Run workflow**.

> GitHub may delay scheduled workflows on free tiers. For exact 5-minute intervals, consider a dedicated runner or external cron trigger.

## Deployment

This project is designed to run as a scheduled GitHub Action — no separate server required.

Deployment steps:

1. Configure all secrets in GitHub
2. Run the Supabase migration
3. Push to `main`
4. Verify the first workflow run in the Actions tab

## Troubleshooting

### Verify the system step-by-step

Run the built-in diagnostic:

```bash
npm run verify
```

This checks environment variables, fetches a sample from Greenhouse, validates your Supabase schema, and shows matching job titles.

To test Telegram and email delivery:

```bash
npm run verify -- --notify
```

### Run completed but nothing saved or notified

Check the final log line. Example of a healthy run:

```json
{"fetched":1131,"matched":4,"saved":4,"notificationsSent":4,"skipped":1127,"errors":0}
```

If `matched > 0` but `saved = 0`, the issue is usually Supabase — not collectors or filters.

Common error: `Could not find the 'description' column` — your table schema is incomplete. Run in Supabase SQL Editor:

```sql
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS description text;
```

Or re-run the full migration from `supabase/migrations/001_create_jobs.sql`.

### No jobs fetched

- Check `config/companies.json` identifiers are correct
- Verify company career pages are publicly accessible
- Review workflow logs for collector-specific errors

### Jobs fetched but no notifications

- Confirm job titles match keywords in `config/keywords.json`
- Check if jobs already exist in Supabase (deduplication skips known jobs)
- Test Telegram token and chat ID manually

### Supabase errors

- Confirm the `jobs` table exists with the correct schema
- Verify `SUPABASE_SERVICE_ROLE_KEY` has write access
- Check Row Level Security policies if enabled (disable or add service role policy)

### Email not sending

- Verify domain in Resend dashboard
- Ensure `EMAIL_FROM` uses the verified domain
- Check Resend dashboard for delivery logs

### Workflow not running on schedule

- Scheduled workflows require activity on the repo (commits/issues)
- GitHub may throttle cron on free accounts
- Use `workflow_dispatch` to test manually

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled monitor |
| `npm run dev` | Run with ts-node (development) |
| `npm run lint` | Run ESLint |

## Project Structure

```
frontend-job-radar/
├── .github/workflows/monitor.yml
├── config/
│   ├── companies.json
│   └── keywords.json
├── dashboard/              # Next.js private job dashboard (see dashboard/README.md)
├── src/
│   ├── collectors/       # Greenhouse, Lever, Workday, LinkedIn
│   ├── config/           # Env and config loaders
│   ├── db/               # Supabase integration
│   ├── filters/          # Role matching
│   ├── notifications/    # Telegram and email
│   ├── services/         # Job processing pipeline
│   ├── types/            # Shared types
│   ├── utils/            # Logger
│   └── index.ts          # Entry point
├── supabase/migrations/
├── FUTURE.md             # Planned enhancements
└── README.md
```

## Future Enhancements

See [FUTURE.md](./FUTURE.md) for planned features including AI match scoring, LinkedIn monitoring, dashboard, and daily digest.

## License

ISC
