-- SECURITY DEFINER function to check admin role without triggering RLS recursion
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Allow admins to view all profiles (uses is_admin() to avoid infinite recursion)
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Allow admins to view all subscriptions
create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  using (public.is_admin());

-- Allow admins to view all AI usage
create policy "Admins can view all ai_usage"
  on public.ai_usage for select
  using (public.is_admin());
