/**
 * Admin Service - View all users, stats, and analytics
 * 
 * Note: In production, admin access should be verified server-side
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { ensureAuthenticated } from './cloudSyncService';

// ============================================
// TYPES
// ============================================

export interface UserSummary {
  id: string;
  username: string | null;
  createdAt: string;
  lastSeen: string;
  totalGames: number;
  totalWins: number;
  level: number;
  visitCount?: number;
}

export interface DailyStatsRow {
  date: string;
  uniqueUsers: number;
  totalVisits: number;
  totalGames: number;
  totalWins: number;
}

export interface CountryStats {
  country: string;
  visitCount: number;
  uniqueUsers: number;
}

export interface DeviceStats {
  browser: string;
  os: string;
  isMobile: boolean;
  visitCount: number;
}

export interface EventStats {
  eventType: string;
  eventCount: number;
  uniqueUsers: number;
}

export interface AdminSummary {
  totalUsers: number;
  activeToday: number;
  totalGamesPlayed: number;
  avgGamesPerUser: number;
}

const ADMIN_STORAGE_KEY = 'flowstate_admin_v1';

// ============================================
// ADMIN AUTH (Simple local check)
// ============================================

let isAdminMode = false;

/**
 * Check if current session is admin
 * In production, this should verify against a server-side admin list
 */
export function isAdmin(): boolean {
  return isAdminMode;
}

/**
 * Enable admin mode with password
 * Note: This is a simple implementation. Use proper auth in production.
 */
export function enableAdminMode(password: string): boolean {
  // Simple hardcoded password for demo
  // In production: verify against server-side admin list
  const ADMIN_PASSWORD = 'flowstate2026';
  
  if (password === ADMIN_PASSWORD) {
    isAdminMode = true;
    localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    console.log('[Admin] Admin mode enabled');
    return true;
  }
  console.warn('[Admin] Invalid password');
  return false;
}

/**
 * Disable admin mode
 */
export function disableAdminMode(): void {
  isAdminMode = false;
  localStorage.removeItem(ADMIN_STORAGE_KEY);
  console.log('[Admin] Admin mode disabled');
}

/**
 * Check stored admin session
 */
export function checkAdminSession(): boolean {
  const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (stored === 'true') {
    isAdminMode = true;
    return true;
  }
  return false;
}

// ============================================
// ADMIN DATA FETCHING
// ============================================

/**
 * Get admin summary stats
 */
export async function getAdminSummary(): Promise<AdminSummary | null> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return null;

  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active today
    const today = new Date().toISOString().split('T')[0];
    const { count: activeToday } = await supabase
      .from('user_visits')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', today);

    // Get total games
    const { count: totalGames } = await supabase
      .from('game_sessions')
      .select('*', { count: 'exact', head: true });

    const avgGamesPerUser = totalUsers && totalUsers > 0 
      ? Math.round((totalGames || 0) / totalUsers) 
      : 0;

    return {
      totalUsers: totalUsers || 0,
      activeToday: activeToday || 0,
      totalGamesPlayed: totalGames || 0,
      avgGamesPerUser
    };
  } catch (err) {
    console.error('[Admin] Failed to get summary:', err);
    return null;
  }
}

/**
 * Get daily stats for charts
 */
export async function getDailyStats(days: number = 7): Promise<DailyStatsRow[]> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase.rpc('get_daily_stats', { days_back: days });
    
    if (error) {
      console.error('[Admin] Failed to get daily stats:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Admin] Daily stats error:', err);
    return [];
  }
}

/**
 * Get country distribution
 */
export async function getCountryStats(): Promise<CountryStats[]> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase.rpc('get_country_stats');
    
    if (error) {
      console.error('[Admin] Failed to get country stats:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Admin] Country stats error:', err);
    return [];
  }
}

/**
 * Get device/browser distribution
 */
export async function getDeviceStats(): Promise<DeviceStats[]> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase.rpc('get_device_stats');
    
    if (error) {
      console.error('[Admin] Failed to get device stats:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Admin] Device stats error:', err);
    return [];
  }
}

/**
 * Get event statistics
 */
export async function getEventStats(): Promise<EventStats[]> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase.rpc('get_event_stats');
    
    if (error) {
      console.error('[Admin] Failed to get event stats:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Admin] Event stats error:', err);
    return [];
  }
}

/**
 * Get recent users list with enhanced stats
 */
export async function getRecentUsers(limit: number = 50): Promise<UserSummary[]> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return [];

  try {
    // Get profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Admin] Failed to get users:', error);
      return [];
    }

    if (!profiles || profiles.length === 0) return [];

    // Get user IDs
    const userIds = profiles.map(p => p.id);

    // Get visit counts for each user
    const { data: visits } = await supabase
      .from('user_visits')
      .select('user_id, created_at')
      .in('user_id', userIds);

    // Get game session stats
    const { data: games } = await supabase
      .from('game_sessions')
      .select('user_id, won')
      .in('user_id', userIds);

    // Get user progress (level)
    const { data: progress } = await supabase
      .from('user_progress')
      .select('user_id, level, xp')
      .in('user_id', userIds);

    // Build lookup maps
    const visitMap = new Map<string, { count: number; lastSeen: string }>();
    (visits || []).forEach(v => {
      const current = visitMap.get(v.user_id) || { count: 0, lastSeen: '' };
      current.count++;
      if (!current.lastSeen || v.created_at > current.lastSeen) {
        current.lastSeen = v.created_at;
      }
      visitMap.set(v.user_id, current);
    });

    const gameMap = new Map<string, { total: number; wins: number }>();
    (games || []).forEach(g => {
      const current = gameMap.get(g.user_id) || { total: 0, wins: 0 };
      current.total++;
      if (g.won) current.wins++;
      gameMap.set(g.user_id, current);
    });

    const progressMap = new Map<string, { level: number; xp: number }>();
    (progress || []).forEach(p => {
      progressMap.set(p.user_id, { level: p.level || 1, xp: p.xp || 0 });
    });

    // Combine data
    return profiles.map(u => {
      const visitData = visitMap.get(u.id) || { count: 0, lastSeen: u.created_at };
      const gameData = gameMap.get(u.id) || { total: 0, wins: 0 };
      const progressData = progressMap.get(u.id) || { level: 1, xp: 0 };
      
      return {
        id: u.id,
        username: u.username,
        createdAt: u.created_at,
        lastSeen: visitData.lastSeen || u.created_at,
        totalGames: gameData.total,
        totalWins: gameData.wins,
        level: progressData.level,
        visitCount: visitData.count
      };
    });
  } catch (err) {
    console.error('[Admin] Users error:', err);
    return [];
  }
}

/**
 * Get error logs (admin only)
 */
export async function getErrorLogs(limit: number = 100): Promise<any[]> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Admin] Failed to get error logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Admin] Error logs error:', err);
    return [];
  }
}

/**
 * Get game session stats by mode
 */
export async function getGameModeStats(): Promise<{ mode: string; count: number; wins: number }[]> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('mode, won');

    if (error || !data) return [];

    // Aggregate by mode
    const modeMap = new Map<string, { count: number; wins: number }>();
    
    data.forEach(session => {
      const current = modeMap.get(session.mode) || { count: 0, wins: 0 };
      current.count++;
      if (session.won) current.wins++;
      modeMap.set(session.mode, current);
    });

    return Array.from(modeMap.entries()).map(([mode, stats]) => ({
      mode,
      ...stats
    }));
  } catch (err) {
    console.error('[Admin] Game mode stats error:', err);
    return [];
  }
}

// ============================================
// ADVANCED ANALYTICS
// ============================================

export interface RetentionStats {
  totalUsers: number;
  day1Retention: number;
  day7Retention: number;
  day30Retention: number;
  day1Count: number;
  day7Count: number;
  day30Count: number;
}

export interface SessionStats {
  totalSessions: number;
  avgDurationSeconds: number;
  avgDurationMinutes: number;
  maxDurationMinutes: number;
  avgMovesPerGame: number;
  winRate: number;
}

export interface FunnelStage {
  name: string;
  count: number;
  rate: number;
}

export interface ABTestResult {
  experiment_id: string;
  variant: string;
  user_count: number;
  event_count: number;
  events_per_user: number;
}

export interface RealtimeStats {
  activeNow: number;
  activeLast15Min: number;
  activeLast1Hour: number;
  gamesLast1Hour: number;
}

export interface DateRangeStats {
  uniqueUsers: number;
  totalVisits: number;
  totalGames: number;
  totalWins: number;
  avgMoves: number;
}

/**
 * Get retention statistics
 */
export async function getRetentionStats(): Promise<RetentionStats | null> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase.rpc('get_retention_stats');
    if (error) {
      console.error('[Admin] Retention stats error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Admin] Retention error:', err);
    return null;
  }
}

/**
 * Get session statistics
 */
export async function getSessionStats(): Promise<SessionStats | null> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase.rpc('get_session_stats');
    if (error) {
      console.error('[Admin] Session stats error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Admin] Session error:', err);
    return null;
  }
}

/**
 * Get funnel analysis
 */
export async function getFunnelStats(daysBack: number = 7): Promise<FunnelStage[]> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase.rpc('get_funnel_stats', { days_back: daysBack });
    if (error) {
      console.error('[Admin] Funnel stats error:', error);
      return [];
    }
    return data?.stages || [];
  } catch (err) {
    console.error('[Admin] Funnel error:', err);
    return [];
  }
}

/**
 * Get A/B test results
 */
export async function getABTestResults(): Promise<ABTestResult[]> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase.rpc('get_ab_test_results');
    if (error) {
      console.error('[Admin] AB test results error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('[Admin] AB test error:', err);
    return [];
  }
}

/**
 * Get real-time stats (active users now)
 */
export async function getRealtimeStats(): Promise<RealtimeStats | null> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase.rpc('get_realtime_stats');
    if (error) {
      console.error('[Admin] Realtime stats error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Admin] Realtime error:', err);
    return null;
  }
}

/**
 * Get stats for custom date range
 */
export async function getStatsForDateRange(
  startDate: string,
  endDate: string
): Promise<DateRangeStats | null> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase.rpc('get_stats_for_range', {
      start_date: startDate,
      end_date: endDate
    });
    if (error) {
      console.error('[Admin] Date range stats error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Admin] Date range error:', err);
    return null;
  }
}

// ============================================
// USER MODERATION
// ============================================

/**
 * Ban a user
 */
export async function banUser(userId: string, reason: string): Promise<boolean> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('user_moderation').insert({
      user_id: userId,
      action_type: 'ban',
      reason
    });
    if (error) throw error;
    console.log('[Admin] User banned:', userId);
    return true;
  } catch (err) {
    console.error('[Admin] Ban user error:', err);
    return false;
  }
}

/**
 * Warn a user
 */
export async function warnUser(userId: string, reason: string): Promise<boolean> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('user_moderation').insert({
      user_id: userId,
      action_type: 'warn',
      reason
    });
    if (error) throw error;
    console.log('[Admin] User warned:', userId);
    return true;
  } catch (err) {
    console.error('[Admin] Warn user error:', err);
    return false;
  }
}

/**
 * Reset user's score/progress
 */
export async function resetUserScore(userId: string): Promise<boolean> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return false;

  try {
    // Log the action
    await supabase.from('user_moderation').insert({
      user_id: userId,
      action_type: 'reset_score',
      reason: 'Admin reset'
    });
    
    // Reset progress
    await supabase.from('user_progress').update({
      level: 1,
      xp: 0
    }).eq('user_id', userId);
    
    console.log('[Admin] User score reset:', userId);
    return true;
  } catch (err) {
    console.error('[Admin] Reset score error:', err);
    return false;
  }
}

/**
 * Send admin broadcast notification
 */
export async function sendAdminBroadcast(
  title: string,
  body: string,
  targetType: 'all' | 'active' | 'inactive' = 'all'
): Promise<boolean> {
  if (!isAdmin() || !supabase || !isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('admin_broadcasts').insert({
      title,
      body,
      target_type: targetType
    });
    if (error) throw error;
    console.log('[Admin] Broadcast sent:', title);
    return true;
  } catch (err) {
    console.error('[Admin] Broadcast error:', err);
    return false;
  }
}

/**
 * Export data as CSV string
 */
export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and handle special characters
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  
  console.log('[Admin] Exported CSV:', filename);
}
