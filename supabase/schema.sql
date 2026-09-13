-- =====================================================================
--  GrowthifyEdge Software Showcase Hub — Supabase schema
--  Run this in the Supabase SQL editor (Dashboard → SQL → New query).
--
--  The app talks to the `software_projects` table below via PostgREST and
--  stores nested data (tech stack, screenshots, impact, etc.) as JSONB so it
--  maps 1:1 to the front-end `Software` model with a single row per project.
--
--  Optional normalized child tables (project_screenshots, project_tech_stack,
--  project_impact_metrics) are included at the bottom for a future, fully
--  relational model — they are NOT required by the current app.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
--  Main table
-- ---------------------------------------------------------------------
create table if not exists public.software_projects (
  id                    text primary key,
  slug                  text not null unique,
  name                  text not null,
  tagline               text default '',
  short_description     text default '',
  full_description      text default '',
  problem               text default '',
  solution              text default '',
  manual_pain_points    jsonb not null default '[]'::jsonb,
  category              text not null,
  demo_category         text not null default 'Operations',
  status                text not null default 'In Development',
  visibility            text not null default 'public',   -- public | private | client-only
  pricing               text not null default 'Custom Quote',
  featured              boolean not null default false,
  published             boolean not null default true,
  is_mini               boolean not null default false,
  cover_image           text default '',                  -- thumbnailUrl
  accent_color          text default '#6d49ff',
  accent_color2         text default '#36e0c8',
  tech_stack            jsonb not null default '[]'::jsonb,
  screenshots           jsonb not null default '[]'::jsonb,
  videos                jsonb not null default '[]'::jsonb,
  impact                jsonb not null default '[]'::jsonb, -- businessImpact[]
  key_features          jsonb not null default '[]'::jsonb,
  headline_metric       jsonb,
  time_saved            text default '',
  io_example            jsonb,
  demo_video_url        text,
  teaser_video_url      text,
  walkthrough_video_url text,
  live_url              text,
  repo_url              text,
  case_study_url        text,
  rating                numeric(2,1) default 0,
  clients               integer default 0,
  impact_score          integer default 0,
  outcome               text,
  metrics               jsonb,
  launched_at           date,
  tags                  jsonb not null default '[]'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists software_projects_category_idx   on public.software_projects (category);
create index if not exists software_projects_status_idx     on public.software_projects (status);
create index if not exists software_projects_featured_idx   on public.software_projects (featured);
create index if not exists software_projects_visibility_idx on public.software_projects (visibility);

-- keep updated_at fresh on every write
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_software_projects_touch on public.software_projects;
create trigger trg_software_projects_touch
  before update on public.software_projects
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
--  Row Level Security
--  Public visitors can read. Only users with app_metadata.role = 'admin'
--  may write; never expose service_role credentials in the browser.
-- ---------------------------------------------------------------------
alter table public.software_projects enable row level security;

drop policy if exists "public read"  on public.software_projects;
drop policy if exists "anon write"   on public.software_projects;
drop policy if exists "auth write"   on public.software_projects;
drop policy if exists "admin write"  on public.software_projects;

create policy "public read"
  on public.software_projects for select
  to anon, authenticated
  using (visibility = 'public' and published = true);

create policy "admin write"
  on public.software_projects for all
  to authenticated
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false))
  with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));

-- ---------------------------------------------------------------------
--  Storage bucket for thumbnail + screenshot uploads (public read)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', true)
on conflict (id) do nothing;

drop policy if exists "media public read"  on storage.objects;
drop policy if exists "media anon upload"  on storage.objects;
drop policy if exists "media admin write"  on storage.objects;

create policy "media public read"
  on storage.objects for select
  using ( bucket_id = 'project-media' );

create policy "media admin write"
  on storage.objects for all to authenticated
  using (bucket_id = 'project-media' and coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false))
  with check (bucket_id = 'project-media' and coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));


-- =====================================================================
--  OPTIONAL: normalized child tables (Phase 5 — not used by the app yet)
-- =====================================================================
-- create table if not exists public.project_screenshots (
--   id           uuid primary key default gen_random_uuid(),
--   project_id   text not null references public.software_projects(id) on delete cascade,
--   url          text not null,
--   thumbnail    text,
--   caption      text,
--   sort_order   integer default 0
-- );
--
-- create table if not exists public.project_tech_stack (
--   id           uuid primary key default gen_random_uuid(),
--   project_id   text not null references public.software_projects(id) on delete cascade,
--   name         text not null,
--   icon         text
-- );
--
-- create table if not exists public.project_impact_metrics (
--   id           uuid primary key default gen_random_uuid(),
--   project_id   text not null references public.software_projects(id) on delete cascade,
--   label        text not null,
--   value        text not null,
--   trend        text,        -- up | down | neutral
--   icon         text
-- );
