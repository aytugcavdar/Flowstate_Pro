/**
 * Mystery Mode - Daily puzzle with special rules that change each day
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { Language } from '../constants/translations';
import { SeededRNG } from '../utils/rng';
import { playSound } from '../services/audio';

interface MysteryModeModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
    onStartMystery?: (rule: MysteryRule) => void;
}

export interface MysteryRule {
    id: string;
    name: string;
    description: string;
    icon: string;
    modifier: MysteryModifier;
    bonusMultiplier: number;
}

export type MysteryModifier =
    | 'REVERSE_FLOW'      // Sink to Source instead of Source to Sink
    | 'HIDDEN_TILES'      // Some tiles start hidden
    | 'TIME_PRESSURE'     // Countdown timer
    | 'MINIMAL_MOVES'     // Very strict move limit
    | 'NO_HINTS'          // Hints disabled
    | 'RAINBOW'           // All colors mixed
    | 'SHIFTING'          // Tiles shift periodically
    | 'MIRROR';           // Grid is mirrored

const MYSTERY_RULES: MysteryRule[] = [
    {
        id: 'reverse',
        name: 'REVERSE FLOW',
        description: 'Akışı tersine çevir! Sink\'ten Source\'a bağla.',
        icon: '🔄',
        modifier: 'REVERSE_FLOW',
        bonusMultiplier: 1.5
    },
    {
        id: 'shadow',
        name: 'SHADOW MODE',
        description: 'Bazı tile\'lar gizli başlıyor. Dokunarak ortaya çıkar.',
        icon: '🌑',
        modifier: 'HIDDEN_TILES',
        bonusMultiplier: 1.3
    },
    {
        id: 'rush',
        name: 'RUSH HOUR',
        description: '60 saniye içinde tamamla!',
        icon: '⏱️',
        modifier: 'TIME_PRESSURE',
        bonusMultiplier: 2.0
    },
    {
        id: 'zen',
        name: 'ZEN MASTER',
        description: 'İpucu yok! Tamamen kendi başına.',
        icon: '🧘',
        modifier: 'NO_HINTS',
        bonusMultiplier: 1.5
    },
    {
        id: 'minimal',
        name: 'MINIMAL',
        description: 'Maksimum 20 hamle ile çöz.',
        icon: '🎯',
        modifier: 'MINIMAL_MOVES',
        bonusMultiplier: 1.8
    },
    {
        id: 'rainbow',
        name: 'RAINBOW CHAOS',
        description: 'Tüm renkler karışık! Dikkatli eşleştir.',
        icon: '🌈',
        modifier: 'RAINBOW',
        bonusMultiplier: 1.4
    },
    {
        id: 'shifting',
        name: 'SHIFTING SANDS',
        description: 'Tile\'lar her 10 saniyede değişiyor!',
        icon: '🌀',
        modifier: 'SHIFTING',
        bonusMultiplier: 2.5
    },
    {
        id: 'mirror',
        name: 'MIRROR WORLD',
        description: 'Grid ayna görüntüsü. Sağ sol değişti!',
        icon: '🪞',
        modifier: 'MIRROR',
        bonusMultiplier: 1.6
    }
];

const getTodaysMysteryRule = (): MysteryRule => {
    const today = new Date().toISOString().split('T')[0];
    const rng = new SeededRNG(`mystery_${today}`);
    const index = Math.floor(rng.next() * MYSTERY_RULES.length);
    return MYSTERY_RULES[index];
};

export const MysteryModeModal: React.FC<MysteryModeModalProps> = ({
    isOpen,
    onClose,
    lang,
    onStartMystery
}) => {
    const [todaysRule, setTodaysRule] = useState<MysteryRule | null>(null);
    const [hasPlayed, setHasPlayed] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTodaysRule(getTodaysMysteryRule());
            // Check if already played today
            const lastPlayed = localStorage.getItem('flowstate_mystery_last');
            const today = new Date().toISOString().split('T')[0];
            setHasPlayed(lastPlayed === today);
        }
    }, [isOpen]);

    const handleStart = () => {
        if (!todaysRule) return;
        playSound('click');

        // Mark as played
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('flowstate_mystery_last', today);

        onStartMystery?.(todaysRule);
        onClose();
    };

    if (!todaysRule) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={lang === 'tr' ? '🎭 GİZEMLİ MOD' : '🎭 MYSTERY MODE'}
        >
            <div className="space-y-4">
                {/* Today's Rule - Premium Glass Card */}
                <div
                    className="p-6 rounded-2xl text-center relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(217, 70, 239, 0.15) 50%, rgba(236, 72, 153, 0.2) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        boxShadow: '0 0 50px rgba(139, 92, 246, 0.15)'
                    }}
                >
                    {/* Animated border */}
                    <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{
                            background: 'linear-gradient(90deg, #8b5cf6, #d946ef, #ec4899, #8b5cf6)',
                            backgroundSize: '200% 100%',
                            animation: 'rainbow-flow 2s linear infinite'
                        }}
                    />

                    {/* Icon */}
                    <div
                        className="text-6xl mb-3 animate-pulse"
                        style={{ filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.6))' }}
                    >
                        {todaysRule.icon}
                    </div>

                    {/* Rule Name */}
                    <div
                        className="text-2xl font-black tracking-wide mb-2"
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #ec4899 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.4))'
                        }}
                    >
                        {todaysRule.name}
                    </div>

                    {/* Description */}
                    <div className="text-slate-300 text-sm">
                        {lang === 'tr' ? todaysRule.description : todaysRule.description}
                    </div>

                    {/* Bonus Multiplier */}
                    <div
                        className="inline-block mt-4 px-4 py-2 rounded-xl font-bold text-sm"
                        style={{
                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)',
                            border: '1px solid rgba(251, 191, 36, 0.4)',
                            color: '#fbbf24'
                        }}
                    >
                        {todaysRule.bonusMultiplier}x XP BONUS
                    </div>
                </div>

                {/* Info */}
                <div
                    className="p-4 rounded-xl text-center"
                    style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <div className="text-xs text-slate-400">
                        {lang === 'tr'
                            ? '📅 Her gün yeni bir gizemli kural!'
                            : '📅 New mystery rule every day!'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        {lang === 'tr'
                            ? 'Günlük 1 deneme hakkın var'
                            : 'One attempt per day'}
                    </div>
                </div>

                {/* Start Button */}
                {!hasPlayed ? (
                    <button
                        onClick={handleStart}
                        className="w-full py-4 font-bold rounded-xl transition-all duration-300 hover:scale-[1.02]"
                        style={{
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(217, 70, 239, 0.2) 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.5)',
                            color: '#a78bfa',
                            boxShadow: '0 0 25px rgba(139, 92, 246, 0.2)'
                        }}
                    >
                        🎭 {lang === 'tr' ? 'GİZEME DAL' : 'ENTER MYSTERY'}
                    </button>
                ) : (
                    <div
                        className="py-4 text-center rounded-xl text-sm"
                        style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            color: '#86efac'
                        }}
                    >
                        ✓ {lang === 'tr' ? 'Bugün oynadın! Yarın gel.' : "You've played today! Come back tomorrow."}
                    </div>
                )}

                {/* All Rules Preview */}
                <div className="pt-2">
                    <div className="text-xs text-slate-500 text-center mb-2">
                        {lang === 'tr' ? 'Olası Kurallar' : 'Possible Rules'}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {MYSTERY_RULES.map(rule => (
                            <div
                                key={rule.id}
                                className={`px-2 py-1 rounded-lg text-sm ${rule.id === todaysRule.id
                                        ? 'bg-purple-500/30 border border-purple-500/50'
                                        : 'bg-slate-800/50 border border-slate-700/30'
                                    }`}
                                title={rule.name}
                            >
                                {rule.icon}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
