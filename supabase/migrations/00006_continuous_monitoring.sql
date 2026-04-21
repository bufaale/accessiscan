-- AccessiScan — continuous monitoring (Business tier feature).
--
-- Business-tier customers register URLs they want re-scanned on a cadence.
-- A daily cron iterates enabled rows, fires a fresh scan per the existing
-- scan pipeline, and compares the new compliance_score against the last
-- known baseline. If the score drops by >=5 points OR the critical issue
-- count increases, an email is sent via Resend.
--
-- scan_snapshots gives us a compact trend history without loading the full
-- scan_issues rows — enough to render a sparkline and detect regressions.

create table if not exists public.monitored_sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  label text,
  cadence text not null default 'weekly'
    check (cadence in ('daily', 'weekly', 'monthly')),
  enabled boolean not null default true,

  -- last baseline captured from the most recent scan
  last_scan_id uuid references public.scans(id) on delete set null,
  last_scan_at timestamptz,
  last_score integer,
  last_critical integer not null default 0,
  last_serious integer not null default 0,

  -- regression alerting
  alert_email text,
  regression_threshold integer not null default 5,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_monitored_sites_user on public.monitored_sites(user_id);
create index if not exists idx_monitored_sites_next
  on public.monitored_sites(enabled, last_scan_at) where enabled = true;
create unique index if not exists idx_monitored_sites_user_url
  on public.monitored_sites(user_id, url);

alter table public.monitored_sites enable row level security;

drop policy if exists "monitored_owner_all" on public.monitored_sites;
create policy "monitored_owner_all" on public.monitored_sites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Lightweight trend history. One row per scan cycle so we can plot score
-- deltas without joining scan_issues for thousands of rows.
create table if not exists public.scan_snapshots (
  id uuid primary key default gen_random_uuid(),
  monitored_site_id uuid not null references public.monitored_sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_id uuid references public.scans(id) on delete set null,
  score integer not null,
  critical_count integer not null default 0,
  serious_count integer not null default 0,
  moderate_count integer not null default 0,
  minor_count integer not null default 0,
  regressed boolean not null default false,
  alert_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_scan_snapshots_site
  on public.scan_snapshots(monitored_site_id, created_at desc);
create index if not exists idx_scan_snapshots_user
  on public.scan_snapshots(user_id, created_at desc);
create unique index if not exists idx_scan_snapshots_unique_scan
  on public.scan_snapshots(scan_id) where scan_id is not null;

alter table public.scan_snapshots enable row level security;

drop policy if exists "scan_snapshots_owner_read" on public.scan_snapshots;
create policy "scan_snapshots_owner_read" on public.scan_snapshots
  for select using (auth.uid() = user_id);

-- Writes happen from the cron (service role), never from the client.
-- No owner insert policy is needed; service role bypasses RLS.

-- Link the scans table so the cron can tell which scans come from monitoring
-- and harvest snapshots from them.
alter table public.scans
  add column if not exists monitored_site_id uuid references public.monitored_sites(id) on delete set null;
create index if not exists idx_scans_monitored_site
  on public.scans(monitored_site_id) where monitored_site_id is not null;
