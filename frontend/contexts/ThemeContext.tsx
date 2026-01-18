import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeId, ThemeMode, Theme, THEMES, DEFAULT_THEME, DEFAULT_MODE, getThemeCSSVariables } from '../constants/themes';

const STORAGE_KEY_THEME = 'flowstate_theme';
const STORAGE_KEY_MODE = 'flowstate_mode';

interface ThemeContextValue {
    themeId: ThemeId;
    mode: ThemeMode;
    theme: Theme;
    colors: Theme['colors']['dark'];
    effects: Theme['effects'];
    setTheme: (id: ThemeId) => void;
    setMode: (mode: ThemeMode) => void;
    toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [themeId, setThemeId] = useState<ThemeId>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_THEME);
        return (saved as ThemeId) || DEFAULT_THEME;
    });

    const [mode, setModeState] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_MODE);
        if (saved) return saved as ThemeMode;
        // Check system preference
        if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return DEFAULT_MODE;
    });

    const theme = THEMES[themeId];
    const colors = theme.colors[mode];
    const effects = theme.effects;

    // Apply CSS variables to document root
    useEffect(() => {
        const cssVars = getThemeCSSVariables(theme, mode);
        const root = document.documentElement;

        Object.entries(cssVars).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        // Apply theme classes to body
        document.body.classList.remove('theme-cyberpunk', 'theme-retro', 'theme-neon', 'theme-matrix');
        document.body.classList.remove('mode-dark', 'mode-light');
        document.body.classList.add(`theme-${themeId}`);
        document.body.classList.add(`mode-${mode}`);

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', colors.bgPrimary);
        }
    }, [themeId, mode, theme, colors]);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_THEME, themeId);
    }, [themeId]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_MODE, mode);
    }, [mode]);

    const setTheme = (id: ThemeId) => {
        setThemeId(id);
    };

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
    };

    const toggleMode = () => {
        setModeState(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const value: ThemeContextValue = {
        themeId,
        mode,
        theme,
        colors,
        effects,
        setTheme,
        setMode,
        toggleMode,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Export types for convenience
export type { ThemeId, ThemeMode, Theme };
