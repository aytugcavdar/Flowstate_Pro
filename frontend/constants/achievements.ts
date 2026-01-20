/**
 * Enhanced Achievements System - Categories, Tiers, and Rewards
 */

import { Badge } from '../types';

// ============================================
// ACHIEVEMENT TIERS
// ============================================

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface TierInfo {
    name: string;
    icon: string;
    color: string;
    glowColor: string;
    xpMultiplier: number;
}

export const TIER_INFO: Record<AchievementTier, TierInfo> = {
    bronze: {
        name: 'Bronze',
        icon: '🥉',
        color: '#cd7f32',
        glowColor: 'rgba(205, 127, 50, 0.5)',
        xpMultiplier: 1
    },
    silver: {
        name: 'Silver',
        icon: '🥈',
        color: '#c0c0c0',
        glowColor: 'rgba(192, 192, 192, 0.5)',
        xpMultiplier: 1.5
    },
    gold: {
        name: 'Gold',
        icon: '🥇',
        color: '#ffd700',
        glowColor: 'rgba(255, 215, 0, 0.5)',
        xpMultiplier: 2
    },
    diamond: {
        name: 'Diamond',
        icon: '💎',
        color: '#b9f2ff',
        glowColor: 'rgba(185, 242, 255, 0.5)',
        xpMultiplier: 3
    }
};

// ============================================
// ACHIEVEMENT CATEGORIES
// ============================================

export type AchievementCategory = 
    | 'progression'    // Win milestones
    | 'speed'          // Time challenges
    | 'precision'      // Low move counts
    | 'dedication'     // Streaks & consistency
    | 'social'         // Referrals, shares
    | 'collection'     // Unlock all of something
    | 'seasonal'       // Event achievements
    | 'mastery';       // Expert challenges

export interface CategoryInfo {
    name: string;
    nameTr: string;
    icon: string;
    color: string;
}

export const CATEGORY_INFO: Record<AchievementCategory, CategoryInfo> = {
    progression: { name: 'Progression', nameTr: 'İlerleme', icon: '📈', color: '#22d3ee' },
    speed: { name: 'Speed', nameTr: 'Hız', icon: '⚡', color: '#fbbf24' },
    precision: { name: 'Precision', nameTr: 'Hassasiyet', icon: '🎯', color: '#22c55e' },
    dedication: { name: 'Dedication', nameTr: 'Bağlılık', icon: '🔥', color: '#f97316' },
    social: { name: 'Social', nameTr: 'Sosyal', icon: '👥', color: '#8b5cf6' },
    collection: { name: 'Collection', nameTr: 'Koleksiyon', icon: '✨', color: '#ec4899' },
    seasonal: { name: 'Seasonal', nameTr: 'Mevsimsel', icon: '🎄', color: '#06b6d4' },
    mastery: { name: 'Mastery', nameTr: 'Ustalık', icon: '👑', color: '#d946ef' }
};

// ============================================
// ACHIEVEMENT DEFINITIONS
// ============================================

export interface Achievement {
    id: string;
    name: string;
    nameTr: string;
    description: string;
    descriptionTr: string;
    icon: string;
    category: AchievementCategory;
    tier: AchievementTier;
    xpReward: number;
    coinReward?: number;
    unlockCondition: AchievementCondition;
    secret?: boolean; // Hidden until unlocked
}

export interface AchievementCondition {
    type: 'wins' | 'streak' | 'speed' | 'moves' | 'no_hint' | 'referrals' | 'shares' | 'collection' | 'level' | 'custom';
    value: number;
    comparator?: 'gte' | 'lte' | 'eq'; // >= | <= | ==
}

export const ACHIEVEMENTS: Achievement[] = [
    // ========== PROGRESSION ==========
    {
        id: 'first_win',
        name: 'First Steps',
        nameTr: 'İlk Adımlar',
        description: 'Complete your first puzzle',
        descriptionTr: 'İlk bulmacayı tamamla',
        icon: '👣',
        category: 'progression',
        tier: 'bronze',
        xpReward: 100,
        coinReward: 50,
        unlockCondition: { type: 'wins', value: 1 }
    },
    {
        id: 'getting_started',
        name: 'Getting Started',
        nameTr: 'Başlangıç',
        description: 'Complete 10 puzzles',
        descriptionTr: '10 bulmaca tamamla',
        icon: '🌱',
        category: 'progression',
        tier: 'bronze',
        xpReward: 200,
        coinReward: 100,
        unlockCondition: { type: 'wins', value: 10 }
    },
    {
        id: 'puzzle_addict',
        name: 'Puzzle Addict',
        nameTr: 'Bulmaca Bağımlısı',
        description: 'Complete 50 puzzles',
        descriptionTr: '50 bulmaca tamamla',
        icon: '🎮',
        category: 'progression',
        tier: 'silver',
        xpReward: 500,
        coinReward: 250,
        unlockCondition: { type: 'wins', value: 50 }
    },
    {
        id: 'century_club',
        name: 'Century Club',
        nameTr: 'Yüzler Kulübü',
        description: 'Complete 100 puzzles',
        descriptionTr: '100 bulmaca tamamla',
        icon: '💯',
        category: 'progression',
        tier: 'gold',
        xpReward: 1000,
        coinReward: 500,
        unlockCondition: { type: 'wins', value: 100 }
    },
    {
        id: 'grandmaster',
        name: 'Grandmaster',
        nameTr: 'Büyük Usta',
        description: 'Complete 500 puzzles',
        descriptionTr: '500 bulmaca tamamla',
        icon: '👑',
        category: 'progression',
        tier: 'diamond',
        xpReward: 5000,
        coinReward: 2500,
        unlockCondition: { type: 'wins', value: 500 }
    },
    
    // ========== SPEED ==========
    {
        id: 'quick_solver',
        name: 'Quick Solver',
        nameTr: 'Hızlı Çözücü',
        description: 'Complete a puzzle in under 60 seconds',
        descriptionTr: '60 saniyenin altında tamamla',
        icon: '⏱️',
        category: 'speed',
        tier: 'bronze',
        xpReward: 150,
        unlockCondition: { type: 'speed', value: 60, comparator: 'lte' }
    },
    {
        id: 'speed_demon',
        name: 'Speed Demon',
        nameTr: 'Hız Şeytanı',
        description: 'Complete a puzzle in under 30 seconds',
        descriptionTr: '30 saniyenin altında tamamla',
        icon: '⚡',
        category: 'speed',
        tier: 'silver',
        xpReward: 300,
        coinReward: 100,
        unlockCondition: { type: 'speed', value: 30, comparator: 'lte' }
    },
    {
        id: 'lightning',
        name: 'Lightning',
        nameTr: 'Yıldırım',
        description: 'Complete a puzzle in under 20 seconds',
        descriptionTr: '20 saniyenin altında tamamla',
        icon: '🌩️',
        category: 'speed',
        tier: 'gold',
        xpReward: 500,
        coinReward: 250,
        unlockCondition: { type: 'speed', value: 20, comparator: 'lte' }
    },
    {
        id: 'time_lord',
        name: 'Time Lord',
        nameTr: 'Zaman Lordu',
        description: 'Complete a puzzle in under 15 seconds',
        descriptionTr: '15 saniyenin altında tamamla',
        icon: '⏰',
        category: 'speed',
        tier: 'diamond',
        xpReward: 1000,
        coinReward: 500,
        unlockCondition: { type: 'speed', value: 15, comparator: 'lte' },
        secret: true
    },
    
    // ========== PRECISION ==========
    {
        id: 'efficient',
        name: 'Efficient',
        nameTr: 'Verimli',
        description: 'Complete a puzzle in 25 moves or less',
        descriptionTr: '25 veya daha az hamle ile tamamla',
        icon: '📐',
        category: 'precision',
        tier: 'bronze',
        xpReward: 150,
        unlockCondition: { type: 'moves', value: 25, comparator: 'lte' }
    },
    {
        id: 'minimalist',
        name: 'Minimalist',
        nameTr: 'Minimalist',
        description: 'Complete a puzzle in 20 moves or less',
        descriptionTr: '20 veya daha az hamle ile tamamla',
        icon: '✂️',
        category: 'precision',
        tier: 'silver',
        xpReward: 300,
        coinReward: 100,
        unlockCondition: { type: 'moves', value: 20, comparator: 'lte' }
    },
    {
        id: 'perfectionist',
        name: 'Perfectionist',
        nameTr: 'Mükemmeliyetçi',
        description: 'Complete a puzzle in 15 moves or less',
        descriptionTr: '15 veya daha az hamle ile tamamla',
        icon: '💎',
        category: 'precision',
        tier: 'gold',
        xpReward: 500,
        coinReward: 250,
        unlockCondition: { type: 'moves', value: 15, comparator: 'lte' }
    },
    
    // ========== DEDICATION ==========
    {
        id: 'consistent',
        name: 'Consistent',
        nameTr: 'Tutarlı',
        description: 'Maintain a 7-day streak',
        descriptionTr: '7 günlük seri yap',
        icon: '🔥',
        category: 'dedication',
        tier: 'silver',
        xpReward: 350,
        coinReward: 150,
        unlockCondition: { type: 'streak', value: 7 }
    },
    {
        id: 'dedicated',
        name: 'Dedicated',
        nameTr: 'Adanmış',
        description: 'Maintain a 14-day streak',
        descriptionTr: '14 günlük seri yap',
        icon: '🎯',
        category: 'dedication',
        tier: 'gold',
        xpReward: 750,
        coinReward: 350,
        unlockCondition: { type: 'streak', value: 14 }
    },
    {
        id: 'unstoppable',
        name: 'Unstoppable',
        nameTr: 'Durdurulamaz',
        description: 'Maintain a 30-day streak',
        descriptionTr: '30 günlük seri yap',
        icon: '💪',
        category: 'dedication',
        tier: 'diamond',
        xpReward: 2000,
        coinReward: 1000,
        unlockCondition: { type: 'streak', value: 30 }
    },
    
    // ========== SKILL ==========
    {
        id: 'no_help',
        name: 'No Help Needed',
        nameTr: 'Yardım Gerekmez',
        description: 'Complete 5 puzzles without using hints',
        descriptionTr: 'İpucu kullanmadan 5 bulmaca tamamla',
        icon: '🧠',
        category: 'mastery',
        tier: 'silver',
        xpReward: 400,
        coinReward: 200,
        unlockCondition: { type: 'no_hint', value: 5 }
    },
    {
        id: 'genius',
        name: 'Genius',
        nameTr: 'Dahi',
        description: 'Complete 25 puzzles without using hints',
        descriptionTr: 'İpucu kullanmadan 25 bulmaca tamamla',
        icon: '🦾',
        category: 'mastery',
        tier: 'diamond',
        xpReward: 1500,
        coinReward: 750,
        unlockCondition: { type: 'no_hint', value: 25 }
    },
    
    // ========== SOCIAL ==========
    {
        id: 'sharer',
        name: 'Sharer',
        nameTr: 'Paylaşımcı',
        description: 'Share your score 5 times',
        descriptionTr: 'Skorunu 5 kez paylaş',
        icon: '📤',
        category: 'social',
        tier: 'bronze',
        xpReward: 100,
        unlockCondition: { type: 'shares', value: 5 }
    },
    {
        id: 'influencer',
        name: 'Influencer',
        nameTr: 'Etkileyici',
        description: 'Refer 3 friends',
        descriptionTr: '3 arkadaş davet et',
        icon: '👥',
        category: 'social',
        tier: 'gold',
        xpReward: 750,
        coinReward: 500,
        unlockCondition: { type: 'referrals', value: 3 }
    },
    
    // ========== LEVELS ==========
    {
        id: 'level_10',
        name: 'Rising Star',
        nameTr: 'Yükselen Yıldız',
        description: 'Reach Level 10',
        descriptionTr: 'Seviye 10\'a ulaş',
        icon: '⭐',
        category: 'progression',
        tier: 'silver',
        xpReward: 500,
        coinReward: 250,
        unlockCondition: { type: 'level', value: 10 }
    },
    {
        id: 'level_25',
        name: 'Pro Player',
        nameTr: 'Pro Oyuncu',
        description: 'Reach Level 25',
        descriptionTr: 'Seviye 25\'e ulaş',
        icon: '🌟',
        category: 'progression',
        tier: 'gold',
        xpReward: 1000,
        coinReward: 500,
        unlockCondition: { type: 'level', value: 25 }
    },
    {
        id: 'level_50',
        name: 'Legend',
        nameTr: 'Efsane',
        description: 'Reach Level 50',
        descriptionTr: 'Seviye 50\'ye ulaş',
        icon: '🏆',
        category: 'progression',
        tier: 'diamond',
        xpReward: 3000,
        coinReward: 1500,
        unlockCondition: { type: 'level', value: 50 }
    }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getAchievementsByCategory = (category: AchievementCategory): Achievement[] => {
    return ACHIEVEMENTS.filter(a => a.category === category);
};

export const getAchievementsByTier = (tier: AchievementTier): Achievement[] => {
    return ACHIEVEMENTS.filter(a => a.tier === tier);
};

export const getAchievementById = (id: string): Achievement | undefined => {
    return ACHIEVEMENTS.find(a => a.id === id);
};

export const countAchievementsByCategory = (): Record<AchievementCategory, number> => {
    const counts = {} as Record<AchievementCategory, number>;
    for (const category of Object.keys(CATEGORY_INFO) as AchievementCategory[]) {
        counts[category] = ACHIEVEMENTS.filter(a => a.category === category).length;
    }
    return counts;
};

export const getTotalXPFromAchievements = (unlockedIds: string[]): number => {
    return unlockedIds.reduce((total, id) => {
        const achievement = getAchievementById(id);
        return total + (achievement?.xpReward || 0);
    }, 0);
};

export const getTotalCoinsFromAchievements = (unlockedIds: string[]): number => {
    return unlockedIds.reduce((total, id) => {
        const achievement = getAchievementById(id);
        return total + (achievement?.coinReward || 0);
    }, 0);
};
