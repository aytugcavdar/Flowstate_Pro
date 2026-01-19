/**
 * Asset Preloader Service
 * Preloads audio, images, and fonts for smoother gameplay
 */

// Track preload status
let preloadComplete = false;
let preloadPromise: Promise<void> | null = null;

// Audio files to preload
const AUDIO_FILES = [
  '/sounds/click.mp3',
  '/sounds/rotate.wav', 
  '/sounds/power.mp3',
  '/sounds/glitch.mp3',
  '/sounds/win.mp3',
  '/sounds/music.mp3',
];

// Fonts to preload
const FONTS = [
  { family: 'JetBrains Mono', url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap' },
];

/**
 * Preload a single audio file
 */
async function preloadAudio(src: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.oncanplaythrough = () => resolve();
      audio.onerror = () => resolve(); // Don't fail on missing files
      audio.src = src;
    } catch {
      resolve();
    }
  });
}

/**
 * Preload font
 */
async function preloadFont(url: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => resolve();
      document.head.appendChild(link);
    } catch {
      resolve();
    }
  });
}

/**
 * Preload all assets
 */
export async function preloadAssets(): Promise<void> {
  if (preloadComplete) return;
  if (preloadPromise) return preloadPromise;

  preloadPromise = (async () => {
    console.log('[Preload] Starting asset preload...');
    const start = Date.now();

    try {
      // Preload audio files
      await Promise.all(AUDIO_FILES.map(preloadAudio));
      
      // Preload fonts
      await Promise.all(FONTS.map(f => preloadFont(f.url)));

      const duration = Date.now() - start;
      console.log(`[Preload] Complete in ${duration}ms`);
      preloadComplete = true;
    } catch (e) {
      console.warn('[Preload] Error:', e);
      preloadComplete = true; // Mark complete anyway to not block app
    }
  })();

  return preloadPromise;
}

/**
 * Check if preload is complete
 */
export function isPreloadComplete(): boolean {
  return preloadComplete;
}

/**
 * Start preload in background (call early, e.g., on app mount)
 */
export function startBackgroundPreload(): void {
  setTimeout(() => {
    preloadAssets();
  }, 100); // Small delay to not block initial render
}
