-- Push subscription storage for web (VAPID) and native (FCM/APNs) delivery.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

create policy "Users manage own push subscriptions"
  on public.push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Service role reads all push subscriptions"
  on public.push_subscriptions
  for select
  using (auth.role() = 'service_role');

comment on table public.push_subscriptions is
  'Web Push subscriptions and native device tokens for push delivery.';
