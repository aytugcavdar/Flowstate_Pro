/**
 * Unlockables Service - Manage tile skins, themes, effects, and cosmetics
 */

// ============================================
// UNLOCKABLE TYPES
// ============================================

export type UnlockableType = 'tile_skin' | 'board_theme' | 'particle_effect' | 'profile_frame' | 'victory_animation';

export interface Unlockable {
    id: string;
    name: string;
    nameTr: string;
    description: string;
    descriptionTr: string;
    type: UnlockableType;
    icon: string;
    preview?: string; // Preview image/animation
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockMethod: UnlockMethod;
    cssVariables?: Record<string, string>; // For applying themes
}

export interface UnlockMethod {
    type: 'achievement' | 'level' | 'purchase' | 'event' | 'referral' | 'default';
    value?: string | number; // achievement ID, level number, coin price, etc.
}

// ============================================
// RARITY INFO
// ============================================

export interface RarityInfo {
    name: string;
    color: string;
    bgGradient: string;
    borderColor: string;
    glowColor: string;
}

export const RARITY_INFO: Record<string, RarityInfo> = {
    common: {
        name: 'Common',
        color: '#94a3b8',
        bgGradient: 'linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(100, 116, 139, 0.1) 100%)',
        borderColor: 'rgba(148, 163, 184, 0.3)',
        glowColor: 'rgba(148, 163, 184, 0.2)'
    },
    rare: {
        name: 'Rare',
        color: '#3b82f6',
        bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)',
        borderColor: 'rgba(59, 130, 246, 0.4)',
        glowColor: 'rgba(59, 130, 246, 0.3)'
    },
    epic: {
        name: 'Epic',
        color: '#8b5cf6',
        bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)',
        borderColor: 'rgba(139, 92, 246, 0.4)',
        glowColor: 'rgba(139, 92, 246, 0.3)'
    },
    legendary: {
        name: 'Legendary',
        color: '#f59e0b',
        bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%)',
        borderColor: 'rgba(245, 158, 11, 0.4)',
        glowColor: 'rgba(245, 158, 11, 0.3)'
    }
};

// ============================================
// UNLOCKABLE DEFINITIONS
// ============================================

export const UNLOCKABLES: Unlockable[] = [
    // ========== TILE SKINS ==========
    {
        id: 'tile_default',
        name: 'Classic',
        nameTr: 'Klasik',
        description: 'The original tile style',
        descriptionTr: 'Orijinal tile stili',
        type: 'tile_skin',
        icon: '🔲',
        rarity: 'common',
        unlockMethod: { type: 'default' }
    },
    {
        id: 'tile_neon',
        name: 'Neon Glow',
        nameTr: 'Neon Işıltı',
        description: 'Bright neon edges',
        descriptionTr: 'Parlak neon kenarlar',
        type: 'tile_skin',
        icon: '💡',
        rarity: 'rare',
        unlockMethod: { type: 'level', value: 5 }
    },
    {
        id: 'tile_holographic',
        name: 'Holographic',
        nameTr: 'Holografik',
        description: 'Shimmering rainbow effect',
        descriptionTr: 'Parlayan gökkuşağı efekti',
        type: 'tile_skin',
        icon: '🌈',
        rarity: 'epic',
        unlockMethod: { type: 'level', value: 15 }
    },
    {
        id: 'tile_diamond',
        name: 'Diamond',
        nameTr: 'Elmas',
        description: 'Crystal clear brilliance',
        descriptionTr: 'Kristal berraklığı',
        type: 'tile_skin',
        icon: '💎',
        rarity: 'legendary',
        unlockMethod: { type: 'achievement', value: 'grandmaster' }
    },
    
    // ========== BOARD THEMES ==========
    {
        id: 'theme_cyberpunk',
        name: 'Cyberpunk',
        nameTr: 'Cyberpunk',
        description: 'Neon city vibes',
        descriptionTr: 'Neon şehir havası',
        type: 'board_theme',
        icon: '🌃',
        rarity: 'common',
        unlockMethod: { type: 'default' },
        cssVariables: {
            '--color-bg-primary': '#020617',
            '--color-accent-1': '#22d3ee',
            '--color-accent-2': '#e879f9'
        }
    },
    {
        id: 'theme_matrix',
        name: 'Matrix',
        nameTr: 'Matrix',
        description: 'Green code rain',
        descriptionTr: 'Yeşil kod yağmuru',
        type: 'board_theme',
        icon: '💚',
        rarity: 'rare',
        unlockMethod: { type: 'level', value: 10 },
        cssVariables: {
            '--color-bg-primary': '#0a0a0a',
            '--color-accent-1': '#22c55e',
            '--color-accent-2': '#86efac'
        }
    },
    {
        id: 'theme_sunset',
        name: 'Sunset',
        nameTr: 'Gün Batımı',
        description: 'Warm orange tones',
        descriptionTr: 'Sıcak turuncu tonlar',
        type: 'board_theme',
        icon: '🌅',
        rarity: 'rare',
        unlockMethod: { type: 'purchase', value: 500 }
    },
    {
        id: 'theme_arctic',
        name: 'Arctic',
        nameTr: 'Kutup',
        description: 'Icy blue atmosphere',
        descriptionTr: 'Buzlu mavi atmosfer',
        type: 'board_theme',
        icon: '❄️',
        rarity: 'epic',
        unlockMethod: { type: 'achievement', value: 'unstoppable' }
    },
    {
        id: 'theme_galaxy',
        name: 'Galaxy',
        nameTr: 'Galaksi',
        description: 'Deep space dreams',
        descriptionTr: 'Derin uzay rüyaları',
        type: 'board_theme',
        icon: '🌌',
        rarity: 'legendary',
        unlockMethod: { type: 'level', value: 50 }
    },
    
    // ========== PARTICLE EFFECTS ==========
    {
        id: 'effect_sparks',
        name: 'Electric Sparks',
        nameTr: 'Elektrik Kıvılcımları',
        description: 'Sparks on connections',
        descriptionTr: 'Bağlantılarda kıvılcımlar',
        type: 'particle_effect',
        icon: '⚡',
        rarity: 'common',
        unlockMethod: { type: 'default' }
    },
    {
        id: 'effect_confetti',
        name: 'Confetti Burst',
        nameTr: 'Konfeti Patlaması',
        description: 'Celebration confetti',
        descriptionTr: 'Kutlama konfetisi',
        type: 'particle_effect',
        icon: '🎊',
        rarity: 'rare',
        unlockMethod: { type: 'level', value: 8 }
    },
    {
        id: 'effect_fireworks',
        name: 'Fireworks',
        nameTr: 'Havai Fişek',
        description: 'Victory fireworks',
        descriptionTr: 'Zafer havai fişekleri',
        type: 'particle_effect',
        icon: '🎆',
        rarity: 'epic',
        unlockMethod: { type: 'achievement', value: 'century_club' }
    },
    
    // ========== PROFILE FRAMES ==========
    {
        id: 'frame_default',
        name: 'Basic',
        nameTr: 'Temel',
        description: 'Simple circle frame',
        descriptionTr: 'Basit daire çerçeve',
        type: 'profile_frame',
        icon: '⭕',
        rarity: 'common',
        unlockMethod: { type: 'default' }
    },
    {
        id: 'frame_fire',
        name: 'Fire Ring',
        nameTr: 'Ateş Halkası',
        description: 'Burning flame border',
        descriptionTr: 'Yanan alev kenarlık',
        type: 'profile_frame',
        icon: '🔥',
        rarity: 'epic',
        unlockMethod: { type: 'streak', value: 30 }
    },
    {
        id: 'frame_crown',
        name: 'Royal Crown',
        nameTr: 'Kraliyet Tacı',
        description: 'Golden crown frame',
        descriptionTr: 'Altın taç çerçeve',
        type: 'profile_frame',
        icon: '👑',
        rarity: 'legendary',
        unlockMethod: { type: 'achievement', value: 'legend' }
    },
    
    // ========== VICTORY ANIMATIONS ==========
    {
        id: 'victory_default',
        name: 'Standard',
        nameTr: 'Standart',
        description: 'Classic win animation',
        descriptionTr: 'Klasik kazanma animasyonu',
        type: 'victory_animation',
        icon: '✨',
        rarity: 'common',
        unlockMethod: { type: 'default' }
    },
    {
        id: 'victory_explosion',
        name: 'Explosion',
        nameTr: 'Patlama',
        description: 'Dramatic explosion',
        descriptionTr: 'Dramatik patlama',
        type: 'victory_animation',
        icon: '💥',
        rarity: 'rare',
        unlockMethod: { type: 'purchase', value: 300 }
    },
    {
        id: 'victory_rainbow',
        name: 'Rainbow Wave',
        nameTr: 'Gökkuşağı Dalgası',
        description: 'Colorful wave effect',
        descriptionTr: 'Renkli dalga efekti',
        type: 'victory_animation',
        icon: '🌊',
        rarity: 'epic',
        unlockMethod: { type: 'level', value: 25 }
    }
];

// ============================================
// STORAGE & STATE
// ============================================

const STORAGE_KEY = 'flowstate_unlockables_v1';
const EQUIPPED_KEY = 'flowstate_equipped_v1';

interface UnlockableState {
    unlockedIds: string[];
    equipped: Record<UnlockableType, string>;
}

const DEFAULT_STATE: UnlockableState = {
    unlockedIds: ['tile_default', 'theme_cyberpunk', 'effect_sparks', 'frame_default', 'victory_default'],
    equipped: {
        tile_skin: 'tile_default',
        board_theme: 'theme_cyberpunk',
        particle_effect: 'effect_sparks',
        profile_frame: 'frame_default',
        victory_animation: 'victory_default'
    }
};

export const loadUnlockableState = (): UnlockableState => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const equipped = localStorage.getItem(EQUIPPED_KEY);
        if (saved && equipped) {
            return {
                unlockedIds: JSON.parse(saved),
                equipped: JSON.parse(equipped)
            };
        }
    } catch (e) {
        console.warn('Failed to load unlockables:', e);
    }
    return { ...DEFAULT_STATE };
};

export const saveUnlockableState = (state: UnlockableState): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.unlockedIds));
        localStorage.setItem(EQUIPPED_KEY, JSON.stringify(state.equipped));
    } catch (e) {
        console.warn('Failed to save unlockables:', e);
    }
};

// ============================================
// API FUNCTIONS
// ============================================

export const isUnlocked = (id: string): boolean => {
    const state = loadUnlockableState();
    return state.unlockedIds.includes(id);
};

export const unlock = (id: string): boolean => {
    const state = loadUnlockableState();
    if (!state.unlockedIds.includes(id)) {
        state.unlockedIds.push(id);
        saveUnlockableState(state);
        return true;
    }
    return false;
};

export const getEquipped = (type: UnlockableType): string => {
    const state = loadUnlockableState();
    return state.equipped[type];
};

export const equip = (id: string): boolean => {
    const unlockable = UNLOCKABLES.find(u => u.id === id);
    if (!unlockable) return false;
    
    const state = loadUnlockableState();
    if (!state.unlockedIds.includes(id)) return false;
    
    state.equipped[unlockable.type] = id;
    saveUnlockableState(state);
    return true;
};

export const getUnlockablesByType = (type: UnlockableType): Unlockable[] => {
    return UNLOCKABLES.filter(u => u.type === type);
};

export const getUnlockedByType = (type: UnlockableType): Unlockable[] => {
    const state = loadUnlockableState();
    return UNLOCKABLES.filter(u => u.type === type && state.unlockedIds.includes(u.id));
};

export const getUnlockProgress = (): { total: number; unlocked: number; percentage: number } => {
    const state = loadUnlockableState();
    const total = UNLOCKABLES.length;
    const unlocked = state.unlockedIds.length;
    return {
        total,
        unlocked,
        percentage: Math.round((unlocked / total) * 100)
    };
};
