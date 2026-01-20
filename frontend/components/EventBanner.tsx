/**
 * Event Banner - Displays active seasonal event with countdown
 */

import React, { useState, useEffect } from 'react';
import {
    getCurrentEvent,
    getTimeRemaining,
    SeasonalEvent,
    getChallengeProgress,
    isChallengeComplete
} from '../services/seasonalEventsService';
import { Language } from '../constants/translations';
import { playSound } from '../services/audio';

interface EventBannerProps {
    lang: Language;
    onOpenEvent: () => void;
}

export const EventBanner: React.FC<EventBannerProps> = ({ lang, onOpenEvent }) => {
    const [event, setEvent] = useState<SeasonalEvent | null>(null);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
        const current = getCurrentEvent();
        setEvent(current);

        if (current) {
            setTimeLeft(getTimeRemaining(current.endDate));

            // Update countdown every minute
            const interval = setInterval(() => {
                setTimeLeft(getTimeRemaining(current.endDate));
            }, 60000);

            return () => clearInterval(interval);
        }
    }, []);

    if (!event) return null;

    const handleClick = () => {
        playSound('click');
        onOpenEvent();
    };

    return (
        <button
            onClick={handleClick}
            className="w-full p-3 rounded-xl transition-all duration-300 hover:scale-[1.01] relative overflow-hidden"
            style={{
                background: event.theme.bgGradient,
                border: `1px solid ${event.theme.borderColor}`,
                boxShadow: `0 0 25px ${event.theme.borderColor}`
            }}
        >
            {/* Shimmer Effect */}
            <div
                className="absolute inset-0 shimmer-sweep opacity-30"
                style={{ background: `linear-gradient(90deg, transparent, ${event.theme.primaryColor}, transparent)` }}
            />

            <div className="flex items-center justify-between relative z-10">
                {/* Left: Event Info */}
                <div className="flex items-center gap-3">
                    <span
                        className="text-2xl animate-pulse"
                        style={{ filter: `drop-shadow(0 0 8px ${event.theme.primaryColor})` }}
                    >
                        {event.icon}
                    </span>
                    <div className="text-left">
                        <div
                            className="font-bold text-sm"
                            style={{ color: event.theme.primaryColor }}
                        >
                            {lang === 'tr' ? event.nameTr : event.name}
                        </div>
                        <div className="text-xs text-slate-400">
                            {lang === 'tr' ? 'Etkinlik Devam Ediyor!' : 'Event Active!'}
                        </div>
                    </div>
                </div>

                {/* Right: Countdown */}
                <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {lang === 'tr' ? 'Bitiş' : 'Ends in'}
                    </div>
                    <div
                        className="font-mono text-sm font-bold"
                        style={{ color: event.theme.primaryColor }}
                    >
                        {timeLeft.days > 0
                            ? `${timeLeft.days}d ${timeLeft.hours}h`
                            : `${timeLeft.hours}h ${timeLeft.minutes}m`
                        }
                    </div>
                </div>
            </div>
        </button>
    );
};

// ============================================
// EVENT PANEL - Full event details modal
// ============================================

interface EventPanelProps {
    isOpen: boolean;
    onClose: () => void;
    event: SeasonalEvent;
    lang: Language;
}

export const EventPanel: React.FC<EventPanelProps> = ({ isOpen, onClose, event, lang }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
        if (event) {
            setTimeLeft(getTimeRemaining(event.endDate));
            const interval = setInterval(() => {
                setTimeLeft(getTimeRemaining(event.endDate));
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [event]);

    if (!isOpen || !event) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            style={{
                background: 'rgba(2, 6, 23, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.99) 100%)',
                    border: `1px solid ${event.theme.borderColor}`,
                    boxShadow: `0 0 60px ${event.theme.borderColor}`
                }}
            >
                {/* Header */}
                <div
                    className="p-6 text-center relative"
                    style={{ background: event.theme.bgGradient }}
                >
                    <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{
                            background: `linear-gradient(90deg, ${event.theme.primaryColor}, ${event.theme.secondaryColor}, ${event.theme.primaryColor})`,
                            backgroundSize: '200% 100%',
                            animation: 'rainbow-flow 2s linear infinite'
                        }}
                    />

                    <span
                        className="text-5xl block animate-pulse mb-2"
                        style={{ filter: `drop-shadow(0 0 15px ${event.theme.primaryColor})` }}
                    >
                        {event.icon}
                    </span>

                    <h2
                        className="text-2xl font-black"
                        style={{ color: event.theme.primaryColor }}
                    >
                        {lang === 'tr' ? event.nameTr : event.name}
                    </h2>

                    <p className="text-sm text-slate-300 mt-1">
                        {lang === 'tr' ? event.descriptionTr : event.description}
                    </p>

                    {/* Countdown */}
                    <div
                        className="inline-flex gap-3 mt-4 px-4 py-2 rounded-xl"
                        style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: `1px solid ${event.theme.borderColor}`
                        }}
                    >
                        <div className="text-center">
                            <div className="text-xl font-black" style={{ color: event.theme.primaryColor }}>{timeLeft.days}</div>
                            <div className="text-[10px] text-slate-500">{lang === 'tr' ? 'GÜN' : 'DAYS'}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-black" style={{ color: event.theme.primaryColor }}>{timeLeft.hours}</div>
                            <div className="text-[10px] text-slate-500">{lang === 'tr' ? 'SAAT' : 'HRS'}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-black" style={{ color: event.theme.primaryColor }}>{timeLeft.minutes}</div>
                            <div className="text-[10px] text-slate-500">{lang === 'tr' ? 'DAK' : 'MIN'}</div>
                        </div>
                    </div>
                </div>

                {/* Challenges */}
                <div className="p-4 space-y-3">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                        {lang === 'tr' ? 'Meydan Okumalar' : 'Challenges'}
                    </div>

                    {event.challenges.map(challenge => {
                        const progress = getChallengeProgress(event.id, challenge);
                        const complete = isChallengeComplete(event.id, challenge);
                        const percentage = Math.min((progress / challenge.target) * 100, 100);

                        return (
                            <div
                                key={challenge.id}
                                className={`p-3 rounded-xl transition-all ${complete ? 'opacity-70' : ''}`}
                                style={{
                                    background: complete
                                        ? 'rgba(34, 197, 94, 0.1)'
                                        : 'rgba(30, 41, 59, 0.6)',
                                    border: complete
                                        ? '1px solid rgba(34, 197, 94, 0.3)'
                                        : '1px solid rgba(255, 255, 255, 0.05)'
                                }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span>{challenge.icon}</span>
                                        <span className="text-sm font-bold text-white">
                                            {lang === 'tr' ? challenge.nameTr : challenge.name}
                                        </span>
                                    </div>
                                    <span className="text-xs font-mono text-slate-400">
                                        {progress}/{challenge.target}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-500"
                                        style={{
                                            width: `${percentage}%`,
                                            background: complete
                                                ? '#22c55e'
                                                : `linear-gradient(90deg, ${event.theme.primaryColor}, ${event.theme.secondaryColor})`
                                        }}
                                    />
                                </div>

                                {/* Reward Preview */}
                                <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                                    <span>{challenge.reward.icon}</span>
                                    <span>{challenge.reward.name}</span>
                                    {complete && <span className="text-green-400 ml-auto">✓</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Grand Rewards */}
                <div
                    className="p-4 border-t"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                        {lang === 'tr' ? 'Büyük Ödüller' : 'Grand Rewards'}
                    </div>
                    <div className="flex justify-around">
                        {event.rewards.map((reward, i) => (
                            <div key={i} className="text-center">
                                <span className="text-2xl block">{reward.icon}</span>
                                <span className="text-xs text-slate-400">{reward.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full py-3 text-slate-500 hover:text-slate-300 transition-colors text-sm font-bold"
                    style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
                >
                    {lang === 'tr' ? 'Kapat' : 'Close'}
                </button>
            </div>
        </div>
    );
};
