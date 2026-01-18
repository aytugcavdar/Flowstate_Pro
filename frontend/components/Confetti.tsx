import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    spin: number;
    spinSpeed: number;
}

export const ConfettiCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize canvas
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Config
        const particles: Particle[] = [];
        const colors = ['#22d3ee', '#e879f9', '#facc15', '#4ade80', '#ffffff'];
        const count = 150;

        // Initialize particles
        for (let i = 0; i < count; i++) {
            particles.push({
                x: window.innerWidth * 0.5,
                y: window.innerHeight * 0.5,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20 - 5, // Upward burst
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                spin: Math.random() * 360,
                spinSpeed: (Math.random() - 0.5) * 10
            });
        }

        let animationId: number;

        const loop = () => {
            // Clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw
            particles.forEach((p, index) => {
                // Physics
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3; // Gravity
                p.vx *= 0.95; // Air resistance
                p.spin += p.spinSpeed;

                // Draw (Square confetti)
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.spin * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();

                // Reset if out of bounds (optional: remove)
                if (p.y > canvas.height + 50) {
                    // Remove particle
                    particles.splice(index, 1);
                }
            });

            if (particles.length > 0) {
                animationId = requestAnimationFrame(loop);
            }
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
        />
    );
};
