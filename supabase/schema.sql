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
