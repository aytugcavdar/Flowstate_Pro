/**
 * Data Migration Service - Handles localStorage version management and data resets
 * 
 * This service manages data migration when app version changes and provides
 * functions to reset user data.
 */

// Current data schema version - INCREMENT this when you need to reset user data
// v2 -> v3: Fix NETRUNNER username issue, reset old data
const DATA_VERSION = 3;
const VERSION_KEY = 'flowstate_data_version';

// All localStorage keys used by the app
const ALL_STORAGE_KEYS = [
  // Core game state
  'flowstate_stats_v1',
  'flowstate_profile_v1',
  'flowstate_state_v1',
  
  // User identity
  'flowstate_username_v1',
  
  // Settings & preferences
  'flowstate_settings_v1',
  'flowstate_theme',
  'flowstate_mode',
  'flowstate_notifications_v1',
  
  // Game modes
  'flowstate_campaign_v1',
  'flowstate_leaderboard_v1',
  'flowstate_solutions_v1',
  'flowstate_endless_best',
  'flowstate_speedrun_bests',
  
  // Economy & rewards
  'flowstate_economy_v1',
  'flowstate_rewards_v2',
  'flowstate_powerups_v1',
  'flowstate_powerup_history',
  
  // Social & analytics
  'flowstate_referral_v1',
  'flowstate_ab_v1',
  
  // Admin
  'flowstate_admin_v1',
];

// Keys to preserve during soft reset (user identity and settings)
const PRESERVE_ON_SOFT_RESET = [
  'flowstate_username_v1',
  'flowstate_settings_v1',
  'flowstate_theme',
  'flowstate_mode',
];

/**
 * Check if data migration is needed and perform it
 * Should be called once on app startup
 */
export function checkAndMigrateData(): { migrated: boolean; fromVersion: number | null } {
  try {
    const savedVersion = localStorage.getItem(VERSION_KEY);
    const currentVersion = savedVersion ? parseInt(savedVersion, 10) : 0;
    
    if (currentVersion < DATA_VERSION) {
      console.log(`[Migration] Data version ${currentVersion} -> ${DATA_VERSION}, performing migration...`);
      
      // Perform migration based on version
      if (currentVersion < 3) {
        // Version 0/1/2 -> 3: Clear old problematic data (NETRUNNER fix)
        // Keep username and settings
        performSoftReset();
      }
      
      // Save new version
      localStorage.setItem(VERSION_KEY, DATA_VERSION.toString());
      
      console.log('[Migration] Migration complete');
      return { migrated: true, fromVersion: currentVersion };
    }
    
    return { migrated: false, fromVersion: currentVersion };
  } catch (err) {
    console.error('[Migration] Error during migration:', err);
    return { migrated: false, fromVersion: null };
  }
}

/**
 * Soft Reset - Clears game progress but keeps user identity and settings
 */
export function performSoftReset(): void {
  console.log('[Migration] Performing soft reset...');
  
  const keysToRemove = ALL_STORAGE_KEYS.filter(key => !PRESERVE_ON_SOFT_RESET.includes(key));
  
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
      console.log(`[Migration] Removed: ${key}`);
    } catch (e) {
      console.warn(`[Migration] Failed to remove ${key}:`, e);
    }
  });
  
  console.log('[Migration] Soft reset complete. Preserved:', PRESERVE_ON_SOFT_RESET);
}

/**
 * Hard Reset - Clears ALL app data including user identity
 */
export function performHardReset(): void {
  console.log('[Migration] Performing hard reset...');
  
  ALL_STORAGE_KEYS.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Migration] Failed to remove ${key}:`, e);
    }
  });
  
  // Also remove version key to trigger fresh start
  localStorage.removeItem(VERSION_KEY);
  
  console.log('[Migration] Hard reset complete. All data cleared.');
}

/**
 * Get current data version
 */
export function getDataVersion(): number {
  const saved = localStorage.getItem(VERSION_KEY);
  return saved ? parseInt(saved, 10) : 0;
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): { keyCount: number; estimatedSize: string } {
  let totalSize = 0;
  let keyCount = 0;
  
  ALL_STORAGE_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      totalSize += value.length;
      keyCount++;
    }
  });
  
  // Convert to human-readable size
  const estimatedSize = totalSize < 1024 
    ? `${totalSize} B` 
    : totalSize < 1024 * 1024 
      ? `${(totalSize / 1024).toFixed(1)} KB`
      : `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
  
  return { keyCount, estimatedSize };
}

/**
 * Export all user data as JSON (for backup)
 */
export function exportUserData(): string {
  const data: Record<string, any> = {};
  
  ALL_STORAGE_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    }
  });
  
  return JSON.stringify(data, null, 2);
}

/**
 * Import user data from JSON backup
 */
export function importUserData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    
    Object.entries(data).forEach(([key, value]) => {
      if (ALL_STORAGE_KEYS.includes(key)) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    });
    
    console.log('[Migration] Data imported successfully');
    return true;
  } catch (err) {
    console.error('[Migration] Import failed:', err);
    return false;
  }
}
