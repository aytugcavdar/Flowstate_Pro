
import React, { useState, useEffect } from 'react';
import { TRANSLATIONS, Language } from '../constants/translations';
import { PlayerProfile, CampaignLevel, GameMode } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { canClaimReward } from '../services/rewardService';
import { getCoins } from '../services/economyService';

interface HeaderProps {
    moves: number;
    mode: GameMode;
    lang: Language;
    setLang: (l: Language) => void;
    setMode: (m: GameMode) => void;
    onOpenProfile: () => void;
    onOpenTheme: () => void;
    onOpenSettings: () => void;
    onOpenLeaderboard: () => void;
    onOpenAchievements: () => void;
    onOpenRewards: () => void;
    onOpenShop: () => void;
    profile: PlayerProfile;
    campaignLevel?: CampaignLevel | null;
    currentStars?: number;
}

export const Header: React.FC<HeaderProps> = ({
    moves, mode, lang, setLang, setMode,
    onOpenProfile, onOpenTheme, onOpenSettings, onOpenLeaderboard, onOpenAchievements, onOpenRewards, onOpenShop,
    profile, campaignLevel, currentStars
}) => {
    const t = TRANSLATIONS[lang];
    const hasReward = canClaimReward();
    const [coins, setCoins] = useState(getCoins());

    useEffect(() => {
        setCoins(getCoins());
        const interval = setInterval(() => setCoins(getCoins()), 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="w-full max-w-lg sticky top-0 z-20 safe-area-inset">
            {/* Top Bar - Clean & Minimal */}
            <div
                className="px-4 py-3 backdrop-blur-lg border-b"
                style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'var(--color-border)'
                }}
            >
                <div className="flex justify-between items-center">
                    {/* Left: Logo & Settings */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">
                            FLOWSTATE
                        </h1>
                        <button
                            onClick={onOpenSettings}
                            className="text-slate-400 hover:text-white transition-colors p-1"
                            title={lang === 'tr' ? 'Ayarlar' : 'Settings'}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>

                    {/* Center: Stats Row */}
                    <div className="flex items-center gap-4">
                        {/* Coins */}
                        <button
                            onClick={onOpenShop}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 transition-all"
                        >
                            <span className="text-sm">🪙</span>
                            <span className="text-sm font-bold text-yellow-400 font-mono">{coins}</span>
                        </button>

                        {/* Leaderboard */}
                        <button
                            onClick={onOpenLeaderboard}
                            className="p-1.5 rounded-full hover:bg-slate-800 transition-all"
                            title={lang === 'tr' ? 'Skor Tablosu' : 'Leaderboard'}
                        >
                            <span className="text-lg">🏆</span>
                        </button>

                        {/* Daily Reward */}
                        <button
                            onClick={onOpenRewards}
                            className={`relative p-1.5 rounded-full transition-all ${hasReward ? 'bg-orange-500/20 animate-pulse' : 'hover:bg-slate-800'}`}
                            title={lang === 'tr' ? 'Günlük Ödül' : 'Daily Reward'}
                        >
                            <span className="text-lg">🎁</span>
                            {hasReward && (
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900" />
                            )}
                        </button>
                    </div>

                    {/* Right: Profile & Moves */}
                    <div className="flex items-center gap-4">
                        {/* Moves Counter */}
                        <div className="text-right">
                            <div className="text-[10px] uppercase tracking-wider text-slate-500">{t.moves}</div>
                            <div className="text-xl font-bold font-mono text-white">{moves}</div>
                        </div>

                        {/* Profile */}
                        <button
                            onClick={onOpenProfile}
                            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="text-right">
                                <div className="text-xs font-bold text-cyan-400">LVL {profile.level}</div>
                                <div className="w-10 h-1 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-cyan-500"
                                        style={{ width: `${(profile.xp % 1000) / 10}%` }}
                                    />
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
                                {profile.level}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mode Tabs - Separate, Clean Row */}
            {mode === 'CAMPAIGN' && campaignLevel ? (
                <div
                    className="px-4 py-2 flex justify-between items-center"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
                >
                    <button
                        onClick={() => setMode('CAMPAIGN')}
                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                    >
                        <span>←</span> {t.buttons.back}
                    </button>
                    <span className="text-sm font-bold tracking-widest text-white">
                        {campaignLevel.title.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">PAR: {campaignLevel.parMoves}</span>
                        {currentStars !== undefined && (
                            <div className="flex gap-0.5">
                                {[1, 2, 3].map(s => (
                                    <span key={s} className={`text-sm ${s <= currentStars ? 'text-yellow-400' : 'text-slate-700'}`}>★</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div
                    className="px-3 py-2 flex gap-1"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
                >
                    {(['DAILY', 'PRACTICE', 'CAMPAIGN', 'ENDLESS'] as const).map(m => {
                        const isActive = mode === m;
                        const config = {
                            DAILY: { label: t.modes.daily, color: 'cyan', icon: '⚡' },
                            PRACTICE: { label: t.modes.practice, color: 'fuchsia', icon: '🎯' },
                            CAMPAIGN: { label: t.modes.campaign, color: 'yellow', icon: '🏆' },
                            ENDLESS: { label: '∞', color: 'green', icon: '' }
                        };
                        const { label, color } = config[m];

                        return (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isActive
                                    ? `bg-${color}-500/20 text-${color}-400 border border-${color}-500/40`
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                    }`}
                                style={isActive ? {
                                    backgroundColor: color === 'cyan' ? 'rgba(34, 211, 238, 0.15)'
                                        : color === 'fuchsia' ? 'rgba(232, 121, 249, 0.15)'
                                            : color === 'yellow' ? 'rgba(234, 179, 8, 0.15)'
                                                : 'rgba(34, 197, 94, 0.15)',
                                    color: color === 'cyan' ? '#22d3ee'
                                        : color === 'fuchsia' ? '#e879f9'
                                            : color === 'yellow' ? '#eab308'
                                                : '#22c55e',
                                    borderColor: color === 'cyan' ? 'rgba(34, 211, 238, 0.4)'
                                        : color === 'fuchsia' ? 'rgba(232, 121, 249, 0.4)'
                                            : color === 'yellow' ? 'rgba(234, 179, 8, 0.4)'
                                                : 'rgba(34, 197, 94, 0.4)'
                                } : {}}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Quick Actions - Minimal, Floating Style */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 hidden">
                {/* Reserved for future floating actions */}
            </div>
        </header>
    );
};
