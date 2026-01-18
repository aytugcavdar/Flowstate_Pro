import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { TRANSLATIONS, Language } from '../constants/translations';
import {
    canClaimReward,
    claimDailyReward,
    getRewardCalendar,
    getStreakInfo,
    DailyReward
} from '../services/rewardService';
import { getProfile, saveProfile } from '../services/progression';
import { playSound } from '../services/audio';

interface DailyRewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
    onRewardClaimed?: (xp: number) => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
    isOpen,
    onClose,
    lang,
    onRewardClaimed
}) => {
    const [canClaim, setCanClaim] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [claimedReward, setClaimedReward] = useState<{ reward: DailyReward; xp: number; streak: number } | null>(null);
    const [calendar, setCalendar] = useState(getRewardCalendar());
    const [streakInfo, setStreakInfo] = useState(getStreakInfo());
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCanClaim(canClaimReward());
            setCalendar(getRewardCalendar());
            setStreakInfo(getStreakInfo());
            setClaimed(false);
            setClaimedReward(null);
        }
    }, [isOpen]);

    const handleClaim = () => {
        const result = claimDailyReward();
        if (result) {
            // Add XP to profile
            const profile = getProfile();
            profile.xp += result.xpGained;
            profile.level = Math.floor(profile.xp / 1000) + 1;
            saveProfile(profile);

            // Update UI
            setClaimedReward({
                reward: result.reward,
                xp: result.xpGained,
                streak: result.newStreak
            });
            setClaimed(true);
            setCanClaim(false);
            setShowConfetti(true);
            setCalendar(getRewardCalendar());
            setStreakInfo(getStreakInfo());

            playSound('win');
            onRewardClaimed?.(result.xpGained);

            setTimeout(() => setShowConfetti(false), 3000);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={lang === 'tr' ? '🎁 GÜNLÜK ÖDÜL' : '🎁 DAILY REWARD'}
        >
            <div className="space-y-4">
                {/* Streak Display */}
                <div className="text-center bg-gradient-to-r from-orange-900/30 to-red-900/30 p-4 rounded-xl border border-orange-500/30">
                    <div className="text-5xl mb-2">🔥</div>
                    <div className="text-3xl font-bold text-orange-400">
                        {streakInfo.streak} {lang === 'tr' ? 'GÜN' : 'DAYS'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        {lang === 'tr' ? 'Giriş Serisi' : 'Login Streak'}
                    </div>
                    {streakInfo.bonus && (
                        <div className="inline-block mt-2 px-3 py-1 bg-orange-500/20 rounded-full text-orange-400 text-sm font-mono">
                            {streakInfo.bonus} XP Bonus
                        </div>
                    )}
                </div>

                {/* Claimed State */}
                {claimed && claimedReward && (
                    <div className="text-center p-6 bg-gradient-to-b from-cyan-900/30 to-fuchsia-900/30 rounded-xl border-2 border-cyan-500 animate-pulse">
                        <div className="text-6xl mb-3 animate-bounce">{claimedReward.reward.icon}</div>
                        <div className="text-xl font-bold text-white">{claimedReward.reward.name}</div>
                        <div className="text-3xl font-bold text-cyan-400 mt-2">+{claimedReward.xp} XP</div>
                        <div className="text-sm text-green-400 mt-2">
                            ✓ {lang === 'tr' ? 'Ödül alındı!' : 'Reward claimed!'}
                        </div>
                    </div>
                )}

                {/* Calendar - 7 Day Cycle */}
                {!claimed && (
                    <>
                        <div className="grid grid-cols-7 gap-1">
                            {calendar.map((reward, index) => (
                                <div
                                    key={index}
                                    className={`relative p-2 rounded-lg text-center transition-all
                    ${reward.current
                                            ? 'bg-cyan-500/30 border-2 border-cyan-500 scale-110 z-10'
                                            : reward.unlocked
                                                ? 'bg-green-900/30 border border-green-500/50'
                                                : 'bg-slate-800/50 border border-slate-700/50'}`}
                                >
                                    {/* Day Number */}
                                    <div className="text-xs text-slate-400 font-mono">D{reward.day}</div>

                                    {/* Icon */}
                                    <div className={`text-xl my-1 ${reward.unlocked || reward.current ? '' : 'grayscale opacity-50'}`}>
                                        {reward.unlocked ? '✅' : reward.icon}
                                    </div>

                                    {/* Current indicator */}
                                    {reward.current && (
                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                                            <span className="text-white text-xs">!</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Today's Reward Preview */}
                        {canClaim && (
                            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                                <div className="text-sm text-slate-400 mb-2">
                                    {lang === 'tr' ? 'Bugünün Ödülü' : "Today's Reward"}
                                </div>
                                <div className="text-4xl mb-2">
                                    {calendar.find(r => r.current)?.icon || '🎁'}
                                </div>
                                <div className="text-lg font-bold text-white">
                                    {calendar.find(r => r.current)?.name}
                                </div>
                                <div className="text-cyan-400 font-mono">
                                    {calendar.find(r => r.current)?.description}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Claim Button */}
                {canClaim && !claimed && (
                    <button
                        onClick={handleClaim}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-fuchsia-600 hover:from-cyan-500 hover:to-fuchsia-500 
              text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95
              shadow-lg shadow-cyan-500/30"
                    >
                        <span className="text-xl mr-2">🎁</span>
                        {lang === 'tr' ? 'ÖDÜLÜ AL' : 'CLAIM REWARD'}
                    </button>
                )}

                {/* Already Claimed State */}
                {!canClaim && !claimed && (
                    <div className="text-center py-4">
                        <div className="text-slate-400 text-sm">
                            {lang === 'tr'
                                ? '✓ Bugünün ödülünü aldın! Yarın tekrar gel.'
                                : "✓ You've claimed today's reward! Come back tomorrow."}
                        </div>
                    </div>
                )}

                {/* Next Milestone Info */}
                {streakInfo.streak < 7 && (
                    <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800">
                        {lang === 'tr'
                            ? `${7 - streakInfo.streak} gün sonra haftalık jackpot!`
                            : `${7 - streakInfo.streak} days until weekly jackpot!`}
                    </div>
                )}
            </div>
        </Modal>
    );
};
