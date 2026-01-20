/**
 * Unlockables Gallery - Browse and equip unlocked cosmetics
 */

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Language } from '../constants/translations';
import {
    UNLOCKABLES,
    RARITY_INFO,
    UnlockableType,
    Unlockable,
    loadUnlockableState,
    isUnlocked,
    equip,
    getEquipped,
    getUnlockProgress
} from '../services/unlockablesService';
import { playSound } from '../services/audio';
import { haptic } from '../services/hapticService';

interface UnlockablesGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
}

type TabType = UnlockableType;

const TABS: { key: TabType; icon: string; label: string; labelTr: string }[] = [
    { key: 'tile_skin', icon: '🔲', label: 'Tiles', labelTr: 'Tile' },
    { key: 'board_theme', icon: '🎨', label: 'Themes', labelTr: 'Tema' },
    { key: 'particle_effect', icon: '✨', label: 'Effects', labelTr: 'Efekt' },
    { key: 'profile_frame', icon: '🖼️', label: 'Frames', labelTr: 'Çerçeve' },
    { key: 'victory_animation', icon: '🎉', label: 'Victory', labelTr: 'Zafer' }
];

export const UnlockablesGallery: React.FC<UnlockablesGalleryProps> = ({
    isOpen,
    onClose,
    lang
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('tile_skin');
    const [equipped, setEquipped] = useState<Record<UnlockableType, string>>({} as any);
    const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            const state = loadUnlockableState();
            setEquipped(state.equipped);
            setUnlockedIds(state.unlockedIds);
        }
    }, [isOpen]);

    const progress = getUnlockProgress();

    const items = UNLOCKABLES.filter(u => u.type === activeTab);

    const handleEquip = (item: Unlockable) => {
        if (!isUnlocked(item.id)) {
            haptic.error();
            return;
        }

        const success = equip(item.id);
        if (success) {
            setEquipped(prev => ({ ...prev, [item.type]: item.id }));
            playSound('power');
            haptic.tileRotate();
        }
    };

    const getUnlockText = (item: Unlockable): string => {
        const method = item.unlockMethod;
        switch (method.type) {
            case 'default': return '';
            case 'level': return lang === 'tr' ? `Seviye ${method.value}` : `Level ${method.value}`;
            case 'achievement': return lang === 'tr' ? 'Başarı' : 'Achievement';
            case 'purchase': return `🪙 ${method.value}`;
            case 'event': return lang === 'tr' ? 'Etkinlik' : 'Event';
            case 'referral': return lang === 'tr' ? 'Davet' : 'Referral';
            case 'streak': return lang === 'tr' ? `${method.value} gün seri` : `${method.value} day streak`;
            default: return '';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={lang === 'tr' ? '✨ KOLEKSİYON' : '✨ COLLECTION'}
            size="lg"
        >
            <div className="space-y-4">
                {/* Progress Bar */}
                <div
                    className="p-4 rounded-xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-400">
                            {lang === 'tr' ? 'Koleksiyon İlerlemesi' : 'Collection Progress'}
                        </span>
                        <span className="text-sm font-bold text-cyan-400">
                            {progress.unlocked}/{progress.total}
                        </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all duration-500"
                            style={{
                                width: `${progress.percentage}%`,
                                background: 'linear-gradient(90deg, #22d3ee, #8b5cf6, #e879f9)'
                            }}
                        />
                    </div>
                    <div className="text-center text-xs text-slate-500 mt-1">
                        {progress.percentage}%
                    </div>
                </div>

                {/* Tabs */}
                <div
                    className="flex gap-1 p-1 rounded-xl overflow-x-auto scrollbar-hide"
                    style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                >
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="flex-1 min-w-[60px] py-2 px-2 text-xs font-bold rounded-lg transition-all duration-300"
                            style={{
                                background: activeTab === tab.key
                                    ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)'
                                    : 'transparent',
                                color: activeTab === tab.key ? '#22d3ee' : '#64748b',
                                border: activeTab === tab.key
                                    ? '1px solid rgba(34, 211, 238, 0.3)'
                                    : '1px solid transparent'
                            }}
                        >
                            <span className="block text-base">{tab.icon}</span>
                            <span className="block mt-0.5">{lang === 'tr' ? tab.labelTr : tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto scrollbar-hide">
                    {items.map(item => {
                        const unlocked = unlockedIds.includes(item.id);
                        const isEquipped = equipped[item.type] === item.id;
                        const rarity = RARITY_INFO[item.rarity];

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleEquip(item)}
                                disabled={!unlocked}
                                className={`p-3 rounded-xl text-center transition-all duration-300 relative ${unlocked ? 'hover:scale-[1.02]' : 'opacity-50'
                                    } ${isEquipped ? 'ring-2 ring-cyan-400' : ''}`}
                                style={{
                                    background: unlocked ? rarity.bgGradient : 'rgba(30, 41, 59, 0.4)',
                                    border: `1px solid ${unlocked ? rarity.borderColor : 'rgba(100, 116, 139, 0.2)'}`,
                                    boxShadow: isEquipped ? `0 0 20px ${rarity.glowColor}` : 'none'
                                }}
                            >
                                {/* Equipped Badge */}
                                {isEquipped && (
                                    <div
                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                                        style={{
                                            background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                                            boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)'
                                        }}
                                    >
                                        ✓
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`text-3xl mb-2 ${!unlocked ? 'grayscale' : ''}`}>
                                    {unlocked ? item.icon : '🔒'}
                                </div>

                                {/* Name */}
                                <div className={`text-sm font-bold ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                                    {lang === 'tr' ? item.nameTr : item.name}
                                </div>

                                {/* Rarity */}
                                <div
                                    className="text-[10px] font-bold uppercase tracking-wider mt-1"
                                    style={{ color: unlocked ? rarity.color : '#64748b' }}
                                >
                                    {rarity.name}
                                </div>

                                {/* Unlock requirement (if locked) */}
                                {!unlocked && (
                                    <div className="text-[10px] text-slate-500 mt-1">
                                        {getUnlockText(item)}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div
                    className="flex justify-around text-center text-[10px] p-2 rounded-lg"
                    style={{ background: 'rgba(15, 23, 42, 0.4)' }}
                >
                    {Object.entries(RARITY_INFO).map(([key, info]) => (
                        <div key={key}>
                            <span style={{ color: info.color }}>●</span>
                            <span className="text-slate-500 ml-1">{info.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};
