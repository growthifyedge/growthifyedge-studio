-- GrowthifyEdge Phase 2: self-contained inquiries + security migration.
-- Safe for a new or existing project: it does not drop the table or data.
create extension if not exists "pgcrypto";

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null, company text not null default '', email text not null,
  phone text not null default '', type text not null default 'Contact',
  project_id text references public.software_projects(id) on delete set null,
  project_name text not null default '', message text not null,
  status text not null default 'New', created_at timestamptz not null default now()
);

-- Safely complete an older partial table without touching existing rows.
alter table public.inquiries add column if not exists name text;
alter table public.inquiries add column if not exists company text not null default '';
alter table public.inquiries add column if not exists email text;
alter table public.inquiries add column if not exists phone text not null default '';
alter table public.inquiries add column if not exists type text not null default 'Contact';
alter table public.inquiries add column if not exists project_id text;
alter table public.inquiries add column if not exists project_name text not null default '';
alter table public.inquiries add column if not exists message text;
alter table public.inquiries add column if not exists status text not null default 'New';
alter table public.inquiries add column if not exists created_at timestamptz not null default now();

create index if not exists inquiries_status_idx on public.inquiries (status);
create index if not exists inquiries_type_idx on public.inquiries (type);
create index if not exists inquiries_created_idx on public.inquiries (created_at desc);

-- Do not fail on historic rows; the submission RPC validates all new data.
alter table public.inquiries drop constraint if exists inquiries_type_check;
alter table public.inquiries add constraint inquiries_type_check check (type in ('Demo','Quotation','Contact')) not valid;
alter table public.inquiries drop constraint if exists inquiries_status_check;
alter table public.inquiries add constraint inquiries_status_check check (status in ('New','Contacted','Quoted','Closed','Archived')) not valid;

alter table public.inquiries enable row level security;
drop policy if exists "inquiries admin read" on public.inquiries;
drop policy if exists "inquiries admin update" on public.inquiries;
drop policy if exists "inquiries admin delete" on public.inquiries;
drop policy if exists "inquiries anonymous insert" on public.inquiries;

create policy "inquiries admin read" on public.inquiries for select to authenticated
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));
create policy "inquiries admin update" on public.inquiries for update to authenticated
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false))
  with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));
create policy "inquiries admin delete" on public.inquiries for delete to authenticated
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));

-- The only anonymous write path. It fixes status to New and accepts only the
-- exact Angular contract: name/company/email/phone/type/project/message.
create or replace function public.submit_inquiry(
  p_name text, p_company text, p_email text, p_phone text, p_type text,
  p_project_id text, p_project_name text, p_message text
) returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if p_type not in ('Demo','Quotation','Contact') then raise exception 'invalid inquiry type'; end if;
  if coalesce(trim(p_name),'') = '' or length(trim(p_name)) > 160 then raise exception 'invalid name'; end if;
  if coalesce(trim(p_email),'') = '' or length(trim(p_email)) > 320 or position('@' in trim(p_email)) < 2 then raise exception 'invalid email'; end if;
  if coalesce(trim(p_message),'') = '' or length(trim(p_message)) > 10000 then raise exception 'invalid message'; end if;
  if length(coalesce(p_company,'')) > 240 or length(coalesce(p_phone,'')) > 80 or length(coalesce(p_project_name,'')) > 240 then raise exception 'field too long'; end if;
  insert into public.inquiries (name,company,email,phone,type,project_id,project_name,message,status)
  values (trim(p_name),left(coalesce(p_company,''),240),lower(trim(p_email)),left(coalesce(p_phone,''),80),p_type,
    nullif(trim(coalesce(p_project_id,'')),''),left(coalesce(p_project_name,''),240),trim(p_message),'New') returning id into new_id;
  return new_id;
end; $$;

-- Minimum grants: no anonymous table access; only the guarded RPC is callable.
revoke all on table public.inquiries from public;
revoke all on table public.inquiries from anon;
revoke insert on table public.inquiries from authenticated;
grant select, update, delete on table public.inquiries to authenticated;
revoke all on function public.submit_inquiry(text,text,text,text,text,text,text,text) from public;
grant execute on function public.submit_inquiry(text,text,text,text,text,text,text,text) to anon, authenticated;
