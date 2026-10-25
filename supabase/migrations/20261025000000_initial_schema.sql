-- 2BirdsEMR initial schema
-- Multi-agency from day one: every clinical row carries agency_id, and Row Level
-- Security limits each signed-in user to rows from their own agency.
-- FAKE DATA ONLY. Do not load real patient information (PHI) into this project.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.staff_role as enum ('clinician', 'office', 'manager', 'admin');
create type public.discipline as enum ('PT', 'PTA', 'OT', 'COTA', 'SLP', 'RN', 'LPN', 'HHA', 'MSW');
create type public.patient_status as enum ('referral', 'active', 'on_hold', 'discharged');
create type public.visit_status as enum ('scheduled', 'in_progress', 'completed', 'missed', 'cancelled');
create type public.note_status as enum ('not_started', 'draft', 'submitted', 'approved', 'returned');
create type public.order_status as enum ('draft', 'sent', 'signed', 'voided');
create type public.audit_status as enum ('open', 'in_review', 'resolved');
create type public.audit_severity as enum ('low', 'medium', 'high');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- One row per signed-in user. id matches auth.users.id.
create table public.staff_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  agency_id uuid not null references public.agencies (id),
  full_name text not null,
  role public.staff_role not null default 'clinician',
  discipline public.discipline,
  created_at timestamptz not null default now()
);

-- Clinicians that appear on schedules. Kept separate from staff_profiles so
-- fake seed data does not need real auth users.
create table public.clinicians (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id),
  profile_id uuid references public.staff_profiles (id) on delete set null,
  full_name text not null,
  discipline public.discipline not null,
  active boolean not null default true
);

create table public.physicians (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id),
  full_name text not null,
  practice text,
  phone text,
  fax text,
  npi text,
  created_at timestamptz not null default now()
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id),
  mrn text not null,
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  status public.patient_status not null default 'active',
  payer text,
  primary_diagnosis text,
  primary_physician_id uuid references public.physicians (id),
  case_manager_id uuid references public.clinicians (id),
  episode_start date,
  episode_end date,
  city text,
  created_at timestamptz not null default now(),
  unique (agency_id, mrn)
);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id),
  patient_id uuid not null references public.patients (id) on delete cascade,
  clinician_id uuid references public.clinicians (id),
  scheduled_at timestamptz not null,
  discipline public.discipline not null,
  visit_type text not null,
  status public.visit_status not null default 'scheduled',
  note_status public.note_status not null default 'not_started',
  created_at timestamptz not null default now()
);

-- Physician orders (plan of care, verbal orders, recerts...). The "physician
-- hotlist" is simply orders that are sent but not yet signed, grouped by doctor.
create table public.physician_orders (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id),
  patient_id uuid not null references public.patients (id) on delete cascade,
  physician_id uuid not null references public.physicians (id),
  order_type text not null,
  status public.order_status not null default 'sent',
  sent_at timestamptz,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Documentation / form audits (OASIS, evals, recerts...) that need a fix.
create table public.form_audits (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id),
  patient_id uuid not null references public.patients (id) on delete cascade,
  visit_id uuid references public.visits (id) on delete set null,
  form_type text not null,
  issue text not null,
  severity public.audit_severity not null default 'medium',
  status public.audit_status not null default 'open',
  assigned_to uuid references public.clinicians (id),
  due_date date,
  created_at timestamptz not null default now()
);

-- Personalization: pinned pages/reports, dashboard layout, etc.
create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  pinned jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- In-app feedback that drives what we build next.
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  agency_id uuid references public.agencies (id),
  page text,
  message text not null check (char_length(message) between 1 and 4000),
  sentiment smallint check (sentiment between -1 and 1),
  created_at timestamptz not null default now()
);

create index on public.patients (agency_id, last_name);
create index on public.visits (agency_id, scheduled_at);
create index on public.visits (patient_id);
create index on public.physician_orders (agency_id, status);
create index on public.physician_orders (physician_id);
create index on public.form_audits (agency_id, status);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create schema if not exists private;

-- Returns the agency of the signed-in user. SECURITY DEFINER so policies can
-- call it without recursing into staff_profiles' own RLS.
create or replace function private.current_agency_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select agency_id from public.staff_profiles where id = (select auth.uid())
$$;

revoke all on function private.current_agency_id() from public;
grant usage on schema private to authenticated;
grant execute on function private.current_agency_id() to authenticated;

-- POC ONLY: every new sign-up joins the demo agency as a clinician so the app
-- has data to show. Replace with a real invite flow before any real use.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  demo_agency uuid;
begin
  select id into demo_agency from public.agencies order by created_at limit 1;
  if demo_agency is not null then
    insert into public.staff_profiles (id, agency_id, full_name)
    values (
      new.id,
      demo_agency,
      coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
    );
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.agencies enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.clinicians enable row level security;
alter table public.physicians enable row level security;
alter table public.patients enable row level security;
alter table public.visits enable row level security;
alter table public.physician_orders enable row level security;
alter table public.form_audits enable row level security;
alter table public.user_preferences enable row level security;
alter table public.feedback enable row level security;

create policy "Members read their agency" on public.agencies
  for select to authenticated using (id = (select private.current_agency_id()));

create policy "Members read agency staff" on public.staff_profiles
  for select to authenticated using (agency_id = (select private.current_agency_id()));
create policy "Users update own profile" on public.staff_profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and agency_id = (select private.current_agency_id()));

-- Agency-scoped clinical tables: members can read and write rows in their agency.
do $$
declare
  t text;
begin
  foreach t in array array['clinicians', 'physicians', 'patients', 'visits', 'physician_orders', 'form_audits']
  loop
    execute format(
      'create policy "Agency members read" on public.%I for select to authenticated
         using (agency_id = (select private.current_agency_id()))', t);
    execute format(
      'create policy "Agency members insert" on public.%I for insert to authenticated
         with check (agency_id = (select private.current_agency_id()))', t);
    execute format(
      'create policy "Agency members update" on public.%I for update to authenticated
         using (agency_id = (select private.current_agency_id()))
         with check (agency_id = (select private.current_agency_id()))', t);
  end loop;
end
$$;

create policy "Users manage own preferences" on public.user_preferences
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users submit feedback" on public.feedback
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Managers read agency feedback" on public.feedback
  for select to authenticated
  using (
    agency_id = (select private.current_agency_id())
    and exists (
      select 1 from public.staff_profiles sp
      where sp.id = (select auth.uid()) and sp.role in ('manager', 'admin')
    )
  );
