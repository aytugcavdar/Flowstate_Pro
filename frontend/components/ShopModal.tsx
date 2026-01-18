/**
 * Shop Modal - Purchase themes, power-ups, and cosmetics with coins
 */

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Language } from '../constants/translations';
import { THEME_ITEMS, POWERUP_ITEMS, COSMETIC_ITEMS, ShopItem } from '../constants/shopData';
import { getCoins, unlockItem, isItemUnlocked } from '../services/economyService';
import { playSound } from '../services/audio';
import { processPurchase, getInventory, PowerupInventory, SHOP_TO_POWERUP } from '../services/powerupService';
import { haptic } from '../services/hapticService';

interface ShopModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
}

type TabType = 'themes' | 'powerups' | 'cosmetics';

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, lang }) => {
    const [activeTab, setActiveTab] = useState<TabType>('themes');
    const [coins, setCoins] = useState(getCoins());
    const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
    const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
    const [inventory, setInventory] = useState<PowerupInventory>(getInventory());

    // Refresh state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCoins(getCoins());
            setInventory(getInventory());
            // Get unlocked items
            const items = THEME_ITEMS.concat(POWERUP_ITEMS, COSMETIC_ITEMS);
            setUnlockedItems(items.filter(i => isItemUnlocked(i.id)).map(i => i.id));
        }
    }, [isOpen]);

    const getTabItems = (): ShopItem[] => {
        switch (activeTab) {
            case 'themes': return THEME_ITEMS;
            case 'powerups': return POWERUP_ITEMS;
            case 'cosmetics': return COSMETIC_ITEMS;
        }
    };

    const handlePurchase = (item: ShopItem) => {
        // Power-ups can be bought multiple times
        const isPowerup = item.type === 'powerup';

        if (!isPowerup && unlockedItems.includes(item.id)) {
            setPurchaseMessage(lang === 'tr' ? 'Zaten sahipsiniz!' : 'Already owned!');
            setTimeout(() => setPurchaseMessage(null), 2000);
            return;
        }

        if (coins < item.price) {
            setPurchaseMessage(lang === 'tr' ? 'Yetersiz coin!' : 'Not enough coins!');
            playSound('click');
            haptic.error();
            setTimeout(() => setPurchaseMessage(null), 2000);
            return;
        }

        const result = unlockItem(item.id, item.price);
        if (result.success) {
            setCoins(result.newBalance);

            // If it's a powerup, add to inventory
            if (isPowerup) {
                const newInventory = processPurchase(item.id);
                if (newInventory) {
                    setInventory(newInventory);
                }
            } else {
                setUnlockedItems([...unlockedItems, item.id]);
            }

            setPurchaseMessage(lang === 'tr' ? '✅ Satın alındı!' : '✅ Purchased!');
            playSound('win');
            haptic.coinEarn();
        } else {
            setPurchaseMessage(lang === 'tr' ? 'Hata oluştu!' : 'Error!');
        }
        setTimeout(() => setPurchaseMessage(null), 2000);
    };

    const tabs: { key: TabType; label: string; icon: string }[] = [
        { key: 'themes', label: lang === 'tr' ? 'Temalar' : 'Themes', icon: '🎨' },
        { key: 'powerups', label: lang === 'tr' ? 'Güçler' : 'Power-ups', icon: '⚡' },
        { key: 'cosmetics', label: lang === 'tr' ? 'Kozmetik' : 'Cosmetics', icon: '✨' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={lang === 'tr' ? '🛒 Mağaza' : '🛒 Shop'}>
            <div className="space-y-4">
                {/* Coin Balance */}
                <div
                    className="flex justify-center items-center gap-2 p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                    <span className="text-2xl">🪙</span>
                    <span className="text-2xl font-bold font-mono" style={{ color: 'var(--color-warning)' }}>
                        {coins.toLocaleString()}
                    </span>
                    <span className="text-sm opacity-60">{lang === 'tr' ? 'coin' : 'coins'}</span>
                </div>

                {/* Purchase Message */}
                {purchaseMessage && (
                    <div
                        className="text-center py-2 rounded-lg animate-pulse text-sm font-bold"
                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                    >
                        {purchaseMessage}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === tab.key ? 'shadow-md' : ''
                                }`}
                            style={{
                                backgroundColor: activeTab === tab.key ? 'var(--color-accent-1)' : 'transparent',
                                color: activeTab === tab.key ? 'var(--color-bg-primary)' : 'var(--color-text-muted)',
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Power-up Inventory Display */}
                {activeTab === 'powerups' && (
                    <div
                        className="flex justify-around p-2 rounded-lg text-xs font-mono"
                        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                    >
                        <div className="text-center">
                            <div className="text-lg">💡</div>
                            <div style={{ color: 'var(--color-accent-1)' }}>{inventory.hints}</div>
                            <div className="opacity-50">{lang === 'tr' ? 'İpucu' : 'Hints'}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg">↩️</div>
                            <div style={{ color: 'var(--color-accent-2)' }}>{inventory.undos}</div>
                            <div className="opacity-50">{lang === 'tr' ? 'Geri Al' : 'Undos'}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg">⏸️</div>
                            <div style={{ color: 'var(--color-warning)' }}>{inventory.freezes}</div>
                            <div className="opacity-50">{lang === 'tr' ? 'Dondur' : 'Freeze'}</div>
                        </div>
                        {inventory.coinBoostGamesLeft > 0 && (
                            <div className="text-center animate-pulse">
                                <div className="text-lg">💰</div>
                                <div style={{ color: 'var(--color-success)' }}>{inventory.coinBoostGamesLeft}</div>
                                <div className="opacity-50">2x</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Items Grid */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {getTabItems().map(item => {
                        const isOwned = unlockedItems.includes(item.id);
                        const canAfford = coins >= item.price;

                        return (
                            <div
                                key={item.id}
                                className={`p-3 rounded-lg border transition-all ${isOwned ? 'opacity-60' : canAfford ? 'hover:scale-[1.02]' : 'opacity-50'
                                    }`}
                                style={{
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    borderColor: isOwned ? 'var(--color-success, #22c55e)' : 'var(--color-border)',
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{item.icon}</span>
                                        <div>
                                            <div className="font-bold text-sm">{item.name}</div>
                                            <div className="text-xs opacity-60">{item.description}</div>
                                        </div>
                                    </div>

                                    {isOwned ? (
                                        <span
                                            className="text-xs font-bold px-2 py-1 rounded"
                                            style={{ backgroundColor: 'var(--color-success, #22c55e)' }}
                                        >
                                            ✓ {lang === 'tr' ? 'Sahip' : 'Owned'}
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handlePurchase(item)}
                                            disabled={!canAfford}
                                            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-sm transition-all ${canAfford ? 'hover:scale-105' : 'cursor-not-allowed'
                                                }`}
                                            style={{
                                                backgroundColor: canAfford ? 'var(--color-warning)' : 'var(--color-bg-tertiary)',
                                                color: canAfford ? 'var(--color-bg-primary)' : 'var(--color-text-muted)',
                                            }}
                                        >
                                            🪙 {item.price}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full py-2 rounded-lg font-bold transition-all hover:scale-105"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                    {lang === 'tr' ? 'Kapat' : 'Close'}
                </button>
            </div>
        </Modal>
    );
};
