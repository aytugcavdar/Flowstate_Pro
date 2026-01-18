import React, { useState } from 'react';
import { useTheme, ThemeId } from '../contexts/ThemeContext';
import { THEMES } from '../constants/themes';
import { TRANSLATIONS, Language } from '../constants/translations';
import { playSound } from '../services/audio';

interface ThemeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isOpen, onClose, lang }) => {
    const { themeId, mode, setTheme, toggleMode } = useTheme();
    const t = TRANSLATIONS[lang];
    const [hoveredTheme, setHoveredTheme] = useState<ThemeId | null>(null);

    if (!isOpen) return null;

    const themeList = Object.values(THEMES);

    const handleThemeSelect = (id: ThemeId) => {
        playSound('click');
        setTheme(id);
    };

    const handleModeToggle = () => {
        playSound('click');
        toggleMode();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {t.themes?.title || 'Theme Settings'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Dark/Light Mode Toggle */}
                <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            {t.themes?.mode || 'Display Mode'}
                        </span>
                        <button
                            onClick={handleModeToggle}
                            className="relative w-16 h-8 rounded-full transition-colors"
                            style={{ backgroundColor: mode === 'dark' ? 'var(--color-accent-1)' : 'var(--color-bg-tertiary)' }}
                        >
                            <div
                                className="absolute top-1 w-6 h-6 rounded-full transition-all duration-200 flex items-center justify-center text-sm"
                                style={{
                                    left: mode === 'dark' ? '2rem' : '0.25rem',
                                    backgroundColor: 'var(--color-bg-primary)'
                                }}
                            >
                                {mode === 'dark' ? '🌙' : '☀️'}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Theme Grid */}
                <div className="p-4">
                    <p className="text-xs mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                        {t.themes?.select || 'Select Theme'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {themeList.map((theme) => {
                            const isActive = theme.id === themeId;
                            const isHovered = theme.id === hoveredTheme;
                            const previewColors = theme.colors[mode];

                            return (
                                <button
                                    key={theme.id}
                                    onClick={() => handleThemeSelect(theme.id)}
                                    onMouseEnter={() => setHoveredTheme(theme.id)}
                                    onMouseLeave={() => setHoveredTheme(null)}
                                    className={`relative p-3 rounded-lg transition-all duration-200 ${isActive ? 'ring-2' : ''} ${isHovered ? 'scale-105' : ''}`}
                                    style={{
                                        backgroundColor: previewColors.bgSecondary,
                                        borderColor: previewColors.border,
                                        border: `1px solid ${previewColors.border}`,
                                        ringColor: previewColors.accent1,
                                    }}
                                >
                                    {/* Color Preview */}
                                    <div className="flex gap-1 mb-2">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: previewColors.accent1 }}
                                        />
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: previewColors.accent2 }}
                                        />
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: previewColors.flowCyan }}
                                        />
                                    </div>

                                    {/* Theme Name */}
                                    <span
                                        className="text-sm font-bold block text-left"
                                        style={{ color: previewColors.textPrimary }}
                                    >
                                        {t.themes?.[theme.nameKey as keyof typeof t.themes] || theme.name}
                                    </span>

                                    {/* Active Indicator */}
                                    {isActive && (
                                        <div
                                            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                                            style={{ backgroundColor: previewColors.accent1, color: previewColors.bgPrimary }}
                                        >
                                            ✓
                                        </div>
                                    )}

                                    {/* Effect badges */}
                                    <div className="flex gap-1 mt-2">
                                        {theme.effects.glow && (
                                            <span className="text-[8px] px-1 rounded" style={{ backgroundColor: previewColors.bgTertiary, color: previewColors.textMuted }}>GLOW</span>
                                        )}
                                        {theme.effects.scanlines && (
                                            <span className="text-[8px] px-1 rounded" style={{ backgroundColor: previewColors.bgTertiary, color: previewColors.textMuted }}>CRT</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                        onClick={onClose}
                        className="w-full py-2 rounded-lg font-bold transition-colors"
                        style={{
                            backgroundColor: 'var(--color-accent-1)',
                            color: 'var(--color-bg-primary)'
                        }}
                    >
                        {t.buttons?.close || 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};
