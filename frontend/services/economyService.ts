/**
 * Economy Service - Coin management and unlock system for Flowstate
 */

import { syncEconomyToCloud, CloudEconomy } from './cloudSyncService';

// ============================================
// TYPES
// ============================================

export interface EconomyState {
  coins: number;
  totalEarned: number;
  totalSpent: number;
  unlockedItems: string[];
  transactions: CoinTransaction[];
}

export interface CoinTransaction {
  id: string;
  amount: number;
  type: 'earn' | 'spend';
  reason: string;
  timestamp: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'theme' | 'powerup' | 'cosmetic';
  icon: string;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'flowstate_economy_v1';

export const COIN_REWARDS: Record<string, number> = {
  DAILY_WIN: 100,
  PRACTICE_WIN: 25,
  CAMPAIGN_WIN_PER_STAR: 50,
  ENDLESS_PER_TILE: 10,
  ENDLESS_LEVEL_COMPLETE: 100,
  SPEEDRUN_FAST: 200,      // Under 30s
  SPEEDRUN_MEDIUM: 100,    // 30-60s
  SPEEDRUN_SLOW: 50,       // Over 60s
  WEEKLY_COMPLETE: 500,
  STREAK_BONUS_PER_DAY: 25,
  MISSION_COMPLETE: 50,
};

// ============================================
// STATE MANAGEMENT
// ============================================

const DEFAULT_STATE: EconomyState = {
  coins: 0,
  totalEarned: 0,
  totalSpent: 0,
  unlockedItems: [],
  transactions: [],
};

/**
 * Load economy state from localStorage
 */
export function loadEconomyState(): EconomyState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (e) {
    console.warn('[Economy] Failed to load state:', e);
  }
  return { ...DEFAULT_STATE };
}

/**
 * Save economy state to localStorage
 */
function saveEconomyState(state: EconomyState): void {
  try {
    // Keep only last 50 transactions to prevent storage bloat
    const trimmedState = {
      ...state,
      transactions: state.transactions.slice(-50),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedState));
    
    // Sync to cloud (fire and forget)
    const cloudData: CloudEconomy = {
      coins: state.coins,
      total_earned: state.totalEarned,
      total_spent: state.totalSpent,
      unlocked_items: state.unlockedItems,
    };
    syncEconomyToCloud(cloudData).catch(err => console.warn('[Economy] Cloud sync failed:', err));
  } catch (e) {
    console.warn('[Economy] Failed to save state:', e);
  }
}

// ============================================
// COIN OPERATIONS
// ============================================

/**
 * Get current coin balance
 */
export function getCoins(): number {
  return loadEconomyState().coins;
}

/**
 * Add coins to balance
 */
export function addCoins(amount: number, reason: string): { newBalance: number; transaction: CoinTransaction } {
  const state = loadEconomyState();
  
  const transaction: CoinTransaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    type: 'earn',
    reason,
    timestamp: Date.now(),
  };
  
  state.coins += amount;
  state.totalEarned += amount;
  state.transactions.push(transaction);
  
  saveEconomyState(state);
  console.log(`[Economy] +${amount} coins (${reason}) → Balance: ${state.coins}`);
  
  return { newBalance: state.coins, transaction };
}

/**
 * Spend coins from balance
 * Returns false if insufficient funds
 */
export function spendCoins(amount: number, reason: string): { success: boolean; newBalance: number } {
  const state = loadEconomyState();
  
  if (state.coins < amount) {
    console.warn(`[Economy] Insufficient funds: ${state.coins} < ${amount}`);
    return { success: false, newBalance: state.coins };
  }
  
  const transaction: CoinTransaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: -amount,
    type: 'spend',
    reason,
    timestamp: Date.now(),
  };
  
  state.coins -= amount;
  state.totalSpent += amount;
  state.transactions.push(transaction);
  
  saveEconomyState(state);
  console.log(`[Economy] -${amount} coins (${reason}) → Balance: ${state.coins}`);
  
  return { success: true, newBalance: state.coins };
}

/**
 * Get transaction history
 */
export function getCoinHistory(): CoinTransaction[] {
  return loadEconomyState().transactions;
}

// ============================================
// UNLOCK SYSTEM
// ============================================

/**
 * Get all unlocked item IDs
 */
export function getUnlockedItems(): string[] {
  return loadEconomyState().unlockedItems;
}

/**
 * Check if a specific item is unlocked
 */
export function isItemUnlocked(itemId: string): boolean {
  return loadEconomyState().unlockedItems.includes(itemId);
}

/**
 * Unlock an item (purchase)
 */
export function unlockItem(itemId: string, price: number): { success: boolean; newBalance: number } {
  // Check if already unlocked
  if (isItemUnlocked(itemId)) {
    console.warn(`[Economy] Item already unlocked: ${itemId}`);
    return { success: false, newBalance: getCoins() };
  }
  
  // Try to spend coins
  const result = spendCoins(price, `Unlock: ${itemId}`);
  
  if (result.success) {
    const state = loadEconomyState();
    state.unlockedItems.push(itemId);
    saveEconomyState(state);
    console.log(`[Economy] Item unlocked: ${itemId}`);
  }
  
  return result;
}

// ============================================
// REWARD HELPERS
// ============================================

/**
 * Calculate and award coins for game win
 */
export function rewardGameWin(
  mode: 'DAILY' | 'PRACTICE' | 'CAMPAIGN' | 'ENDLESS' | 'SPEEDRUN' | 'WEEKLY',
  options?: {
    stars?: number;          // For Campaign
    timeMs?: number;         // For SpeedRun
    tilesCleared?: number;   // For Endless
    streak?: number;         // For Daily
    missionsCompleted?: number;
  }
): { totalCoins: number; breakdown: { reason: string; amount: number }[] } {
  const breakdown: { reason: string; amount: number }[] = [];
  
  switch (mode) {
    case 'DAILY':
      breakdown.push({ reason: 'Daily Win', amount: COIN_REWARDS.DAILY_WIN });
      
      // Streak bonus
      if (options?.streak && options.streak > 1) {
        const streakBonus = Math.min(options.streak, 7) * COIN_REWARDS.STREAK_BONUS_PER_DAY;
        breakdown.push({ reason: `${options.streak} Day Streak`, amount: streakBonus });
      }
      
      // Mission bonus
      if (options?.missionsCompleted) {
        const missionBonus = options.missionsCompleted * COIN_REWARDS.MISSION_COMPLETE;
        breakdown.push({ reason: `${options.missionsCompleted} Missions`, amount: missionBonus });
      }
      break;
      
    case 'PRACTICE':
      breakdown.push({ reason: 'Practice Win', amount: COIN_REWARDS.PRACTICE_WIN });
      break;
      
    case 'CAMPAIGN':
      const stars = options?.stars || 1;
      breakdown.push({ reason: `Campaign ${stars}★`, amount: stars * COIN_REWARDS.CAMPAIGN_WIN_PER_STAR });
      break;
      
    case 'ENDLESS':
      const tiles = options?.tilesCleared || 0;
      breakdown.push({ reason: `${tiles} Tiles Cleared`, amount: tiles * COIN_REWARDS.ENDLESS_PER_TILE });
      breakdown.push({ reason: 'Level Complete', amount: COIN_REWARDS.ENDLESS_LEVEL_COMPLETE });
      break;
      
    case 'SPEEDRUN':
      const timeMs = options?.timeMs || 60000;
      const timeSeconds = timeMs / 1000;
      
      if (timeSeconds < 30) {
        breakdown.push({ reason: 'Speed Run (Fast!)', amount: COIN_REWARDS.SPEEDRUN_FAST });
      } else if (timeSeconds < 60) {
        breakdown.push({ reason: 'Speed Run (Good)', amount: COIN_REWARDS.SPEEDRUN_MEDIUM });
      } else {
        breakdown.push({ reason: 'Speed Run', amount: COIN_REWARDS.SPEEDRUN_SLOW });
      }
      break;
      
    case 'WEEKLY':
      breakdown.push({ reason: 'Weekly Challenge!', amount: COIN_REWARDS.WEEKLY_COMPLETE });
      break;
  }
  
  // Award all coins
  const totalCoins = breakdown.reduce((sum, item) => sum + item.amount, 0);
  addCoins(totalCoins, `${mode} Win`);
  
  return { totalCoins, breakdown };
}

// ============================================
// STATS
// ============================================

/**
 * Get economy stats for profile display
 */
export function getEconomyStats(): {
  coins: number;
  totalEarned: number;
  totalSpent: number;
  itemsUnlocked: number;
} {
  const state = loadEconomyState();
  return {
    coins: state.coins,
    totalEarned: state.totalEarned,
    totalSpent: state.totalSpent,
    itemsUnlocked: state.unlockedItems.length,
  };
}
