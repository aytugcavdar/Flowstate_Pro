// Theme definitions for Flowstate
// Each theme defines colors and visual effects

export type ThemeId = 'cyberpunk' | 'retro' | 'neon' | 'matrix';
export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  // Background
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  
  // Accents
  accent1: string;      // Primary accent (cyan in cyberpunk)
  accent2: string;      // Secondary accent (magenta in cyberpunk)
  accentGlow: string;   // Glow color for effects
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Game specific
  flowCyan: string;
  flowMagenta: string;
  flowWhite: string;
  
  // UI Elements
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface ThemeEffects {
  glow: boolean;
  scanlines: boolean;
  grid: boolean;
  particles: boolean;
}

export interface Theme {
  id: ThemeId;
  name: string;
  nameKey: string;  // Translation key
  icon: string;     // Emoji icon for theme selector
  colors: {
    dark: ThemeColors;
    light: ThemeColors;
  };
  effects: ThemeEffects;
}

export const THEMES: Record<ThemeId, Theme> = {
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    nameKey: 'theme_cyberpunk',
    icon: '🌃',
    colors: {
      dark: {
        bgPrimary: '#020617',      // slate-950
        bgSecondary: '#0f172a',    // slate-900
        bgTertiary: '#1e293b',     // slate-800
        accent1: '#22d3ee',        // cyan-400
        accent2: '#e879f9',        // fuchsia-400
        accentGlow: '#06b6d4',     // cyan-500
        textPrimary: '#f1f5f9',    // slate-100
        textSecondary: '#94a3b8',  // slate-400
        textMuted: '#64748b',      // slate-500
        flowCyan: '#22d3ee',
        flowMagenta: '#e879f9',
        flowWhite: '#ffffff',
        border: '#334155',         // slate-700
        success: '#22c55e',        // green-500
        warning: '#eab308',        // yellow-500
        error: '#ef4444',          // red-500
      },
      light: {
        bgPrimary: '#f8fafc',      // slate-50
        bgSecondary: '#e2e8f0',    // slate-200
        bgTertiary: '#cbd5e1',     // slate-300
        accent1: '#0891b2',        // cyan-600
        accent2: '#c026d3',        // fuchsia-600
        accentGlow: '#06b6d4',
        textPrimary: '#0f172a',    // slate-900
        textSecondary: '#475569',  // slate-600
        textMuted: '#94a3b8',      // slate-400
        flowCyan: '#0891b2',
        flowMagenta: '#c026d3',
        flowWhite: '#1e293b',
        border: '#cbd5e1',
        success: '#16a34a',
        warning: '#ca8a04',
        error: '#dc2626',
      }
    },
    effects: {
      glow: true,
      scanlines: true,
      grid: true,
      particles: true,
    }
  },
  
  retro: {
    id: 'retro',
    name: 'Retro Arcade',
    nameKey: 'theme_retro',
    icon: '👾',
    colors: {
      dark: {
        bgPrimary: '#1a1a2e',
        bgSecondary: '#16213e',
        bgTertiary: '#0f3460',
        accent1: '#e94560',        // Hot pink
        accent2: '#f9ed69',        // Yellow
        accentGlow: '#e94560',
        textPrimary: '#ffffff',
        textSecondary: '#a0a0a0',
        textMuted: '#666666',
        flowCyan: '#4ecca3',       // Teal
        flowMagenta: '#e94560',    // Hot pink
        flowWhite: '#f9ed69',      // Yellow (mixed)
        border: '#0f3460',
        success: '#4ecca3',
        warning: '#f9ed69',
        error: '#e94560',
      },
      light: {
        bgPrimary: '#fff5f5',
        bgSecondary: '#ffe4e6',
        bgTertiary: '#fecdd3',
        accent1: '#be123c',
        accent2: '#854d0e',
        accentGlow: '#e94560',
        textPrimary: '#1a1a2e',
        textSecondary: '#4a4a4a',
        textMuted: '#888888',
        flowCyan: '#0d9488',
        flowMagenta: '#be123c',
        flowWhite: '#854d0e',
        border: '#fecdd3',
        success: '#0d9488',
        warning: '#854d0e',
        error: '#be123c',
      }
    },
    effects: {
      glow: true,
      scanlines: false,
      grid: false,
      particles: true,
    }
  },
  
  neon: {
    id: 'neon',
    name: 'Neon Dreams',
    nameKey: 'theme_neon',
    icon: '✨',
    colors: {
      dark: {
        bgPrimary: '#0a0a0a',
        bgSecondary: '#171717',
        bgTertiary: '#262626',
        accent1: '#00ff88',        // Neon green
        accent2: '#ff00ff',        // Neon pink
        accentGlow: '#00ff88',
        textPrimary: '#ffffff',
        textSecondary: '#a3a3a3',
        textMuted: '#737373',
        flowCyan: '#00ff88',
        flowMagenta: '#ff00ff',
        flowWhite: '#ffffff',
        border: '#404040',
        success: '#00ff88',
        warning: '#ffff00',
        error: '#ff0044',
      },
      light: {
        bgPrimary: '#fafafa',
        bgSecondary: '#f4f4f5',
        bgTertiary: '#e4e4e7',
        accent1: '#059669',
        accent2: '#a21caf',
        accentGlow: '#10b981',
        textPrimary: '#18181b',
        textSecondary: '#52525b',
        textMuted: '#a1a1aa',
        flowCyan: '#059669',
        flowMagenta: '#a21caf',
        flowWhite: '#18181b',
        border: '#d4d4d8',
        success: '#059669',
        warning: '#ca8a04',
        error: '#dc2626',
      }
    },
    effects: {
      glow: true,
      scanlines: false,
      grid: true,
      particles: true,
    }
  },
  
  matrix: {
    id: 'matrix',
    name: 'Matrix',
    nameKey: 'theme_matrix',
    icon: '💊',
    colors: {
      dark: {
        bgPrimary: '#000000',
        bgSecondary: '#001100',
        bgTertiary: '#002200',
        accent1: '#00ff00',        // Matrix green
        accent2: '#00cc00',        // Darker green
        accentGlow: '#00ff00',
        textPrimary: '#00ff00',
        textSecondary: '#00cc00',
        textMuted: '#008800',
        flowCyan: '#00ff00',
        flowMagenta: '#88ff88',
        flowWhite: '#ffffff',
        border: '#003300',
        success: '#00ff00',
        warning: '#88ff00',
        error: '#ff0000',
      },
      light: {
        bgPrimary: '#f0fff0',
        bgSecondary: '#dcfce7',
        bgTertiary: '#bbf7d0',
        accent1: '#15803d',
        accent2: '#166534',
        accentGlow: '#22c55e',
        textPrimary: '#052e16',
        textSecondary: '#166534',
        textMuted: '#4ade80',
        flowCyan: '#15803d',
        flowMagenta: '#22c55e',
        flowWhite: '#052e16',
        border: '#86efac',
        success: '#15803d',
        warning: '#65a30d',
        error: '#b91c1c',
      }
    },
    effects: {
      glow: true,
      scanlines: true,
      grid: true,
      particles: false,
    }
  }
};

export const DEFAULT_THEME: ThemeId = 'cyberpunk';
export const DEFAULT_MODE: ThemeMode = 'dark';

// Helper to get CSS variables from theme
export function getThemeCSSVariables(theme: Theme, mode: ThemeMode): Record<string, string> {
  const colors = theme.colors[mode];
  return {
    '--color-bg-primary': colors.bgPrimary,
    '--color-bg-secondary': colors.bgSecondary,
    '--color-bg-tertiary': colors.bgTertiary,
    '--color-accent-1': colors.accent1,
    '--color-accent-2': colors.accent2,
    '--color-accent-glow': colors.accentGlow,
    '--color-text-primary': colors.textPrimary,
    '--color-text-secondary': colors.textSecondary,
    '--color-text-muted': colors.textMuted,
    '--color-flow-cyan': colors.flowCyan,
    '--color-flow-magenta': colors.flowMagenta,
    '--color-flow-white': colors.flowWhite,
    '--color-border': colors.border,
    '--color-success': colors.success,
    '--color-warning': colors.warning,
    '--color-error': colors.error,
  };
}
