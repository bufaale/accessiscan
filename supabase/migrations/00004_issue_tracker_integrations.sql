-- AccessiScan — Issue tracker integrations (Jira, Linear, GitHub Issues).
--
-- Lets a user push a WCAG violation to their own tracker with one click.
-- Per the April 2026 competitive research, Jira/Linear push is the #1
-- friction complaint from agency users of competing tools (Deque shipped
-- this Q1 2026). Build cost 1, impact medium-high.
--
-- Token storage note: tokens are stored as plaintext in a row protected by
-- owner-only RLS. Supabase encrypts at rest and the connection is TLS.
-- For tenants with strict compliance needs, Supabase Vault is the next
-- step — not shipped here to keep the integration toggleable by SMBs.

create table if not exists issue_tracker_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  provider text not null check (provider in ('jira', 'linear', 'github')),
  enabled boolean not null default true,

  -- Provider-specific config
  jira_site text,         -- e.g. acme.atlassian.net
  jira_email text,        -- Atlassian account email (for Basic auth)
  jira_project_key text,  -- e.g. ADA
  jira_api_token text,    -- Atlassian API token

  linear_team_id text,
  linear_api_key text,

  github_owner text,      -- github org/user
  github_repo text,       -- repo name
  github_token text,      -- PAT with repo:issues scope
  github_default_labels text[], -- labels to apply

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists tracker_user_provider_idx
  on issue_tracker_integrations(user_id, provider);

alter table issue_tracker_integrations enable row level security;

create policy "tracker_owner" on issue_tracker_integrations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger set_tracker_updated_at
  before update on issue_tracker_integrations
  for each row execute function update_updated_at();

-- Log every push so users can audit + avoid duplicates
create table if not exists issue_tracker_pushes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  scan_issue_id uuid not null references scan_issues(id) on delete cascade,
  provider text not null,
  external_id text,        -- ticket key / issue id / issue number
  external_url text,
  status text not null default 'pending'
    check (status in ('pending', 'success', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists pushes_issue_idx on issue_tracker_pushes(scan_issue_id);
create index if not exists pushes_user_idx on issue_tracker_pushes(user_id, created_at desc);

alter table issue_tracker_pushes enable row level security;

create policy "pushes_owner" on issue_tracker_pushes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

comment on table issue_tracker_integrations is 'Per-user Jira / Linear / GitHub Issues integration config for one-click WCAG ticket push.';
comment on table issue_tracker_pushes is 'Audit trail of every scan-issue push to an external tracker, with the resulting ticket URL.';
