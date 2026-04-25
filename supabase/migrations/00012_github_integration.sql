-- AccessiScan — GitHub App integration for Auto-Fix PRs (Business tier).
-- Customer installs the AccessiScan GitHub App on their repo, we store the
-- installation_id and use it to open PRs that fix WCAG violations the scan
-- found. See .shared/launch/auto-fix-prs-design-2026-04-25.md.

create table if not exists public.github_installations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  github_installation_id bigint not null unique,
  github_account_login text not null,
  github_account_type text check (github_account_type in ('Organization', 'User')),
  repository_selection text check (repository_selection in ('all', 'selected')),
  installed_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_github_installations_user_id
  on public.github_installations (user_id)
  where revoked_at is null;

alter table public.github_installations enable row level security;

create policy "users see their own github installations"
  on public.github_installations for select
  using (auth.uid() = user_id);

create policy "users delete their own github installations"
  on public.github_installations for delete
  using (auth.uid() = user_id);

-- Track every Auto-Fix PR we open so the UI can show status (open/merged/closed)
-- and we can attribute Business-tier usage limits (10 PRs/mo cap).
create table if not exists public.auto_fix_prs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  scan_id uuid references public.scans(id) on delete cascade,
  installation_id uuid references public.github_installations(id) on delete set null,
  repo_full_name text not null,
  pr_number int not null,
  pr_url text not null,
  state text not null default 'open' check (state in ('open', 'merged', 'closed')),
  fixes_count int not null default 0,
  fixes_applied jsonb,
  warnings jsonb,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create unique index if not exists idx_auto_fix_prs_repo_pr
  on public.auto_fix_prs (repo_full_name, pr_number);

create index if not exists idx_auto_fix_prs_user_created
  on public.auto_fix_prs (user_id, created_at desc);

alter table public.auto_fix_prs enable row level security;

create policy "users see their own auto-fix PRs"
  on public.auto_fix_prs for select
  using (auth.uid() = user_id);
