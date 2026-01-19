
import React, { useState } from 'react';
import { CAMPAIGN_CHAPTERS, calculateTotalStars } from '../services/campaign';
import { CampaignProgress, CampaignLevel } from '../types';
import { Language, TRANSLATIONS } from '../constants/translations';
import { playSound } from '../services/audio';

interface CampaignMenuProps {
    progress: CampaignProgress;
    onSelectLevel: (level: CampaignLevel) => void;
    lang: Language;
    onBack: () => void;
}

export const CampaignMenu: React.FC<CampaignMenuProps> = ({ progress, onSelectLevel, lang, onBack }) => {
    const t = TRANSLATIONS[lang];
    const totalStars = calculateTotalStars(progress);
    const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

    // Level Grid View
    if (selectedChapterId) {
        const chapter = CAMPAIGN_CHAPTERS.find(c => c.id === selectedChapterId)!;
        const chapterIdx = parseInt(chapter.id.replace('ch', ''));

        return (
            <div className="w-full max-w-lg mx-auto p-4 animate-in fade-in">
                {/* Chapter Header */}
                <div className="mb-6">
                    <button
                        onClick={() => setSelectedChapterId(null)}
                        className="text-xs text-cyan-400 hover:text-white mb-3 flex items-center gap-1"
                    >
                        ← {t.buttons.back}
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-500 tracking-widest block mb-1">
                                {t.campaign.chapter} {chapterIdx}
                            </span>
                            <h2 className="text-2xl font-black text-white">{chapter.title}</h2>
                        </div>
                        <div className="text-right">
                            <span className="text-yellow-400 font-bold text-lg">★ {chapter.levels.reduce((a, l) => a + (progress.levelStars[l.id] || 0), 0)}</span>
                            <span className="text-slate-500 text-sm">/{chapter.levels.length * 3}</span>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">{chapter.description}</p>
                </div>

                {/* Level Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {chapter.levels.map((level, idx) => {
                        const stars = progress.levelStars[level.id] || 0;
                        const isLocked = idx > 0 && !progress.levelStars[chapter.levels[idx - 1].id];
                        const isOpen = !isLocked;
                        const isBoss = level.isBoss;
                        const isCompleted = stars > 0;

                        return (
                            <button
                                key={level.id}
                                disabled={!isOpen}
                                onClick={() => { playSound('click'); onSelectLevel(level); }}
                                className={`relative rounded-xl p-3 transition-all duration-200
                                    ${isBoss ? 'col-span-3' : ''}
                                    ${isBoss
                                        ? isCompleted
                                            ? 'bg-gradient-to-r from-yellow-600 to-orange-600 shadow-lg shadow-yellow-500/20'
                                            : isOpen
                                                ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600/40 hover:border-yellow-500'
                                                : 'bg-slate-900 border border-slate-800'
                                        : isCompleted
                                            ? 'bg-gradient-to-br from-cyan-600 to-blue-700 shadow-lg shadow-cyan-500/20'
                                            : isOpen
                                                ? 'bg-slate-800/80 border border-slate-600 hover:border-cyan-500 hover:bg-slate-700'
                                                : 'bg-slate-900/50 border border-slate-800 opacity-40'
                                    }
                                `}
                            >
                                {/* Level Number/Icon */}
                                <div className={`text-center ${isBoss ? 'py-2' : ''}`}>
                                    {isBoss ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="text-3xl">{level.title.split(' ')[0]}</span>
                                            <div>
                                                <div className="text-xs text-yellow-200/70 uppercase">Boss</div>
                                                <div className="text-lg font-bold text-white">{level.title.split(' ').slice(1).join(' ')}</div>
                                            </div>
                                        </div>
                                    ) : isLocked ? (
                                        <span className="text-2xl opacity-30">🔒</span>
                                    ) : (
                                        <span className="text-xl font-bold text-white">{idx + 1}</span>
                                    )}
                                </div>

                                {/* Stars */}
                                {!isBoss && (
                                    <div className="flex justify-center gap-0.5 mt-2">
                                        {[1, 2, 3].map(s => (
                                            <span key={s} className={`text-xs ${s <= stars ? 'text-yellow-400' : 'text-slate-700'}`}>★</span>
                                        ))}
                                    </div>
                                )}

                                {/* Level title */}
                                {!isBoss && (
                                    <div className={`text-[9px] mt-1 text-center truncate ${isCompleted ? 'text-white/80' : 'text-slate-500'}`}>
                                        {level.title}
                                    </div>
                                )}

                                {/* Boss stars */}
                                {isBoss && stars > 0 && (
                                    <div className="flex justify-center gap-1 mt-2">
                                        {[1, 2, 3].map(s => (
                                            <span key={s} className={`text-lg ${s <= stars ? 'text-yellow-300' : 'text-yellow-900'}`}>★</span>
                                        ))}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Chapter List
    const icons = ['⚡', '🌆', '🌐', '⚙️', '🌟'];
    const gradients = [
        'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
        'from-purple-500/20 to-pink-500/20 border-purple-500/30',
        'from-green-500/20 to-teal-500/20 border-green-500/30',
        'from-orange-500/20 to-red-500/20 border-orange-500/30',
        'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
    ];

    return (
        <div className="w-full max-w-lg mx-auto p-4 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-wide">{t.campaign.title}</h1>
                    <p className="text-xs text-slate-500">{lang === 'tr' ? 'Hikayeyi tamamla' : 'Complete the story'}</p>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                    <span className="text-yellow-400 text-lg">★</span>
                    <span className="text-yellow-400 font-bold">{totalStars}</span>
                </div>
            </div>

            {/* Chapter Cards */}
            <div className="space-y-4">
                {CAMPAIGN_CHAPTERS.map((chapter, idx) => {
                    const isUnlocked = progress.unlockedChapters.includes(chapter.id);
                    const chapterStars = chapter.levels.reduce((a, l) => a + (progress.levelStars[l.id] || 0), 0);
                    const maxStars = chapter.levels.length * 3;
                    const completed = chapter.levels.filter(l => progress.levelStars[l.id] > 0).length;
                    const percent = (completed / chapter.levels.length) * 100;

                    return (
                        <button
                            key={chapter.id}
                            disabled={!isUnlocked}
                            onClick={() => { playSound('click'); setSelectedChapterId(chapter.id); }}
                            className={`w-full text-left rounded-2xl overflow-hidden transition-all duration-200
                                ${isUnlocked
                                    ? 'hover:scale-[1.02] active:scale-[0.98]'
                                    : 'opacity-50 grayscale'
                                }
                            `}
                        >
                            <div className={`p-5 bg-gradient-to-r ${gradients[idx]} border backdrop-blur-sm`}>
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl
                                        ${isUnlocked ? 'bg-white/10' : 'bg-slate-800'}
                                    `}>
                                        {isUnlocked ? icons[idx] : '🔒'}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                                                    {t.campaign.chapter} {idx + 1}
                                                </span>
                                                <h3 className="text-lg font-bold text-white mt-0.5">{chapter.title}</h3>
                                            </div>
                                            {isUnlocked && (
                                                <div className="text-right">
                                                    <div className="text-yellow-400 font-bold">★ {chapterStars}</div>
                                                    <div className="text-[10px] text-slate-500">{completed}/{chapter.levels.length}</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Progress bar */}
                                        {isUnlocked && (
                                            <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-white/60 rounded-full transition-all duration-500"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        )}

                                        {/* Locked message */}
                                        {!isUnlocked && (
                                            <p className="text-xs text-slate-500 mt-2">
                                                {t.campaign.locked} <span className="text-yellow-600">★ {chapter.requiredStars}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Back Button */}
            <button
                onClick={onBack}
                className="w-full mt-6 py-3 text-slate-500 hover:text-white text-sm border border-slate-800 hover:border-slate-600 rounded-xl transition-colors"
            >
                {t.buttons.back}
            </button>
        </div>
    );
};
