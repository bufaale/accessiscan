-- Legal Evidence Pack: an immutable, timestamped, hash-signed baseline of a paid
-- WCAG audit. The un-promptable differentiator — proves WHEN the violations were
-- documented, verifiable by a third party (lawyer/procurement) at /verify/[id].
--
-- INSERT-ONLY by design: there is intentionally NO update or delete policy, so a
-- baseline can never be altered after creation. That immutability IS the legal
-- value. Do NOT add an UPDATE/DELETE policy.

create table if not exists public.audit_baselines (
  id               uuid primary key default gen_random_uuid(),
  paid_audit_id    uuid not null references public.paid_audits(id),
  audit_uuid       text not null unique,   -- equals paid_audits.id (the URL slug for /verify)
  target_url       text not null,
  scanned_at       timestamptz not null,   -- server-stamped scan moment (UTC), the legal date
  engine_version   text not null,
  violations_json  jsonb not null,         -- canonicalized WcagFreeIssue[] (sorted keys)
  violations_hash  text not null,          -- SHA-256 hex of canonicalize(violations_json)
  created_at       timestamptz not null default now()
);

create index if not exists audit_baselines_audit_uuid_idx on public.audit_baselines (audit_uuid);
create index if not exists audit_baselines_paid_audit_id_idx on public.audit_baselines (paid_audit_id);

alter table public.audit_baselines enable row level security;

-- service_role inserts exactly once (webhook fulfilment). No update/delete policy
-- exists anywhere => the row is immutable for the life of the record.
create policy "audit_baselines_service_insert"
  on public.audit_baselines for insert to service_role with check (true);

-- Public verification surface: only non-sensitive columns, never the violation
-- detail. The /verify page reads this view; violation detail stays private.
create or replace view public.audit_baselines_public
  with (security_invoker = true) as
  select audit_uuid, target_url, scanned_at, engine_version, violations_hash
  from public.audit_baselines;

grant select on public.audit_baselines_public to anon, authenticated;

comment on table public.audit_baselines is
  'Immutable WCAG audit baseline for legal evidence. Insert-only — no UPDATE/DELETE policy by design.';

-- Random access token (sent in the delivery email) gates the buyer-only surfaces
-- (evidence-pack PDF, re-scan). baseline_id links the audit to its evidence record.
alter table public.paid_audits
  add column if not exists evidence_token text,
  add column if not exists baseline_id uuid references public.audit_baselines(id);
