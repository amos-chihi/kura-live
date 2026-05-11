create table if not exists public.stream_sessions (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  station_code text not null,
  platform text not null check (platform in ('tiktok', 'youtube', 'rtmp', 'browser', 'microphone')),
  source_url text not null,
  status text not null check (status in ('idle', 'monitoring', 'reconnecting', 'ended', 'error')) default 'idle',
  viewer_count integer not null default 0,
  bitrate_kbps numeric not null default 0,
  latency_ms numeric not null default 0,
  health text not null check (health in ('healthy', 'degraded', 'offline')) default 'healthy',
  last_error text,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transcript_segments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.stream_sessions(id) on delete cascade,
  station_code text not null,
  agent_id text,
  chunk_index integer not null,
  transcript_text text not null,
  confidence numeric not null default 0.8,
  created_at timestamptz not null default now()
);

create table if not exists public.station_activity (
  id uuid primary key default gen_random_uuid(),
  station_code text not null,
  activity_type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.verification_events (
  id uuid primary key default gen_random_uuid(),
  station_code text not null,
  candidate_name text not null,
  delta integer not null default 0,
  severity text not null check (severity in ('critical', 'warning', 'info')) default 'info',
  created_at timestamptz not null default now()
);

alter table public.stream_sessions enable row level security;
alter table public.transcript_segments enable row level security;
alter table public.station_activity enable row level security;
alter table public.verification_events enable row level security;

drop policy if exists "agents can read own stream sessions" on public.stream_sessions;
create policy "agents can read own stream sessions"
on public.stream_sessions
for select
using (auth.uid()::text = agent_id or auth.role() = 'service_role');

drop policy if exists "agents can insert own stream sessions" on public.stream_sessions;
create policy "agents can insert own stream sessions"
on public.stream_sessions
for insert
with check (auth.uid()::text = agent_id or auth.role() = 'service_role');

drop policy if exists "agents can update own stream sessions" on public.stream_sessions;
create policy "agents can update own stream sessions"
on public.stream_sessions
for update
using (auth.uid()::text = agent_id or auth.role() = 'service_role');

drop policy if exists "agents can read own transcript segments" on public.transcript_segments;
create policy "agents can read own transcript segments"
on public.transcript_segments
for select
using (auth.uid()::text = agent_id or auth.role() = 'service_role');

drop policy if exists "agents can insert own transcript segments" on public.transcript_segments;
create policy "agents can insert own transcript segments"
on public.transcript_segments
for insert
with check (auth.uid()::text = agent_id or auth.role() = 'service_role');

drop policy if exists "admins can read station activity" on public.station_activity;
create policy "admins can read station activity"
on public.station_activity
for select
using (auth.role() = 'service_role' or auth.jwt() ->> 'role' = 'admin');

drop policy if exists "admins can read verification events" on public.verification_events;
create policy "admins can read verification events"
on public.verification_events
for select
using (auth.role() = 'service_role' or auth.jwt() ->> 'role' = 'admin');
