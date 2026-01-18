/**
 * Haptic Feedback Service
 * Provides vibration feedback for mobile devices
 */

import { loadSettings } from './settingsService';

// Vibration patterns (in milliseconds)
export const HAPTIC_PATTERNS = {
    // Simple patterns
    click: [5],
    light: [10],
    medium: [20],
    heavy: [40],
    
    // Complex patterns [vibrate, pause, vibrate, ...]
    success: [30, 50, 30, 50, 80],
    error: [100, 30, 100],
    warning: [50, 30, 50],
    
    // Game-specific
    tileRotate: [8],
    tileFlow: [15, 20, 15],
    levelComplete: [50, 50, 50, 50, 100],
    badgeUnlock: [30, 30, 50, 30, 100],
    coinEarn: [10, 20, 10],
    powerupUse: [20, 40, 60],
} as const;

export type HapticPattern = keyof typeof HAPTIC_PATTERNS;

// Check if vibration is supported
export function isHapticSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

// Get intensity multiplier based on setting
function getIntensityMultiplier(): number {
    const settings = loadSettings();
    const intensity = (settings as any).hapticIntensity || 'medium';
    
    switch (intensity) {
        case 'light': return 0.5;
        case 'heavy': return 1.5;
        default: return 1;
    }
}

// Apply intensity to pattern
function applyIntensity(pattern: number[], multiplier: number): number[] {
    return pattern.map((duration, index) => {
        // Only modify vibration durations (even indices), not pauses
        if (index % 2 === 0) {
            return Math.round(duration * multiplier);
        }
        return duration;
    });
}

/**
 * Trigger haptic feedback with specified pattern
 */
export function triggerHaptic(pattern: HapticPattern = 'click'): boolean {
    // Check if haptic is enabled in settings
    const settings = loadSettings();
    const hapticEnabled = (settings as any).hapticEnabled !== false; // Default true
    
    if (!hapticEnabled || !isHapticSupported()) {
        return false;
    }
    
    try {
        const basePattern = HAPTIC_PATTERNS[pattern];
        const multiplier = getIntensityMultiplier();
        const finalPattern = applyIntensity([...basePattern], multiplier);
        
        return navigator.vibrate(finalPattern);
    } catch (e) {
        console.warn('Haptic feedback failed:', e);
        return false;
    }
}

/**
 * Stop any ongoing vibration
 */
export function stopHaptic(): void {
    if (isHapticSupported()) {
        navigator.vibrate(0);
    }
}

/**
 * Quick haptic for common actions
 */
export const haptic = {
    click: () => triggerHaptic('click'),
    light: () => triggerHaptic('light'),
    medium: () => triggerHaptic('medium'),
    heavy: () => triggerHaptic('heavy'),
    success: () => triggerHaptic('success'),
    error: () => triggerHaptic('error'),
    warning: () => triggerHaptic('warning'),
    tileRotate: () => triggerHaptic('tileRotate'),
    tileFlow: () => triggerHaptic('tileFlow'),
    levelComplete: () => triggerHaptic('levelComplete'),
    badgeUnlock: () => triggerHaptic('badgeUnlock'),
    coinEarn: () => triggerHaptic('coinEarn'),
    powerupUse: () => triggerHaptic('powerupUse'),
};
