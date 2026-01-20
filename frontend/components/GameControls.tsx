
import React from 'react';
import { TRANSLATIONS, Language } from '../constants/translations';

interface GameControlsProps {
    isWon: boolean;
    loadingHint: boolean;
    mode: 'DAILY' | 'PRACTICE';
    charges: number;
    lang: Language;
    onRequestHint: () => void;
    onReset: () => void;
    onNewLevel: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
    isWon, loadingHint, mode, charges, lang, onRequestHint, onReset, onNewLevel
}) => {
    const t = TRANSLATIONS[lang];

    return (
        <div className="w-full flex flex-col gap-3 px-2">
            {/* Capacitor Ability Bar - Premium Glass Design */}
            <div
                className="w-full flex justify-between items-center px-4 py-3 rounded-2xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: charges > 0
                        ? '1px solid rgba(59, 130, 246, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: charges > 0
                        ? '0 0 20px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                        : '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
            >
                <div className="flex items-center gap-2">
                    <span
                        className={`text-xl transition-all duration-300 ${charges > 0 ? 'animate-pulse' : 'opacity-30'}`}
                        style={{ filter: charges > 0 ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' : 'none' }}
                    >
                        {charges > 0 ? '⚡' : '🔋'}
                    </span>
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                        {lang === 'tr' ? 'Yetenek' : 'Ability'}
                    </span>
                </div>
                <div
                    className={`text-xs font-bold font-mono px-4 py-1.5 rounded-xl transition-all duration-300`}
                    style={{
                        background: charges > 0
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)'
                            : 'rgba(30, 41, 59, 0.5)',
                        color: charges > 0 ? '#93c5fd' : '#64748b',
                        border: charges > 0
                            ? '1px solid rgba(59, 130, 246, 0.4)'
                            : '1px solid rgba(100, 116, 139, 0.2)',
                        boxShadow: charges > 0
                            ? '0 0 15px rgba(59, 130, 246, 0.2)'
                            : 'none'
                    }}
                >
                    {charges > 0
                        ? (lang === 'tr' ? '🎯 BUG\'A TIKLA' : '🎯 CLICK BUG')
                        : (lang === 'tr' ? 'BOŞ' : 'EMPTY')
                    }
                </div>
            </div>

            {/* Action Buttons - Modern Glass Style */}
            <div className="w-full flex justify-center items-center gap-3">
                {!isWon && (
                    <>
                        {/* Hint Button */}
                        <button
                            onClick={onRequestHint}
                            disabled={loadingHint}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 hover:from-cyan-800/50 hover:to-cyan-700/30 text-cyan-400 text-sm font-bold rounded-xl border border-cyan-700/40 hover:border-cyan-500/60 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-900/30"
                        >
                            <span className="text-lg group-hover:animate-pulse">💡</span>
                            <span>{loadingHint ? '...' : t.buttons.hint}</span>
                        </button>

                        {/* Reset Button - Only in Practice mode (Daily is one-shot) */}
                        {mode === 'PRACTICE' && (
                            <button
                                onClick={onReset}
                                className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-slate-800/80 to-slate-700/60 hover:from-slate-700/80 hover:to-slate-600/60 text-slate-300 text-sm font-bold rounded-xl border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 shadow-lg"
                            >
                                <span className="text-lg group-hover:rotate-180 transition-transform duration-500">🔄</span>
                                <span>{t.buttons.reset}</span>
                            </button>
                        )}
                    </>
                )}

                {/* New Level Button (Practice Mode) */}
                {mode === 'PRACTICE' && !isWon && (
                    <button
                        onClick={onNewLevel}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-purple-900/40 to-purple-800/20 hover:from-purple-800/50 hover:to-purple-700/30 text-purple-400 text-sm font-bold rounded-xl border border-purple-700/40 hover:border-purple-500/60 transition-all duration-300 shadow-lg hover:shadow-purple-900/30"
                    >
                        <span className="text-lg group-hover:translate-x-1 transition-transform">✨</span>
                        <span>{t.buttons.newLevel}</span>
                    </button>
                )}
            </div>
        </div>
    );
};
