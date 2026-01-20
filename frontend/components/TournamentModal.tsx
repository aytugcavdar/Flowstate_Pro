/**
 * Tournament Mode - Weekly competitive tournaments with brackets
 */

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Language } from '../constants/translations';
import { getCoins, spendCoins } from '../services/economyService';
import { playSound } from '../services/audio';
import { haptic } from '../services/hapticService';

interface TournamentModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
    onStartTournament?: () => void;
}

interface Tournament {
    id: string;
    name: string;
    status: 'upcoming' | 'active' | 'completed';
    entryFee: number;
    prizePool: number;
    participants: number;
    maxParticipants: number;
    startTime: string;
    rounds: TournamentRound[];
    userRank?: number;
    userScore?: number;
}

interface TournamentRound {
    id: number;
    name: string;
    status: 'locked' | 'active' | 'completed';
    puzzleCount: number;
    completedPuzzles: number;
    bestTime?: number;
}

// Mock tournament data - in production this would come from Supabase
const getMockTournament = (): Tournament => {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - now.getDay()));

    return {
        id: `tournament_${now.toISOString().split('T')[0]}`,
        name: 'WEEKLY CHAMPIONSHIP',
        status: 'active',
        entryFee: 100,
        prizePool: 5000,
        participants: 47,
        maxParticipants: 64,
        startTime: now.toISOString(),
        rounds: [
            { id: 1, name: 'QUALIFIER', status: 'active', puzzleCount: 3, completedPuzzles: 0 },
            { id: 2, name: 'ROUND OF 32', status: 'locked', puzzleCount: 2, completedPuzzles: 0 },
            { id: 3, name: 'ROUND OF 16', status: 'locked', puzzleCount: 2, completedPuzzles: 0 },
            { id: 4, name: 'QUARTER-FINALS', status: 'locked', puzzleCount: 1, completedPuzzles: 0 },
            { id: 5, name: 'SEMI-FINALS', status: 'locked', puzzleCount: 1, completedPuzzles: 0 },
            { id: 6, name: 'FINALS', status: 'locked', puzzleCount: 1, completedPuzzles: 0 },
        ],
        userRank: undefined,
        userScore: undefined
    };
};

export const TournamentModal: React.FC<TournamentModalProps> = ({
    isOpen,
    onClose,
    lang,
    onStartTournament
}) => {
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [coins, setCoins] = useState(getCoins());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTournament(getMockTournament());
            setCoins(getCoins());
        }
    }, [isOpen]);

    const handleRegister = () => {
        if (!tournament) return;

        if (coins < tournament.entryFee) {
            haptic.error();
            playSound('click');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            spendCoins(tournament.entryFee);
            setCoins(getCoins());
            setIsRegistered(true);
            setLoading(false);
            playSound('win');
            haptic.coinEarn();
        }, 500);
    };

    const handleStartRound = (roundId: number) => {
        playSound('click');
        haptic.tileRotate();
        onStartTournament?.();
        onClose();
    };

    if (!tournament) return null;

    const canAfford = coins >= tournament.entryFee;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={lang === 'tr' ? '🏆 TURNUVA' : '🏆 TOURNAMENT'}
        >
            <div className="space-y-4">
                {/* Tournament Header - Premium Glass */}
                <div
                    className="p-5 rounded-2xl text-center relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 50%, rgba(234, 88, 12, 0.15) 100%)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        boxShadow: '0 0 40px rgba(251, 191, 36, 0.1)'
                    }}
                >
                    {/* Animated gradient border */}
                    <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{
                            background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #ea580c, #fbbf24)',
                            backgroundSize: '200% 100%',
                            animation: 'rainbow-flow 2s linear infinite'
                        }}
                    />

                    <div className="text-sm text-yellow-500/70 uppercase tracking-widest mb-1">
                        {lang === 'tr' ? 'Haftalık' : 'Weekly'}
                    </div>
                    <div
                        className="text-2xl font-black tracking-wide"
                        style={{
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.4))'
                        }}
                    >
                        {tournament.name}
                    </div>

                    {/* Stats Row */}
                    <div className="flex justify-around mt-4 text-sm">
                        <div>
                            <div className="text-yellow-400 font-bold text-lg">{tournament.participants}</div>
                            <div className="text-slate-400 text-xs">
                                {lang === 'tr' ? 'Katılımcı' : 'Players'}
                            </div>
                        </div>
                        <div>
                            <div className="text-cyan-400 font-bold text-lg font-mono">🪙 {tournament.prizePool}</div>
                            <div className="text-slate-400 text-xs">
                                {lang === 'tr' ? 'Ödül Havuzu' : 'Prize Pool'}
                            </div>
                        </div>
                        <div>
                            <div className="text-fuchsia-400 font-bold text-lg">6</div>
                            <div className="text-slate-400 text-xs">
                                {lang === 'tr' ? 'Tur' : 'Rounds'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registration or Rounds */}
                {!isRegistered ? (
                    <>
                        {/* Entry Fee */}
                        <div
                            className="p-4 rounded-xl flex justify-between items-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                        >
                            <div>
                                <div className="text-sm text-slate-400">
                                    {lang === 'tr' ? 'Giriş Ücreti' : 'Entry Fee'}
                                </div>
                                <div className="text-xl font-bold text-yellow-400 font-mono">
                                    🪙 {tournament.entryFee}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500">
                                    {lang === 'tr' ? 'Bakiye' : 'Balance'}
                                </div>
                                <div className={`font-mono font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                                    🪙 {coins}
                                </div>
                            </div>
                        </div>

                        {/* Register Button */}
                        <button
                            onClick={handleRegister}
                            disabled={!canAfford || loading}
                            className="w-full py-4 font-bold rounded-xl transition-all duration-300 disabled:opacity-50"
                            style={{
                                background: canAfford
                                    ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.2) 100%)'
                                    : 'rgba(30, 41, 59, 0.5)',
                                border: canAfford
                                    ? '1px solid rgba(251, 191, 36, 0.5)'
                                    : '1px solid rgba(100, 116, 139, 0.3)',
                                color: canAfford ? '#fbbf24' : '#64748b',
                                boxShadow: canAfford ? '0 0 25px rgba(251, 191, 36, 0.2)' : 'none'
                            }}
                        >
                            {loading ? '...' : (lang === 'tr' ? '📝 KAYIT OL' : '📝 REGISTER')}
                        </button>
                    </>
                ) : (
                    <>
                        {/* Tournament Bracket */}
                        <div className="space-y-2">
                            {tournament.rounds.map((round, index) => {
                                const isActive = round.status === 'active';
                                const isLocked = round.status === 'locked';

                                return (
                                    <div
                                        key={round.id}
                                        className={`p-3 rounded-xl flex justify-between items-center transition-all duration-300 ${isActive ? 'scale-[1.02]' : ''
                                            }`}
                                        style={{
                                            background: isActive
                                                ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)'
                                                : isLocked
                                                    ? 'rgba(30, 41, 59, 0.4)'
                                                    : 'rgba(34, 197, 94, 0.1)',
                                            border: isActive
                                                ? '1px solid rgba(34, 211, 238, 0.4)'
                                                : isLocked
                                                    ? '1px solid rgba(100, 116, 139, 0.2)'
                                                    : '1px solid rgba(34, 197, 94, 0.3)',
                                            opacity: isLocked ? 0.6 : 1
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isActive ? 'bg-cyan-500/30 text-cyan-400'
                                                    : isLocked ? 'bg-slate-700 text-slate-500'
                                                        : 'bg-green-500/30 text-green-400'
                                                }`}>
                                                {isLocked ? '🔒' : round.status === 'completed' ? '✓' : round.id}
                                            </div>
                                            <div>
                                                <div className={`font-bold text-sm ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                                                    {round.name}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {round.puzzleCount} {lang === 'tr' ? 'Bulmaca' : 'Puzzles'}
                                                </div>
                                            </div>
                                        </div>

                                        {isActive && (
                                            <button
                                                onClick={() => handleStartRound(round.id)}
                                                className="px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)',
                                                    border: '1px solid rgba(34, 211, 238, 0.5)',
                                                    color: '#22d3ee'
                                                }}
                                            >
                                                {lang === 'tr' ? 'BAŞLA' : 'START'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Prize Distribution */}
                <div
                    className="p-3 rounded-xl"
                    style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 text-center">
                        {lang === 'tr' ? 'Ödül Dağılımı' : 'Prize Distribution'}
                    </div>
                    <div className="flex justify-around text-center text-xs">
                        <div>
                            <div className="text-yellow-400 font-bold">🥇 2500</div>
                            <div className="text-slate-500">1st</div>
                        </div>
                        <div>
                            <div className="text-slate-300 font-bold">🥈 1500</div>
                            <div className="text-slate-500">2nd</div>
                        </div>
                        <div>
                            <div className="text-orange-400 font-bold">🥉 750</div>
                            <div className="text-slate-500">3rd</div>
                        </div>
                        <div>
                            <div className="text-slate-400 font-bold">250</div>
                            <div className="text-slate-500">4th</div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
