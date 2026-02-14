-- ============================================
-- SaaS AI Boilerplate - Initial Schema
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- Profiles table (extends auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  stripe_customer_id text unique,
  subscription_status text not null default 'free'
    check (subscription_status in ('active', 'trialing', 'past_due', 'canceled', 'free')),
  subscription_plan text,
  api_key text unique default ('sk_' || replace(gen_random_uuid()::text, '-', '')),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_stripe_customer_id on public.profiles (stripe_customer_id);

-- ============================================
-- Subscriptions table
-- ============================================
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_subscription_id text unique not null,
  stripe_price_id text not null,
  status text not null default 'incomplete'
    check (status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subscriptions_user_id on public.subscriptions (user_id);

-- ============================================
-- AI Usage tracking table
-- ============================================
create table public.ai_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  tokens_used integer not null default 0,
  model text not null,
  created_at timestamptz not null default now()
);

create index idx_ai_usage_user_id on public.ai_usage (user_id);
create index idx_ai_usage_created_at on public.ai_usage (created_at);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

alter table public.ai_usage enable row level security;

create policy "Users can view own AI usage"
  on public.ai_usage for select
  using (auth.uid() = user_id);

-- ============================================
-- Auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Auto-update updated_at timestamp
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.update_updated_at();
