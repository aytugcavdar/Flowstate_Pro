/**
 * Seasonal Events Service - Time-limited events with exclusive rewards
 */

// ============================================
// EVENT TYPES
// ============================================

export type EventType = 
    | 'seasonal'      // Spring, Summer, Fall, Winter
    | 'holiday'       // Christmas, Halloween, Easter
    | 'anniversary'   // Game anniversary
    | 'weekend'       // Special weekend events
    | 'flash';        // Short 24-hour events

export interface SeasonalEvent {
    id: string;
    name: string;
    nameTr: string;
    description: string;
    descriptionTr: string;
    type: EventType;
    icon: string;
    theme: EventTheme;
    startDate: string; // ISO date
    endDate: string;   // ISO date
    challenges: EventChallenge[];
    rewards: EventReward[];
    shopItems?: EventShopItem[];
    leaderboardEnabled?: boolean;
}

export interface EventTheme {
    primaryColor: string;
    secondaryColor: string;
    bgGradient: string;
    borderColor: string;
    particleType?: 'snow' | 'leaves' | 'hearts' | 'stars' | 'confetti';
}

export interface EventChallenge {
    id: string;
    name: string;
    nameTr: string;
    description: string;
    descriptionTr: string;
    icon: string;
    target: number;
    progressKey: string; // Key for tracking progress
    reward: EventReward;
}

export interface EventReward {
    type: 'xp' | 'coins' | 'item' | 'achievement';
    value: number | string;
    icon: string;
    name: string;
}

export interface EventShopItem {
    id: string;
    name: string;
    icon: string;
    price: number; // Event currency or coins
    limited: boolean;
}

// ============================================
// EVENT THEMES
// ============================================

export const EVENT_THEMES: Record<string, EventTheme> = {
    winter: {
        primaryColor: '#93c5fd',
        secondaryColor: '#60a5fa',
        bgGradient: 'linear-gradient(135deg, rgba(147, 197, 253, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
        borderColor: 'rgba(147, 197, 253, 0.3)',
        particleType: 'snow'
    },
    spring: {
        primaryColor: '#86efac',
        secondaryColor: '#4ade80',
        bgGradient: 'linear-gradient(135deg, rgba(134, 239, 172, 0.15) 0%, rgba(74, 222, 128, 0.1) 100%)',
        borderColor: 'rgba(134, 239, 172, 0.3)',
        particleType: 'leaves'
    },
    summer: {
        primaryColor: '#fcd34d',
        secondaryColor: '#fbbf24',
        bgGradient: 'linear-gradient(135deg, rgba(252, 211, 77, 0.15) 0%, rgba(251, 191, 36, 0.1) 100%)',
        borderColor: 'rgba(252, 211, 77, 0.3)',
        particleType: 'stars'
    },
    halloween: {
        primaryColor: '#f97316',
        secondaryColor: '#ea580c',
        bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%)',
        borderColor: 'rgba(249, 115, 22, 0.3)'
    },
    christmas: {
        primaryColor: '#ef4444',
        secondaryColor: '#22c55e',
        bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        particleType: 'snow'
    },
    valentine: {
        primaryColor: '#ec4899',
        secondaryColor: '#f472b6',
        bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(244, 114, 182, 0.1) 100%)',
        borderColor: 'rgba(236, 72, 153, 0.3)',
        particleType: 'hearts'
    }
};

// ============================================
// PREDEFINED EVENTS
// ============================================

export const SEASONAL_EVENTS: SeasonalEvent[] = [
    {
        id: 'winter_2026',
        name: 'Winter Wonderland',
        nameTr: 'Kış Harikası',
        description: 'Celebrate the winter season with exclusive challenges and rewards!',
        descriptionTr: 'Özel meydan okumalar ve ödüllerle kış sezonunu kutla!',
        type: 'seasonal',
        icon: '❄️',
        theme: EVENT_THEMES.winter,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        challenges: [
            {
                id: 'winter_5_wins',
                name: 'Frosty Start',
                nameTr: 'Buzlu Başlangıç',
                description: 'Complete 5 puzzles during the event',
                descriptionTr: 'Etkinlik süresince 5 bulmaca tamamla',
                icon: '⛄',
                target: 5,
                progressKey: 'event_wins',
                reward: { type: 'xp', value: 250, icon: '✨', name: '+250 XP' }
            },
            {
                id: 'winter_streak',
                name: 'Ice Streak',
                nameTr: 'Buz Serisi',
                description: 'Maintain a 5-day streak during the event',
                descriptionTr: 'Etkinlik süresince 5 günlük seri yap',
                icon: '🔥',
                target: 5,
                progressKey: 'event_streak',
                reward: { type: 'coins', value: 500, icon: '🪙', name: '+500 Coins' }
            },
            {
                id: 'winter_speed',
                name: 'Blizzard Speed',
                nameTr: 'Kar Fırtınası Hızı',
                description: 'Complete a puzzle in under 30 seconds',
                descriptionTr: '30 saniyenin altında tamamla',
                icon: '⚡',
                target: 1,
                progressKey: 'speed_under_30',
                reward: { type: 'item', value: 'frame_winter', icon: '🖼️', name: 'Winter Frame' }
            }
        ],
        rewards: [
            { type: 'xp', value: 1000, icon: '✨', name: 'Event XP' },
            { type: 'coins', value: 750, icon: '🪙', name: 'Bonus Coins' },
            { type: 'item', value: 'theme_winter', icon: '❄️', name: 'Winter Theme' }
        ],
        shopItems: [
            { id: 'winter_tile', name: 'Frost Tiles', icon: '🧊', price: 300, limited: true },
            { id: 'winter_badge', name: 'Snowflake Badge', icon: '❄️', price: 500, limited: true }
        ],
        leaderboardEnabled: true
    },
    {
        id: 'valentine_2026',
        name: 'Flowstate of Love',
        nameTr: 'Aşk Akışı',
        description: 'Spread the love with heart-themed challenges!',
        descriptionTr: 'Kalp temalı meydan okumalarla aşkı yay!',
        type: 'holiday',
        icon: '💕',
        theme: EVENT_THEMES.valentine,
        startDate: '2026-02-10',
        endDate: '2026-02-16',
        challenges: [
            {
                id: 'valentine_hearts',
                name: 'Heart Collector',
                nameTr: 'Kalp Toplayıcı',
                description: 'Complete 14 puzzles',
                descriptionTr: '14 bulmaca tamamla',
                icon: '💝',
                target: 14,
                progressKey: 'event_wins',
                reward: { type: 'item', value: 'effect_hearts', icon: '💕', name: 'Heart Particles' }
            }
        ],
        rewards: [
            { type: 'xp', value: 500, icon: '✨', name: 'Valentine XP' },
            { type: 'coins', value: 300, icon: '🪙', name: 'Love Coins' }
        ],
        leaderboardEnabled: false
    }
];

// ============================================
// STORAGE
// ============================================

const EVENT_PROGRESS_KEY = 'flowstate_event_progress_v1';

interface EventProgress {
    eventId: string;
    progress: Record<string, number>;
    claimed: string[];
}

export const loadEventProgress = (eventId: string): EventProgress => {
    try {
        const saved = localStorage.getItem(`${EVENT_PROGRESS_KEY}_${eventId}`);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.warn('Failed to load event progress:', e);
    }
    return { eventId, progress: {}, claimed: [] };
};

export const saveEventProgress = (progress: EventProgress): void => {
    try {
        localStorage.setItem(`${EVENT_PROGRESS_KEY}_${progress.eventId}`, JSON.stringify(progress));
    } catch (e) {
        console.warn('Failed to save event progress:', e);
    }
};

// ============================================
// API FUNCTIONS
// ============================================

export const getCurrentEvent = (): SeasonalEvent | null => {
    const now = new Date();
    return SEASONAL_EVENTS.find(event => {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        end.setHours(23, 59, 59); // Include end day
        return now >= start && now <= end;
    }) || null;
};

export const getUpcomingEvents = (): SeasonalEvent[] => {
    const now = new Date();
    return SEASONAL_EVENTS.filter(event => {
        const start = new Date(event.startDate);
        return start > now;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
};

export const getTimeRemaining = (endDate: string): { days: number; hours: number; minutes: number } => {
    const now = new Date();
    const end = new Date(endDate);
    end.setHours(23, 59, 59);
    
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
};

export const incrementEventProgress = (eventId: string, key: string, amount: number = 1): void => {
    const progress = loadEventProgress(eventId);
    progress.progress[key] = (progress.progress[key] || 0) + amount;
    saveEventProgress(progress);
};

export const claimEventReward = (eventId: string, rewardId: string): boolean => {
    const progress = loadEventProgress(eventId);
    if (progress.claimed.includes(rewardId)) return false;
    
    progress.claimed.push(rewardId);
    saveEventProgress(progress);
    return true;
};

export const isChallengeComplete = (eventId: string, challenge: EventChallenge): boolean => {
    const progress = loadEventProgress(eventId);
    return (progress.progress[challenge.progressKey] || 0) >= challenge.target;
};

export const getChallengeProgress = (eventId: string, challenge: EventChallenge): number => {
    const progress = loadEventProgress(eventId);
    return Math.min(progress.progress[challenge.progressKey] || 0, challenge.target);
};
