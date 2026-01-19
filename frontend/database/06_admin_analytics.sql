-- ================================================
-- ADMIN DASHBOARD ANALYTICS - ENHANCED
-- Version 2.0 - Full Analytics Suite
-- Run this in Supabase SQL Editor
-- ================================================

-- ================================================
-- 1. REVENUE ANALYTICS
-- Günlük/haftalık/aylık gelir takibi
-- ================================================

create or replace function get_revenue_stats(days_back integer default 30)
returns json
language sql
security definer
as $$
  select json_build_object(
    'dailyRevenue', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          date(created_at) as date,
          count(*) as transactions,
          coalesce(sum(price_coins), 0) as coin_revenue,
          coalesce(sum(price_gems), 0) as gem_revenue,
          coalesce(sum(price_real::numeric), 0) as real_revenue
        from public.purchase_history
        where created_at > now() - (days_back || ' days')::interval
        group by date(created_at)
        order by date desc
      ) t
    ),
    'totalRevenue', (
      select json_build_object(
        'coins', coalesce(sum(price_coins), 0),
        'gems', coalesce(sum(price_gems), 0),
        'real', coalesce(sum(price_real::numeric), 0),
        'transactions', count(*)
      )
      from public.purchase_history
      where created_at > now() - (days_back || ' days')::interval
    ),
    'topItems', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          item_id,
          item_type,
          count(*) as purchase_count,
          sum(quantity) as total_quantity
        from public.purchase_history
        where created_at > now() - (days_back || ' days')::interval
        group by item_id, item_type
        order by purchase_count desc
        limit 10
      ) t
    ),
    'payingUsers', (
      select count(distinct user_id)
      from public.purchase_history
      where price_real > 0::money
      and created_at > now() - (days_back || ' days')::interval
    )
  );
$$;

-- ================================================
-- 2. GROWTH METRICS (DAU, WAU, MAU)
-- Aktif kullanıcı trendleri
-- ================================================

create or replace function get_growth_metrics()
returns json
language sql
security definer
as $$
  select json_build_object(
    'dau', (
      select count(distinct user_id)
      from public.user_visits
      where date(created_at) = current_date
    ),
    'dauYesterday', (
      select count(distinct user_id)
      from public.user_visits
      where date(created_at) = current_date - 1
    ),
    'wau', (
      select count(distinct user_id)
      from public.user_visits
      where created_at > now() - interval '7 days'
    ),
    'wauLastWeek', (
      select count(distinct user_id)
      from public.user_visits
      where created_at between now() - interval '14 days' and now() - interval '7 days'
    ),
    'mau', (
      select count(distinct user_id)
      from public.user_visits
      where created_at > now() - interval '30 days'
    ),
    'mauLastMonth', (
      select count(distinct user_id)
      from public.user_visits
      where created_at between now() - interval '60 days' and now() - interval '30 days'
    ),
    'newUsersToday', (
      select count(*)
      from public.profiles
      where date(created_at) = current_date
    ),
    'newUsersThisWeek', (
      select count(*)
      from public.profiles
      where created_at > now() - interval '7 days'
    ),
    'newUsersThisMonth', (
      select count(*)
      from public.profiles
      where created_at > now() - interval '30 days'
    ),
    'totalUsers', (
      select count(*) from public.profiles
    ),
    'dauTrend', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          date(created_at) as date,
          count(distinct user_id) as dau
        from public.user_visits
        where created_at > now() - interval '30 days'
        group by date(created_at)
        order by date desc
      ) t
    )
  );
$$;

-- ================================================
-- 3. LEADERBOARD INSIGHTS
-- En iyi oyuncular ve mod bazlı istatistikler
-- ================================================

create or replace function get_leaderboard_insights(days_back integer default 7)
returns json
language sql
security definer
as $$
  select json_build_object(
    'topPlayers', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          p.username,
          up.level,
          up.total_wins,
          up.xp,
          up.current_streak,
          up.max_streak,
          count(gs.id) as games_this_week
        from public.profiles p
        join public.user_progress up on p.id = up.id
        left join public.game_sessions gs on p.id = gs.user_id 
          and gs.created_at > now() - (days_back || ' days')::interval
        group by p.username, up.level, up.total_wins, up.xp, up.current_streak, up.max_streak
        order by up.total_wins desc
        limit 20
      ) t
    ),
    'topByMode', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          s.mode,
          p.username,
          min(s.moves) as best_moves,
          min(s.time_ms) as best_time
        from public.scores s
        join public.profiles p on s.user_id = p.id
        where s.created_at > now() - (days_back || ' days')::interval
        group by s.mode, p.username
        order by s.mode, best_moves asc, best_time asc
      ) t
    ),
    'recordBreakers', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          p.username,
          up.fastest_win_ms,
          up.max_streak
        from public.user_progress up
        join public.profiles p on up.id = p.id
        where up.fastest_win_ms is not null
        order by up.fastest_win_ms asc
        limit 10
      ) t
    ),
    'highestLevel', (
      select json_build_object(
        'maxLevel', max(level),
        'maxXP', max(xp),
        'avgLevel', round(avg(level), 1)
      )
      from public.user_progress
    )
  );
$$;

-- ================================================
-- 4. GAME MODE POPULARITY
-- Hangi mod daha çok oynanıyor
-- ================================================

create or replace function get_game_mode_stats(days_back integer default 30)
returns json
language sql
security definer
as $$
  select json_build_object(
    'modeDistribution', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          mode,
          count(*) as total_games,
          count(distinct user_id) as unique_players,
          round(count(*)::numeric / nullif(sum(count(*)) over (), 0) * 100, 1) as percentage,
          round(avg(time_ms) / 1000, 1) as avg_duration_sec,
          round(avg(moves), 1) as avg_moves,
          round(sum(case when won then 1 else 0 end)::numeric / nullif(count(*), 0) * 100, 1) as win_rate
        from public.game_sessions
        where created_at > now() - (days_back || ' days')::interval
        group by mode
        order by total_games desc
      ) t
    ),
    'modeTrend', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          date(created_at) as date,
          mode,
          count(*) as games
        from public.game_sessions
        where created_at > now() - interval '14 days'
        group by date(created_at), mode
        order by date desc, mode
      ) t
    ),
    'modeRetention', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          mode,
          count(distinct case when game_count > 1 then user_id end) as returning_players,
          count(distinct user_id) as total_players
        from (
          select user_id, mode, count(*) as game_count
          from public.game_sessions
          where created_at > now() - (days_back || ' days')::interval
          group by user_id, mode
        ) sub
        group by mode
      ) t
    )
  );
$$;

-- ================================================
-- 5. PEAK HOURS (Heatmap Data)
-- En yoğun saatler
-- ================================================

create or replace function get_peak_hours_stats(days_back integer default 7)
returns json
language sql
security definer
as $$
  select json_build_object(
    'hourlyDistribution', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          extract(hour from created_at)::integer as hour,
          count(*) as visits,
          count(distinct user_id) as unique_users
        from public.user_visits
        where created_at > now() - (days_back || ' days')::interval
        group by extract(hour from created_at)
        order by hour
      ) t
    ),
    'dayOfWeekDistribution', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          extract(dow from created_at)::integer as day_of_week,
          count(*) as visits,
          count(distinct user_id) as unique_users
        from public.user_visits
        where created_at > now() - (days_back || ' days')::interval
        group by extract(dow from created_at)
        order by day_of_week
      ) t
    ),
    'heatmapData', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          extract(dow from created_at)::integer as day,
          extract(hour from created_at)::integer as hour,
          count(*) as activity
        from public.user_visits
        where created_at > now() - (days_back || ' days')::interval
        group by extract(dow from created_at), extract(hour from created_at)
        order by day, hour
      ) t
    ),
    'peakHour', (
      select json_build_object(
        'hour', extract(hour from created_at)::integer,
        'visits', count(*)
      )
      from public.user_visits
      where created_at > now() - (days_back || ' days')::interval
      group by extract(hour from created_at)
      order by count(*) desc
      limit 1
    ),
    'peakDay', (
      select json_build_object(
        'day', extract(dow from created_at)::integer,
        'visits', count(*)
      )
      from public.user_visits
      where created_at > now() - (days_back || ' days')::interval
      group by extract(dow from created_at)
      order by count(*) desc
      limit 1
    )
  );
$$;

-- ================================================
-- 6. NOTIFICATION STATS
-- Bildirim istatistikleri
-- ================================================

-- Notification tracking table (if not exists)
create table if not exists public.notification_logs (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users on delete cascade,
  notification_type text not null, -- daily_reminder, streak_warning, level_up, milestone, admin_broadcast
  title text not null,
  body text,
  sent_at timestamp with time zone default now() not null,
  opened boolean default false not null,
  opened_at timestamp with time zone,
  broadcast_id bigint references public.admin_broadcasts(id)
);

alter table public.notification_logs enable row level security;

create policy "Users can view own notifications"
  on public.notification_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own notifications"
  on public.notification_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notification_logs for update
  using (auth.uid() = user_id);

create index if not exists notif_user_idx on public.notification_logs (user_id);
create index if not exists notif_type_idx on public.notification_logs (notification_type);
create index if not exists notif_sent_idx on public.notification_logs (sent_at);

-- Notification stats function
create or replace function get_notification_stats(days_back integer default 30)
returns json
language sql
security definer
as $$
  select json_build_object(
    'totalSent', (
      select count(*) from public.notification_logs
      where sent_at > now() - (days_back || ' days')::interval
    ),
    'totalOpened', (
      select count(*) from public.notification_logs
      where opened = true
      and sent_at > now() - (days_back || ' days')::interval
    ),
    'openRate', (
      select round(
        (count(*) filter (where opened = true))::numeric / 
        nullif(count(*), 0) * 100, 1
      )
      from public.notification_logs
      where sent_at > now() - (days_back || ' days')::interval
    ),
    'byType', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          notification_type,
          count(*) as sent,
          count(*) filter (where opened) as opened,
          round(count(*) filter (where opened)::numeric / nullif(count(*), 0) * 100, 1) as open_rate
        from public.notification_logs
        where sent_at > now() - (days_back || ' days')::interval
        group by notification_type
        order by sent desc
      ) t
    ),
    'dailyTrend', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          date(sent_at) as date,
          count(*) as sent,
          count(*) filter (where opened) as opened
        from public.notification_logs
        where sent_at > now() - (days_back || ' days')::interval
        group by date(sent_at)
        order by date desc
      ) t
    ),
    'broadcastStats', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select 
          ab.id,
          ab.title,
          ab.sent_at,
          ab.send_count,
          count(nl.id) as delivered,
          count(*) filter (where nl.opened) as opened
        from public.admin_broadcasts ab
        left join public.notification_logs nl on ab.id = nl.broadcast_id
        where ab.sent_at > now() - (days_back || ' days')::interval
        group by ab.id, ab.title, ab.sent_at, ab.send_count
        order by ab.sent_at desc
        limit 10
      ) t
    ),
    'avgTimeToOpen', (
      select round(avg(extract(epoch from (opened_at - sent_at)) / 60), 1)
      from public.notification_logs
      where opened = true
      and opened_at is not null
      and sent_at > now() - (days_back || ' days')::interval
    )
  );
$$;

-- ================================================
-- BONUS: COMPREHENSIVE DASHBOARD SUMMARY
-- Tek bir çağrıda tüm özet metrikler
-- ================================================

create or replace function get_dashboard_summary()
returns json
language sql
security definer
as $$
  select json_build_object(
    'realtime', (
      select json_build_object(
        'activeNow', (select count(distinct user_id) from public.user_visits where created_at > now() - interval '5 minutes'),
        'gamesNow', (select count(*) from public.game_sessions where created_at > now() - interval '5 minutes')
      )
    ),
    'today', (
      select json_build_object(
        'visits', (select count(*) from public.user_visits where date(created_at) = current_date),
        'uniqueUsers', (select count(distinct user_id) from public.user_visits where date(created_at) = current_date),
        'games', (select count(*) from public.game_sessions where date(created_at) = current_date),
        'wins', (select count(*) from public.game_sessions where date(created_at) = current_date and won = true),
        'newUsers', (select count(*) from public.profiles where date(created_at) = current_date),
        'purchases', (select count(*) from public.purchase_history where date(created_at) = current_date)
      )
    ),
    'totals', (
      select json_build_object(
        'users', (select count(*) from public.profiles),
        'games', (select count(*) from public.game_sessions),
        'wins', (select count(*) from public.game_sessions where won = true),
        'purchases', (select count(*) from public.purchase_history)
      )
    ),
    'growth', (
      select json_build_object(
        'dau', (select count(distinct user_id) from public.user_visits where date(created_at) = current_date),
        'wau', (select count(distinct user_id) from public.user_visits where created_at > now() - interval '7 days'),
        'mau', (select count(distinct user_id) from public.user_visits where created_at > now() - interval '30 days')
      )
    )
  );
$$;
