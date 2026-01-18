import React from 'react';
import { getStreakInfo } from '../services/rewardService';

interface StreakIndicatorProps {
    compact?: boolean;
    onClick?: () => void;
}

/**
 * Visual streak indicator with flame animation
 * Shows current streak, bonus, and progress to next milestone
 */
export const StreakIndicator: React.FC<StreakIndicatorProps> = ({ compact = false, onClick }) => {
    const streakInfo = getStreakInfo();
    const { streak, bonus, nextMilestone, freezeCount } = streakInfo;

    // Calculate progress to next milestone
    const progressPercent = nextMilestone
        ? Math.min(100, (streak / nextMilestone.days) * 100)
        : 100;

    // Flame color based on streak
    const getFlameColor = () => {
        if (streak >= 30) return 'text-yellow-400'; // Gold
        if (streak >= 14) return 'text-orange-400'; // Orange
        if (streak >= 7) return 'text-red-400';     // Red
        if (streak >= 3) return 'text-orange-500';  // Dark Orange
        return 'text-slate-400';                     // Gray (no streak)
    };

    // Flame animation intensity
    const getFlameAnimation = () => {
        if (streak >= 14) return 'animate-pulse';
        if (streak >= 7) return 'animate-bounce';
        return '';
    };

    if (compact) {
        return (
            <button
                onClick={onClick}
                className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                title={`${streak} gün streak${bonus ? ` (${bonus} bonus)` : ''}`}
            >
                <span className={`text-lg ${getFlameColor()} ${getFlameAnimation()}`}>🔥</span>
                <span className="text-sm font-bold text-white">{streak}</span>
                {bonus && (
                    <span className="text-xs text-green-400 font-mono">{bonus}</span>
                )}
                {freezeCount > 0 && (
                    <span className="text-xs text-cyan-400" title={`${freezeCount} dondurucu var`}>❄️</span>
                )}
            </button>
        );
    }

    return (
        <div
            onClick={onClick}
            className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 cursor-pointer hover:border-orange-500/50 transition-all"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className={`text-2xl ${getFlameColor()} ${getFlameAnimation()}`}>🔥</span>
                    <div>
                        <span className="text-xl font-bold text-white">{streak}</span>
                        <span className="text-xs text-slate-400 ml-1">gün</span>
                    </div>
                </div>

                {bonus && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-2 py-1">
                        <span className="text-sm font-bold text-green-400">{bonus} BONUS</span>
                    </div>
                )}
            </div>

            {/* Progress to Next Milestone */}
            {nextMilestone && (
                <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Sonraki: {nextMilestone.icon} {nextMilestone.name}</span>
                        <span>{streak}/{nextMilestone.days}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        +{nextMilestone.reward} coin ödül
                    </div>
                </div>
            )}

            {/* Freeze indicator */}
            {freezeCount > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-cyan-400">
                    <span>❄️</span>
                    <span>{freezeCount} dondurucu hazır</span>
                </div>
            )}
        </div>
    );
};
