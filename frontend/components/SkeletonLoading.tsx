/**
 * Skeleton Loading Component
 * Shows animated placeholder while game is loading
 */

import React from 'react';
import { GRID_SIZE } from '../constants';

interface SkeletonGridProps {
    size?: number;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ size = GRID_SIZE }) => {
    return (
        <div className="w-full max-w-lg aspect-square p-1 bg-slate-900 rounded-xl border border-slate-800">
            <div
                className="grid gap-0.5 w-full h-full"
                style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
            >
                {Array(size * size).fill(null).map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square bg-slate-800 rounded-lg animate-pulse"
                        style={{
                            animationDelay: `${(i % size) * 50}ms`,
                            animationDuration: '1s'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

/**
 * Skeleton for header stats
 */
export const SkeletonStats: React.FC = () => {
    return (
        <div className="flex items-center gap-4">
            <div className="h-6 w-16 bg-slate-800 rounded animate-pulse" />
            <div className="h-6 w-16 bg-slate-800 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
            <div className="h-6 w-20 bg-slate-800 rounded animate-pulse" style={{ animationDelay: '200ms' }} />
        </div>
    );
};

/**
 * Full page loading skeleton
 */
export const SkeletonPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center gap-6 p-4">
            {/* Header skeleton */}
            <div className="w-full max-w-lg flex justify-between items-center px-4">
                <div className="h-8 w-32 bg-slate-800 rounded animate-pulse" />
                <SkeletonStats />
            </div>

            {/* Grid skeleton */}
            <SkeletonGrid />

            {/* Footer skeleton */}
            <div className="w-full max-w-lg flex justify-center gap-4 px-4">
                <div className="h-10 w-24 bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-10 w-24 bg-slate-800 rounded-lg animate-pulse" style={{ animationDelay: '100ms' }} />
                <div className="h-10 w-24 bg-slate-800 rounded-lg animate-pulse" style={{ animationDelay: '200ms' }} />
            </div>
        </div>
    );
};
