-- free_tool_events — server-side funnel instrumentation for the FREE WCAG scanner.
--
-- WHY: /api/free/wcag-scan wrote only a `public_scan_results` row, which carries
-- no attribution. A paid ad click that RAN a scan was therefore indistinguishable
-- from a bounce, and a click whose scan was BLOCKED by the target's bot
-- protection was indistinguishable from a successful one. Client-side analytics
-- cannot answer either (ad-blockers drop it, custom events aren't queryable), so
-- every free-tool completion is now logged server-side with its attribution.
-- This table is the gate for a paid-ads test: without it there is no way to say
-- what $50 of traffic actually did.
--
-- AGGREGATE-ONLY: event name, scan outcome, counts, UTM attribution, referer.
-- NEVER an email, NEVER the scanned URL or domain, NEVER issue detail. The
-- email stays where it already lives — public_scan_results.email_captured.
--
-- Anti-pattern #4 (portfolio-app-anti-patterns.md): ship RLS ENABLED with no
-- policy. This table is written ONLY by the server via the service-role client
-- (RLS-exempt) and read only by the operator via the Management API / SQL
-- editor. Enabling RLS with no policy closes the public PostgREST hole without
-- breaking the server path.

create table if not exists public.free_tool_events (
  id uuid primary key default gen_random_uuid(),
  -- 'scan_completed' | 'email_captured'
  event text not null,
  -- 'ok' | 'blocked' | 'failed'. Null when not applicable to the event.
  -- 'blocked' means the target host refused our scanner (403/401/429) so
  -- nothing was measured — those clicks must not be counted as successes.
  outcome text,
  -- Denormalised outcome = 'blocked', so "did this click get a real
  -- measurement?" is a single boolean filter on the ads dashboard.
  blocked boolean not null default false,
  -- Attribution, straight from the landing URL's UTM params. Untrusted client
  -- input: validated + length-capped server-side before it ever gets here.
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referer text,
  -- Aggregate measurements only. health_score is null whenever outcome <> 'ok'
  -- (nothing was measured) — never stored as 0, which would read as "this site
  -- is catastrophically inaccessible".
  health_score integer,
  issue_count integer,
  critical_count integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_free_tool_events_created_at
  on public.free_tool_events (created_at desc);

create index if not exists idx_free_tool_events_event_created
  on public.free_tool_events (event, created_at desc);

-- The ads query: group a campaign's scans by outcome over a date range.
create index if not exists idx_free_tool_events_campaign_created
  on public.free_tool_events (utm_campaign, created_at desc);

alter table public.free_tool_events enable row level security;

-- No policies, deliberately: anon + authenticated get zero rows through
-- PostgREST. Only the service-role client (server-side, RLS-exempt) may write
-- or read. Do NOT add a blanket select policy — funnel data is operator-only.
