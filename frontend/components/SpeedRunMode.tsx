/**
 * Speed Run Mode Component - Race against time for coins and leaderboard glory
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Tile } from './Tile';
import { Language } from '../constants/translations';
import { Grid, TileType } from '../types';
import { generateDailyLevel } from '../services/levelGenerator';
import { calculateFlow, checkWinCondition } from '../services/gameLogic';
import { playSound, startAmbience, stopAmbience, setMusicIntensity } from '../services/audio';
import { addCoins, COIN_REWARDS } from '../services/economyService';
import { GRID_SIZE } from '../constants';

interface SpeedRunModeProps {
    lang: Language;
    onExit: () => void;
}

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface DifficultyConfig {
    name: string;
    timeLimit: number; // in seconds
    coinMultiplier: number;
    icon: string;
}

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
    EASY: { name: 'Easy', timeLimit: 120, coinMultiplier: 1, icon: '🟢' },
    MEDIUM: { name: 'Medium', timeLimit: 60, coinMultiplier: 1.5, icon: '🟡' },
    HARD: { name: 'Hard', timeLimit: 30, coinMultiplier: 3, icon: '🔴' },
};

const SPEEDRUN_STORAGE_KEY = 'flowstate_speedrun_best';

export const SpeedRunMode: React.FC<SpeedRunModeProps> = ({ lang, onExit }) => {
    // State
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [grid, setGrid] = useState<Grid>([]);
    const [moves, setMoves] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [finalTime, setFinalTime] = useState(0);
    const [bestTimes, setBestTimes] = useState<Record<Difficulty, number>>({
        EASY: Infinity,
        MEDIUM: Infinity,
        HARD: Infinity,
    });
    const [coinsEarned, setCoinsEarned] = useState(0);

    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    // Load best times
    useEffect(() => {
        const saved = localStorage.getItem(SPEEDRUN_STORAGE_KEY);
        if (saved) {
            setBestTimes(JSON.parse(saved));
        }
    }, []);

    // Start game when difficulty selected
    useEffect(() => {
        if (!difficulty) return;

        const config = DIFFICULTY_CONFIG[difficulty];
        setTimeLeft(config.timeLimit);
        startTimeRef.current = Date.now();

        // Generate puzzle
        const seed = `SPEEDRUN_${difficulty}_${Date.now()}`;
        const newGrid = generateDailyLevel(seed);
        setGrid(newGrid);
        setMoves(0);
        setIsWon(false);
        setIsTimeUp(false);

        startAmbience();
        playSound('power');

        // Start timer
        timerRef.current = window.setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    setIsTimeUp(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [difficulty]);

    // Check win condition
    useEffect(() => {
        if (grid.length === 0 || isWon || isTimeUp) return;

        // Update music intensity
        let powered = 0, total = 0;
        grid.forEach(row => row.forEach(tile => {
            if (tile.type !== TileType.EMPTY) {
                total++;
                if (tile.hasFlow) powered++;
            }
        }));
        setMusicIntensity(total > 0 ? (powered / total) : 0);

        // Check win
        if (checkWinCondition(grid)) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsWon(true);
            handleWin();
        }
    }, [grid]);

    const handleTileClick = (r: number, c: number) => {
        if (isWon || isTimeUp || !difficulty) return;
        if (grid[r][c].fixed) return;

        const newGrid = grid.map(row => row.map(tile => ({ ...tile })));
        newGrid[r][c].rotation = (newGrid[r][c].rotation + 1) % 4;

        setMoves(prev => prev + 1);
        setGrid(calculateFlow(newGrid));
        playSound('click');
    };

    const handleWin = () => {
        if (!difficulty) return;

        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setFinalTime(elapsed);

        const config = DIFFICULTY_CONFIG[difficulty];

        // Calculate coins based on time
        let baseCoins = COIN_REWARDS.SPEEDRUN_SLOW;
        if (elapsed < 30) baseCoins = COIN_REWARDS.SPEEDRUN_FAST;
        else if (elapsed < 60) baseCoins = COIN_REWARDS.SPEEDRUN_MEDIUM;

        const totalCoins = Math.floor(baseCoins * config.coinMultiplier);
        setCoinsEarned(totalCoins);
        addCoins(totalCoins, `SpeedRun ${difficulty}`);

        // Update best time
        if (elapsed < bestTimes[difficulty]) {
            const newBests = { ...bestTimes, [difficulty]: elapsed };
            setBestTimes(newBests);
            localStorage.setItem(SPEEDRUN_STORAGE_KEY, JSON.stringify(newBests));
        }

        playSound('win');
        stopAmbience();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const restartWithDifficulty = (d: Difficulty) => {
        setDifficulty(null);
        setTimeout(() => setDifficulty(d), 100);
    };

    // Difficulty Selection Screen
    if (!difficulty) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4"
                style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <div className="text-center max-w-md w-full">
                    <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent-1)' }}>
                        ⚡ SPEED RUN
                    </h2>
                    <p className="text-sm mb-6 opacity-60">Solve as fast as you can!</p>

                    <div className="space-y-3 mb-6">
                        {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(d => {
                            const config = DIFFICULTY_CONFIG[d];
                            const best = bestTimes[d];

                            return (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className="w-full p-4 rounded-xl border transition-all hover:scale-105"
                                    style={{
                                        backgroundColor: 'var(--color-bg-secondary)',
                                        borderColor: 'var(--color-border)',
                                    }}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{config.icon}</span>
                                            <div className="text-left">
                                                <div className="font-bold">{config.name}</div>
                                                <div className="text-xs opacity-60">
                                                    {config.timeLimit}s limit • {config.coinMultiplier}x coins
                                                </div>
                                            </div>
                                        </div>
                                        {best < Infinity && (
                                            <div className="text-right">
                                                <div className="text-xs opacity-60">Best</div>
                                                <div className="font-mono font-bold" style={{ color: 'var(--color-warning)' }}>
                                                    {formatTime(best)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={onExit}
                        className="px-6 py-2 rounded-lg"
                        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                    >
                        ← Back
                    </button>
                </div>
            </div>
        );
    }

    // Time Up Screen
    if (isTimeUp) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4"
                style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <div className="text-center max-w-md w-full p-6 rounded-xl border"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                    <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-error, #ef4444)' }}>
                        ⏰ TIME'S UP!
                    </h2>
                    <p className="mb-6 opacity-60">Better luck next time!</p>

                    <div className="flex gap-3">
                        <button
                            onClick={() => restartWithDifficulty(difficulty)}
                            className="flex-1 py-3 rounded-lg font-bold"
                            style={{ backgroundColor: 'var(--color-accent-1)', color: 'var(--color-bg-primary)' }}
                        >
                            🔄 Try Again
                        </button>
                        <button
                            onClick={() => setDifficulty(null)}
                            className="flex-1 py-3 rounded-lg font-bold"
                            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                        >
                            Change Difficulty
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Win Screen
    if (isWon) {
        const config = DIFFICULTY_CONFIG[difficulty];
        const isNewBest = finalTime <= bestTimes[difficulty];

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4"
                style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <div className="text-center max-w-md w-full p-6 rounded-xl border"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-warning)' }}>
                    <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-warning)' }}>
                        ⚡ COMPLETE!
                    </h2>
                    {isNewBest && (
                        <div className="text-sm mb-4 animate-pulse" style={{ color: 'var(--color-success, #22c55e)' }}>
                            🏆 NEW RECORD!
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <div className="text-3xl font-mono font-bold" style={{ color: 'var(--color-accent-1)' }}>
                                {formatTime(finalTime)}
                            </div>
                            <div className="text-xs opacity-60">Time</div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>
                                🪙 {coinsEarned}
                            </div>
                            <div className="text-xs opacity-60">Coins Earned</div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <div className="text-2xl font-bold">{moves}</div>
                            <div className="text-xs opacity-60">Moves</div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <div className="text-lg font-bold">{config.icon} {config.name}</div>
                            <div className="text-xs opacity-60">Difficulty</div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => restartWithDifficulty(difficulty)}
                            className="flex-1 py-3 rounded-lg font-bold transition-all hover:scale-105"
                            style={{ backgroundColor: 'var(--color-accent-1)', color: 'var(--color-bg-primary)' }}
                        >
                            🔄 Play Again
                        </button>
                        <button
                            onClick={() => setDifficulty(null)}
                            className="flex-1 py-3 rounded-lg font-bold"
                            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                        >
                            Change
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Game Screen
    const config = DIFFICULTY_CONFIG[difficulty];
    const timePercent = (timeLeft / config.timeLimit) * 100;
    const isUrgent = timePercent < 25;

    return (
        <div className="min-h-screen flex flex-col items-center p-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            {/* Header */}
            <div className="w-full max-w-lg mb-4">
                <div className="flex justify-between items-center p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <button
                        onClick={onExit}
                        className="text-sm px-3 py-1 rounded"
                        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                    >
                        ← Exit
                    </button>

                    <div className="text-center">
                        <div className={`text-3xl font-mono font-bold ${isUrgent ? 'text-red-500 animate-pulse' : ''}`}
                            style={!isUrgent ? { color: 'var(--color-accent-1)' } : undefined}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-xs opacity-60">Moves</div>
                        <div className="font-bold">{moves}</div>
                    </div>
                </div>

                {/* Timer Bar */}
                <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                    <div
                        className="h-full transition-all duration-1000"
                        style={{
                            width: `${timePercent}%`,
                            backgroundColor: isUrgent ? 'var(--color-error, #ef4444)' : 'var(--color-accent-1)'
                        }}
                    />
                </div>
            </div>

            {/* Grid */}
            <div
                className="grid gap-0.5 p-1 rounded-xl shadow-2xl border transition-all"
                style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                    width: '100%',
                    maxWidth: '400px',
                    aspectRatio: '1/1',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border)'
                }}
            >
                {grid.map((row, r) => row.map((tile, c) => (
                    <div key={`${r}-${c}`} className="w-full h-full">
                        <Tile tile={tile} onClick={() => handleTileClick(r, c)} isWon={isWon} charges={0} row={r} />
                    </div>
                )))}
            </div>
        </div>
    );
};
