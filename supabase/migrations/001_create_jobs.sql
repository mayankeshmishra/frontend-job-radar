-- Run this in the Supabase SQL Editor to create the jobs table.

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

create index if not exists jobs_discovered_at_idx on public.jobs (discovered_at desc);
create index if not exists jobs_source_external_id_idx on public.jobs (source, external_id);
