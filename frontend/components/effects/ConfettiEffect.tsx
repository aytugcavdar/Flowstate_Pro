import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { getPerformanceSettings, FrameRateLimiter } from '../../utils/performanceUtils';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    shape: 'square' | 'circle' | 'triangle';
    gravity: number;
    friction: number;
    opacity: number;
}

interface ConfettiEffectProps {
    active: boolean;
    duration?: number; // Duration in ms before stopping new particles
    particleCount?: number; // Initial burst count
    colors?: string[];
    onComplete?: () => void;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
    active,
    duration = 3000,
    particleCount: baseparticleCount = 100,
    colors,
    onComplete
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>(0);
    const isActiveRef = useRef(active);
    const startTimeRef = useRef<number>(0);
    const frameRateLimiterRef = useRef(new FrameRateLimiter(30));

    // Get optimized settings based on device performance
    const perfSettings = useMemo(() => getPerformanceSettings(), []);
    const particleCount = perfSettings.enableParticles
        ? Math.min(baseparticleCount, perfSettings.confettiParticleCount)
        : 0;

    // Get theme colors from CSS variables or use defaults
    const getColors = useCallback(() => {
        if (colors) return colors;

        const computedStyle = getComputedStyle(document.documentElement);
        return [
            computedStyle.getPropertyValue('--color-accent-1').trim() || '#22d3ee',
            computedStyle.getPropertyValue('--color-accent-2').trim() || '#e879f9',
            computedStyle.getPropertyValue('--color-warning').trim() || '#eab308',
            computedStyle.getPropertyValue('--color-success').trim() || '#22c55e',
            '#ffffff',
            '#ff6b6b',
            '#4ecdc4',
        ];
    }, [colors]);

    const createParticle = useCallback((x: number, y: number, colorOptions: string[]): Particle => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 5 + Math.random() * 10;
        const shapes: ('square' | 'circle' | 'triangle')[] = ['square', 'circle', 'triangle'];

        return {
            x,
            y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 5, // Initial upward bias
            color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
            size: 6 + Math.random() * 8,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 15,
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            gravity: 0.15 + Math.random() * 0.1,
            friction: 0.99,
            opacity: 1,
        };
    }, []);

    const burstConfetti = useCallback((canvas: HTMLCanvasElement) => {
        const colorOptions = getColors();
        const centerX = canvas.width / 2;
        const topY = canvas.height * 0.2;

        for (let i = 0; i < particleCount; i++) {
            // Spread particles from center top area
            const x = centerX + (Math.random() - 0.5) * canvas.width * 0.5;
            const y = topY + (Math.random() - 0.5) * 100;
            particlesRef.current.push(createParticle(x, y, colorOptions));
        }
    }, [particleCount, getColors, createParticle]);

    const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;

        const halfSize = particle.size / 2;

        switch (particle.shape) {
            case 'square':
                ctx.fillRect(-halfSize, -halfSize, particle.size, particle.size);
                break;
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(0, -halfSize);
                ctx.lineTo(halfSize, halfSize);
                ctx.lineTo(-halfSize, halfSize);
                ctx.closePath();
                ctx.fill();
                break;
        }

        ctx.restore();
    }, []);

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Frame rate limiting for performance
        if (!frameRateLimiterRef.current.shouldRenderFrame()) {
            animationRef.current = requestAnimationFrame(animate);
            return;
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particlesRef.current = particlesRef.current.filter(particle => {
            // Update physics
            particle.vy += particle.gravity;
            particle.vx *= particle.friction;
            particle.vy *= particle.friction;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.rotationSpeed;

            // Fade out particles that are falling off screen
            if (particle.y > canvas.height * 0.8) {
                particle.opacity -= 0.03; // Faster fade for performance
            }

            // Draw particle
            if (particle.opacity > 0) {
                drawParticle(ctx, particle);
                return true;
            }
            return false;
        });

        // Continue animation if particles exist
        if (particlesRef.current.length > 0) {
            animationRef.current = requestAnimationFrame(animate);
        } else if (onComplete) {
            onComplete();
        }
    }, [drawParticle, onComplete]);

    useEffect(() => {
        isActiveRef.current = active;

        if (active) {
            const canvas = canvasRef.current;
            if (!canvas) return;

            // Set canvas size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            startTimeRef.current = Date.now();

            // Initial burst
            burstConfetti(canvas);

            // Start animation
            animationRef.current = requestAnimationFrame(animate);

            // Add more particles periodically during duration (adjusted for device performance)
            const addCount = perfSettings.enableParticles ? (perfSettings.reducedMotion ? 0 : 3) : 0;
            const addMoreInterval = setInterval(() => {
                if (Date.now() - startTimeRef.current < duration && isActiveRef.current && addCount > 0) {
                    const colorOptions = getColors();
                    for (let i = 0; i < addCount; i++) {
                        const x = Math.random() * canvas.width;
                        const y = -20;
                        particlesRef.current.push(createParticle(x, y, colorOptions));
                    }
                }
            }, perfSettings.particleAddInterval);

            return () => {
                cancelAnimationFrame(animationRef.current);
                clearInterval(addMoreInterval);
            };
        } else {
            cancelAnimationFrame(animationRef.current);
        }
    }, [active, duration, burstConfetti, animate, getColors, createParticle]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!active && particlesRef.current.length === 0) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ width: '100%', height: '100%' }}
        />
    );
};
