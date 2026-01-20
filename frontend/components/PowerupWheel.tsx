/**
 * Power-up Wheel - Radial menu for quick power-up access
 */

import React, { useState, useEffect } from 'react';
import { PowerupInventory, PowerupType, hasPowerup } from '../services/powerupService';
import { playSound } from '../services/audio';
import { haptic } from '../services/hapticService';
import { Language } from '../constants/translations';

interface PowerupWheelProps {
    isOpen: boolean;
    onClose: () => void;
    onUsePowerup: (type: PowerupType) => void;
    inventory: PowerupInventory;
    lang: Language;
    disabledTypes?: PowerupType[];
}

interface WheelItem {
    type: PowerupType;
    icon: string;
    name: string;
    description: string;
    count: number;
    color: string;
    glowColor: string;
}

export const PowerupWheel: React.FC<PowerupWheelProps> = ({
    isOpen,
    onClose,
    onUsePowerup,
    inventory,
    lang,
    disabledTypes = []
}) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            playSound('click');
        } else {
            setIsAnimating(false);
            setSelectedIndex(null);
        }
    }, [isOpen]);

    const items: WheelItem[] = [
        {
            type: 'hint',
            icon: '💡',
            name: lang === 'tr' ? 'İpucu' : 'Hint',
            description: lang === 'tr' ? 'Doğru rotasyonu göster' : 'Show correct rotation',
            count: inventory.hints,
            color: 'rgba(34, 211, 238, 0.3)',
            glowColor: 'rgba(34, 211, 238, 0.5)'
        },
        {
            type: 'undo',
            icon: '↩️',
            name: lang === 'tr' ? 'Geri Al' : 'Undo',
            description: lang === 'tr' ? 'Son hamleyi geri al' : 'Undo last move',
            count: inventory.undos,
            color: 'rgba(139, 92, 246, 0.3)',
            glowColor: 'rgba(139, 92, 246, 0.5)'
        },
        {
            type: 'freeze',
            icon: '⏸️',
            name: lang === 'tr' ? 'Dondur' : 'Freeze',
            description: lang === 'tr' ? 'Zamanlayıcıyı durdur' : 'Pause the timer',
            count: inventory.freezes,
            color: 'rgba(59, 130, 246, 0.3)',
            glowColor: 'rgba(59, 130, 246, 0.5)'
        }
    ];

    const handleSelect = (index: number) => {
        const item = items[index];
        if (item.count <= 0 || disabledTypes.includes(item.type)) {
            haptic.error();
            return;
        }

        setSelectedIndex(index);
        haptic.tileRotate();
        playSound('power');

        setTimeout(() => {
            onUsePowerup(item.type);
            onClose();
        }, 300);
    };

    if (!isOpen) return null;

    const radius = 100; // Distance from center
    const angleOffset = -90; // Start from top

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
            style={{
                background: 'rgba(2, 6, 23, 0.8)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
            }}
        >
            {/* Wheel Container */}
            <div
                className="relative"
                style={{ width: '280px', height: '280px' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Center Hub */}
                <div
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                        }`}
                    style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <span className="text-2xl">⚡</span>
                </div>

                {/* Power-up Items */}
                {items.map((item, index) => {
                    const angle = (index / items.length) * 360 + angleOffset;
                    const radian = (angle * Math.PI) / 180;
                    const x = Math.cos(radian) * radius;
                    const y = Math.sin(radian) * radius;

                    const isSelected = selectedIndex === index;
                    const isDisabled = item.count <= 0 || disabledTypes.includes(item.type);

                    return (
                        <button
                            key={item.type}
                            onClick={() => handleSelect(index)}
                            disabled={isDisabled}
                            className={`absolute left-1/2 top-1/2 w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${isAnimating ? 'opacity-100' : 'opacity-0'
                                } ${isSelected ? 'scale-125 z-10' : isDisabled ? 'opacity-40' : 'hover:scale-110'}`}
                            style={{
                                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                                transitionDelay: `${index * 50}ms`,
                                transitionDuration: '300ms',
                                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                                background: isSelected
                                    ? item.color.replace('0.3', '0.5')
                                    : `linear-gradient(135deg, ${item.color} 0%, rgba(15, 23, 42, 0.9) 100%)`,
                                border: isSelected
                                    ? `2px solid ${item.glowColor}`
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: isSelected
                                    ? `0 0 30px ${item.glowColor}`
                                    : '0 8px 32px rgba(0, 0, 0, 0.3)'
                            }}
                        >
                            {/* Icon */}
                            <span className={`text-2xl ${isSelected ? 'animate-bounce' : ''}`}>
                                {item.icon}
                            </span>

                            {/* Count Badge */}
                            <div
                                className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{
                                    background: item.count > 0
                                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.9) 100%)'
                                        : 'rgba(100, 116, 139, 0.5)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: 'white'
                                }}
                            >
                                {item.count}
                            </div>

                            {/* Name */}
                            <span className="text-[10px] text-white/80 mt-1 font-medium">
                                {item.name}
                            </span>
                        </button>
                    );
                })}

                {/* Connecting Lines */}
                <svg
                    className="absolute inset-0 pointer-events-none"
                    viewBox="0 0 280 280"
                >
                    {items.map((item, index) => {
                        const angle = (index / items.length) * 360 + angleOffset;
                        const radian = (angle * Math.PI) / 180;
                        const x = 140 + Math.cos(radian) * (radius * 0.6);
                        const y = 140 + Math.sin(radian) * (radius * 0.6);

                        return (
                            <line
                                key={item.type}
                                x1="140"
                                y1="140"
                                x2={x}
                                y2={y}
                                stroke="rgba(255, 255, 255, 0.1)"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                className={`transition-all duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            />
                        );
                    })}
                </svg>
            </div>

            {/* Instructions */}
            <div
                className="absolute bottom-10 left-0 right-0 text-center text-sm text-slate-400"
                style={{
                    opacity: isAnimating ? 1 : 0,
                    transition: 'opacity 300ms ease'
                }}
            >
                {lang === 'tr' ? 'Kullanmak için dokun • Kapatmak için dışarıya dokun' : 'Tap to use • Tap outside to close'}
            </div>
        </div>
    );
};
