import React, { forwardRef } from 'react';

export interface SocialShareProps {
    dateKey: string;
    moves: number;
    timeMs: number;
    streak: number;
    playerName: string;
    mode: string;
    stars?: number;
    rank?: string;
}

export const SocialShare = forwardRef<HTMLDivElement, SocialShareProps>(({
    dateKey,
    moves,
    timeMs,
    streak,
    playerName,
    mode,
    stars,
    rank
}, ref) => {
    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remSec = seconds % 60;
        return `${minutes}:${remSec.toString().padStart(2, '0')}`;
    };

    return (
        <div
            ref={ref}
            id="social-share-card"
            className="w-[600px] h-[400px] bg-slate-900 text-white p-6 relative overflow-hidden flex flex-col items-center justify-between font-mono border-4 border-cyan-500 shadow-2xl"
            style={{ fontFamily: "'Courier New', monospace" }}
        >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/30 via-slate-900 to-slate-900"></div>
            <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.5)]"></div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="flex w-full justify-between items-start z-10">
                {/* Header */}
                <div className="text-left">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                        FLOWSTATE
                    </h1>
                    <div className="text-xs tracking-[0.3em] text-slate-400 uppercase">System Solved</div>
                </div>

                {/* Mode Tag */}
                <div className="text-right">
                    <div className="text-xs text-cyan-400 font-bold uppercase border border-cyan-500/50 px-2 py-1 rounded bg-cyan-900/20">
                        {mode === 'DAILY' ? 'DAILY RUN' : mode}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">{dateKey}</div>
                </div>
            </div>

            {/* Main Stats Row */}
            <div className="z-10 w-full flex items-center justify-center gap-12 my-4">
                {/* Moves */}
                <div className="text-center relative group">
                    <div className="absolute -inset-4 bg-cyan-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="text-6xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">{moves}</div>
                    <div className="text-xs text-cyan-500 uppercase tracking-widest font-bold">Moves</div>
                </div>

                {/* Divider */}
                <div className="h-16 w-[1px] bg-slate-700"></div>

                {/* Time */}
                <div className="text-center">
                    <div className="text-5xl font-bold text-fuchsia-400">{formatTime(timeMs)}</div>
                    <div className="text-xs text-fuchsia-600 uppercase tracking-widest font-bold">Time</div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="z-10 w-full flex justify-between items-end border-t border-slate-800 pt-4">
                <div className="text-left">
                    <div className="text-xs text-slate-500 uppercase">Player</div>
                    <div className="text-sm text-cyan-300 font-bold">@{playerName}</div>
                </div>

                {/* Rank/Stars or Stamp */}
                <div className="flex items-center gap-4">
                    {rank && (
                        <div className="text-right">
                            <div className="text-xs text-slate-500 uppercase">Rank</div>
                            <div className="text-xl text-yellow-500 font-bold">#{rank}</div>
                        </div>
                    )}
                    {stars && (
                        <div className="text-2xl text-yellow-400 tracking-widest user-select-none">{'★'.repeat(stars)}</div>
                    )}
                    <div className="border border-green-500/30 text-green-500 text-xs px-2 py-1 rotate-[-5deg] font-black uppercase tracking-widest backdrop-blur-sm">
                        ACCESS GRANTED
                    </div>
                </div>
            </div>
        </div>
    );
});
