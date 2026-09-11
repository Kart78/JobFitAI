# JobFit AI — Zero-Cost React + TypeScript MVP

A responsive resume-driven job matching dashboard built with React, TypeScript and Vite. It includes a deterministic fitment engine, duplicate detection, application tracking, Excel export, Supabase schema, and Cloudflare Worker starter endpoints.

## What works now

- Responsive desktop and mobile UI
- Resume/profile screen with local upload selection
- Search preferences and 8+/10 fitment threshold
- Deterministic, explainable fitment scoring
- Duplicate job fingerprinting
- Ranked job cards and application statuses
- LocalStorage persistence for profile, preferences and statuses
- Excel export using SheetJS
- Cloudflare Worker health/jobs/email starter endpoints
- Daily cron entry in `wrangler.toml`
- Supabase/Postgres schema for profiles, preferences, jobs and matches

The bundled jobs are demo records only. Real employer job discovery and Gmail OAuth are intentionally left as integration points rather than pretending those external services are connected.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build

```bash
npm run build
```

## Worker

```bash
npm run worker:dev
```

The default Vite environment points to `http://localhost:8787` when you copy `.env.example` to `.env`.

## Supabase

1. Create a free Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Create a private Storage bucket for resumes.
4. Copy `.env.example` to `.env` and add your project URL and anon key.
5. Before production, enable Supabase Auth and Row Level Security policies for every user-owned table.

## Gmail

`worker/emailReport.ts` is a secure placeholder. Add Google OAuth credentials as Cloudflare Worker secrets, never in frontend code. Then exchange/refresh tokens server-side and call the Gmail API from the Worker.

## Real job discovery

Implement permitted sources in `worker/jobSearch.ts`. Prefer official employer APIs, ATS feeds, RSS, structured search sources, and company career pages that allow automated access. Store each job with a normalized fingerprint and `last_verified_at` so stale or duplicate jobs are not re-sent.

## Recommended next implementation order

1. Supabase Auth + RLS
2. Resume storage and PDF/DOCX text extraction
3. Official job-source adapters
4. Job upsert + freshness verification
5. Per-user scoring and saved match history
6. Gmail OAuth + daily report delivery
7. Excel attachment generation on the Worker or via a scheduled workflow

## Project structure

The requested `src/pages`, `src/components`, `src/services`, `src/engine`, `src/types`, `worker`, and `supabase` folders are all included. Supporting files such as `styles.css`, `data/demo.ts`, `.env.example`, and TypeScript build configs are also included so the project runs as a real Vite app.
