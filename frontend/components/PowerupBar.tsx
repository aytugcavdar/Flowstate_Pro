/**
 * PowerupBar - In-game floating bar showing available power-ups
 */

import React from 'react';
import { Language } from '../constants/translations';
import { PowerupInventory, PowerupType } from '../services/powerupService';
import { playSound } from '../services/audio';
import { haptic } from '../services/hapticService';

interface PowerupBarProps {
    inventory: PowerupInventory;
    lang: Language;
    onUsePowerup: (type: PowerupType) => void;
    disabled?: boolean;
    showFreeze?: boolean; // Only show in SpeedRun mode
}

interface PowerupButtonProps {
    icon: string;
    count: number;
    label: string;
    type: PowerupType;
    onUse: () => void;
    disabled?: boolean;
    color?: string;
}

const PowerupButton: React.FC<PowerupButtonProps> = ({
    icon, count, label, onUse, disabled = false, color = 'var(--color-accent-1)'
}) => {
    const isAvailable = count > 0 && !disabled;

    const handleClick = () => {
        if (isAvailable) {
            haptic.powerupUse();
            playSound('click');
            onUse();
        } else {
            haptic.error();
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={!isAvailable}
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${isAvailable
                    ? 'hover:scale-110 active:scale-95 cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                }`}
            style={{
                backgroundColor: 'var(--color-bg-secondary)',
                border: `1px solid ${isAvailable ? color : 'var(--color-border)'}`,
                minWidth: '50px',
            }}
        >
            <span className="text-xl">{icon}</span>
            <span
                className="text-xs font-mono font-bold"
                style={{ color: isAvailable ? color : 'var(--color-text-muted)' }}
            >
                {count}
            </span>
            <span className="text-[8px] opacity-60">{label}</span>
        </button>
    );
};

export const PowerupBar: React.FC<PowerupBarProps> = ({
    inventory,
    lang,
    onUsePowerup,
    disabled = false,
    showFreeze = false,
}) => {
    // Don't render if no power-ups available
    const totalPowerups = inventory.hints + inventory.undos + (showFreeze ? inventory.freezes : 0);
    if (totalPowerups === 0) return null;

    return (
        <div
            className="flex gap-2 p-2 rounded-xl backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-300"
            style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: '1px solid var(--color-border)',
            }}
        >
            {inventory.hints > 0 && (
                <PowerupButton
                    icon="💡"
                    count={inventory.hints}
                    label={lang === 'tr' ? 'İpucu' : 'Hint'}
                    type="hint"
                    onUse={() => onUsePowerup('hint')}
                    disabled={disabled}
                    color="var(--color-accent-1)"
                />
            )}

            {inventory.undos > 0 && (
                <PowerupButton
                    icon="↩️"
                    count={inventory.undos}
                    label={lang === 'tr' ? 'Geri' : 'Undo'}
                    type="undo"
                    onUse={() => onUsePowerup('undo')}
                    disabled={disabled}
                    color="var(--color-accent-2)"
                />
            )}

            {showFreeze && inventory.freezes > 0 && (
                <PowerupButton
                    icon="⏸️"
                    count={inventory.freezes}
                    label={lang === 'tr' ? 'Dondur' : 'Freeze'}
                    type="freeze"
                    onUse={() => onUsePowerup('freeze')}
                    disabled={disabled}
                    color="var(--color-warning)"
                />
            )}

            {/* Coin Boost Indicator */}
            {inventory.coinBoostGamesLeft > 0 && (
                <div
                    className="flex flex-col items-center justify-center p-2 rounded-lg animate-pulse"
                    style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid var(--color-success)',
                    }}
                >
                    <span className="text-sm">💰</span>
                    <span className="text-[8px] font-bold" style={{ color: 'var(--color-success)' }}>
                        2x ({inventory.coinBoostGamesLeft})
                    </span>
                </div>
            )}
        </div>
    );
};
