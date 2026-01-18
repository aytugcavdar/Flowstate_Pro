
import React from 'react';
import { TRANSLATIONS, Language } from '../constants/translations';
import { PlayerProfile, CampaignLevel } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { canClaimReward } from '../services/rewardService';

interface HeaderProps {
    moves: number;
    mode: string; // 'DAILY' | 'PRACTICE' | 'CAMPAIGN'
    lang: Language;
    setLang: (l: Language) => void;
    setMode: (m: 'DAILY' | 'PRACTICE' | 'CAMPAIGN') => void;
    onOpenProfile: () => void;
    onOpenTheme: () => void;
    onOpenSettings: () => void;
    onOpenLeaderboard: () => void;
    onOpenAchievements: () => void;
    onOpenRewards: () => void;
    profile: PlayerProfile;
    campaignLevel?: CampaignLevel | null;
    currentStars?: number; // 0-3 for current run
}

export const Header: React.FC<HeaderProps> = ({
    moves, mode, lang, setLang, setMode,
    onOpenProfile, onOpenTheme, onOpenSettings, onOpenLeaderboard, onOpenAchievements, onOpenRewards,
    profile, campaignLevel, currentStars
}) => {
    const t = TRANSLATIONS[lang];
    const { mode: themeMode } = useTheme();
    const hasReward = canClaimReward();

    return (
        <header
            className="w-full max-w-lg p-4 pb-2 border-b backdrop-blur-md sticky top-0 z-20"
            style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)'
            }}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-1.5">
                    <h1
                        className="text-xl font-black tracking-tighter bg-clip-text text-transparent"
                        style={{
                            backgroundImage: `linear-gradient(to right, var(--color-accent-1), var(--color-accent-2))`
                        }}
                    >
                        {t.title}
                    </h1>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1 ml-2">
                        {/* Daily Reward (with indicator) */}
                        <button
                            onClick={onOpenRewards}
                            className={`text-sm px-1.5 py-1 rounded transition-all hover:scale-110 relative
                                ${hasReward ? 'animate-pulse' : ''}`}
                            style={{
                                backgroundColor: 'var(--color-bg-tertiary)',
                                border: `1px solid ${hasReward ? 'var(--color-warning)' : 'var(--color-border)'}`,
                            }}
                            title={lang === 'tr' ? 'Günlük Ödül' : 'Daily Reward'}
                        >
                            🎁
                            {hasReward && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </button>

                        {/* Leaderboard */}
                        {mode === 'DAILY' && (
                            <button
                                onClick={onOpenLeaderboard}
                                className="text-sm px-1.5 py-1 rounded transition-all hover:scale-110"
                                style={{
                                    backgroundColor: 'var(--color-bg-tertiary)',
                                    border: '1px solid var(--color-border)',
                                }}
                                title={lang === 'tr' ? 'Skor Tablosu' : 'Leaderboard'}
                            >
                                🏆
                            </button>
                        )}

                        {/* Achievements */}
                        <button
                            onClick={onOpenAchievements}
                            className="text-sm px-1.5 py-1 rounded transition-all hover:scale-110"
                            style={{
                                backgroundColor: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                            }}
                            title={lang === 'tr' ? 'Başarımlar' : 'Achievements'}
                        >
                            🏅
                        </button>

                        {/* Settings */}
                        <button
                            onClick={onOpenSettings}
                            className="text-sm px-1.5 py-1 rounded transition-all hover:scale-110"
                            style={{
                                backgroundColor: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                            }}
                            title={lang === 'tr' ? 'Ayarlar' : 'Settings'}
                        >
                            ⚙️
                        </button>
                    </div>
                </div>
                <div className="text-right flex items-center gap-4">
                    {/* Level Indicator */}
                    <button onClick={onOpenProfile} className="flex flex-col items-end group">
                        <div className="flex items-center gap-2">
                            <span
                                className="text-xs font-bold tracking-widest opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{ color: 'var(--color-warning)' }}
                            >
                                LVL {profile.level}
                            </span>
                            <span className="text-2xl hover:scale-110 transition-transform">👤</span>
                        </div>
                        <div
                            className="w-12 h-1 rounded-full mt-1 overflow-hidden"
                            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                        >
                            <div
                                className="h-full"
                                style={{
                                    width: `${(profile.xp % 1000) / 10}%`,
                                    backgroundColor: 'var(--color-warning)'
                                }}
                            ></div>
                        </div>
                    </button>

                    <div>
                        <span
                            className="block text-[10px] uppercase tracking-wider"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            {t.moves}
                        </span>
                        <div className="flex items-baseline gap-2 justify-end">
                            <span
                                className="font-bold font-mono text-xl"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                {moves}
                            </span>
                            {/* Star Preview for Campaign */}
                            {mode === 'CAMPAIGN' && currentStars !== undefined && (
                                <div className="flex text-xs">
                                    {[1, 2, 3].map(s => (
                                        <span
                                            key={s}
                                            style={{ color: s <= currentStars ? 'var(--color-warning)' : 'var(--color-bg-tertiary)' }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mode Switcher or Level Title */}
            {mode === 'CAMPAIGN' && campaignLevel ? (
                <div
                    className="p-2 rounded flex justify-between items-center animate-in slide-in-from-top-2"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                    <button
                        onClick={() => setMode('CAMPAIGN')}
                        className="text-xs hover:underline"
                        style={{ color: 'var(--color-accent-1)' }}
                    >
                        ← {t.buttons.back}
                    </button>
                    <span
                        className="text-xs font-bold tracking-widest"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        {campaignLevel.title.toUpperCase()}
                    </span>
                    <div
                        className="text-[10px]"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        PAR: {campaignLevel.parMoves}
                    </div>
                </div>
            ) : (
                <div
                    className="flex p-1 rounded-lg backdrop-blur-sm mb-2"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                    {(['DAILY', 'PRACTICE', 'CAMPAIGN'] as const).map(m => {
                        const isActive = mode === m;
                        const bgColor = m === 'DAILY'
                            ? 'var(--color-accent-1)'
                            : m === 'CAMPAIGN'
                                ? 'var(--color-warning)'
                                : 'var(--color-accent-2)';

                        return (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-md transition-all ${isActive ? 'shadow-lg' : ''}`}
                                style={{
                                    backgroundColor: isActive ? bgColor : 'transparent',
                                    color: isActive ? 'var(--color-bg-primary)' : 'var(--color-text-muted)'
                                }}
                            >
                                {m === 'DAILY' ? t.modes.daily : m === 'CAMPAIGN' ? t.modes.campaign : t.modes.practice}
                            </button>
                        );
                    })}
                </div>
            )}
        </header>
    );
};
