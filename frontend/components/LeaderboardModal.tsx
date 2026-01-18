import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { TRANSLATIONS, Language } from '../constants/translations';
import {
    getLeaderboard,
    submitScore,
    LeaderboardEntry,
    formatTime,
    getRankSuffix
} from '../services/leaderboardService';
import { loadSettings } from '../services/settingsService';
import { playSound } from '../services/audio';
import { isSupabaseConfigured } from '../services/supabase';

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
    dateKey: string;
    playerMoves?: number;
    playerTime?: number;
    onScoreSubmit?: (rank: number) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
    isOpen,
    onClose,
    lang,
    dateKey,
    playerMoves,
    playerTime,
    onScoreSubmit
}) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [playerRank, setPlayerRank] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [justSubmitted, setJustSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadLeaderboardData();
        }
    }, [isOpen, dateKey]);

    const loadLeaderboardData = async () => {
        setLoading(true);
        const settings = loadSettings();
        const playerName = settings.playerName || 'NETRUNNER';

        // If player has a score to submit
        if (playerMoves !== undefined && playerTime !== undefined) {
            const result = await submitScore(dateKey, playerMoves, playerTime, playerName);
            setEntries(result.entries);
            setPlayerRank(result.rank);
            if (result.improved) {
                setJustSubmitted(true);
                playSound('power');
                onScoreSubmit?.(result.rank);
            }
        } else {
            // Just viewing
            const data = await getLeaderboard(dateKey, playerName);
            setEntries(data);
            const playerEntry = data.find(e => e.isPlayer);
            setPlayerRank(playerEntry?.rank || null);
        }

        setLoading(false);
    };

    const getMedalEmoji = (rank: number): string => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '';
    };

    const getRankColor = (rank: number): string => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-slate-300';
        if (rank === 3) return 'text-orange-400';
        if (rank <= 10) return 'text-cyan-400';
        return 'text-slate-400';
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={lang === 'tr' ? '🏆 SKOR TABLOSU' : '🏆 LEADERBOARD'}
        >
            <div className="space-y-4">
                {/* Date Header */}
                <div className="text-center">
                    <div className="text-xs text-slate-500 font-mono uppercase">
                        {lang === 'tr' ? 'Günlük Mücadele' : 'Daily Challenge'}
                    </div>
                    <div className="text-lg font-bold text-cyan-400 font-mono">{dateKey}</div>
                    <div className="text-[10px] uppercase tracking-widest mt-1">
                        {isSupabaseConfigured() ? (
                            <span className="text-green-400/70 flex items-center justify-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                ONLINE
                            </span>
                        ) : (
                            <span className="text-orange-400/70 flex items-center justify-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                OFFLINE SIMULATION
                            </span>
                        )}
                    </div>
                </div>

                {/* Player Rank Banner */}
                {playerRank && (
                    <div className={`p-4 rounded-xl text-center transition-all
            ${justSubmitted
                            ? 'bg-gradient-to-r from-cyan-600/30 to-fuchsia-600/30 border-2 border-cyan-500 animate-pulse'
                            : 'bg-slate-800/50 border border-slate-700'}`}
                    >
                        <div className="text-sm text-slate-400">
                            {lang === 'tr' ? 'Senin Sıralaman' : 'Your Rank'}
                        </div>
                        <div className="text-4xl font-bold text-white">
                            {getMedalEmoji(playerRank)} {playerRank}{getRankSuffix(playerRank)}
                        </div>
                        {justSubmitted && (
                            <div className="text-xs text-green-400 mt-1">
                                ✓ {lang === 'tr' ? 'Skor kaydedildi!' : 'Score submitted!'}
                            </div>
                        )}
                    </div>
                )}

                {/* Leaderboard Table */}
                {loading ? (
                    <div className="text-center py-8 text-slate-400 animate-pulse">
                        {lang === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 font-mono uppercase px-2 py-1 border-b border-slate-700 sticky top-0 bg-slate-900">
                            <div className="col-span-2">#</div>
                            <div className="col-span-4">{lang === 'tr' ? 'İsim' : 'Name'}</div>
                            <div className="col-span-3 text-right">{lang === 'tr' ? 'Hamle' : 'Moves'}</div>
                            <div className="col-span-3 text-right">{lang === 'tr' ? 'Süre' : 'Time'}</div>
                        </div>

                        {/* Entries */}
                        {entries.slice(0, 25).map((entry, index) => (
                            <div
                                key={`${entry.name}-${index}`}
                                className={`grid grid-cols-12 gap-2 text-sm px-2 py-2 border-b border-slate-800/50 transition-all
                  ${entry.isPlayer
                                        ? 'bg-cyan-500/10 border-l-2 border-l-cyan-500'
                                        : 'hover:bg-slate-800/30'}`}
                            >
                                {/* Rank */}
                                <div className={`col-span-2 font-mono font-bold ${getRankColor(entry.rank)}`}>
                                    {getMedalEmoji(entry.rank) || entry.rank}
                                </div>

                                {/* Name */}
                                <div className={`col-span-4 font-mono truncate 
                  ${entry.isPlayer ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}>
                                    {entry.name}
                                    {entry.isPlayer && ' ←'}
                                </div>

                                {/* Moves */}
                                <div className="col-span-3 text-right font-mono text-white">
                                    {entry.moves}
                                </div>

                                {/* Time */}
                                <div className="col-span-3 text-right font-mono text-fuchsia-400">
                                    {formatTime(entry.timeMs)}
                                </div>
                            </div>
                        ))}

                        {/* Show player if not in top 25 */}
                        {playerRank && playerRank > 25 && (
                            <>
                                <div className="text-center text-slate-500 py-2">• • •</div>
                                {entries.filter(e => e.isPlayer).map((entry, i) => (
                                    <div
                                        key={`player-${i}`}
                                        className="grid grid-cols-12 gap-2 text-sm px-2 py-2 bg-cyan-500/10 border-l-2 border-l-cyan-500"
                                    >
                                        <div className="col-span-2 font-mono font-bold text-cyan-400">
                                            {entry.rank}
                                        </div>
                                        <div className="col-span-4 font-mono truncate text-cyan-400 font-bold">
                                            {entry.name} ←
                                        </div>
                                        <div className="col-span-3 text-right font-mono text-white">
                                            {entry.moves}
                                        </div>
                                        <div className="col-span-3 text-right font-mono text-fuchsia-400">
                                            {formatTime(entry.timeMs)}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-800">
                    {lang === 'tr'
                        ? '🌐 Günlük tablolar her gün sıfırlanır'
                        : '🌐 Daily boards reset every day'}
                </div>
            </div>
        </Modal>
    );
};
