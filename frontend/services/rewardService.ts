/**
 * Reward Service - Daily login rewards and streak bonuses
 */

export interface DailyReward {
  day: number;
  type: 'xp' | 'badge' | 'theme' | 'special';
  amount: number;
  icon: string;
  name: string;
  description: string;
}

export interface RewardState {
  lastClaimDate: string;
  currentStreak: number;
  totalClaims: number;
  claimedToday: boolean;
}

const STORAGE_KEY = 'flowstate_rewards_v1';

// 7-day reward cycle
const REWARD_CYCLE: DailyReward[] = [
  { day: 1, type: 'xp', amount: 100, icon: '⚡', name: 'Data Packet', description: '+100 XP' },
  { day: 2, type: 'xp', amount: 150, icon: '💾', name: 'Memory Chip', description: '+150 XP' },
  { day: 3, type: 'xp', amount: 200, icon: '🔌', name: 'Power Cell', description: '+200 XP' },
  { day: 4, type: 'xp', amount: 300, icon: '💿', name: 'Data Core', description: '+300 XP' },
  { day: 5, type: 'xp', amount: 400, icon: '🔋', name: 'Energy Matrix', description: '+400 XP' },
  { day: 6, type: 'xp', amount: 500, icon: '💎', name: 'Crypto Cache', description: '+500 XP' },
  { day: 7, type: 'special', amount: 1000, icon: '🏆', name: 'Weekly Jackpot', description: '+1000 XP + Bonus!' }
];

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
      // Check if already claimed today
      const today = getTodayKey();
      return {
        ...state,
        claimedToday: state.lastClaimDate === today
      };
    }
  } catch (e) {
    console.warn('Failed to load reward state:', e);
  }
  return {
    lastClaimDate: '',
    currentStreak: 0,
    totalClaims: 0,
    claimedToday: false
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
export function claimDailyReward(): { reward: DailyReward; xpGained: number; newStreak: number } | null {
  const state = loadRewardState();
  const today = getTodayKey();
  const yesterday = getYesterdayKey();
  
  // Already claimed today
  if (state.lastClaimDate === today) {
    return null;
  }
  
  // Calculate streak
  let newStreak = 1;
  if (state.lastClaimDate === yesterday) {
    // Consecutive day
    newStreak = state.currentStreak + 1;
  }
  // If more than 1 day gap, streak resets to 1
  
  // Get the reward for current streak day
  const dayIndex = (newStreak - 1) % 7;
  const reward = REWARD_CYCLE[dayIndex];
  
  // Calculate XP with streak bonus
  let xpGained = reward.amount;
  if (newStreak >= 7) {
    // 7+ day streak: 50% bonus
    xpGained = Math.floor(xpGained * 1.5);
  } else if (newStreak >= 3) {
    // 3+ day streak: 20% bonus
    xpGained = Math.floor(xpGained * 1.2);
  }
  
  // Update state
  const newState: RewardState = {
    lastClaimDate: today,
    currentStreak: newStreak,
    totalClaims: state.totalClaims + 1,
    claimedToday: true
  };
  
  saveRewardState(newState);
  
  return {
    reward,
    xpGained,
    newStreak
  };
}

/**
 * Get streak info for display
 */
export function getStreakInfo(): { streak: number; bonus: string; nextMilestone: number } {
  const state = loadRewardState();
  let bonus = '';
  let nextMilestone = 3;
  
  if (state.currentStreak >= 7) {
    bonus = '+50%';
    nextMilestone = 7;
  } else if (state.currentStreak >= 3) {
    bonus = '+20%';
    nextMilestone = 7;
  } else {
    nextMilestone = 3 - state.currentStreak;
  }
  
  return {
    streak: state.currentStreak,
    bonus,
    nextMilestone
  };
}
