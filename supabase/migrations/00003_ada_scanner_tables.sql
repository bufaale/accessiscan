-- Sites table
create table public.sites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  domain text not null,
  name text,
  latest_score integer,
  latest_scan_id uuid,
  scan_count integer default 0,
  created_at timestamptz default now()
);

alter table public.sites enable row level security;
create policy "Users can manage own sites" on public.sites for all using (auth.uid() = user_id);
create unique index idx_sites_user_domain on public.sites(user_id, domain);

-- Scans table
create table public.scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  site_id uuid references public.sites(id) on delete set null,
  url text not null,
  domain text not null,
  status text not null default 'pending' check (status in ('pending', 'crawling', 'analyzing', 'completed', 'failed')),
  scan_type text not null default 'quick' check (scan_type in ('quick', 'deep')),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  pages_scanned integer default 0,
  compliance_score integer check (compliance_score >= 0 and compliance_score <= 100),
  level_a_score integer,
  level_aa_score integer,
  level_aaa_score integer,
  total_issues integer default 0,
  critical_count integer default 0,
  serious_count integer default 0,
  moderate_count integer default 0,
  minor_count integer default 0,
  ai_summary text,
  ai_recommendations jsonb,
  raw_data jsonb,
  error_message text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

alter table public.scans enable row level security;
create policy "Users can view own scans" on public.scans for select using (auth.uid() = user_id);
create policy "Users can insert own scans" on public.scans for insert with check (auth.uid() = user_id);

create index idx_scans_user_id on public.scans(user_id);
create index idx_scans_status on public.scans(status);
create index idx_scans_site_id on public.scans(site_id);

alter publication supabase_realtime add table scans;

-- Scan issues table
create table public.scan_issues (
  id uuid default gen_random_uuid() primary key,
  scan_id uuid references public.scans(id) on delete cascade not null,
  wcag_level text check (wcag_level in ('A', 'AA', 'AAA')),
  severity text not null check (severity in ('critical', 'serious', 'moderate', 'minor')),
  impact text,
  rule_id text not null,
  rule_description text not null,
  help_url text,
  html_snippet text,
  selector text,
  page_url text,
  fix_suggestion text,
  position integer default 0,
  created_at timestamptz default now()
);

alter table public.scan_issues enable row level security;
create policy "Users can view own scan issues" on public.scan_issues for select
  using (exists (select 1 from public.scans where scans.id = scan_issues.scan_id and scans.user_id = auth.uid()));

create index idx_scan_issues_scan_id on public.scan_issues(scan_id);

-- Scan pages table (for deep scans)
create table public.scan_pages (
  id uuid default gen_random_uuid() primary key,
  scan_id uuid references public.scans(id) on delete cascade not null,
  url text not null,
  status text default 'pending' check (status in ('pending', 'scanning', 'completed', 'failed')),
  issue_count integer default 0,
  score integer,
  created_at timestamptz default now()
);

alter table public.scan_pages enable row level security;
create policy "Users can view own scan pages" on public.scan_pages for select
  using (exists (select 1 from public.scans where scans.id = scan_pages.scan_id and scans.user_id = auth.uid()));

create index idx_scan_pages_scan_id on public.scan_pages(scan_id);

-- Foreign key for latest_scan_id
alter table public.sites add constraint sites_latest_scan_id_fkey foreign key (latest_scan_id) references public.scans(id) on delete set null;

-- Trigger to update site stats when scan completes
create or replace function public.handle_scan_completed()
returns trigger as $$
begin
  if NEW.status = 'completed' and (OLD.status is null or OLD.status != 'completed') then
    update public.sites
    set latest_score = NEW.compliance_score,
        latest_scan_id = NEW.id,
        scan_count = scan_count + 1
    where id = NEW.site_id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_scan_completed
  after update on public.scans
  for each row execute function public.handle_scan_completed();
