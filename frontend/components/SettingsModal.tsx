import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useTheme, ThemeId } from '../contexts/ThemeContext';
import { THEMES } from '../constants/themes';
import { TRANSLATIONS, Language } from '../constants/translations';
import { GameSettings, loadSettings, saveSettings, resetSettings } from '../services/settingsService';
import { setMasterVolume, setSFXVolume, setMusicVolume } from '../services/audio';
import { playSound } from '../services/audio';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
    setLang: (lang: Language) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, lang, setLang }) => {
    const { themeId, setTheme, mode, toggleMode } = useTheme();
    const [settings, setSettings] = useState<GameSettings>(loadSettings);
    const [activeTab, setActiveTab] = useState<'audio' | 'visual' | 'game' | 'data'>('audio');
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const t = TRANSLATIONS[lang];

    useEffect(() => {
        if (isOpen) {
            setSettings(loadSettings());
        }
    }, [isOpen]);

    const updateAndSave = (updates: Partial<GameSettings>) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);
        saveSettings(newSettings);

        // Apply audio changes immediately
        if ('masterVolume' in updates || 'muteAll' in updates) {
            setMasterVolume(newSettings.muteAll ? 0 : newSettings.masterVolume / 100);
        }
        if ('sfxVolume' in updates) {
            setSFXVolume(newSettings.sfxVolume / 100);
        }
        if ('musicVolume' in updates) {
            setMusicVolume(newSettings.musicVolume / 100);
        }
    };

    const handleReset = () => {
        if (showResetConfirm) {
            localStorage.clear();
            window.location.reload();
        } else {
            setShowResetConfirm(true);
            setTimeout(() => setShowResetConfirm(false), 3000);
        }
    };

    const tabs = [
        { id: 'audio', icon: '🔊', label: lang === 'tr' ? 'Ses' : 'Audio' },
        { id: 'visual', icon: '🎨', label: lang === 'tr' ? 'Görsel' : 'Visual' },
        { id: 'game', icon: '🎮', label: lang === 'tr' ? 'Oyun' : 'Game' },
        { id: 'data', icon: '💾', label: lang === 'tr' ? 'Veri' : 'Data' }
    ] as const;

    const SliderControl = ({
        label,
        value,
        onChange,
        disabled = false
    }: {
        label: string;
        value: number;
        onChange: (v: number) => void;
        disabled?: boolean;
    }) => (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-slate-300">{label}</span>
                <span className="font-mono text-cyan-400">{value}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                disabled={disabled}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          bg-slate-700 accent-cyan-500`}
                style={{
                    background: disabled
                        ? '#334155'
                        : `linear-gradient(to right, var(--color-accent-1) 0%, var(--color-accent-1) ${value}%, #334155 ${value}%, #334155 100%)`
                }}
            />
        </div>
    );

    const ToggleControl = ({
        label,
        description,
        checked,
        onChange
    }: {
        label: string;
        description?: string;
        checked: boolean;
        onChange: (v: boolean) => void;
    }) => (
        <div className="flex items-center justify-between py-2">
            <div>
                <div className="text-sm text-slate-300">{label}</div>
                {description && <div className="text-xs text-slate-500">{description}</div>}
            </div>
            <button
                onClick={() => { onChange(!checked); playSound('click'); }}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative
          ${checked ? 'bg-cyan-600' : 'bg-slate-600'}`}
            >
                <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300
            ${checked ? 'left-7' : 'left-1'}`}
                />
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={lang === 'tr' ? '⚙️ AYARLAR' : '⚙️ SETTINGS'}>
            <div className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); playSound('click'); }}
                            className={`flex-1 py-2 px-3 rounded-md text-xs font-mono transition-all
                ${activeTab === tab.id
                                    ? 'bg-cyan-600 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        >
                            <span className="mr-1">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Audio Tab */}
                {activeTab === 'audio' && (
                    <div className="space-y-4 p-3 bg-slate-800/30 rounded-lg">
                        <ToggleControl
                            label={lang === 'tr' ? 'Tüm Sesleri Kapat' : 'Mute All'}
                            checked={settings.muteAll}
                            onChange={(v) => updateAndSave({ muteAll: v })}
                        />

                        <div className={settings.muteAll ? 'opacity-50 pointer-events-none' : ''}>
                            <SliderControl
                                label={lang === 'tr' ? 'Ana Ses' : 'Master Volume'}
                                value={settings.masterVolume}
                                onChange={(v) => updateAndSave({ masterVolume: v })}
                                disabled={settings.muteAll}
                            />

                            <div className="mt-4">
                                <SliderControl
                                    label={lang === 'tr' ? 'Efekt Sesi' : 'SFX Volume'}
                                    value={settings.sfxVolume}
                                    onChange={(v) => updateAndSave({ sfxVolume: v })}
                                    disabled={settings.muteAll}
                                />
                            </div>

                            <div className="mt-4">
                                <SliderControl
                                    label={lang === 'tr' ? 'Müzik Sesi' : 'Music Volume'}
                                    value={settings.musicVolume}
                                    onChange={(v) => updateAndSave({ musicVolume: v })}
                                    disabled={settings.muteAll}
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => playSound('power')}
                            className="w-full py-2 mt-2 text-xs font-mono bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                        >
                            🔊 {lang === 'tr' ? 'Sesi Test Et' : 'Test Sound'}
                        </button>
                    </div>
                )}

                {/* Visual Tab */}
                {activeTab === 'visual' && (
                    <div className="space-y-4 p-3 bg-slate-800/30 rounded-lg">
                        {/* Theme Selection */}
                        <div className="space-y-2">
                            <div className="text-sm text-slate-300">{t.themes.select}</div>
                            <div className="grid grid-cols-2 gap-2">
                                {(Object.keys(THEMES) as ThemeId[]).map(id => (
                                    <button
                                        key={id}
                                        onClick={() => { setTheme(id); playSound('click'); }}
                                        className={`p-2 rounded-lg border-2 transition-all text-left
                      ${themeId === id
                                                ? 'border-cyan-500 bg-cyan-500/10'
                                                : 'border-slate-600 hover:border-slate-500'}`}
                                    >
                                        <div className="text-lg">{THEMES[id].icon}</div>
                                        <div className="text-xs font-mono text-slate-300">{THEMES[id].name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dark/Light Mode */}
                        <div className="flex items-center justify-between py-2 border-t border-slate-700 mt-4">
                            <span className="text-sm text-slate-300">{t.themes.mode}</span>
                            <button
                                onClick={() => { toggleMode(); playSound('click'); }}
                                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors font-mono text-sm"
                            >
                                {mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
                            </button>
                        </div>

                        <ToggleControl
                            label={lang === 'tr' ? 'Animasyonlar' : 'Animations'}
                            description={lang === 'tr' ? 'Parçacık ve geçiş efektleri' : 'Particles and transitions'}
                            checked={settings.animationsEnabled}
                            onChange={(v) => updateAndSave({ animationsEnabled: v })}
                        />

                        <ToggleControl
                            label={lang === 'tr' ? 'CRT Tarama Çizgileri' : 'CRT Scanlines'}
                            checked={settings.showScanlines}
                            onChange={(v) => updateAndSave({ showScanlines: v })}
                        />

                        <ToggleControl
                            label={lang === 'tr' ? 'Yüksek Kontrast' : 'High Contrast'}
                            description={lang === 'tr' ? 'Erişilebilirlik için' : 'For accessibility'}
                            checked={settings.highContrast}
                            onChange={(v) => updateAndSave({ highContrast: v })}
                        />
                    </div>
                )}

                {/* Game Tab */}
                {activeTab === 'game' && (
                    <div className="space-y-4 p-3 bg-slate-800/30 rounded-lg">
                        {/* Language */}
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-slate-300">{lang === 'tr' ? 'Dil' : 'Language'}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setLang('en'); playSound('click'); }}
                                    className={`px-3 py-1 rounded text-sm font-mono transition-colors
                    ${lang === 'en' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => { setLang('tr'); playSound('click'); }}
                                    className={`px-3 py-1 rounded text-sm font-mono transition-colors
                    ${lang === 'tr' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                                >
                                    TR
                                </button>
                            </div>
                        </div>

                        {/* Player Name */}
                        <div className="space-y-2">
                            <div className="text-sm text-slate-300">{lang === 'tr' ? 'Oyuncu Adı' : 'Player Name'}</div>
                            <input
                                type="text"
                                value={settings.playerName}
                                onChange={(e) => updateAndSave({ playerName: e.target.value.toUpperCase().slice(0, 12) })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg font-mono text-sm
                  focus:outline-none focus:border-cyan-500 uppercase"
                                placeholder="NETRUNNER"
                                maxLength={12}
                            />
                        </div>

                        <ToggleControl
                            label={lang === 'tr' ? 'Zamanlayıcı Göster' : 'Show Timer'}
                            checked={settings.showTimer}
                            onChange={(v) => updateAndSave({ showTimer: v })}
                        />

                        <ToggleControl
                            label={lang === 'tr' ? 'Sıfırlama Onayı' : 'Confirm Reset'}
                            description={lang === 'tr' ? 'Oyun sıfırlamadan önce sor' : 'Ask before resetting game'}
                            checked={settings.confirmReset}
                            onChange={(v) => updateAndSave({ confirmReset: v })}
                        />
                    </div>
                )}

                {/* Data Tab */}
                {activeTab === 'data' && (
                    <div className="space-y-4 p-3 bg-slate-800/30 rounded-lg">
                        <div className="text-sm text-slate-400 text-center py-4">
                            {lang === 'tr'
                                ? 'Tüm veriler tarayıcınızda yerel olarak saklanır.'
                                : 'All data is stored locally in your browser.'}
                        </div>

                        <div className="space-y-2 text-xs font-mono text-slate-500">
                            <div className="flex justify-between">
                                <span>localStorage</span>
                                <span>{(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB</span>
                            </div>
                        </div>

                        <button
                            onClick={handleReset}
                            className={`w-full py-3 rounded-lg font-mono text-sm transition-all
                ${showResetConfirm
                                    ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                        >
                            {showResetConfirm
                                ? (lang === 'tr' ? '⚠️ ONAYLAMAK İÇİN TEKRAR TIKLA' : '⚠️ CLICK AGAIN TO CONFIRM')
                                : (lang === 'tr' ? '🗑️ Tüm Verileri Sil' : '🗑️ Reset All Data')}
                        </button>

                        <div className="text-center text-xs text-slate-600 pt-4 border-t border-slate-700">
                            FLOWSTATE v1.0.0<br />
                            Made with ⚡ by Netrunners
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
