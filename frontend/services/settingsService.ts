/**
 * Settings Service - Manages game settings and preferences
 */

export interface GameSettings {
  // Audio Settings
  masterVolume: number; // 0-100
  sfxVolume: number; // 0-100
  musicVolume: number; // 0-100
  muteAll: boolean;
  
  // Visual Settings
  animationsEnabled: boolean;
  reducedMotion: boolean;
  showScanlines: boolean;
  
  // Game Settings
  confirmReset: boolean;
  showTimer: boolean;
  
  // Accessibility
  highContrast: boolean;
  
  // Data
  playerName: string;
}

const STORAGE_KEY = 'flowstate_settings_v1';

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 80,
  sfxVolume: 100,
  musicVolume: 70,
  muteAll: false,
  animationsEnabled: true,
  reducedMotion: false,
  showScanlines: true,
  confirmReset: true,
  showTimer: true,
  highContrast: false,
  playerName: 'NETRUNNER'
};

/**
 * Load settings from localStorage
 */
export function loadSettings(): GameSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

/**
 * Reset settings to defaults
 */
export function resetSettings(): GameSettings {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_SETTINGS };
}

/**
 * Get a single setting value
 */
export function getSetting<K extends keyof GameSettings>(key: K): GameSettings[K] {
  const settings = loadSettings();
  return settings[key];
}

/**
 * Update a single setting
 */
export function updateSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
  const settings = loadSettings();
  settings[key] = value;
  saveSettings(settings);
}

/**
 * Calculate effective volume (considering mute and master)
 */
export function getEffectiveVolume(type: 'sfx' | 'music'): number {
  const settings = loadSettings();
  if (settings.muteAll) return 0;
  
  const masterMultiplier = settings.masterVolume / 100;
  const typeVolume = type === 'sfx' ? settings.sfxVolume : settings.musicVolume;
  
  return (typeVolume / 100) * masterMultiplier;
}

/**
 * Check if user prefers reduced motion
 */
export function shouldReduceMotion(): boolean {
  const settings = loadSettings();
  if (settings.reducedMotion) return true;
  
  // Also respect system preference
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
}
