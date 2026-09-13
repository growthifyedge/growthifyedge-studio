-- GrowthifyEdge Phase 3: prevent anonymous access to drafts and non-public work.
-- Safe to run after Phase 1. It changes RLS policies only; no project rows or
-- media files are deleted or changed.
alter table public.software_projects enable row level security;
drop policy if exists "public read" on public.software_projects;
create policy "public read" on public.software_projects for select to anon, authenticated
  using (visibility = 'public' and published = true);

-- The existing "admin write" FOR ALL policy continues to let users whose JWT
-- app_metadata.role is admin see and manage every project.
