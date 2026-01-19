/**
 * Boss Level Intro Component
 * Dramatic entrance animation when starting a boss level
 */

import React, { useState, useEffect } from 'react';
import { CampaignLevel, BossType } from '../types';
import { playSound } from '../services/audio';
import { haptic } from '../services/hapticService';

interface BossIntroProps {
    level: CampaignLevel;
    onComplete: () => void;
}

const BOSS_CONFIGS: Record<BossType, { icon: string; color: string; subtitle: string }> = {
    'TIME_ATTACK': { icon: '⏱️', color: 'from-orange-500 to-red-600', subtitle: 'Beat the clock!' },
    'MULTI_SINK': { icon: '🔀', color: 'from-purple-500 to-fuchsia-600', subtitle: 'Multiple targets!' },
    'SHIFTING': { icon: '🌀', color: 'from-cyan-500 to-blue-600', subtitle: 'Tiles will shift!' },
    'MEGA_GRID': { icon: '📐', color: 'from-yellow-500 to-orange-600', subtitle: 'Massive grid!' },
};

export const BossLevelIntro: React.FC<BossIntroProps> = ({ level, onComplete }) => {
    const [phase, setPhase] = useState<'enter' | 'title' | 'subtitle' | 'go'>('enter');

    const config = level.bossType ? BOSS_CONFIGS[level.bossType] : BOSS_CONFIGS['MEGA_GRID'];

    useEffect(() => {
        playSound('glitch');
        haptic.heavy();

        const timers: NodeJS.Timeout[] = [];

        timers.push(setTimeout(() => {
            setPhase('title');
            haptic.medium();
        }, 500));

        timers.push(setTimeout(() => {
            setPhase('subtitle');
            playSound('power');
        }, 1500));

        timers.push(setTimeout(() => {
            setPhase('go');
            haptic.success();
        }, 2500));

        timers.push(setTimeout(() => {
            onComplete();
        }, 3500));

        return () => timers.forEach(t => clearTimeout(t));
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10 animate-pulse`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center space-y-6">
                {/* Boss Icon */}
                <div className={`text-8xl transition-all duration-500 ${phase !== 'enter' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}>
                    {config.icon}
                </div>

                {/* Title */}
                <div className={`transition-all duration-500 ${phase === 'title' || phase === 'subtitle' || phase === 'go'
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-10 opacity-0'
                    }`}>
                    <div className="text-xs uppercase tracking-[0.5em] text-slate-500 mb-2">
                        ⚠️ BOSS LEVEL ⚠️
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-black tracking-wider bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                        {level.title}
                    </h1>
                </div>

                {/* Subtitle */}
                <div className={`transition-all duration-500 ${phase === 'subtitle' || phase === 'go'
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-10 opacity-0'
                    }`}>
                    <p className="text-lg text-slate-400 font-mono">{config.subtitle}</p>
                    {level.timeLimit && (
                        <p className="text-sm text-orange-400 mt-2 font-mono">
                            ⏱️ Time Limit: {Math.floor(level.timeLimit / 60)}:{String(level.timeLimit % 60).padStart(2, '0')}
                        </p>
                    )}
                    {level.gridSize && level.gridSize > 8 && (
                        <p className="text-sm text-purple-400 mt-1 font-mono">
                            📐 Grid Size: {level.gridSize}x{level.gridSize}
                        </p>
                    )}
                </div>

                {/* GO! */}
                <div className={`transition-all duration-300 ${phase === 'go'
                        ? 'scale-100 opacity-100'
                        : 'scale-50 opacity-0'
                    }`}>
                    <div className="text-6xl font-black text-white animate-pulse drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">
                        START!
                    </div>
                </div>
            </div>
        </div>
    );
};
