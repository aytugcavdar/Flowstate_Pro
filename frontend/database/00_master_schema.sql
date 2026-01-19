-- ================================================
-- FLOWSTATE - MASTER DATABASE SCHEMA
-- Version: 2.0 (Production Ready)
-- Last Updated: 2026-01-19
-- ================================================
-- Bu dosya Supabase SQL Editor'da tek seferde çalıştırılmalıdır.
-- Modüler dosyalar (01_analytics.sql vb.) sonra çalıştırılabilir.
-- ================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ================================================
-- UTILITY FUNCTIONS
-- ================================================

-- Auto-update timestamp trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ================================================
-- 1. PROFILES TABLE (User Identity)
-- ================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  display_name text,
  avatar_url text,
  is_banned boolean default false not null,
  ban_reason text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auto profile creation (run only once)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create trigger update_profiles_timestamp
  before update on public.profiles
  for each row execute function update_updated_at();

-- ================================================
-- 2. USER PROGRESS TABLE (XP, Level, Badges)
-- ================================================
create table if not exists public.user_progress (
  id uuid references auth.users on delete cascade not null primary key,
  xp integer default 0 not null,
  level integer default 1 not null,
  total_wins integer default 0 not null,
  total_games integer default 0 not null,
  fastest_win_ms integer,
  consecutive_no_hint_wins integer default 0 not null,
  current_streak integer default 0 not null,
  max_streak integer default 0 not null,
  badges text[] default '{}' not null,
  last_played_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.user_progress enable row level security;

create policy "Users can view own progress"
  on public.user_progress for select using (auth.uid() = id);

create policy "Users can insert own progress"
  on public.user_progress for insert with check (auth.uid() = id);

create policy "Users can update own progress"
  on public.user_progress for update using (auth.uid() = id);

create trigger update_user_progress_timestamp
  before update on public.user_progress
  for each row execute function update_updated_at();

-- ================================================
-- 3. USER ECONOMY TABLE (Coins, Purchases)
-- ================================================
create table if not exists public.user_economy (
  id uuid references auth.users on delete cascade not null primary key,
  coins integer default 0 not null check (coins >= 0),
  gems integer default 0 not null check (gems >= 0), -- Premium currency
  total_earned integer default 0 not null,
  total_spent integer default 0 not null,
  unlocked_items text[] default '{}' not null,
  unlocked_themes text[] default '{"default"}' not null,
  active_theme text default 'default' not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.user_economy enable row level security;

create policy "Users can view own economy"
  on public.user_economy for select using (auth.uid() = id);

create policy "Users can insert own economy"
  on public.user_economy for insert with check (auth.uid() = id);

create policy "Users can update own economy"
  on public.user_economy for update using (auth.uid() = id);

create trigger update_user_economy_timestamp
  before update on public.user_economy
  for each row execute function update_updated_at();

-- ================================================
-- 4. USER INVENTORY TABLE (Power-ups)
-- ================================================
create table if not exists public.user_inventory (
  id uuid references auth.users on delete cascade not null primary key,
  hints integer default 3 not null check (hints >= 0),
  undos integer default 3 not null check (undos >= 0),
  freezes integer default 3 not null check (freezes >= 0),
  time_extensions integer default 0 not null check (time_extensions >= 0),
  coin_boosts integer default 0 not null check (coin_boosts >= 0),
  multipliers integer default 0 not null check (multipliers >= 0),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.user_inventory enable row level security;

create policy "Users can view own inventory"
  on public.user_inventory for select using (auth.uid() = id);

create policy "Users can insert own inventory"
  on public.user_inventory for insert with check (auth.uid() = id);

create policy "Users can update own inventory"
  on public.user_inventory for update using (auth.uid() = id);

create trigger update_user_inventory_timestamp
  before update on public.user_inventory
  for each row execute function update_updated_at();

-- ================================================
-- 5. SCORES TABLE (Leaderboard)
-- ================================================
create table if not exists public.scores (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  username text not null, -- Denormalized for performance
  date_key text not null, -- Format: YYYY-MM-DD
  mode text default 'daily' not null,
  moves integer not null check (moves > 0),
  time_ms integer not null check (time_ms > 0),
  used_hint boolean default false not null,
  powerups_used jsonb default '{}' not null,
  created_at timestamp with time zone default now() not null
);

alter table public.scores enable row level security;

create policy "Scores are viewable by everyone"
  on public.scores for select using (true);

create policy "Users can insert their own scores"
  on public.scores for insert with check (auth.uid() = user_id);

-- Performance indexes for leaderboard queries
create index if not exists scores_date_idx on public.scores (date_key);
create index if not exists scores_mode_idx on public.scores (mode);
create index if not exists scores_user_idx on public.scores (user_id);
create index if not exists scores_ranking_idx on public.scores (date_key, mode, moves asc, time_ms asc);

-- ================================================
-- 6. CAMPAIGN PROGRESS TABLE
-- ================================================
create table if not exists public.campaign_progress (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  level_id text not null,
  stars integer default 0 not null check (stars >= 0 and stars <= 3),
  moves integer,
  time_ms integer,
  completed_at timestamp with time zone default now() not null,
  unique(user_id, level_id)
);

alter table public.campaign_progress enable row level security;

create policy "Users can view own campaign progress"
  on public.campaign_progress for select using (auth.uid() = user_id);

create policy "Users can insert own campaign progress"
  on public.campaign_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own campaign progress"
  on public.campaign_progress for update using (auth.uid() = user_id);

create index if not exists campaign_user_idx on public.campaign_progress (user_id);
create index if not exists campaign_level_idx on public.campaign_progress (level_id);

-- ================================================
-- 7. GAME SESSIONS TABLE (Analytics)
-- ================================================
create table if not exists public.game_sessions (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  mode text not null, -- daily, campaign, endless, speedrun, weekly
  date_key text, -- YYYY-MM-DD format for daily modes
  level_id text, -- For campaign mode
  moves integer not null,
  time_ms integer not null,
  won boolean default false not null,
  used_hint boolean default false not null,
  powerups_used jsonb default '{}' not null,
  score integer default 0 not null,
  difficulty text default 'normal',
  created_at timestamp with time zone default now() not null
);

alter table public.game_sessions enable row level security;

create policy "Users can view own sessions"
  on public.game_sessions for select using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.game_sessions for insert with check (auth.uid() = user_id);

-- Performance indexes for analytics
create index if not exists sessions_user_idx on public.game_sessions (user_id);
create index if not exists sessions_mode_idx on public.game_sessions (mode);
create index if not exists sessions_date_idx on public.game_sessions (date_key);
create index if not exists sessions_won_idx on public.game_sessions (won);
create index if not exists sessions_created_idx on public.game_sessions (created_at);

-- ================================================
-- 8. DAILY CHALLENGES TABLE
-- ================================================
create table if not exists public.daily_challenges (
  id bigint generated by default as identity primary key,
  date_key text unique not null, -- YYYY-MM-DD
  seed text not null, -- For reproducible puzzle generation
  difficulty text default 'normal' not null,
  par_moves integer, -- Target moves for 3 stars
  par_time_ms integer, -- Target time for 3 stars
  created_at timestamp with time zone default now() not null
);

alter table public.daily_challenges enable row level security;

create policy "Daily challenges are viewable by everyone"
  on public.daily_challenges for select using (true);

create index if not exists daily_date_idx on public.daily_challenges (date_key);

-- ================================================
-- 9. ACHIEVEMENTS TABLE
-- ================================================
create table if not exists public.user_achievements (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  achievement_id text not null,
  progress integer default 0 not null,
  completed boolean default false not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  unique(user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "Users can view own achievements"
  on public.user_achievements for select using (auth.uid() = user_id);

create policy "Users can insert own achievements"
  on public.user_achievements for insert with check (auth.uid() = user_id);

create policy "Users can update own achievements"
  on public.user_achievements for update using (auth.uid() = user_id);

create index if not exists achievements_user_idx on public.user_achievements (user_id);

-- ================================================
-- 10. PURCHASE HISTORY TABLE (For IAP/Shop)
-- ================================================
create table if not exists public.purchase_history (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  item_id text not null,
  item_type text not null, -- powerup, theme, coin_pack, etc.
  quantity integer default 1 not null,
  price_coins integer default 0 not null,
  price_gems integer default 0 not null,
  price_real money, -- For real money purchases
  transaction_id text, -- External payment ID
  created_at timestamp with time zone default now() not null
);

alter table public.purchase_history enable row level security;

create policy "Users can view own purchases"
  on public.purchase_history for select using (auth.uid() = user_id);

create policy "Users can insert own purchases"
  on public.purchase_history for insert with check (auth.uid() = user_id);

create index if not exists purchases_user_idx on public.purchase_history (user_id);
create index if not exists purchases_created_idx on public.purchase_history (created_at);

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- Initialize all user data on first login
create or replace function initialize_user_data(p_user_id uuid)
returns void as $$
begin
  -- Create progress if not exists
  insert into public.user_progress (id)
  values (p_user_id)
  on conflict (id) do nothing;
  
  -- Create economy if not exists
  insert into public.user_economy (id)
  values (p_user_id)
  on conflict (id) do nothing;
  
  -- Create inventory if not exists
  insert into public.user_inventory (id)
  values (p_user_id)
  on conflict (id) do nothing;
end;
$$ language plpgsql security definer;

-- Get user rank for a specific date/mode
create or replace function get_user_rank(
  p_user_id uuid,
  p_date_key text,
  p_mode text default 'daily'
)
returns integer as $$
declare
  user_rank integer;
begin
  select rank into user_rank
  from (
    select user_id, rank() over (order by moves asc, time_ms asc) as rank
    from public.scores
    where date_key = p_date_key and mode = p_mode
  ) ranked
  where user_id = p_user_id;
  
  return coalesce(user_rank, 0);
end;
$$ language plpgsql security definer;

-- ================================================
-- ADMIN POLICIES (for service role access)
-- ================================================
-- These policies allow service role to manage all data
-- In production, use service role key only on server-side

create policy "Service role can manage all profiles"
  on public.profiles for all
  using (auth.role() = 'service_role');

create policy "Service role can manage all progress"
  on public.user_progress for all
  using (auth.role() = 'service_role');

create policy "Service role can manage all economy"
  on public.user_economy for all
  using (auth.role() = 'service_role');

create policy "Service role can manage all inventory"
  on public.user_inventory for all
  using (auth.role() = 'service_role');

create policy "Service role can manage all scores"
  on public.scores for all
  using (auth.role() = 'service_role');

create policy "Service role can manage all sessions"
  on public.game_sessions for all
  using (auth.role() = 'service_role');

-- ================================================
-- END OF MASTER SCHEMA
-- ================================================
-- Next steps:
-- 1. Run 01_analytics.sql for analytics tables
-- 2. Run 02_ab_testing.sql for A/B testing
-- 3. Run 03_admin.sql for admin functions
-- 4. Run 04_referral.sql for referral system
-- 5. Run 05_error_tracking.sql for error logging
-- ================================================
