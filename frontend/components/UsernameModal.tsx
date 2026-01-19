import React, { useState, useEffect } from 'react';
import {
    getStoredUsername,
    saveUsername,
    changeUsername,
    generateUniqueUsername,
    parseUsername
} from '../services/usernameService';

interface UsernameModalProps {
    isOpen: boolean;
    onComplete: (username: string) => void;
    isFirstTime?: boolean;
}

// Cool random name suggestions
const SUGGESTIONS = [
    'NeonRunner', 'CyberWolf', 'PixelKnight', 'ShadowNinja',
    'QuantumHawk', 'DarkPhoenix', 'SwiftBlade', 'TurboGhost'
];

export const UsernameModal: React.FC<UsernameModalProps> = ({
    isOpen,
    onComplete,
    isFirstTime = true
}) => {
    const [inputName, setInputName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [previewTag, setPreviewTag] = useState('');
    const [suggestion, setSuggestion] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Generate a random suggestion
            setSuggestion(SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]);
            // Generate preview tag
            setPreviewTag(Math.floor(1000 + Math.random() * 9000).toString());
            // Clear previous state
            setInputName('');
            setError('');
        }
    }, [isOpen]);

    const validateName = (name: string): string | null => {
        const trimmed = name.trim();

        if (trimmed.length < 2) {
            return 'En az 2 karakter gerekli';
        }

        if (trimmed.length > 16) {
            return 'En fazla 16 karakter olabilir';
        }

        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
            return 'Sadece harf, rakam ve _ kullanabilirsin';
        }

        return null;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputName(value);

        if (value.length > 0) {
            const validationError = validateName(value);
            setError(validationError || '');
        } else {
            setError('');
        }
    };

    const handleSubmit = async () => {
        const trimmed = inputName.trim();

        // Use suggestion if empty
        const finalName = trimmed || suggestion;

        const validationError = validateName(finalName);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        try {
            // Generate unique username with tag
            const uniqueUsername = generateUniqueUsername(finalName);

            // Save to localStorage
            saveUsername(uniqueUsername);

            // If not first time, also update in Supabase
            if (!isFirstTime) {
                await changeUsername(finalName);
            }

            onComplete(uniqueUsername);
        } catch (err) {
            setError('Bir hata oluştu, tekrar dene');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseSuggestion = () => {
        setInputName(suggestion);
        setError('');
    };

    const handleSkip = () => {
        // Generate auto username and continue
        const autoUsername = generateUniqueUsername();
        saveUsername(autoUsername);
        onComplete(autoUsername);
    };

    if (!isOpen) return null;

    const displayName = inputName.trim() || suggestion;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
                {/* Header */}
                <div className="p-6 text-center border-b border-slate-700/50">
                    <div className="text-4xl mb-3">🎮</div>
                    <h2 className="text-2xl font-bold text-white tracking-wide">
                        {isFirstTime ? 'Oyuncu Adını Seç!' : 'İsmini Değiştir'}
                    </h2>
                    <p className="text-slate-400 text-sm mt-2">
                        Leaderboard'da bu isimle görüneceksin
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Input */}
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Oyuncu Adı</label>
                        <input
                            type="text"
                            value={inputName}
                            onChange={handleInputChange}
                            placeholder={suggestion}
                            maxLength={16}
                            autoFocus
                            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white text-lg placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${error
                                    ? 'border-red-500 focus:ring-red-500/50'
                                    : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400/50'
                                }`}
                        />
                        {error && (
                            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                                <span>⚠️</span> {error}
                            </p>
                        )}
                    </div>

                    {/* Preview */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                        <p className="text-slate-400 text-xs mb-2">Önizleme</p>
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-xl font-bold text-white">{displayName}</span>
                            <span className="text-xl font-bold text-cyan-400">#{previewTag}</span>
                        </div>
                    </div>

                    {/* Suggestion Button */}
                    {inputName.length === 0 && (
                        <button
                            onClick={handleUseSuggestion}
                            className="w-full py-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            💡 "{suggestion}" kullan
                        </button>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !!error}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${isLoading || error
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40'
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span> Kaydediliyor...
                            </span>
                        ) : (
                            '✓ Başla!'
                        )}
                    </button>

                    {/* Skip Button (only for first time) */}
                    {isFirstTime && (
                        <button
                            onClick={handleSkip}
                            className="w-full py-2 text-slate-500 hover:text-slate-400 text-sm transition-colors"
                        >
                            Rasgele isim ver ve başla →
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-4 text-center">
                    <p className="text-slate-500 text-xs">
                        #{previewTag} etiketi otomatik oluşturulur
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UsernameModal;
