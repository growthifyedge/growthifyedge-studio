-- =====================================================================
--  GrowthifyEdge — Phase 6.2 Analytics (PREPARED for future cloud mode)
--
--  NOT yet applied. The app currently records analytics in localStorage.
--  This is a clean, separate migration that does NOT modify any existing
--  table or policy (software_projects / storage stay exactly as they are).
--
--  Key design point: analytics VIEWS/CLICKS are recorded by ANONYMOUS
--  visitors, so writes must be allowed for anon — but reads (the dashboard)
--  stay admin-only. To avoid granting anon direct table writes, writes go
--  through a SECURITY DEFINER function `record_analytics_event(...)` that
--  anon may EXECUTE; reads are gated to `authenticated` via RLS.
-- =====================================================================

-- --- raw event log ----------------------------------------------------
create table if not exists public.project_analytics_events (
  id          uuid primary key default gen_random_uuid(),
  project_id  text not null references public.software_projects(id) on delete cascade,
  type        text not null check (type in ('view','presentation','demo','case_study')),
  created_at  timestamptz not null default now()
);
create index if not exists paev_project_idx on public.project_analytics_events (project_id);
create index if not exists paev_created_idx on public.project_analytics_events (created_at);
create index if not exists paev_type_idx    on public.project_analytics_events (type);

-- --- per-project aggregate --------------------------------------------
create table if not exists public.project_analytics (
  project_id         text primary key references public.software_projects(id) on delete cascade,
  total_views        integer not null default 0,
  presentation_views integer not null default 0,
  demo_clicks        integer not null default 0,
  case_study_clicks  integer not null default 0,
  last_viewed_at     timestamptz,
  updated_at         timestamptz not null default now()
);

-- --- write path: SECURITY DEFINER RPC (anon-callable) -----------------
create or replace function public.record_analytics_event(p_project_id text, p_type text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_type not in ('view','presentation','demo','case_study') then
    raise exception 'invalid analytics type: %', p_type;
  end if;

  insert into public.project_analytics_events (project_id, type)
  values (p_project_id, p_type);

  insert into public.project_analytics as pa (project_id, total_views, presentation_views,
                                              demo_clicks, case_study_clicks, last_viewed_at)
  values (
    p_project_id,
    (p_type = 'view')::int,
    (p_type = 'presentation')::int,
    (p_type = 'demo')::int,
    (p_type = 'case_study')::int,
    case when p_type in ('view','presentation') then now() end
  )
  on conflict (project_id) do update set
    total_views        = pa.total_views        + (p_type = 'view')::int,
    presentation_views = pa.presentation_views + (p_type = 'presentation')::int,
    demo_clicks        = pa.demo_clicks        + (p_type = 'demo')::int,
    case_study_clicks  = pa.case_study_clicks  + (p_type = 'case_study')::int,
    last_viewed_at     = case when p_type in ('view','presentation') then now() else pa.last_viewed_at end,
    updated_at         = now();
end;
$$;

-- --- RLS: reads admin-only; writes only via the RPC above -------------
alter table public.project_analytics_events enable row level security;
alter table public.project_analytics        enable row level security;

drop policy if exists "analytics events admin read" on public.project_analytics_events;
drop policy if exists "analytics admin read"        on public.project_analytics;

create policy "analytics events admin read"
  on public.project_analytics_events for select
  to authenticated using ( true );

create policy "analytics admin read"
  on public.project_analytics for select
  to authenticated using ( true );

-- No INSERT/UPDATE/DELETE policies → direct writes are blocked for everyone;
-- all writes flow through the SECURITY DEFINER RPC below.

grant execute on function public.record_analytics_event(text, text) to anon, authenticated;
