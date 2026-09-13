-- GrowthifyEdge Phase 1: safe RLS hardening for existing Supabase projects.
-- Run once in the Supabase SQL editor. It changes policies only; existing rows
-- and files are preserved. Admin accounts must have app_metadata.role = 'admin'.

alter table public.software_projects enable row level security;
alter table public.software_projects add column if not exists published boolean not null default true;
alter table public.software_projects add column if not exists outcome text;
alter table public.software_projects add column if not exists metrics jsonb;
drop policy if exists "public read" on public.software_projects;
create policy "public read" on public.software_projects for select to anon, authenticated
  using (visibility = 'public' and published = true);
drop policy if exists "anon write" on public.software_projects;
drop policy if exists "auth write" on public.software_projects;
drop policy if exists "admin write" on public.software_projects;
create policy "admin write" on public.software_projects for all to authenticated
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false))
  with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));

drop policy if exists "media anon upload" on storage.objects;
drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects for all to authenticated
  using (bucket_id = 'project-media' and coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false))
  with check (bucket_id = 'project-media' and coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));
