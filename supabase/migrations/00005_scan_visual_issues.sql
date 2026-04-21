-- AccessiScan — visual AI analysis issues (Claude Vision)
-- Parallel to scan_issues but produced by visual/screenshot-based AI scan, not
-- axe-core. Was manually created on the original Supabase; now formalised as a
-- migration so the consolidated Pro project has parity.

create table if not exists public.scan_visual_issues (
  id uuid default gen_random_uuid() primary key,
  scan_id uuid references public.scans(id) on delete cascade not null,
  category text not null,
  severity text not null check (severity in ('critical', 'serious', 'moderate', 'minor')),
  title text not null,
  description text not null,
  wcag_criteria text,
  location text,
  recommendation text not null,
  position integer default 0,
  created_at timestamptz default now()
);

alter table public.scan_visual_issues enable row level security;

drop policy if exists "Users can view own scan visual issues" on public.scan_visual_issues;
create policy "Users can view own scan visual issues" on public.scan_visual_issues
  for select using (
    exists (
      select 1 from public.scans
      where scans.id = scan_visual_issues.scan_id
        and scans.user_id = auth.uid()
    )
  );

create index if not exists idx_scan_visual_issues_scan_id on public.scan_visual_issues(scan_id);
