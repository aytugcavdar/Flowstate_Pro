/**
 * Performance Utilities
 * Detects device capabilities and provides optimized settings
 */

export interface PerformanceSettings {
    particleCount: number;
    confettiParticleCount: number;
    particleAddInterval: number;
    enableComplexAnimations: boolean;
    enableParticles: boolean;
    reducedMotion: boolean;
}

// Detect if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Detect if device is likely low-end
export const isLowEndDevice = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    
    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;
    if (cores <= 2) return true;
    
    // Check device memory if available
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (nav.deviceMemory && nav.deviceMemory <= 2) return true;
    
    // Detect mobile devices (generally have less GPU power)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Mobile with low cores is definitely low-end
    if (isMobile && cores <= 4) return true;
    
    return false;
};

// Check if device is mobile
export const isMobileDevice = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Get optimal particle count based on device
export const getOptimalParticleCount = (baseCount: number): number => {
    if (prefersReducedMotion()) return 0;
    if (isLowEndDevice()) return Math.floor(baseCount * 0.3);
    if (isMobileDevice()) return Math.floor(baseCount * 0.5);
    return baseCount;
};

// Get comprehensive performance settings (combines device detection with user preferences)
export const getPerformanceSettings = (): PerformanceSettings => {
    const systemReducedMotion = prefersReducedMotion();
    const lowEnd = isLowEndDevice();
    const mobile = isMobileDevice();
    
    // Try to load user settings
    let userSettings: { 
        animationLevel?: string; 
        showConfetti?: boolean; 
        showParticles?: boolean;
        reducedMotion?: boolean;
    } = {};
    
    try {
        const saved = localStorage.getItem('flowstate_settings_v1');
        if (saved) {
            userSettings = JSON.parse(saved);
        }
    } catch (e) {
        // Use defaults if settings not available
    }
    
    // User's explicit preferences take priority
    const userReducedMotion = userSettings.reducedMotion || systemReducedMotion;
    const animationLevel = userSettings.animationLevel || 'full';
    const showConfetti = userSettings.showConfetti !== false;
    const showParticles = userSettings.showParticles !== false;
    
    // If user explicitly disabled or reduced motion
    if (userReducedMotion || animationLevel === 'minimal') {
        return {
            particleCount: 0,
            confettiParticleCount: 0,
            particleAddInterval: 500,
            enableComplexAnimations: false,
            enableParticles: false,
            reducedMotion: true,
        };
    }
    
    // Reduced animation level
    if (animationLevel === 'reduced') {
        return {
            particleCount: showParticles ? 20 : 0,
            confettiParticleCount: showConfetti ? 30 : 0,
            particleAddInterval: 300,
            enableComplexAnimations: false,
            enableParticles: showParticles,
            reducedMotion: false,
        };
    }
    
    // Full animations but respect individual toggles
    if (lowEnd) {
        return {
            particleCount: showParticles ? 30 : 0,
            confettiParticleCount: showConfetti ? 40 : 0,
            particleAddInterval: 250,
            enableComplexAnimations: false,
            enableParticles: showParticles,
            reducedMotion: false,
        };
    }
    
    if (mobile) {
        return {
            particleCount: showParticles ? 50 : 0,
            confettiParticleCount: showConfetti ? 60 : 0,
            particleAddInterval: 150,
            enableComplexAnimations: true,
            enableParticles: showParticles,
            reducedMotion: false,
        };
    }
    
    // Desktop/high-end
    return {
        particleCount: showParticles ? 80 : 0,
        confettiParticleCount: showConfetti ? 100 : 0,
        particleAddInterval: 100,
        enableComplexAnimations: true,
        enableParticles: showParticles,
        reducedMotion: false,
    };
};

// Frame rate limiter for animations
export class FrameRateLimiter {
    private lastFrameTime = 0;
    private readonly minFrameTime: number;
    
    constructor(targetFps: number = 30) {
        this.minFrameTime = 1000 / targetFps;
    }
    
    shouldRenderFrame(): boolean {
        const now = performance.now();
        if (now - this.lastFrameTime >= this.minFrameTime) {
            this.lastFrameTime = now;
            return true;
        }
        return false;
    }
}
