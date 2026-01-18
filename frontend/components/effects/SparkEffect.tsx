import React, { useEffect, useState, useCallback } from 'react';

interface Spark {
    id: number;
    x: number;
    y: number;
    angle: number;
    distance: number;
    color: string;
    size: number;
    delay: number;
}

interface SparkEffectProps {
    active: boolean;
    x: number; // Center X position
    y: number; // Center Y position
    count?: number;
    colors?: string[];
    onComplete?: () => void;
}

export const SparkEffect: React.FC<SparkEffectProps> = ({
    active,
    x,
    y,
    count = 12,
    colors,
    onComplete
}) => {
    const [sparks, setSparks] = useState<Spark[]>([]);

    const getColors = useCallback(() => {
        if (colors) return colors;

        const computedStyle = getComputedStyle(document.documentElement);
        return [
            computedStyle.getPropertyValue('--color-accent-1').trim() || '#22d3ee',
            computedStyle.getPropertyValue('--color-accent-2').trim() || '#e879f9',
            computedStyle.getPropertyValue('--color-warning').trim() || '#eab308',
            '#ffffff',
        ];
    }, [colors]);

    useEffect(() => {
        if (active) {
            const sparkColors = getColors();
            const newSparks: Spark[] = [];

            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                newSparks.push({
                    id: i,
                    x: 0,
                    y: 0,
                    angle,
                    distance: 30 + Math.random() * 40,
                    color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
                    size: 3 + Math.random() * 4,
                    delay: Math.random() * 100,
                });
            }

            setSparks(newSparks);

            // Clean up after animation
            const timer = setTimeout(() => {
                setSparks([]);
                if (onComplete) onComplete();
            }, 600);

            return () => clearTimeout(timer);
        }
    }, [active, count, getColors, onComplete]);

    if (!active || sparks.length === 0) return null;

    return (
        <div
            className="absolute pointer-events-none"
            style={{ left: x, top: y, width: 0, height: 0 }}
        >
            {sparks.map((spark) => (
                <div
                    key={spark.id}
                    className="absolute rounded-full animate-spark"
                    style={{
                        width: spark.size,
                        height: spark.size,
                        backgroundColor: spark.color,
                        boxShadow: `0 0 ${spark.size * 2}px ${spark.color}`,
                        '--tx': `${Math.cos(spark.angle) * spark.distance}px`,
                        '--ty': `${Math.sin(spark.angle) * spark.distance}px`,
                        animationDelay: `${spark.delay}ms`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};
