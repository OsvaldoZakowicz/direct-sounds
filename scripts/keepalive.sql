-- Minimal table to register keep-alive activity.
-- Supabase pauses Free Plan projects after ~7 days of low database activity,
-- so api/keepalive.js upserts this single row once a day.

create table public.keepalive (
  id int primary key,
  pinged_at timestamptz not null default now()
);

-- RLS on with no policies: only the service role can touch this table.
alter table public.keepalive enable row level security;

insert into public.keepalive (id) values (1);
