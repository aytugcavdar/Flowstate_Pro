-- ================================================
-- ADVANCED ADMIN ANALYTICS SCHEMA
-- Run this in Supabase SQL Editor
-- ================================================

-- ================================================
-- RETENTION RATE FUNCTION
-- Calculates Day 1, 7, 30 retention
-- ================================================
create or replace function get_retention_stats()
returns json
language plpgsql
security definer
as $$
declare
  total_users integer;
  day1_retained integer;
  day7_retained integer;
  day30_retained integer;
begin
  -- Total users with at least one visit
  select count(distinct user_id) into total_users
  from public.user_visits
  where created_at < now() - interval '1 day';
  
  -- Day 1 retention: users who came back within 24-48 hours
  select count(distinct v1.user_id) into day1_retained
  from public.user_visits v1
  where exists (
    select 1 from public.user_visits v2
    where v2.user_id = v1.user_id
    and v2.created_at > v1.created_at + interval '1 day'
    and v2.created_at < v1.created_at + interval '2 days'
  );
  
  -- Day 7 retention
  select count(distinct v1.user_id) into day7_retained
  from public.user_visits v1
  where exists (
    select 1 from public.user_visits v2
    where v2.user_id = v1.user_id
    and v2.created_at > v1.created_at + interval '7 days'
    and v2.created_at < v1.created_at + interval '8 days'
  );
  
  -- Day 30 retention
  select count(distinct v1.user_id) into day30_retained
  from public.user_visits v1
  where exists (
    select 1 from public.user_visits v2
    where v2.user_id = v1.user_id
    and v2.created_at > v1.created_at + interval '30 days'
    and v2.created_at < v1.created_at + interval '31 days'
  );
  
  return json_build_object(
    'totalUsers', total_users,
    'day1Retention', case when total_users > 0 then round((day1_retained::numeric / total_users) * 100, 1) else 0 end,
    'day7Retention', case when total_users > 0 then round((day7_retained::numeric / total_users) * 100, 1) else 0 end,
    'day30Retention', case when total_users > 0 then round((day30_retained::numeric / total_users) * 100, 1) else 0 end,
    'day1Count', day1_retained,
    'day7Count', day7_retained,
    'day30Count', day30_retained
  );
end;
$$;

-- ================================================
-- SESSION DURATION FUNCTION
-- Calculates average session time (using time_ms column)
-- ================================================
create or replace function get_session_stats()
returns json
language sql
security definer
as $$
  select json_build_object(
    'totalSessions', count(*),
    'avgDurationSeconds', coalesce(round(avg(time_ms) / 1000), 0),
    'avgDurationMinutes', coalesce(round(avg(time_ms) / 60000, 1), 0),
    'maxDurationMinutes', coalesce(round(max(time_ms) / 60000, 1), 0),
    'avgMovesPerGame', coalesce(round(avg(moves)), 0),
    'winRate', coalesce(round((sum(case when won then 1 else 0 end)::numeric / nullif(count(*), 0)) * 100, 1), 0)
  )
  from public.game_sessions
  where created_at > now() - interval '7 days';
$$;

-- ================================================
-- FUNNEL ANALYSIS FUNCTION
-- Tracks conversion through stages
-- ================================================
create or replace function get_funnel_stats(days_back integer default 7)
returns json
language plpgsql
security definer
as $$
declare
  total_visits integer;
  users_with_game integer;
  users_with_win integer;
  users_with_purchase integer;
begin
  -- Stage 1: Total unique visitors
  select count(distinct user_id) into total_visits
  from public.user_visits
  where created_at > now() - (days_back || ' days')::interval;
  
  -- Stage 2: Users who played at least one game
  select count(distinct user_id) into users_with_game
  from public.game_sessions
  where created_at > now() - (days_back || ' days')::interval;
  
  -- Stage 3: Users who won at least once
  select count(distinct user_id) into users_with_win
  from public.game_sessions
  where won = true
  and created_at > now() - (days_back || ' days')::interval;
  
  -- Stage 4: Users who made a purchase (from shop)
  select count(distinct user_id) into users_with_purchase
  from public.analytics_events
  where event_type = 'shop_purchase'
  and created_at > now() - (days_back || ' days')::interval;
  
  return json_build_object(
    'stages', json_build_array(
      json_build_object('name', 'Ziyaret', 'count', total_visits, 'rate', 100),
      json_build_object('name', 'Oyun', 'count', users_with_game, 
        'rate', case when total_visits > 0 then round((users_with_game::numeric / total_visits) * 100, 1) else 0 end),
      json_build_object('name', 'Kazanma', 'count', users_with_win,
        'rate', case when total_visits > 0 then round((users_with_win::numeric / total_visits) * 100, 1) else 0 end),
      json_build_object('name', 'Satın Alma', 'count', users_with_purchase,
        'rate', case when total_visits > 0 then round((users_with_purchase::numeric / total_visits) * 100, 1) else 0 end)
    )
  );
end;
$$;

-- ================================================
-- A/B TEST RESULTS FUNCTION
-- Get performance for each experiment
-- ================================================
create or replace function get_ab_test_results()
returns json
language sql
security definer
as $$
  select coalesce(json_agg(row_to_json(t)), '[]'::json)
  from (
    select 
      ea.experiment_id,
      ea.variant,
      count(distinct ea.user_id) as user_count,
      count(distinct ee.id) as event_count,
      round(count(distinct ee.id)::numeric / nullif(count(distinct ea.user_id), 0), 2) as events_per_user
    from public.experiment_assignments ea
    left join public.experiment_events ee 
      on ea.user_id = ee.user_id 
      and ea.experiment_id = ee.experiment_id
    group by ea.experiment_id, ea.variant
    order by ea.experiment_id, ea.variant
  ) t;
$$;

-- ================================================
-- REAL-TIME ACTIVE USERS FUNCTION
-- Users active in last 5 minutes
-- ================================================
create or replace function get_realtime_stats()
returns json
language sql
security definer
as $$
  select json_build_object(
    'activeNow', (
      select count(distinct user_id)
      from public.user_visits
      where created_at > now() - interval '5 minutes'
    ),
    'activeLast15Min', (
      select count(distinct user_id)
      from public.user_visits
      where created_at > now() - interval '15 minutes'
    ),
    'activeLast1Hour', (
      select count(distinct user_id)
      from public.user_visits
      where created_at > now() - interval '1 hour'
    ),
    'gamesLast1Hour', (
      select count(*)
      from public.game_sessions
      where created_at > now() - interval '1 hour'
    )
  );
$$;

-- ================================================
-- CUSTOM DATE RANGE STATS FUNCTION
-- ================================================
create or replace function get_stats_for_range(
  start_date timestamp with time zone,
  end_date timestamp with time zone
)
returns json
language sql
security definer
as $$
  select json_build_object(
    'uniqueUsers', (
      select count(distinct user_id)
      from public.user_visits
      where created_at between start_date and end_date
    ),
    'totalVisits', (
      select count(*)
      from public.user_visits
      where created_at between start_date and end_date
    ),
    'totalGames', (
      select count(*)
      from public.game_sessions
      where created_at between start_date and end_date
    ),
    'totalWins', (
      select count(*)
      from public.game_sessions
      where won = true
      and created_at between start_date and end_date
    ),
    'avgMoves', (
      select coalesce(round(avg(moves)), 0)
      from public.game_sessions
      where created_at between start_date and end_date
    )
  );
$$;

-- ================================================
-- USER BAN/WARN TRACKING TABLE
-- ================================================
create table if not exists public.user_moderation (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users not null,
  action_type text not null check (action_type in ('ban', 'warn', 'reset_score', 'unban')),
  reason text,
  admin_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index
create index if not exists user_mod_user_idx on public.user_moderation (user_id);

-- ================================================
-- ADMIN BROADCAST TABLE
-- For admin push notifications to all users
-- ================================================
create table if not exists public.admin_broadcasts (
  id bigint generated by default as identity primary key,
  title text not null,
  body text not null,
  target_type text default 'all' check (target_type in ('all', 'active', 'inactive')),
  sent_by uuid,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  send_count integer default 0
);
