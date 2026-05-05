-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  phone text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Consultants
create table public.consultants (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  specialty text not null,
  bio text not null,
  avatar_url text,
  hourly_rate numeric(10,2) not null,
  rating numeric(3,2) default 0,
  review_count int default 0,
  tags text[] default '{}',
  offers_online boolean default true,
  offers_in_person boolean default false,
  is_active boolean default true,
  created_at timestamptz default now() not null
);

alter table public.consultants enable row level security;

create policy "Anyone can view active consultants"
  on public.consultants for select
  using (is_active = true);

-- Consultant availability (weekly template)
create table public.consultant_availability (
  id uuid default uuid_generate_v4() primary key,
  consultant_id uuid references public.consultants(id) on delete cascade not null,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_duration_minutes int default 60 not null,
  constraint valid_times check (start_time < end_time)
);

alter table public.consultant_availability enable row level security;

create policy "Anyone can view availability"
  on public.consultant_availability for select
  using (true);

-- Blocked slots (individual date overrides)
create table public.blocked_slots (
  id uuid default uuid_generate_v4() primary key,
  consultant_id uuid references public.consultants(id) on delete cascade not null,
  blocked_date date not null,
  time_slot time not null
);

alter table public.blocked_slots enable row level security;

create policy "Anyone can view blocked slots"
  on public.blocked_slots for select
  using (true);

-- Bookings
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  consultant_id uuid references public.consultants(id) on delete restrict not null,
  booking_date date not null,
  time_slot time not null,
  session_type text not null check (session_type in ('online', 'in_person')),
  summary text not null,
  status text not null default 'pending_payment' check (status in ('pending_payment', 'confirmed', 'cancelled')),
  payment_reference text,
  total_amount numeric(10,2) not null,
  created_at timestamptz default now() not null
);

alter table public.bookings enable row level security;

create policy "Users can view own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Users can create bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bookings"
  on public.bookings for update
  using (auth.uid() = user_id);

-- Index for slot availability lookups
create index bookings_consultant_date_idx
  on public.bookings (consultant_id, booking_date)
  where status != 'cancelled';
