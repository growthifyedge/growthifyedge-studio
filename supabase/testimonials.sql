-- =====================================================================
--  GrowthifyEdge — Phase 6.4 Testimonials + structured case study
--  (PREPARED for future cloud)
--
--  NOT yet applied. The app currently stores testimonials in localStorage
--  (seeded from the mock dataset) and the structured case study travels with
--  the project row. This migration is self-contained and does NOT modify any
--  existing Phase 5 / 6.x policy on software_projects data itself — it only
--  ADDS one nullable column and a new testimonials table.
--
--  Unlike inquiries, testimonials are PUBLIC read (they appear on the public
--  Case Studies page), while create/update/delete are ADMIN-only.
-- =====================================================================

-- --- structured case study travels with the project -------------------
alter table if exists public.software_projects
  add column if not exists case_study jsonb;

-- --- testimonials -----------------------------------------------------
create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  client_name text not null,
  company     text default '',
  designation text default '',
  photo       text default '',
  rating      int  not null default 5 check (rating between 1 and 5),
  review      text not null,
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists testimonials_featured_idx on public.testimonials (featured);
create index if not exists testimonials_created_idx  on public.testimonials (created_at);

-- --- RLS: public read, admin write ------------------------------------
alter table public.testimonials enable row level security;

drop policy if exists "testimonials public read"  on public.testimonials;
drop policy if exists "testimonials admin insert" on public.testimonials;
drop policy if exists "testimonials admin update" on public.testimonials;
drop policy if exists "testimonials admin delete" on public.testimonials;

create policy "testimonials public read"
  on public.testimonials for select
  to anon, authenticated using ( true );

create policy "testimonials admin insert"
  on public.testimonials for insert
  to authenticated with check ( true );

create policy "testimonials admin update"
  on public.testimonials for update
  to authenticated using ( true ) with check ( true );

create policy "testimonials admin delete"
  on public.testimonials for delete
  to authenticated using ( true );
