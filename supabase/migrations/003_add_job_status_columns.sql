-- Add status tracking columns for the dashboard.

alter table public.jobs
  add column if not exists status text not null default 'new'
    check (status in ('new', 'applied', 'ignored'));

alter table public.jobs
  add column if not exists applied_at timestamptz;

create index if not exists jobs_status_idx on public.jobs (status);
create index if not exists jobs_posted_at_idx on public.jobs (posted_at desc nulls last);

-- Allow authenticated users to read and update jobs (single-user dashboard).
alter table public.jobs enable row level security;

create policy "Authenticated users can read jobs"
  on public.jobs
  for select
  to authenticated
  using (true);

create policy "Authenticated users can update jobs"
  on public.jobs
  for update
  to authenticated
  using (true)
  with check (true);
