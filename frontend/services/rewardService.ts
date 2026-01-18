/**
 * Reward Service - Daily login rewards and streak bonuses
 * Enhanced: Streak milestones, recovery, and freeze
 */

export interface DailyReward {
  day: number;
  type: 'xp' | 'badge' | 'theme' | 'special' | 'coins';
  amount: number;
  icon: string;
  name: string;
  description: string;
}

export interface RewardState {
  lastClaimDate: string;
  currentStreak: number;
  longestStreak: number;
  totalClaims: number;
  claimedToday: boolean;
  streakFreezeCount: number;   // Number of streak freezes available
  streakFreezeActive: boolean; // Is freeze protecting streak today?
  missedDate: string | null;   // Last missed date (for recovery)
}

export interface StreakMilestone {
  days: number;
  reward: number;
  icon: string;
  name: string;
  claimed: boolean;
}

const STORAGE_KEY = 'flowstate_rewards_v2';

// 7-day reward cycle
const REWARD_CYCLE: DailyReward[] = [
  { day: 1, type: 'xp', amount: 100, icon: '⚡', name: 'Data Packet', description: '+100 XP' },
  { day: 2, type: 'xp', amount: 150, icon: '💾', name: 'Memory Chip', description: '+150 XP' },
  { day: 3, type: 'coins', amount: 50, icon: '🪙', name: 'Coin Cache', description: '+50 Coins' },
  { day: 4, type: 'xp', amount: 300, icon: '💿', name: 'Data Core', description: '+300 XP' },
  { day: 5, type: 'xp', amount: 400, icon: '🔋', name: 'Energy Matrix', description: '+400 XP' },
  { day: 6, type: 'coins', amount: 100, icon: '💰', name: 'Crypto Cache', description: '+100 Coins' },
  { day: 7, type: 'special', amount: 1000, icon: '🏆', name: 'Weekly Jackpot', description: '+1000 XP + 200 Coins!' }
];

// Streak milestones with coin bonuses
const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 7, reward: 200, icon: '🔥', name: 'On Fire!', claimed: false },
  { days: 14, reward: 500, icon: '🌟', name: 'Dedicated', claimed: false },
  { days: 30, reward: 1000, icon: '👑', name: 'Legend', claimed: false },
  { days: 60, reward: 2000, icon: '💎', name: 'Diamond', claimed: false },
  { days: 100, reward: 5000, icon: '🏅', name: 'Master', claimed: false }
];

// Recovery cost (coins to restore broken streak)
const STREAK_RECOVERY_COST = 100;
// Freeze cost (coins to buy streak protection)
const STREAK_FREEZE_COST = 50;

/**
 * Get today's date key
 */
function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Get yesterday's date key
 */
function getYesterdayKey(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}

/**
 * Load reward state from storage
 */
export function loadRewardState(): RewardState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      const today = getTodayKey();
      const yesterday = getYesterdayKey();
      
      // Check if streak is broken (missed yesterday and not today)
      let streakBroken = false;
      if (state.lastClaimDate !== today && state.lastClaimDate !== yesterday && state.currentStreak > 0) {
        // Check if freeze was active
        if (!state.streakFreezeActive) {
          streakBroken = true;
        }
      }
      
      return {
        ...state,
        claimedToday: state.lastClaimDate === today,
        longestStreak: state.longestStreak || state.currentStreak,
        streakFreezeCount: state.streakFreezeCount || 0,
        streakFreezeActive: state.streakFreezeActive || false,
        missedDate: streakBroken ? state.lastClaimDate : null
      };
    }
  } catch (e) {
    console.warn('Failed to load reward state:', e);
  }
  return {
    lastClaimDate: '',
    currentStreak: 0,
    longestStreak: 0,
    totalClaims: 0,
    claimedToday: false,
    streakFreezeCount: 0,
    streakFreezeActive: false,
    missedDate: null
  };
}

/**
 * Save reward state
 */
function saveRewardState(state: RewardState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save reward state:', e);
  }
}

/**
 * Check if player can claim daily reward
 */
export function canClaimReward(): boolean {
  const state = loadRewardState();
  return !state.claimedToday;
}

/**
 * Get current day in reward cycle (1-7)
 */
export function getCurrentRewardDay(): number {
  const state = loadRewardState();
  return ((state.currentStreak) % 7) + 1;
}

/**
 * Get the reward for current day
 */
export function getTodayReward(): DailyReward {
  const day = getCurrentRewardDay();
  return REWARD_CYCLE[day - 1];
}

/**
 * Get all rewards in the cycle with locked/unlocked status
 */
export function getRewardCalendar(): (DailyReward & { unlocked: boolean; current: boolean })[] {
  const currentDay = getCurrentRewardDay();
  const state = loadRewardState();
  
  return REWARD_CYCLE.map((reward, index) => ({
    ...reward,
    unlocked: index < currentDay - 1 || (index === currentDay - 1 && state.claimedToday),
    current: index === currentDay - 1 && !state.claimedToday
  }));
}

/**
 * Claim today's reward
 * Returns the reward and XP amount
 */
export function claimDailyReward(): { reward: DailyReward; xpGained: number; coinsGained: number; newStreak: number; milestoneReached?: StreakMilestone } | null {
  const state = loadRewardState();
  const today = getTodayKey();
  const yesterday = getYesterdayKey();
  
  // Already claimed today
  if (state.lastClaimDate === today) {
    return null;
  }
  
  // Calculate streak
  let newStreak = 1;
  if (state.lastClaimDate === yesterday || state.streakFreezeActive) {
    // Consecutive day or freeze protected
    newStreak = state.currentStreak + 1;
  }
  // If more than 1 day gap without freeze, streak resets to 1
  
  // Get the reward for current streak day
  const dayIndex = (newStreak - 1) % 7;
  const reward = REWARD_CYCLE[dayIndex];
  
  // Calculate rewards with streak bonus
  let xpGained = reward.type === 'xp' || reward.type === 'special' ? reward.amount : 0;
  let coinsGained = reward.type === 'coins' || reward.type === 'special' ? (reward.type === 'special' ? 200 : reward.amount) : 0;
  
  if (newStreak >= 30) {
    // 30+ day streak: 100% bonus
    xpGained = Math.floor(xpGained * 2);
    coinsGained = Math.floor(coinsGained * 2);
  } else if (newStreak >= 14) {
    // 14+ day streak: 75% bonus
    xpGained = Math.floor(xpGained * 1.75);
    coinsGained = Math.floor(coinsGained * 1.75);
  } else if (newStreak >= 7) {
    // 7+ day streak: 50% bonus
    xpGained = Math.floor(xpGained * 1.5);
    coinsGained = Math.floor(coinsGained * 1.5);
  } else if (newStreak >= 3) {
    // 3+ day streak: 20% bonus
    xpGained = Math.floor(xpGained * 1.2);
    coinsGained = Math.floor(coinsGained * 1.2);
  }
  
  // Check milestone
  const milestoneReached = STREAK_MILESTONES.find(m => m.days === newStreak);
  if (milestoneReached) {
    coinsGained += milestoneReached.reward;
  }
  
  // Update state
  const newState: RewardState = {
    lastClaimDate: today,
    currentStreak: newStreak,
    longestStreak: Math.max(state.longestStreak || 0, newStreak),
    totalClaims: state.totalClaims + 1,
    claimedToday: true,
    streakFreezeCount: state.streakFreezeCount,
    streakFreezeActive: false, // Reset freeze after use
    missedDate: null
  };
  
  saveRewardState(newState);
  
  return {
    reward,
    xpGained,
    coinsGained,
    newStreak,
    milestoneReached
  };
}

/**
 * Get streak info for display
 */
export function getStreakInfo(): { 
  streak: number; 
  longestStreak: number;
  bonus: string; 
  nextMilestone: StreakMilestone | null;
  freezeCount: number;
  canRecover: boolean;
  recoveryCost: number;
} {
  const state = loadRewardState();
  let bonus = '';
  
  if (state.currentStreak >= 30) {
    bonus = '+100%';
  } else if (state.currentStreak >= 14) {
    bonus = '+75%';
  } else if (state.currentStreak >= 7) {
    bonus = '+50%';
  } else if (state.currentStreak >= 3) {
    bonus = '+20%';
  }
  
  // Find next milestone
  const nextMilestone = STREAK_MILESTONES.find(m => m.days > state.currentStreak) || null;
  
  return {
    streak: state.currentStreak,
    longestStreak: state.longestStreak || state.currentStreak,
    bonus,
    nextMilestone,
    freezeCount: state.streakFreezeCount,
    canRecover: state.missedDate !== null,
    recoveryCost: STREAK_RECOVERY_COST
  };
}

/**
 * Purchase streak freeze (protects streak for next missed day)
 */
export function purchaseStreakFreeze(): boolean {
  // This should check economy service for coins
  // For now, just add the freeze
  const state = loadRewardState();
  state.streakFreezeCount += 1;
  saveRewardState(state);
  console.log('[Rewards] Streak freeze purchased');
  return true;
}

/**
 * Activate streak freeze for today
 */
export function activateStreakFreeze(): boolean {
  const state = loadRewardState();
  if (state.streakFreezeCount <= 0) return false;
  
  state.streakFreezeCount -= 1;
  state.streakFreezeActive = true;
  saveRewardState(state);
  console.log('[Rewards] Streak freeze activated');
  return true;
}

/**
 * Recover broken streak (costs coins)
 */
export function recoverStreak(): { success: boolean; cost: number } {
  const state = loadRewardState();
  if (!state.missedDate) {
    return { success: false, cost: 0 };
  }
  
  // Would deduct coins from economy service
  // For now, just recover the streak
  state.missedDate = null;
  saveRewardState(state);
  console.log('[Rewards] Streak recovered');
  return { success: true, cost: STREAK_RECOVERY_COST };
}

/**
 * Get streak milestones with claimed status
 */
export function getStreakMilestones(): StreakMilestone[] {
  const state = loadRewardState();
  return STREAK_MILESTONES.map(m => ({
    ...m,
    claimed: state.currentStreak >= m.days || state.longestStreak >= m.days
  }));
}

/**
 * Get freeze cost
 */
export function getStreakFreezeCost(): number {
  return STREAK_FREEZE_COST;
}
