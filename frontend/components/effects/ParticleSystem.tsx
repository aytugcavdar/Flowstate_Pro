/**
 * ParticleSystem - Ambient background particles for premium feel
 */

import React, { useEffect, useState, useMemo } from 'react';

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    color: 'cyan' | 'magenta' | 'white';
}

interface ParticleSystemProps {
    count?: number;
    enabled?: boolean;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
    count = 20,
    enabled = true
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const particles = useMemo<Particle[]>(() => {
        if (!mounted) return [];

        return Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 2 + Math.random() * 4,
            duration: 15 + Math.random() * 20,
            delay: Math.random() * 10,
            color: (['cyan', 'magenta', 'white'] as const)[Math.floor(Math.random() * 3)]
        }));
    }, [count, mounted]);

    if (!enabled || !mounted) return null;

    const colorMap = {
        cyan: 'rgba(34, 211, 238, 0.6)',
        magenta: 'rgba(217, 70, 239, 0.6)',
        white: 'rgba(255, 255, 255, 0.4)'
    };

    return (
        <div className="particle-container">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="particle particle-ambient"
                    style={{
                        left: `${particle.x}%`,
                        bottom: '-20px',
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        background: `radial-gradient(circle, ${colorMap[particle.color]} 0%, transparent 70%)`,
                        animationDuration: `${particle.duration}s`,
                        animationDelay: `${particle.delay}s`,
                        filter: `blur(${particle.size > 4 ? 1 : 0}px)`
                    }}
                />
            ))}
        </div>
    );
};

/**
 * Electric Spark Effect - For flow connections
 */
interface SparkProps {
    x: number;
    y: number;
    color?: 'cyan' | 'magenta' | 'white';
    onComplete?: () => void;
}

export const ElectricSpark: React.FC<SparkProps> = ({ x, y, color = 'cyan', onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete?.();
        }, 600);
        return () => clearTimeout(timer);
    }, [onComplete]);

    const sparkColor = {
        cyan: '#22d3ee',
        magenta: '#e879f9',
        white: '#ffffff'
    }[color];

    return (
        <div
            className="fixed pointer-events-none z-50"
            style={{ left: x, top: y }}
        >
            {Array.from({ length: 8 }, (_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const distance = 30 + Math.random() * 20;
                return (
                    <div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full animate-spark"
                        style={{
                            backgroundColor: sparkColor,
                            boxShadow: `0 0 8px ${sparkColor}, 0 0 16px ${sparkColor}`,
                            '--tx': `${Math.cos(angle) * distance}px`,
                            '--ty': `${Math.sin(angle) * distance}px`
                        } as React.CSSProperties}
                    />
                );
            })}
        </div>
    );
};

/**
 * Win Celebration - Explosion of particles
 */
interface WinExplosionProps {
    x: number;
    y: number;
    onComplete?: () => void;
}

export const WinExplosion: React.FC<WinExplosionProps> = ({ x, y, onComplete }) => {
    const [particles, setParticles] = useState<Array<{
        id: number;
        angle: number;
        distance: number;
        size: number;
        color: string;
        delay: number;
    }>>([]);

    useEffect(() => {
        const colors = ['#22d3ee', '#e879f9', '#fbbf24', '#22c55e', '#f43f5e', '#8b5cf6'];
        const newParticles = Array.from({ length: 40 }, (_, i) => ({
            id: i,
            angle: (i / 40) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
            distance: 80 + Math.random() * 120,
            size: 4 + Math.random() * 8,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 0.2
        }));
        setParticles(newParticles);

        const timer = setTimeout(() => {
            onComplete?.();
        }, 1500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            className="fixed pointer-events-none z-50"
            style={{ left: x, top: y }}
        >
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        boxShadow: `0 0 10px ${p.color}`,
                        animation: `spark-fly 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s forwards`,
                        '--tx': `${Math.cos(p.angle) * p.distance}px`,
                        '--ty': `${Math.sin(p.angle) * p.distance}px`
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};

/**
 * Floating Orbs - Decorative background elements
 */
export const FloatingOrbs: React.FC = () => {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Large Cyan Orb */}
            <div
                className="absolute rounded-full animate-float"
                style={{
                    width: '400px',
                    height: '400px',
                    top: '10%',
                    left: '-100px',
                    background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    animationDelay: '0s',
                    animationDuration: '8s'
                }}
            />

            {/* Medium Magenta Orb */}
            <div
                className="absolute rounded-full animate-float"
                style={{
                    width: '300px',
                    height: '300px',
                    bottom: '20%',
                    right: '-50px',
                    background: 'radial-gradient(circle, rgba(217, 70, 239, 0.1) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    animationDelay: '2s',
                    animationDuration: '10s'
                }}
            />

            {/* Small Purple Orb */}
            <div
                className="absolute rounded-full animate-float"
                style={{
                    width: '200px',
                    height: '200px',
                    top: '50%',
                    right: '20%',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                    filter: 'blur(30px)',
                    animationDelay: '4s',
                    animationDuration: '12s'
                }}
            />
        </div>
    );
};
