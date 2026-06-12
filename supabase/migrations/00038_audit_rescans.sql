-- Before/after re-scan: documents remediation progress vs the immutable baseline.
-- The strongest legal exhibit — proves the business found the issues AND fixed them,
-- referencing the original dated/hashed baseline. Insert-only (service_role), like
-- baselines: a re-scan record is a dated artifact and must not be mutated.

create table if not exists public.audit_rescans (
  id                  uuid primary key default gen_random_uuid(),
  paid_audit_id       uuid not null references public.paid_audits(id),
  baseline_audit_uuid text not null,            -- the audit_uuid of the baseline compared against
  rescanned_at        timestamptz not null,
  new_score           integer,
  new_hash            text not null,            -- SHA-256 of the re-scan findings
  resolved_count      integer not null default 0,
  still_open_count    integer not null default 0,
  new_issues_count    integer not null default 0,
  diff_json           jsonb not null,           -- { resolved:[], stillOpen:[], newIssues:[] }
  created_at          timestamptz not null default now()
);

create index if not exists audit_rescans_paid_audit_id_idx on public.audit_rescans (paid_audit_id);
create index if not exists audit_rescans_baseline_idx on public.audit_rescans (baseline_audit_uuid);

alter table public.audit_rescans enable row level security;
create policy "audit_rescans_service_insert"
  on public.audit_rescans for insert to service_role with check (true);

comment on table public.audit_rescans is
  'Before/after re-scan vs an audit_baselines record. Insert-only, service-role.';
