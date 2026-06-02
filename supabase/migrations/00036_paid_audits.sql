-- One-time $149 ADA audit purchases (no-account flow).
-- A buyer pays via Stripe Checkout (mode=payment) without signing up; the
-- webhook runs a scan, generates the report + VPAT, and emails it. Keyed by
-- email + stripe session, not by auth user, because this is intentionally a
-- no-login purchase (lowest friction for a demand-letter buyer).

create table if not exists public.paid_audits (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  target_url text not null,
  stripe_session_id text unique not null,
  amount_cents integer not null default 14900,
  status text not null default 'pending'
    check (status in ('pending', 'scanning', 'delivered', 'failed', 'refunded')),
  report_url text,
  scan_score integer,
  scan_issue_count integer,
  resend_message_id text,
  error_detail text,
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

create index if not exists paid_audits_email_idx on public.paid_audits (email);
create index if not exists paid_audits_status_idx on public.paid_audits (status);
create index if not exists paid_audits_created_idx on public.paid_audits (created_at desc);

-- RLS on. No anon/auth policies => only the service-role (webhook + admin)
-- can read/write. Buyers never query this directly; they get the report by
-- email. This keeps purchase records private by default.
alter table public.paid_audits enable row level security;

comment on table public.paid_audits is
  'One-time ADA audit purchases via Stripe Checkout (no-account). Service-role only.';
