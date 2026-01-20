
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { TRANSLATIONS, Language } from '../constants/translations';
import { BADGES } from '../services/progression';
import { WinAnalysis, DailyMission } from '../types';
import { playSound } from '../services/audio';
import { ConfettiEffect } from './effects/ConfettiEffect';
import { ShareCardModal } from './ShareCardModal';
import { ShareCardData } from '../services/shareService';
import { getPerformanceSettings } from '../utils/performanceUtils';

// Typewriter effect component for dramatic text reveal
const TypewriterText: React.FC<{ text: string; speed?: number; onComplete?: () => void; className?: string }> = ({
    text, speed = 30, onComplete, className = ""
}) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(timer);
                setIsComplete(true);
                onComplete?.();
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed, onComplete]);

    return (
        <span className={className}>
            {displayedText}
            {!isComplete && <span className="animate-pulse">▊</span>}
        </span>
    );
};

// Mode-specific story messages
const getStoryIntro = (mode: string, lang: Language, streak?: number): { title: string; subtitle: string } => {
    if (mode === 'CAMPAIGN') {
        return lang === 'tr'
            ? { title: "BÖLÜM TAMAMLANDI", subtitle: "Akış başarıyla yönlendirildi..." }
            : { title: "CHAPTER COMPLETE", subtitle: "Flow successfully redirected..." };
    }
    if (mode === 'DAILY') {
        const streakText = streak && streak > 1
            ? (lang === 'tr' ? ` (${streak}. gün seri!)` : ` (${streak} day streak!)`)
            : '';
        return lang === 'tr'
            ? { title: "GÜNLÜK GÖREV", subtitle: `Sistem güvenliği aşıldı${streakText}` }
            : { title: "DAILY MISSION", subtitle: `System security bypassed${streakText}` };
    }
    // Practice mode
    return lang === 'tr'
        ? { title: "ANTRENMAN TAMAMLANDI", subtitle: "Yetenekler gelişiyor..." }
        : { title: "TRAINING COMPLETE", subtitle: "Skills improving..." };
};

interface TerminalWinScreenProps {
    moves: number;
    timeMs: number;
    unlockedBadges: string[];
    winAnalysis: WinAnalysis | null;
    lang: Language;
    onShare: () => void;
    onNext: () => void;
    onClose: () => void;
    mode: string; // 'DAILY' | 'PRACTICE' | 'CAMPAIGN'
    xpGained: number;
    missions?: DailyMission[];
    completedMissionIds?: string[];
    streak?: number;
    campaignStars?: number; // New for campaign
    hasNextLevel?: boolean;
    dateKey?: string; // For share card
}

export const TerminalWinScreen: React.FC<TerminalWinScreenProps> = ({
    moves, timeMs, unlockedBadges, winAnalysis, lang, onShare, onNext, onClose, mode, xpGained, missions, completedMissionIds, streak, campaignStars, hasNextLevel, dateKey
}) => {
    const t = TRANSLATIONS[lang];
    const [lines, setLines] = useState<React.ReactNode[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [showConfetti, setShowConfetti] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);

    // Performance settings
    const perfSettings = getPerformanceSettings();
    const storyIntro = getStoryIntro(mode, lang, streak);

    // Prepare share card data
    const shareCardData: ShareCardData = {
        moves,
        timeMs,
        mode: mode as 'DAILY' | 'PRACTICE' | 'CAMPAIGN',
        dateKey: dateKey || new Date().toISOString().split('T')[0],
        rank: winAnalysis?.rank,
        stars: campaignStars,
        streak,
        xpGained,
    };

    const addLine = useCallback((content: React.ReactNode) => {
        setLines(prev => [...prev, content]);
        if (!perfSettings.reducedMotion) {
            playSound('click');
        }
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [perfSettings.reducedMotion]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const sequence = async () => {
            const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

            // Mode-specific dramatic intro
            await wait(300);
            addLine(
                <div className="text-center mb-4 space-y-1">
                    <div className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 animate-pulse">
                        {storyIntro.title}
                    </div>
                    <TypewriterText
                        text={storyIntro.subtitle}
                        speed={40}
                        className="text-xs text-slate-400 italic"
                    />
                </div>
            );

            await wait(800);
            addLine(<div className="text-xs text-slate-500 border-b border-slate-700 pb-1 mb-2">--- {t.terminal.header} ---</div>);

            await wait(250);
            addLine(<div className="text-green-500 font-bold">{`> ${t.terminal.upload}... OK`}</div>);

            await wait(300);
            addLine(
                <div className="flex justify-between w-full max-w-xs text-sm">
                    <span className="text-slate-400">{t.terminal.analysis}:</span>
                    <span className="text-cyan-400 font-mono">{moves} MOVES</span>
                </div>
            );

            // Campaign Stars
            if (mode === 'CAMPAIGN' && campaignStars) {
                await wait(400);
                addLine(
                    <div className="flex justify-between items-center w-full max-w-xs text-sm mt-2 p-2 bg-yellow-900/10 border border-yellow-900/30 rounded">
                        <span className="text-slate-400">{t.terminal.stars}:</span>
                        <div className="flex gap-1 text-xl">
                            {[1, 2, 3].map(s => (
                                <span key={s} className={`transform transition-all ${s <= campaignStars ? 'text-yellow-400 scale-110' : 'text-slate-800'}`}>★</span>
                            ))}
                        </div>
                    </div>
                );
            }

            // Mission Report
            if (missions && completedMissionIds && missions.length > 0) {
                await wait(500);
                addLine(<div className="mt-2 text-slate-500 text-[10px]">--- {t.terminal.missions} ---</div>);

                for (const m of missions) {
                    const isDone = completedMissionIds.includes(m.id);
                    await wait(200);
                    addLine(
                        <div className={`flex justify-between items-center w-full max-w-xs text-xs py-0.5 ${isDone ? 'text-green-400' : 'text-slate-600'}`}>
                            <span className="flex items-center gap-2">
                                <span>{isDone ? '[x]' : '[ ]'}</span>
                                <span>{t.missions[m.description as keyof typeof t.missions].replace('{target}', m.target.toString())}</span>
                            </span>
                            {isDone && <span className="font-mono text-yellow-500">+{m.xpReward}XP</span>}
                        </div>
                    );
                }
            }

            await wait(500);
            // XP GAIN
            if (xpGained > 0) {
                const streakBonus = (streak && streak > 1) ? ` (x${(1 + Math.min(streak, 10) * 0.1).toFixed(1)})` : '';
                addLine(
                    <div className="flex justify-between w-full max-w-xs text-sm border-t border-slate-800 pt-2 mt-2">
                        <span className="text-slate-400">{t.terminal.xp}:</span>
                        <span className="text-yellow-400 font-bold font-mono animate-pulse">+{xpGained} XP{streakBonus}</span>
                    </div>
                );
            } else if (mode === 'DAILY') {
                addLine(
                    <div className="flex justify-center w-full max-w-xs text-xs text-slate-500 border-t border-slate-800 pt-2 mt-2 font-mono">
                        // {lang === 'tr' ? 'GÜNLÜK ÖDÜL ALINDI' : 'DAILY REWARD CLAIMED'}
                    </div>
                );
            }

            if (unlockedBadges.length > 0) {
                await wait(800);
                unlockedBadges.forEach(bid => {
                    const badgeInfo = t.badges[bid as keyof typeof t.badges];
                    const baseBadge = BADGES[bid];
                    if (badgeInfo && baseBadge) {
                        addLine(
                            <div className="my-2 p-2 bg-yellow-900/20 border border-yellow-600/50 rounded flex items-center gap-3 animate-pulse">
                                <span className="text-2xl">{baseBadge.icon}</span>
                                <div>
                                    <div className="text-[10px] text-yellow-500 uppercase tracking-widest">{t.terminal.badge}</div>
                                    <div className="text-yellow-300 font-bold">{badgeInfo.name}</div>
                                </div>
                            </div>
                        );
                    }
                });
            }

            if (winAnalysis) {
                await wait(1000);
                addLine(<div className="mt-2 text-slate-500 text-[10px]">--- {t.terminal.rank} ---</div>);
                addLine(<div className="text-lg font-black text-fuchsia-500 tracking-wider typing-effect">{winAnalysis.rank}</div>);
                await wait(500);
                addLine(<div className="text-xs text-slate-400 italic">"{winAnalysis.comment}"</div>);
            }

            await wait(1000);
            setIsComplete(true);
        };

        sequence();
        return () => clearTimeout(timer);
    }, [moves, timeMs, unlockedBadges, winAnalysis, xpGained, missions, completedMissionIds, campaignStars]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                backgroundColor: 'rgba(2, 6, 23, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
            }}
        >
            {/* Confetti celebration */}
            <ConfettiEffect
                active={showConfetti}
                duration={4000}
                particleCount={80}
                onComplete={() => setShowConfetti(false)}
            />

            {/* Premium Glass Container */}
            <div
                className="w-full max-w-md h-[550px] flex flex-col font-mono rounded-2xl shadow-2xl relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    boxShadow: `
                        0 0 60px rgba(34, 197, 94, 0.15),
                        0 0 0 1px rgba(34, 197, 94, 0.2),
                        0 20px 60px rgba(0, 0, 0, 0.5),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05)
                    `
                }}
            >
                {/* Animated gradient top border */}
                <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{
                        background: 'linear-gradient(90deg, #22c55e, #22d3ee, #8b5cf6, #e879f9, #22c55e)',
                        backgroundSize: '200% 100%',
                        animation: 'rainbow-flow 3s linear infinite'
                    }}
                />

                {/* CRT Scanline Overlay */}
                <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.05) 0%, transparent 70%)' }} />

                {/* Scrollable Content */}
                <div className="flex-1 p-6 overflow-y-auto space-y-1 scrollbar-hide">
                    {lines.map((line, i) => <div key={i} className="animate-in fade-in duration-300">{line}</div>)}
                    <div ref={bottomRef}></div>
                </div>

                {/* Footer Buttons - Premium Glass Style */}
                {isComplete && (
                    <div
                        className="p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-500"
                        style={{
                            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
                            borderTop: '1px solid rgba(34, 197, 94, 0.2)'
                        }}
                    >
                        <div className="flex gap-2 w-full">
                            {/* Text Share - Glass Green */}
                            <button
                                onClick={onShare}
                                className="flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.2) 100%)',
                                    border: '1px solid rgba(34, 197, 94, 0.4)',
                                    color: '#86efac',
                                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)'
                                }}
                            >
                                <span>📋</span>
                                <span>{t.buttons.share}</span>
                            </button>

                            {/* Visual Share - Glass Magenta */}
                            <button
                                onClick={() => { playSound('click'); setShowShareModal(true); }}
                                className="flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(217, 70, 239, 0.3) 0%, rgba(168, 85, 247, 0.2) 100%)',
                                    border: '1px solid rgba(217, 70, 239, 0.4)',
                                    color: '#f0abfc',
                                    boxShadow: '0 0 20px rgba(217, 70, 239, 0.2)'
                                }}
                            >
                                <span>📸</span>
                                <span>{lang === 'tr' ? 'Görsel' : 'Image'}</span>
                            </button>

                            {/* Next Level - Glass Slate */}
                            {(mode === 'PRACTICE' || (mode === 'CAMPAIGN' && hasNextLevel)) && (
                                <button
                                    onClick={onNext}
                                    className="flex-1 py-3 font-bold rounded-xl transition-all duration-300 hover:scale-[1.02]"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
                                        border: '1px solid rgba(100, 116, 139, 0.4)',
                                        color: '#e2e8f0'
                                    }}
                                >
                                    {t.buttons.next}
                                </button>
                            )}
                        </div>

                        {/* Close Button - Subtle */}
                        <button
                            onClick={onClose}
                            className="w-full py-2 text-slate-500 hover:text-slate-300 text-xs font-bold rounded-lg transition-all duration-200 hover:bg-white/5"
                        >
                            {t.buttons.close}
                        </button>
                    </div>
                )}
            </div>

            {/* Share Card Modal */}
            <ShareCardModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                lang={lang}
                data={shareCardData}
            />
        </div>
    );
};
