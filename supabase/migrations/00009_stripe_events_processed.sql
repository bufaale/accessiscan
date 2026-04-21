-- Stripe webhook idempotency — Stripe retries any 5xx response, so every
-- webhook handler MUST deduplicate by event.id. Without this table, a
-- subscription.created retry would double-apply the plan upgrade.

create table if not exists public.stripe_events_processed (
  event_id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

create index if not exists idx_stripe_events_processed_at
  on public.stripe_events_processed(processed_at desc);

-- No RLS — this table is written only by the webhook route using the
-- service role client; nothing should ever select it from a user context.
