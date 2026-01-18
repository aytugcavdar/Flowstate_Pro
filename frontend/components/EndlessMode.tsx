/**
 * Endless Mode Component - Progressive difficulty puzzle mode with coin rewards
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Tile } from './Tile';
import { Language } from '../constants/translations';
import { Grid, TileType, GameMode } from '../types';
import { generateDailyLevel } from '../services/levelGenerator';
import { calculateFlow, checkWinCondition } from '../services/gameLogic';
import { playSound, startAmbience, stopAmbience, setMusicIntensity } from '../services/audio';
import { addCoins, COIN_REWARDS } from '../services/economyService';
import { GRID_SIZE } from '../constants';

interface EndlessModeProps {
    lang: Language;
    onExit: () => void;
}

interface EndlessStats {
    level: number;
    tilesCleared: number;
    totalCoins: number;
    bestLevel: number;
}

const ENDLESS_STORAGE_KEY = 'flowstate_endless_best';

export const EndlessMode: React.FC<EndlessModeProps> = ({ lang, onExit }) => {
    // Game State
    const [level, setLevel] = useState(1);
    const [grid, setGrid] = useState<Grid>([]);
    const [moves, setMoves] = useState(0);
    const [tilesCleared, setTilesCleared] = useState(0);
    const [sessionCoins, setSessionCoins] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [bestLevel, setBestLevel] = useState(1);
    const [showLevelUp, setShowLevelUp] = useState(false);

    // Difficulty scaling
    const maxMoves = useMemo(() => {
        // More moves allowed on easier levels, fewer on harder
        const base = 50;
        const reduction = Math.floor(level / 3) * 5;
        return Math.max(base - reduction, 25);
    }, [level]);

    // Load best score
    useEffect(() => {
        const saved = localStorage.getItem(ENDLESS_STORAGE_KEY);
        if (saved) {
            setBestLevel(parseInt(saved, 10));
        }
        startAmbience();
        return () => stopAmbience();
    }, []);

    // Generate level
    useEffect(() => {
        const seed = `ENDLESS_${Date.now()}_LVL${level}`;
        const newGrid = generateDailyLevel(seed);
        setGrid(newGrid);
        setMoves(0);
        setIsWon(false);
        playSound('power');
    }, [level]);

    // Check win condition
    useEffect(() => {
        if (grid.length === 0 || isWon || isGameOver) return;

        // Update music intensity based on flow
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
            setIsWon(true);
            handleLevelComplete();
        }
    }, [grid]);

    // Check game over (out of moves)
    useEffect(() => {
        if (moves >= maxMoves && !isWon) {
            setIsGameOver(true);
            handleGameOver();
        }
    }, [moves, maxMoves, isWon]);

    const handleTileClick = (r: number, c: number) => {
        if (isWon || isGameOver) return;
        if (grid[r][c].fixed) return;

        const newGrid = grid.map(row => row.map(tile => ({ ...tile })));
        newGrid[r][c].rotation = (newGrid[r][c].rotation + 1) % 4;

        // Award coins for each tile interaction
        const coinReward = Math.ceil(COIN_REWARDS.ENDLESS_PER_TILE * (1 + level * 0.1));
        setTilesCleared(prev => prev + 1);
        setSessionCoins(prev => prev + coinReward);

        setMoves(prev => prev + 1);
        setGrid(calculateFlow(newGrid));
        playSound('click');
    };

    const handleLevelComplete = () => {
        // Award level completion bonus
        const levelBonus = COIN_REWARDS.ENDLESS_LEVEL_COMPLETE * level;
        const totalReward = levelBonus;

        addCoins(totalReward, `Endless Level ${level}`);
        setSessionCoins(prev => prev + totalReward);

        // Update best
        if (level > bestLevel) {
            setBestLevel(level);
            localStorage.setItem(ENDLESS_STORAGE_KEY, level.toString());
        }

        playSound('win');
        setShowLevelUp(true);

        // Auto-advance after delay
        setTimeout(() => {
            setShowLevelUp(false);
            setLevel(prev => prev + 1);
        }, 2000);
    };

    const handleGameOver = () => {
        stopAmbience();
        playSound('win'); // Could be a different sound
    };

    const restartGame = () => {
        setLevel(1);
        setTilesCleared(0);
        setSessionCoins(0);
        setIsGameOver(false);
        setIsWon(false);
        startAmbience();
    };

    // Render Game Over Screen
    if (isGameOver) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4"
                style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <div className="text-center max-w-md w-full p-6 rounded-xl border"
                    style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderColor: 'var(--color-border)'
                    }}>
                    <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-accent-2)' }}>
                        GAME OVER
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-1)' }}>{level}</div>
                            <div className="text-xs opacity-60">Level Reached</div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>🪙 {sessionCoins}</div>
                            <div className="text-xs opacity-60">Coins Earned</div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <div className="text-2xl font-bold">{tilesCleared}</div>
                            <div className="text-xs opacity-60">Tiles Cleared</div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>⭐ {bestLevel}</div>
                            <div className="text-xs opacity-60">Best Level</div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={restartGame}
                            className="flex-1 py-3 rounded-lg font-bold transition-all hover:scale-105"
                            style={{ backgroundColor: 'var(--color-accent-1)', color: 'var(--color-bg-primary)' }}
                        >
                            🔄 Play Again
                        </button>
                        <button
                            onClick={onExit}
                            className="flex-1 py-3 rounded-lg font-bold transition-all hover:scale-105"
                            style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)' }}
                        >
                            Exit
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center p-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            {/* Header */}
            <div className="w-full max-w-lg mb-4">
                <div className="flex justify-between items-center p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                    <button
                        onClick={onExit}
                        className="text-sm px-3 py-1 rounded"
                        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                    >
                        ← Exit
                    </button>

                    <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-1)' }}>
                            LEVEL {level}
                        </div>
                        <div className="text-xs opacity-60">
                            Best: {bestLevel}
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--color-warning)' }}>
                            🪙 {sessionCoins}
                        </div>
                    </div>
                </div>

                {/* Move Counter */}
                <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="flex justify-between text-xs mb-1">
                        <span>Moves: {moves}/{maxMoves}</span>
                        <span className={moves > maxMoves * 0.8 ? 'text-red-500' : ''}>
                            {maxMoves - moves} left
                        </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                        <div
                            className="h-full transition-all duration-300"
                            style={{
                                width: `${(moves / maxMoves) * 100}%`,
                                backgroundColor: moves > maxMoves * 0.8 ? 'var(--color-error)' : 'var(--color-accent-1)'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Level Up Animation */}
            {showLevelUp && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                    <div className="text-4xl font-bold animate-bounce" style={{ color: 'var(--color-warning)' }}>
                        🎉 LEVEL UP! 🎉
                    </div>
                </div>
            )}

            {/* Grid */}
            <div
                className="grid gap-0.5 p-1 rounded-xl shadow-2xl border transition-all"
                style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                    width: '100%',
                    maxWidth: '400px',
                    aspectRatio: '1/1',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: isWon ? 'var(--color-warning)' : 'var(--color-border)'
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
