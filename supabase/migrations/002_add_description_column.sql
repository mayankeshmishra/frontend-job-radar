-- Run if your jobs table was created without the description column.

alter table public.jobs add column if not exists description text;
