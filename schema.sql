create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  has_access boolean not null default false,
  name text,
  age integer,
  gender text,
  monthly_income numeric(12, 2),
  financial_goal text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists name text,
  add column if not exists age integer,
  add column if not exists gender text,
  add column if not exists monthly_income numeric(12, 2),
  add column if not exists financial_goal text,
  add column if not exists onboarding_completed boolean not null default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null,
  amount numeric(12, 2) not null,
  type text not null check (type in ('income', 'expense')),
  category text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_date_idx on public.transactions (date desc);

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;

revoke update (has_access) on public.profiles from anon, authenticated;

create policy "users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users can view own transactions"
  on public.transactions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can insert own transactions"
  on public.transactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can update own transactions"
  on public.transactions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own transactions"
  on public.transactions for delete
  to authenticated
  using (auth.uid() = user_id);