create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  full_name text not null,
  headline text,
  total_years_experience numeric default 0,
  location text,
  skills jsonb not null default '[]'::jsonb,
  industries jsonb not null default '[]'::jsonb,
  certifications jsonb not null default '[]'::jsonb,
  target_roles jsonb not null default '[]'::jsonb,
  achievements jsonb not null default '[]'::jsonb,
  resume_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  target_roles jsonb not null default '[]'::jsonb,
  locations jsonb not null default '[]'::jsonb,
  radius_miles int default 40,
  employment_types jsonb not null default '["Full Time"]'::jsonb,
  include_remote_strong_matches boolean default true,
  minimum_fitment numeric default 8.0,
  email_reports boolean default true,
  email_address text,
  report_time time default '07:00',
  include_excel boolean default true,
  updated_at timestamptz default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  fingerprint text unique not null,
  title text not null,
  company text not null,
  location text,
  work_arrangement text,
  employment_type text,
  salary text,
  posted_date date,
  apply_url text not null,
  source text not null,
  description text,
  required_skills jsonb not null default '[]'::jsonb,
  preferred_skills jsonb not null default '[]'::jsonb,
  industry text,
  min_years_experience numeric,
  first_seen_at timestamptz default now(),
  last_verified_at timestamptz default now(),
  is_open boolean default true
);

create table if not exists job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  job_id uuid not null references jobs(id) on delete cascade,
  fitment numeric not null,
  match_reasons jsonb not null default '[]'::jsonb,
  gaps jsonb not null default '[]'::jsonb,
  status text not null default 'New',
  is_priority boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, job_id)
);

create index if not exists idx_jobs_open on jobs(is_open);
create index if not exists idx_job_matches_user_fitment on job_matches(user_id, fitment desc);

-- Personal records must always belong to an authenticated Supabase user.
alter table profiles alter column user_id set not null;
alter table preferences alter column user_id set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_user_id_fkey') then
    alter table profiles add constraint profiles_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'preferences_user_id_fkey') then
    alter table preferences add constraint preferences_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'job_matches_user_id_fkey') then
    alter table job_matches add constraint job_matches_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

alter table profiles enable row level security;
alter table preferences enable row level security;
alter table jobs enable row level security;
alter table job_matches enable row level security;

revoke all on table profiles, preferences, jobs, job_matches from anon;
grant select, insert, update, delete on table profiles, preferences, job_matches to authenticated;
grant select on table jobs to authenticated;

drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_insert_own" on profiles;
drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "profiles_delete_own" on profiles;
create policy "profiles_select_own" on profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles_insert_own" on profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profiles_update_own" on profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "profiles_delete_own" on profiles for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "preferences_select_own" on preferences;
drop policy if exists "preferences_insert_own" on preferences;
drop policy if exists "preferences_update_own" on preferences;
drop policy if exists "preferences_delete_own" on preferences;
create policy "preferences_select_own" on preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy "preferences_insert_own" on preferences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "preferences_update_own" on preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "preferences_delete_own" on preferences for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "job_matches_select_own" on job_matches;
drop policy if exists "job_matches_insert_own" on job_matches;
drop policy if exists "job_matches_update_own" on job_matches;
drop policy if exists "job_matches_delete_own" on job_matches;
create policy "job_matches_select_own" on job_matches for select to authenticated using ((select auth.uid()) = user_id);
create policy "job_matches_insert_own" on job_matches for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "job_matches_update_own" on job_matches for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "job_matches_delete_own" on job_matches for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "jobs_select_authenticated" on jobs;
create policy "jobs_select_authenticated" on jobs for select to authenticated using (true);
