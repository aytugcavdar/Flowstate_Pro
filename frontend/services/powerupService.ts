/**
 * Power-up Service - Inventory management for consumable power-ups
 */

import { syncInventoryToCloud, CloudInventory } from './cloudSyncService';

// ============================================
// TYPES
// ============================================

export interface PowerupInventory {
    hints: number;
    undos: number;
    freezes: number;  // Time freeze for SpeedRun
    coinBoostGamesLeft: number; // Remaining games with 2x coins
}

export type PowerupType = 'hint' | 'undo' | 'freeze' | 'coinBoost';

export interface PowerupUsage {
    type: PowerupType;
    timestamp: number;
    gameMode?: string;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'flowstate_powerups_v1';
const USAGE_HISTORY_KEY = 'flowstate_powerup_history';

// Mapping from shop items to powerup types
export const SHOP_TO_POWERUP: Record<string, { type: PowerupType; amount: number }> = {
    'hint_pack_3': { type: 'hint', amount: 3 },
    'hint_pack_10': { type: 'hint', amount: 10 },
    'time_freeze': { type: 'freeze', amount: 1 },
    'extra_moves_5': { type: 'undo', amount: 5 }, // Using undo for extra moves
    'coin_boost': { type: 'coinBoost', amount: 3 }, // 3 games of boost
};

const DEFAULT_INVENTORY: PowerupInventory = {
    hints: 0,
    undos: 0,
    freezes: 0,
    coinBoostGamesLeft: 0,
};

// ============================================
// STATE MANAGEMENT
// ============================================

export function loadInventory(): PowerupInventory {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return { ...DEFAULT_INVENTORY, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.warn('Failed to load powerup inventory:', e);
    }
    return { ...DEFAULT_INVENTORY };
}

function saveInventory(inventory: PowerupInventory): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
        
        // Sync to cloud (fire and forget)
        const cloudData: CloudInventory = {
            hints: inventory.hints,
            undos: inventory.undos,
            freezes: inventory.freezes,
            coin_boosts: inventory.coinBoostGamesLeft,
        };
        syncInventoryToCloud(cloudData).catch(err => console.warn('[Powerups] Cloud sync failed:', err));
    } catch (e) {
        console.warn('Failed to save powerup inventory:', e);
    }
}

// ============================================
// INVENTORY OPERATIONS
// ============================================

/**
 * Get current inventory
 */
export function getInventory(): PowerupInventory {
    return loadInventory();
}

/**
 * Get count of a specific powerup
 */
export function getPowerupCount(type: PowerupType): number {
    const inventory = loadInventory();
    switch (type) {
        case 'hint': return inventory.hints;
        case 'undo': return inventory.undos;
        case 'freeze': return inventory.freezes;
        case 'coinBoost': return inventory.coinBoostGamesLeft;
    }
}

/**
 * Check if a powerup is available
 */
export function hasPowerup(type: PowerupType): boolean {
    return getPowerupCount(type) > 0;
}

/**
 * Add powerups to inventory (after purchase)
 */
export function addPowerup(type: PowerupType, amount: number): PowerupInventory {
    const inventory = loadInventory();
    
    switch (type) {
        case 'hint':
            inventory.hints += amount;
            break;
        case 'undo':
            inventory.undos += amount;
            break;
        case 'freeze':
            inventory.freezes += amount;
            break;
        case 'coinBoost':
            inventory.coinBoostGamesLeft += amount;
            break;
    }
    
    saveInventory(inventory);
    return inventory;
}

/**
 * Use a powerup (decrements count)
 * Returns true if successful, false if not available
 */
export function usePowerup(type: PowerupType, gameMode?: string): boolean {
    const inventory = loadInventory();
    let canUse = false;
    
    switch (type) {
        case 'hint':
            if (inventory.hints > 0) {
                inventory.hints--;
                canUse = true;
            }
            break;
        case 'undo':
            if (inventory.undos > 0) {
                inventory.undos--;
                canUse = true;
            }
            break;
        case 'freeze':
            if (inventory.freezes > 0) {
                inventory.freezes--;
                canUse = true;
            }
            break;
        case 'coinBoost':
            // Coin boost is decremented when a game ends, not used directly
            if (inventory.coinBoostGamesLeft > 0) {
                inventory.coinBoostGamesLeft--;
                canUse = true;
            }
            break;
    }
    
    if (canUse) {
        saveInventory(inventory);
        logUsage(type, gameMode);
    }
    
    return canUse;
}

/**
 * Consume one coin boost game (called when game completes)
 */
export function consumeCoinBoost(): boolean {
    const inventory = loadInventory();
    if (inventory.coinBoostGamesLeft > 0) {
        inventory.coinBoostGamesLeft--;
        saveInventory(inventory);
        return true;
    }
    return false;
}

/**
 * Check if coin boost is active
 */
export function isCoinBoostActive(): boolean {
    return loadInventory().coinBoostGamesLeft > 0;
}

/**
 * Get total powerup count (for displaying in header)
 */
export function getTotalPowerupCount(): number {
    const inv = loadInventory();
    return inv.hints + inv.undos + inv.freezes;
}

// ============================================
// USAGE HISTORY
// ============================================

function logUsage(type: PowerupType, gameMode?: string): void {
    try {
        const historyJson = localStorage.getItem(USAGE_HISTORY_KEY);
        const history: PowerupUsage[] = historyJson ? JSON.parse(historyJson) : [];
        
        history.push({
            type,
            timestamp: Date.now(),
            gameMode,
        });
        
        // Keep only last 50 entries
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }
        
        localStorage.setItem(USAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        // Ignore history errors
    }
}

/**
 * Get powerup usage history
 */
export function getUsageHistory(): PowerupUsage[] {
    try {
        const historyJson = localStorage.getItem(USAGE_HISTORY_KEY);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch {
        return [];
    }
}

// ============================================
// SHOP INTEGRATION
// ============================================

/**
 * Process a shop purchase and add to inventory
 * Returns the updated inventory
 */
export function processPurchase(shopItemId: string): PowerupInventory | null {
    const mapping = SHOP_TO_POWERUP[shopItemId];
    if (!mapping) {
        return null; // Not a powerup item
    }
    
    return addPowerup(mapping.type, mapping.amount);
}
