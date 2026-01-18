/**
 * Cloud Sync Service - Bidirectional sync between localStorage and Supabase
 * 
 * Handles syncing user progress, economy, inventory, and campaign data.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { PlayerProfile } from '../types';

// ============================================
// TYPES
// ============================================

export interface CloudProgress {
  xp: number;
  level: number;
  total_wins: number;
  fastest_win_ms: number | null;
  consecutive_no_hint_wins: number;
  badges: string[];
}

export interface CloudEconomy {
  coins: number;
  total_earned: number;
  total_spent: number;
  unlocked_items: string[];
}

export interface CloudInventory {
  hints: number;
  undos: number;
  freezes: number;
  coin_boosts: number;
}

export interface CloudCampaignLevel {
  level_id: string;
  stars: number;
}

export interface GameSessionData {
  mode: string;
  date_key?: string;
  moves: number;
  time_ms: number;
  won: boolean;
  used_hint: boolean;
  powerups_used?: Record<string, number>;
}

// ============================================
// AUTH HELPER
// ============================================

/**
 * Ensure user is authenticated (anonymous if needed)
 * Returns user ID or null
 */
export async function ensureAuthenticated(): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    let { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('[CloudSync] Anonymous auth failed:', error);
        return null;
      }
      const result = await supabase.auth.getSession();
      session = result.data.session;
    }

    return session?.user?.id || null;
  } catch (err) {
    console.error('[CloudSync] Auth error:', err);
    return null;
  }
}

// ============================================
// PROGRESS SYNC
// ============================================

/**
 * Fetch user progress from cloud
 */
export async function fetchProgressFromCloud(): Promise<CloudProgress | null> {
  const userId = await ensureAuthenticated();
  if (!userId || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[CloudSync] Fetch progress error:', error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error('[CloudSync] Fetch progress exception:', err);
    return null;
  }
}

/**
 * Sync progress to cloud (upsert)
 */
export async function syncProgressToCloud(progress: CloudProgress): Promise<boolean> {
  const userId = await ensureAuthenticated();
  if (!userId || !supabase) return false;

  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        id: userId,
        ...progress,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('[CloudSync] Sync progress error:', error);
      return false;
    }

    console.log('[CloudSync] Progress synced successfully');
    return true;
  } catch (err) {
    console.error('[CloudSync] Sync progress exception:', err);
    return false;
  }
}

/**
 * Merge local and cloud progress, keeping higher values
 */
export function mergeProgress(local: PlayerProfile, cloud: CloudProgress | null): PlayerProfile {
  if (!cloud) return local;

  return {
    xp: Math.max(local.xp, cloud.xp),
    level: Math.max(local.level, cloud.level),
    totalWins: Math.max(local.totalWins, cloud.total_wins),
    fastestWinMs: Math.min(local.fastestWinMs, cloud.fastest_win_ms || Infinity),
    consecutiveNoHintWins: Math.max(local.consecutiveNoHintWins, cloud.consecutive_no_hint_wins),
    badges: [...new Set([...local.badges, ...cloud.badges])],
  };
}

// ============================================
// ECONOMY SYNC
// ============================================

/**
 * Fetch economy from cloud
 */
export async function fetchEconomyFromCloud(): Promise<CloudEconomy | null> {
  const userId = await ensureAuthenticated();
  if (!userId || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_economy')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[CloudSync] Fetch economy error:', error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error('[CloudSync] Fetch economy exception:', err);
    return null;
  }
}

/**
 * Sync economy to cloud
 */
export async function syncEconomyToCloud(economy: CloudEconomy): Promise<boolean> {
  const userId = await ensureAuthenticated();
  if (!userId || !supabase) return false;

  try {
    const { error } = await supabase
      .from('user_economy')
      .upsert({
        id: userId,
        ...economy,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('[CloudSync] Sync economy error:', error);
      return false;
    }

    console.log('[CloudSync] Economy synced successfully');
    return true;
  } catch (err) {
    console.error('[CloudSync] Sync economy exception:', err);
    return false;
  }
}

// ============================================
// INVENTORY SYNC
// ============================================

/**
 * Fetch inventory from cloud
 */
export async function fetchInventoryFromCloud(): Promise<CloudInventory | null> {
  const userId = await ensureAuthenticated();
  if (!userId || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_inventory')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[CloudSync] Fetch inventory error:', error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error('[CloudSync] Fetch inventory exception:', err);
    return null;
  }
}

/**
 * Sync inventory to cloud
 */
export async function syncInventoryToCloud(inventory: CloudInventory): Promise<boolean> {
  const userId = await ensureAuthenticated();
  if (!userId || !supabase) return false;

  try {
    const { error } = await supabase
      .from('user_inventory')
      .upsert({
        id: userId,
        ...inventory,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('[CloudSync] Sync inventory error:', error);
      return false;
    }

    console.log('[CloudSync] Inventory synced successfully');
    return true;
  } catch (err) {
    console.error('[CloudSync] Sync inventory exception:', err);
    return false;
  }
}

// ============================================
// CAMPAIGN PROGRESS SYNC
// ============================================

/**
 * Fetch all campaign progress from cloud
 */
export async function fetchCampaignProgressFromCloud(): Promise<CloudCampaignLevel[]> {
  const userId = await ensureAuthenticated();
  if (!userId || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('campaign_progress')
      .select('level_id, stars')
      .eq('user_id', userId);

    if (error) {
      console.error('[CloudSync] Fetch campaign error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[CloudSync] Fetch campaign exception:', err);
    return [];
  }
}

/**
 * Sync a single campaign level completion to cloud
 */
export async function syncCampaignLevelToCloud(levelId: string, stars: number): Promise<boolean> {
  const userId = await ensureAuthenticated();
  if (!userId || !supabase) return false;

  try {
    // Upsert - insert or update if better stars
    const { error } = await supabase
      .from('campaign_progress')
      .upsert(
        {
          user_id: userId,
          level_id: levelId,
          stars: stars,
          completed_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id,level_id'
        }
      );

    if (error) {
      console.error('[CloudSync] Sync campaign level error:', error);
      return false;
    }

    console.log(`[CloudSync] Campaign level ${levelId} synced (${stars} stars)`);
    return true;
  } catch (err) {
    console.error('[CloudSync] Sync campaign level exception:', err);
    return false;
  }
}

// ============================================
// GAME SESSION ANALYTICS
// ============================================

/**
 * Log a game session for analytics
 */
export async function logGameSession(session: GameSessionData): Promise<boolean> {
  const userId = await ensureAuthenticated();
  if (!userId || !supabase) return false;

  try {
    const { error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: userId,
        mode: session.mode,
        date_key: session.date_key,
        moves: session.moves,
        time_ms: session.time_ms,
        won: session.won,
        used_hint: session.used_hint,
        powerups_used: session.powerups_used || {}
      });

    if (error) {
      console.error('[CloudSync] Log session error:', error);
      return false;
    }

    console.log('[CloudSync] Game session logged');
    return true;
  } catch (err) {
    console.error('[CloudSync] Log session exception:', err);
    return false;
  }
}

/**
 * Get user's game session stats
 */
export async function getSessionStats(): Promise<{
  totalGames: number;
  totalWins: number;
  avgMoves: number;
  avgTimeMs: number;
} | null> {
  const userId = await ensureAuthenticated();
  if (!userId || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('won, moves, time_ms')
      .eq('user_id', userId);

    if (error) {
      console.error('[CloudSync] Get session stats error:', error);
      return null;
    }

    if (!data || data.length === 0) return null;

    const totalGames = data.length;
    const totalWins = data.filter(s => s.won).length;
    const avgMoves = data.reduce((sum, s) => sum + (s.moves || 0), 0) / totalGames;
    const avgTimeMs = data.reduce((sum, s) => sum + (s.time_ms || 0), 0) / totalGames;

    return { totalGames, totalWins, avgMoves, avgTimeMs };
  } catch (err) {
    console.error('[CloudSync] Get session stats exception:', err);
    return null;
  }
}

// ============================================
// FULL SYNC
// ============================================

/**
 * Perform a full sync - fetch all data from cloud on app start
 */
export async function performFullSync(): Promise<{
  progress: CloudProgress | null;
  economy: CloudEconomy | null;
  inventory: CloudInventory | null;
  campaign: CloudCampaignLevel[];
}> {
  console.log('[CloudSync] Starting full sync...');
  
  const [progress, economy, inventory, campaign] = await Promise.all([
    fetchProgressFromCloud(),
    fetchEconomyFromCloud(),
    fetchInventoryFromCloud(),
    fetchCampaignProgressFromCloud(),
  ]);

  console.log('[CloudSync] Full sync complete:', {
    hasProgress: !!progress,
    hasEconomy: !!economy,
    hasInventory: !!inventory,
    campaignLevels: campaign.length
  });

  return { progress, economy, inventory, campaign };
}
