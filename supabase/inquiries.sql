-- =====================================================================
--  GrowthifyEdge — Phase 6.3 Client Inquiries (PREPARED for future cloud)
--
--  NOT yet applied. The app currently stores inquiries in localStorage.
--  This migration is self-contained and does NOT modify any existing table
--  or Phase 5 policy (software_projects / storage / analytics stay as-is).
--
--  Inquiries are submitted by ANONYMOUS visitors, so — like analytics —
--  writes go through a SECURITY DEFINER RPC `submit_inquiry(...)` that anon
--  may EXECUTE (it forces status = 'New' and validates the type). Reading,
--  updating status and archiving are ADMIN-only via RLS (authenticated).
-- =====================================================================

create table if not exists public.inquiries (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  company      text default '',
  email        text not null,
  phone        text default '',
  type         text not null check (type in ('Demo','Quotation','Contact')),
  project_id   text references public.software_projects(id) on delete set null,
  project_name text default '',
  message      text not null,
  status       text not null default 'New'
               check (status in ('New','Contacted','Quoted','Closed','Archived')),
  created_at   timestamptz not null default now()
);
create index if not exists inquiries_status_idx  on public.inquiries (status);
create index if not exists inquiries_type_idx    on public.inquiries (type);
create index if not exists inquiries_created_idx on public.inquiries (created_at);

-- --- anon-safe write path (forces status = 'New') ---------------------
create or replace function public.submit_inquiry(
  p_name text,
  p_company text,
  p_email text,
  p_phone text,
  p_type text,
  p_project_id text,
  p_project_name text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if p_type not in ('Demo','Quotation','Contact') then
    raise exception 'invalid inquiry type: %', p_type;
  end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_email), '') = ''
     or coalesce(trim(p_message), '') = '' then
    raise exception 'name, email and message are required';
  end if;

  insert into public.inquiries (name, company, email, phone, type, project_id, project_name, message, status)
  values (trim(p_name), coalesce(p_company,''), trim(p_email), coalesce(p_phone,''),
          p_type, nullif(p_project_id,''), coalesce(p_project_name,''), trim(p_message), 'New')
  returning id into new_id;

  return new_id;
end;
$$;

-- --- RLS: admin-only reads/updates; writes only via the RPC -----------
alter table public.inquiries enable row level security;

drop policy if exists "inquiries admin read"   on public.inquiries;
drop policy if exists "inquiries admin update" on public.inquiries;
drop policy if exists "inquiries admin delete" on public.inquiries;

create policy "inquiries admin read"
  on public.inquiries for select
  to authenticated using ( true );

-- status updates + archiving (archive = set status to 'Archived')
create policy "inquiries admin update"
  on public.inquiries for update
  to authenticated using ( true ) with check ( true );

create policy "inquiries admin delete"
  on public.inquiries for delete
  to authenticated using ( true );

-- No INSERT policy → direct inserts blocked for everyone; all creates flow
-- through the SECURITY DEFINER RPC below.
grant execute on function public.submit_inquiry(text, text, text, text, text, text, text, text)
  to anon, authenticated;
