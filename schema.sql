-- REFIND GOLF CHARITY SCHEMA (Scalability & Multi-Country)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Countries Table (Multi-Country Support)
create table public.countries (
    id uuid default uuid_generate_v4() primary key,
    code varchar(2) not null unique, 
    name text not null,
    currency_code varchar(3) default 'USD',
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Charities Table (Regional selection)
create table public.charities (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    image_url text,
    website_url text,
    country_id uuid references public.countries(id),
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles Table (Users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    full_name text,
    avatar_url text,
    role text default 'USER' check (role in ('USER', 'ADMIN')),
    country_id uuid references public.countries(id),
    charity_id uuid references public.charities(id),
    contribution_percentage integer default 10 check (contribution_percentage >= 10), -- Enforce min 10%
    stripe_customer_id text unique,
    is_verified boolean default false,
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriptions Table
create table public.subscriptions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade unique,
    stripe_subscription_id text unique,
    stripe_customer_id text,
    plan text check (plan in ('ethereal', 'apex', 'luminary', 'free')),
    status text,
    currency varchar(3) default 'USD',
    current_period_end timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Scores Table
create table public.scores (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    value integer not null check (value between 1 and 45),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Draws Table
create table public.draws (
    id uuid default uuid_generate_v4() primary key,
    type text not null check (type in ('random', 'algorithmic')),
    numbers integer[] not null check (array_length(numbers, 1) = 5),
    prize_pool_total decimal(12,2) default 0,
    tier_5_pool decimal(12,2) default 0,
    tier_4_pool decimal(12,2) default 0,
    tier_3_pool decimal(12,2) default 0,
    winner_count_tier_5 integer default 0,
    winner_count_tier_4 integer default 0,
    winner_count_tier_3 integer default 0,
    tier_5_rolled_over boolean default false,
    tier_4_rolled_over boolean default false,
    tier_3_rolled_over boolean default false,
    status text default 'simulated' check (status in ('simulated', 'published')),
    country_id uuid references public.countries(id),
    score_cutoff_at timestamp with time zone,
    published_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Winners Table
create table public.winners (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    draw_id uuid references public.draws(id) on delete cascade not null,
    match_count integer not null check (match_count between 3 and 5),
    prize_amount decimal(12,2) not null,
    prize_currency varchar(3) default 'USD',
    proof_url text,
    status text default 'pending' check (status in ('pending', 'rejected', 'paid')),
    verified_by uuid references public.profiles(id),
    verified_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Draw Participants (Historical Snapshot of Nodes)
create table public.draw_participants (
    id uuid default uuid_generate_v4() primary key,
    draw_id uuid references public.draws(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    numbers integer[] not null, -- Snapshot of their nodes at draw time
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1. KYC Table (Member Identity Layer - One-time)
create table public.kyc_records (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    full_name text not null,
    dob date,
    phone text,
    address text,
    id_type text check (id_type in ('passport', 'license', 'national_id')),
    id_number text,
    id_front_url text, -- Secure URL to Storage
    w9_form_url text,  -- Secure URL to Storage
    status text default 'pending' check (status in ('pending', 'verified', 'rejected')),
    rejection_reason text,
    verified_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.kyc_records enable row level security;
create policy "Users can view own KYC" on public.kyc_records for select using (auth.uid() = user_id);
create policy "Users can insert own KYC" on public.kyc_records for insert with check (auth.uid() = user_id);
create policy "Admins can manage KYC" on public.kyc_records for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- 2. Claims Table (Redistribution Nodes - Independent Transactions)
create table public.claims (
    id uuid default uuid_generate_v4() primary key,
    winner_id uuid references public.winners(id) on delete cascade not null unique,
    user_id uuid references public.profiles(id) on delete cascade not null,
    amount numeric(20,2) not null,
    account_details jsonb not null, -- Stores bankName, account#, routing#
    charity_id uuid references public.charities(id),
    contribution_percentage integer default 15,
    status text default 'pending' check (status in ('pending', 'under_review', 'approved', 'rejected', 'paid')),
    admin_notes text,
    processed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.claims enable row level security;
create policy "Users can view own claims" on public.claims for select using (auth.uid() = user_id);
create policy "Users can insert own claims" on public.claims for insert with check (auth.uid() = user_id);
create policy "Admins can manage claims" on public.claims for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- Ensure Storage Buckets exist (Manual creation in dashboard is better, but policies here)
-- Bucket: kyc-documents (public=false)

create policy "Users can upload their own KYC docs"
on storage.objects for insert
with check ( bucket_id = 'kyc-documents' AND auth.uid() = (storage.foldername(name))[1]::uuid );

create policy "Users can view their own KYC docs"
on storage.objects for select
using ( bucket_id = 'kyc-documents' AND auth.uid() = (storage.foldername(name))[1]::uuid );

create policy "Admins can view all KYC docs"
on storage.objects for select
using ( bucket_id = 'kyc-documents' AND (select role from profiles where id = auth.uid()) = 'ADMIN' );

-- Update Profile Schema for persistent state
alter table public.profiles add column if not exists kyc_status text default 'not_started' check (kyc_status in ('not_started', 'pending', 'verified', 'rejected'));
alter table public.profiles add column if not exists balance numeric(20,2) default 0.00;

-- Scalability: Hyper-optimized Counters
create table public.system_stats (
    key text primary key,
    value bigint default 0,
    updated_at timestamp with time zone default now()
);

-- Initialize keys
insert into public.system_stats (key, value) values ('total_users', 0), ('active_subscriptions', 0) on conflict (key) do nothing;

-- High-performance count triggers
create or replace function public.update_system_stats()
returns trigger as $$
begin
    if (tg_op = 'INSERT') then
        update public.system_stats set value = value + 1 where key = tg_argv[0];
    elsif (tg_op = 'DELETE') then
        update public.system_stats set value = value - 1 where key = tg_argv[0];
    end if;
    return null;
end;
$$ language plpgsql;

create trigger trg_count_users after insert or delete on public.profiles for each row execute procedure public.update_system_stats('total_users');
create trigger trg_count_subs after insert or delete on public.subscriptions for each row execute procedure public.update_system_stats('active_subscriptions');

-- Audit Logs
create table public.audit_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id),
    action text not null,
    entity_type text not null,
    entity_id uuid,
    details jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INDEXES
create index idx_scores_user_id on public.scores(user_id);
create index idx_scores_created_at on public.scores(created_at desc);
create index idx_winners_user_id on public.winners(user_id);
create index idx_winners_status on public.winners(status);
create index idx_draws_status on public.draws(status);

-- RLS
alter table public.countries enable row level security;
alter table public.charities enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scores enable row level security;
alter table public.draws enable row level security;
alter table public.winners enable row level security;
alter table public.audit_logs enable row level security;

create policy "Allow public to view countries" on public.countries for select using (is_active = true);
create policy "Allow public to view active charities" on public.charities for select using (is_active = true);
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can view own scores" on public.scores for select using (auth.uid() = user_id);
create policy "Users can insert own scores" on public.scores for insert with check (auth.uid() = user_id);
create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Anyone can view published draws" on public.draws for select using (status = 'published');
create policy "Users can view own records" on public.winners for select using (auth.uid() = user_id);
create policy "Users can update own records" on public.winners for update using (auth.uid() = user_id);

-- Admin policies
create policy "Admins can do everything on charities" on public.charities for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
create policy "Admins can do everything on draws" on public.draws for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
create policy "Admins can manage winners" on public.winners for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
create policy "Users can view all winners for leaderboard" on public.winners for select using (true);
create policy "Users can view other profiles names for leaderboard" on public.profiles for select using (true);

-- FUNCTIONS

-- Score rotation logic
create or replace function public.add_score(score_val int)
returns void as $$
declare
  total_scores int;
begin
  select count(*) into total_scores from public.scores where user_id = auth.uid();
  if total_scores >= 5 then
    delete from public.scores where id in (select id from public.scores where user_id = auth.uid() order by created_at asc limit (total_scores - 4));
  end if;
  insert into public.scores (user_id, value) values (auth.uid(), score_val);
end;
$$ language plpgsql security definer;

-- Atomic Draw Publication (Hardened with Race Lock & Snapshotting)
create or replace function public.publish_draw(p_draw_id uuid)
returns void as $$
declare
  d_status text;
  d_numbers int[];
  d_tier_5_pool decimal;
  d_tier_4_pool decimal;
  d_tier_3_pool decimal;
  d_cutoff timestamp with time zone;
begin
  -- Lock the row and check status
  select status, numbers, tier_5_pool, tier_4_pool, tier_3_pool, score_cutoff_at
  into d_status, d_numbers, d_tier_5_pool, d_tier_4_pool, d_tier_3_pool, d_cutoff
  from public.draws where id = p_draw_id for update;

  if d_status != 'simulated' then
    raise exception 'Draw is already published or in an invalid state.';
  end if;

  -- 1. SNAPSHOT participation for records
  insert into public.draw_participants (draw_id, user_id, numbers)
  select p_draw_id, s.user_id, array_agg(s.value order by s.created_at asc)
  from public.scores s
  where s.created_at <= d_cutoff
  group by s.user_id;

  -- 2. VERIFY Winners
  create temp table tmp_winners as
  select p.id as user_id, count(distinct s.value) as match_count
  from public.profiles p
  join public.scores s on s.user_id = p.id
  where s.value = any(d_numbers)
    and s.created_at <= d_cutoff
  group by p.id
  having count(distinct s.value) >= 3;

  insert into public.winners (user_id, draw_id, match_count, prize_amount)
  select user_id, p_draw_id, match_count, d_tier_5_pool / nullif((select count(*) from tmp_winners where match_count = 5), 0)
  from tmp_winners where match_count = 5;

  insert into public.winners (user_id, draw_id, match_count, prize_amount)
  select user_id, p_draw_id, match_count, d_tier_4_pool / nullif((select count(*) from tmp_winners where match_count = 4), 0)
  from tmp_winners where match_count = 4;

  insert into public.winners (user_id, draw_id, match_count, prize_amount)
  select user_id, p_draw_id, match_count, d_tier_3_pool / nullif((select count(*) from tmp_winners where match_count = 3), 0)
  from tmp_winners where match_count = 3;

  -- 3. BROADCAST: Update draw metadata
  update public.draws set 
    status = 'published', 
    published_at = now(),
    winner_count_tier_5 = (select count(*) from tmp_winners where match_count = 5),
    winner_count_tier_4 = (select count(*) from tmp_winners where match_count = 4),
    winner_count_tier_3 = (select count(*) from tmp_winners where match_count = 3)
  where id = p_draw_id;
  
  -- 4. RESET: Global Participation Reset
  delete from public.scores;

  drop table tmp_winners;
end;
$$ language plpgsql security definer;

-- Auto-profile trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url, country_id, charity_id)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url', (new.raw_user_meta_data->>'country_id')::uuid, (new.raw_user_meta_data->>'charity_id')::uuid);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
