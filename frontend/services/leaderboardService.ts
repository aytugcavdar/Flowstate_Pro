/**
 * Leaderboard Service - Hybrid (Supabase + Local Fallback)
 * 
 * If Supabase is configured (VITE_SUPABASE_URL/KEY present), uses cloud.
 * Otherwise falls back to simulated local leaderboard.
 */

import { SeededRNG } from '../utils/rng';
import { supabase, isSupabaseConfigured, DBScore } from './supabase';
import { getOrCreateUsername, getStoredUsername } from './usernameService';
import { getTimezoneMetadata } from './cloudSyncService';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  moves: number;
  timeMs: number;
  isPlayer: boolean;
  isNew?: boolean;
}

const STORAGE_KEY = 'flowstate_leaderboard_v1';
const CURRENT_PLAYER_ID_KEY = 'flowstate_player_id'; // UUID for local player identification

// AI player name pool
const AI_NAMES = [
  'GHOST', 'CIPHER', 'NEXUS', 'ZERO', 'PHOENIX', 'BYTE',
  'PIXEL', 'GLITCH', 'NOVA', 'VOID', 'PULSE', 'AXIOM',
  'BLADE', 'CORE', 'DRIFT', 'ECHO', 'FLUX', 'GRID',
  'HELIX', 'ION', 'JOLT', 'KARMA', 'LOGIC', 'MATRIX',
  'NANO', 'OMEGA', 'PRISM', 'QUARK', 'ROGUE', 'SIGMA',
  'TITAN', 'ULTRA', 'VECTOR', 'WARP', 'XENON', 'ZEPHYR'
];

interface StoredLeaderboard {
  [dateKey: string]: LeaderboardEntry[];
}

// --- LOCAL SIMULATION HELPERS ---

function generateAIPlayers(dateKey: string, count: number = 20): LeaderboardEntry[] {
  const rng = new SeededRNG(dateKey + '_LEADERBOARD');
  const players: LeaderboardEntry[] = [];
  const shuffledNames = [...AI_NAMES].sort(() => rng.next() - 0.5);
  
  for (let i = 0; i < count; i++) {
    const skillLevel = rng.next();
    let moves, timeMs;
    
    if (skillLevel < 0.1) { moves = rng.range(18, 25); timeMs = rng.range(20000, 40000); }
    else if (skillLevel < 0.3) { moves = rng.range(25, 32); timeMs = rng.range(35000, 60000); }
    else if (skillLevel < 0.7) { moves = rng.range(32, 45); timeMs = rng.range(50000, 90000); }
    else { moves = rng.range(40, 60); timeMs = rng.range(70000, 150000); }
    
    players.push({
      rank: 0,
      name: shuffledNames[i % shuffledNames.length],
      moves,
      timeMs,
      isPlayer: false
    });
  }
  return players;
}

function loadLocalLeaderboard(): StoredLeaderboard {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function saveLocalLeaderboard(data: StoredLeaderboard): void {
  try {
    const keys = Object.keys(data).sort().slice(-7);
    const trimmed: StoredLeaderboard = {};
    keys.forEach(k => trimmed[k] = data[k]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

// --- EXPORTED FUNCTIONS ---

/**
 * Check if player has already played today's daily (from database)
 */
export async function hasPlayedToday(dateKey: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    // Fallback to localStorage if Supabase not available
    try {
      const stored = JSON.parse(localStorage.getItem('flowstate_stats_v1') || '{}');
      return stored.lastPlayed === dateKey;
    } catch { return false; }
  }

  try {
    // Ensure we have a session (sign in anonymously if needed)
    let { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Try to sign in anonymously
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('[hasPlayedToday] Anonymous sign-in failed:', error);
        // Fallback to localStorage
        try {
          const stored = JSON.parse(localStorage.getItem('flowstate_stats_v1') || '{}');
          return stored.lastPlayed === dateKey;
        } catch { return false; }
      }
      // Get the new session
      const result = await supabase.auth.getSession();
      session = result.data.session;
    }

    if (!session?.user) return false;

    // Check if they have a score for this date
    const { data, error } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('date_key', dateKey)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[hasPlayedToday] DB Error, falling back to localStorage:', error);
      // Fallback to localStorage on any error
      try {
        const stored = JSON.parse(localStorage.getItem('flowstate_stats_v1') || '{}');
        return stored.lastPlayed === dateKey;
      } catch { return false; }
    }

    return !!data;
  } catch (err) {
    console.error('[hasPlayedToday] Exception, falling back to localStorage:', err);
    // Fallback to localStorage on exception
    try {
      const stored = JSON.parse(localStorage.getItem('flowstate_stats_v1') || '{}');
      return stored.lastPlayed === dateKey;
    } catch { return false; }
  }
}

/**
 * Get leaderboard for a specific day
 */
export async function getLeaderboard(dateKey: string, playerName: string = 'YOU'): Promise<LeaderboardEntry[]> {
  // SUPABASE LOGIC
  const configured = isSupabaseConfigured();
  console.log('[Leaderboard] Configured:', configured, 'Supabase Client:', !!supabase);

  if (configured && supabase) {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('username, moves, time_ms')
        .eq('date_key', dateKey)
        .order('moves', { ascending: true })
        .order('time_ms', { ascending: true })
        .limit(50);
        
      console.log('[Leaderboard] Fetch Result:', { data, error });

      if (!error && data) {
         return data.map((d, index) => ({
             rank: index + 1,
             name: d.username,
             moves: d.moves,
             timeMs: d.time_ms,
             isPlayer: d.username === playerName // Simple name check for now
         }));
      }
    } catch (err) {
      console.error("Supabase fetch error:", err);
    }
    // If Supabase configured but error, return empty to avoid confusion
    return [];
  }

  // FALLBACK / LOCAL LOGIC (DISABLED BY REQUEST)
  /*
  const stored = loadLocalLeaderboard();
  if (!stored[dateKey]) {
    stored[dateKey] = generateAIPlayers(dateKey);
    saveLocalLeaderboard(stored);
  }
  
  const entries = stored[dateKey].filter(e => e.isPlayer || !e.isNew);
  // Sort
  const sorted = [...entries].sort((a, b) => {
    if (a.moves !== b.moves) return a.moves - b.moves;
    return a.timeMs - b.timeMs;
  });
  
  return sorted.slice(0, 50).map((e, i) => ({ ...e, rank: i + 1 }));
  */
  return [];
}

/**
 * Submit a player score (Async)
 */
export async function submitScore(
  dateKey: string, 
  moves: number, 
  timeMs: number, 
  playerName?: string
): Promise<{ rank: number; entries: LeaderboardEntry[]; improved: boolean }> {
    
  // Priority: 1) passed playerName, 2) stored username from UsernameModal, 3) generate new
  let finalPlayerName = playerName;
  
  // If no name passed or it's a default placeholder, use stored username
  if (!finalPlayerName || finalPlayerName === 'YOU' || finalPlayerName === 'NETRUNNER') {
    const storedName = getStoredUsername();
    if (storedName) {
      finalPlayerName = storedName;
      console.log('[Leaderboard] Using stored username:', storedName);
    } else {
      // Generate new username as last resort
      finalPlayerName = await getOrCreateUsername();
      console.log('[Leaderboard] Generated new username:', finalPlayerName);
    }
  }

  // SUPABASE LOGIC
  if (isSupabaseConfigured() && supabase) {
    try {
        // Authenticate anonymously if needed
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            await supabase.auth.signInAnonymously();
        }

        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
            // Always sync profile username (ensures username is always current in DB)
            const { error: profileError } = await supabase.from('profiles').upsert({ 
                id: user.id, 
                username: finalPlayerName,
                ...getTimezoneMetadata(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
            
            if (profileError) {
                console.warn('[Leaderboard] Profile upsert warning:', profileError);
            }

            // Check existing score
            const { data: existing } = await supabase
                .from('scores')
                .select('*')
                .eq('user_id', user.id)
                .eq('date_key', dateKey)
                .single();

            let shouldInsert = true;
            let improved = false;

            if (existing) {
                if (moves < existing.moves || (moves === existing.moves && timeMs < existing.time_ms)) {
                    // Update existing score (improved)
                    const { error: updateError } = await supabase
                        .from('scores')
                        .update({ moves, time_ms: timeMs, username: finalPlayerName, ...getTimezoneMetadata() })
                        .eq('id', existing.id);
                    
                    if (updateError) {
                        console.error('[Leaderboard] Score update error:', updateError);
                    } else {
                        improved = true;
                    }
                    shouldInsert = false;
                } else {
                    shouldInsert = false; // Not improved
                }
            }

            if (shouldInsert) {
                const { error: insertError } = await supabase.from('scores').insert({
                    user_id: user.id,
                    username: finalPlayerName,
                    date_key: dateKey,
                    moves,
                    time_ms: timeMs,
                    ...getTimezoneMetadata()
                });
                
                if (insertError) {
                    console.error('[Leaderboard] Score insert error:', insertError);
                } else {
                    improved = true;
                    console.log('[Leaderboard] Score saved successfully:', { dateKey, moves, timeMs, username: finalPlayerName });
                }
            }

            // Fetch new leaderboard
            const newEntries = await getLeaderboard(dateKey, finalPlayerName);
            const playerRank = newEntries.findIndex(e => e.name === finalPlayerName) + 1;
            
            return {
                rank: playerRank || 0,
                entries: newEntries,
                improved
            };
        }
    } catch (err) {
        console.error("[Leaderboard] Supabase submit error:", err);
    }
  }

  // FALLBACK / LOCAL LOGIC (DISABLED)
  return { rank: 0, entries: [], improved: false };
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function getRankSuffix(rank: number): string {
  if (rank >= 11 && rank <= 13) return 'th';
  switch (rank % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
