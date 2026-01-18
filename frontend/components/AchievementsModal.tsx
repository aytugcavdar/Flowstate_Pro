import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { TRANSLATIONS, Language } from '../constants/translations';
import { PlayerProfile } from '../types';
import { BADGES, getTitleForLevel } from '../services/progression';
import { playSound } from '../services/audio';

// Extended badge definitions with unlock conditions
export const ALL_BADGES = {
    // Beginner Badges
    NOVICE: {
        id: 'NOVICE',
        icon: '🌱',
        category: 'beginner',
        requirement: 'First win'
    },
    FIRST_STEPS: {
        id: 'FIRST_STEPS',
        icon: '👣',
        category: 'beginner',
        requirement: '5 wins'
    },

    // Speed Badges
    SPEED_DEMON: {
        id: 'SPEED_DEMON',
        icon: '⚡',
        category: 'speed',
        requirement: 'Under 30s'
    },
    LIGHTNING: {
        id: 'LIGHTNING',
        icon: '🌩️',
        category: 'speed',
        requirement: 'Under 20s'
    },
    TIME_MASTER: {
        id: 'TIME_MASTER',
        icon: '⏰',
        category: 'speed',
        requirement: 'Under 15s'
    },

    // Skill Badges
    NETRUNNER: {
        id: 'NETRUNNER',
        icon: '🕵️',
        category: 'skill',
        requirement: '5 no-hint wins'
    },
    ARCHITECT: {
        id: 'ARCHITECT',
        icon: '🏗️',
        category: 'skill',
        requirement: '10 wins'
    },
    CYBER_GOD: {
        id: 'CYBER_GOD',
        icon: '🦾',
        category: 'skill',
        requirement: '<20 moves in <45s'
    },

    // Milestone Badges
    DEDICATED: {
        id: 'DEDICATED',
        icon: '🎯',
        category: 'milestone',
        requirement: '25 wins'
    },
    OBSESSED: {
        id: 'OBSESSED',
        icon: '💎',
        category: 'milestone',
        requirement: '50 wins'
    },
    LEGEND: {
        id: 'LEGEND',
        icon: '👑',
        category: 'milestone',
        requirement: '100 wins'
    },

    // Streak Badges
    CONSISTENT: {
        id: 'CONSISTENT',
        icon: '🔥',
        category: 'streak',
        requirement: '7 day streak'
    },
    UNSTOPPABLE: {
        id: 'UNSTOPPABLE',
        icon: '💪',
        category: 'streak',
        requirement: '30 day streak'
    },

    // Secret Badges
    PERFECTIONIST: {
        id: 'PERFECTIONIST',
        icon: '✨',
        category: 'secret',
        requirement: '???'
    },
    HACKER: {
        id: 'HACKER',
        icon: '💀',
        category: 'secret',
        requirement: '???'
    }
};

interface AchievementsModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: PlayerProfile;
    lang: Language;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
    isOpen,
    onClose,
    profile,
    lang
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const t = TRANSLATIONS[lang];

    const categories = [
        { id: 'all', label: lang === 'tr' ? 'Tümü' : 'All', icon: '🏆' },
        { id: 'beginner', label: lang === 'tr' ? 'Başlangıç' : 'Beginner', icon: '🌱' },
        { id: 'speed', label: lang === 'tr' ? 'Hız' : 'Speed', icon: '⚡' },
        { id: 'skill', label: lang === 'tr' ? 'Yetenek' : 'Skill', icon: '🎮' },
        { id: 'milestone', label: lang === 'tr' ? 'Kilometre Taşı' : 'Milestone', icon: '🎯' },
        { id: 'streak', label: 'Streak', icon: '🔥' },
        { id: 'secret', label: lang === 'tr' ? 'Gizli' : 'Secret', icon: '❓' }
    ];

    const filteredBadges = useMemo(() => {
        const entries = Object.entries(ALL_BADGES);
        if (selectedCategory === 'all') return entries;
        return entries.filter(([_, badge]) => badge.category === selectedCategory);
    }, [selectedCategory]);

    const unlockedCount = profile.badges.length;
    const totalCount = Object.keys(ALL_BADGES).length;
    const completionPercent = Math.round((unlockedCount / totalCount) * 100);

    // Calculate XP progress
    const XP_PER_LEVEL = 1000;
    const currentLevelXP = profile.xp % XP_PER_LEVEL;
    const xpProgress = (currentLevelXP / XP_PER_LEVEL) * 100;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={lang === 'tr' ? '🏅 BAŞARIMLAR' : '🏅 ACHIEVEMENTS'}>
            <div className="space-y-4">
                {/* Profile Summary */}
                <div className="bg-gradient-to-r from-cyan-900/30 to-fuchsia-900/30 p-4 rounded-xl border border-cyan-500/30">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">🎖️</div>
                        <div className="flex-1">
                            <div className="text-lg font-bold text-white">
                                {getTitleForLevel(profile.level)}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                                {t.profile.level}: {profile.level}
                            </div>
                            {/* XP Progress Bar */}
                            <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-500"
                                    style={{ width: `${xpProgress}%` }}
                                />
                            </div>
                            <div className="text-xs text-slate-500 mt-1 font-mono">
                                {currentLevelXP} / {XP_PER_LEVEL} XP
                            </div>
                        </div>
                    </div>
                </div>

                {/* Completion Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-cyan-400">{unlockedCount}</div>
                        <div className="text-xs text-slate-400">{lang === 'tr' ? 'Kazanılan' : 'Unlocked'}</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-fuchsia-400">{totalCount}</div>
                        <div className="text-xs text-slate-400">{lang === 'tr' ? 'Toplam' : 'Total'}</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400">{completionPercent}%</div>
                        <div className="text-xs text-slate-400">{lang === 'tr' ? 'Tamamlanan' : 'Complete'}</div>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setSelectedCategory(cat.id); playSound('click'); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all
                ${selectedCategory === cat.id
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                            <span className="mr-1">{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {filteredBadges.map(([id, badge]) => {
                        const isUnlocked = profile.badges.includes(id);
                        const badgeInfo = t.badges?.[id as keyof typeof t.badges];

                        return (
                            <div
                                key={id}
                                className={`relative p-3 rounded-xl text-center transition-all cursor-pointer
                  ${isUnlocked
                                        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500/50 hover:border-cyan-400'
                                        : 'bg-slate-900/50 border border-slate-700/50 opacity-50 grayscale'}`}
                                title={badgeInfo?.desc || badge.requirement}
                            >
                                {/* Badge Icon */}
                                <div className={`text-3xl mb-1 ${isUnlocked ? 'animate-pulse' : ''}`}>
                                    {isUnlocked ? badge.icon : '🔒'}
                                </div>

                                {/* Badge Name */}
                                <div className="text-xs font-mono text-slate-300 truncate">
                                    {badgeInfo?.name || id}
                                </div>

                                {/* Unlock indicator */}
                                {isUnlocked && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                                        ✓
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Stats Summary */}
                <div className="bg-slate-800/30 p-3 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-400">{t.profile.wins}</span>
                        <span className="text-white font-mono">{profile.totalWins}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">{t.profile.fastest}</span>
                        <span className="text-white font-mono">
                            {profile.fastestWinMs < Infinity
                                ? `${(profile.fastestWinMs / 1000).toFixed(1)}s`
                                : '--'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">{t.profile.streak}</span>
                        <span className="text-white font-mono">{profile.consecutiveNoHintWins}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">{t.profile.xp}</span>
                        <span className="text-white font-mono">{profile.xp.toLocaleString()} XP</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
