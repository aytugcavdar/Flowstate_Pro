/**
 * Puzzle Progress Bar Component
 * Shows how much of the grid has power/flow - intuitive visual feedback
 */

import React, { useMemo } from 'react';
import { Grid, TileType } from '../types';

interface ProgressBarProps {
    grid: Grid;
    isWon: boolean;
}

export const PuzzleProgressBar: React.FC<ProgressBarProps> = ({ grid, isWon }) => {
    const { powered, total, percentage } = useMemo(() => {
        let powered = 0;
        let total = 0;

        grid.flat().forEach(tile => {
            // Count tiles that could have flow (exclude empty, block)
            if (tile.type !== TileType.EMPTY && tile.type !== TileType.BLOCK) {
                total++;
                if (tile.hasFlow) {
                    powered++;
                }
            }
        });

        return {
            powered,
            total,
            percentage: total > 0 ? Math.round((powered / total) * 100) : 0
        };
    }, [grid]);

    // Don't show if no flowable tiles
    if (total === 0) return null;

    // Color based on progress
    const getBarColor = () => {
        if (isWon) return 'from-green-400 to-emerald-500';
        if (percentage >= 80) return 'from-cyan-400 to-blue-500';
        if (percentage >= 50) return 'from-yellow-400 to-orange-500';
        return 'from-slate-500 to-slate-600';
    };

    const getGlowColor = () => {
        if (isWon) return 'shadow-green-500/50';
        if (percentage >= 80) return 'shadow-cyan-500/30';
        if (percentage >= 50) return 'shadow-yellow-500/20';
        return '';
    };

    return (
        <div className="w-full max-w-xs mx-auto px-4">
            {/* Minimal label - just icon and percentage */}
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="flex items-center gap-1 text-slate-400">
                    <span className="text-cyan-400">⚡</span>
                    Power
                </span>
                <span className={`font-bold ${isWon ? 'text-green-400' : percentage >= 50 ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {percentage}%
                </span>
            </div>

            {/* Animated progress bar */}
            <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                    className={`h-full bg-gradient-to-r ${getBarColor()} transition-all duration-500 ease-out rounded-full ${getGlowColor()} shadow-lg`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
