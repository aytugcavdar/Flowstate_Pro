import React, { useEffect, useState, useRef, useMemo } from 'react';
import { playSound } from '../services/audio';
import { Language, TRANSLATIONS } from '../constants/translations';
import { getPerformanceSettings } from '../utils/performanceUtils';

interface CyberpunkOverlayProps {
  onComplete: () => void;
  lang: Language;
}

// Matrix rain effect component
const MatrixRain: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    let animationId: number;

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f0';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Gradient effect - brighter at front
        ctx.fillStyle = `rgba(34, 197, 94, ${0.3 + Math.random() * 0.7})`;
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-30"
    />
  );
};

export const CyberpunkOverlay: React.FC<CyberpunkOverlayProps> = ({ onComplete, lang }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [showBigSuccess, setShowBigSuccess] = useState(false);
  const [glitchPhase, setGlitchPhase] = useState(0);
  const t = TRANSLATIONS[lang];

  // Performance settings
  const perfSettings = useMemo(() => getPerformanceSettings(), []);

  useEffect(() => {
    let delay = 0;

    // Play logs sequentially
    t.logs.forEach((msg, index) => {
      // Varying speed for "typing" effect feel
      delay += Math.random() * 250 + 120;

      setTimeout(() => {
        if (!perfSettings.reducedMotion) {
          playSound('click'); // Mechanical typing sound
        }
        setLogs(prev => [...prev, msg]);

        // Scroll to bottom
        const el = document.getElementById('hack-logs');
        if (el) el.scrollTop = el.scrollHeight;

      }, delay);
    });

    // Show big success text after logs
    const climaxDelay = delay + 500;
    setTimeout(() => {
      setShowBigSuccess(true);
      playSound('power'); // Big power up sound

      // Trigger glitch phases for dramatic effect
      setTimeout(() => setGlitchPhase(1), 100);
      setTimeout(() => setGlitchPhase(2), 300);
      setTimeout(() => setGlitchPhase(3), 500);
    }, climaxDelay);

    // End animation and trigger callback
    setTimeout(() => {
      onComplete();
    }, climaxDelay + 1800); // Slightly faster completion

  }, [onComplete, t.logs, perfSettings.reducedMotion]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono overflow-hidden">
      {/* Matrix Rain Background */}
      <MatrixRain enabled={perfSettings.enableComplexAnimations} />

      {/* Background CRT Effects */}
      <div className="absolute inset-0 scanlines opacity-30"></div>
      <div className="absolute inset-0 bg-green-900/10 animate-pulse"></div>

      {/* Console Output */}
      {!showBigSuccess && (
        <div
          id="hack-logs"
          className="relative z-10 w-full max-w-md p-6 h-64 overflow-y-auto flex flex-col gap-2 text-xs sm:text-sm text-green-500 font-bold"
        >
          {logs.map((log, i) => (
            <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="opacity-50 mr-2">{`>`}</span>
              {log}
            </div>
          ))}
          <div className="animate-pulse">_</div>
        </div>
      )}

      {/* Climax Success Screen with enhanced glitch */}
      {showBigSuccess && (
        <div className={`relative z-10 flex flex-col items-center animate-in zoom-in duration-300 ${glitchPhase >= 1 ? 'glitch-intense' : ''}`}>
          <div className={`text-6xl sm:text-8xl mb-4 ${glitchPhase >= 2 ? 'animate-bounce' : ''}`}>⚡</div>
          <h1 className={`text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 tracking-tighter text-glow ${glitchPhase >= 3 ? 'animate-glitch' : ''} text-center`}>
            {t.success.system}<br />{t.success.online}
          </h1>
          <div className={`mt-4 px-4 py-1 bg-green-500/20 border border-green-500 text-green-400 text-xs tracking-[0.3em] ${glitchPhase >= 2 ? 'animate-pulse' : ''}`}>
            {t.success.access}
          </div>
          {/* Extra dramatic elements */}
          <div className="mt-6 flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-green-400"
                style={{
                  animation: `pulse 0.5s ease-in-out ${i * 0.1}s infinite`,
                  opacity: 0.5 + (i * 0.1)
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};