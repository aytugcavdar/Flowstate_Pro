import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { TRANSLATIONS, Language } from '../constants/translations';
import { ShareCardData, downloadAsImage, getShareUrls, generateShareText } from '../services/shareService';
import { playSound } from '../services/audio';
import { SocialShare } from './SocialShare';
import { loadSettings } from '../services/settingsService';

interface ShareCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
    data: ShareCardData;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ isOpen, onClose, lang, data }) => {
    const t = TRANSLATIONS[lang];
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const settings = loadSettings();

    if (!isOpen) return null;

    const handleDownload = async () => {
        if (!cardRef.current || isGenerating) return;

        setIsGenerating(true);
        playSound('click');

        try {
            // Wait for fonts/images
            await new Promise(r => setTimeout(r, 100));

            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#0f172a',
                scale: 2, // Retina quality
                logging: false,
                useCORS: true
            });

            const filename = `flowstate_${data.mode.toLowerCase()}_${data.moves}moves.png`;
            downloadAsImage(canvas, filename);
        } catch (e) {
            console.error('Generation failed:', e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyText = async () => {
        playSound('click');
        const text = generateShareText(data);
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTwitterShare = () => {
        playSound('click');
        const text = generateShareText(data);
        const urls = getShareUrls(text);
        window.open(urls.twitter, '_blank', 'noopener,noreferrer');
    };

    const handleTelegramShare = () => {
        playSound('click');
        const text = generateShareText(data);
        const urls = getShareUrls(text);
        window.open(urls.telegram, '_blank', 'noopener,noreferrer');
    };

    const shareTranslations = {
        en: {
            title: 'Share Result',
            download: 'Download Image',
            twitter: 'Twitter',
            telegram: 'Telegram',
            copyText: 'Copy Text',
            copied: 'Copied!',
            generating: 'Generating...',
        },
        tr: {
            title: 'Sonucu Paylaş',
            download: 'Resmi İndir',
            twitter: 'Twitter',
            telegram: 'Telegram',
            copyText: 'Metni Kopyala',
            copied: 'Kopyalandı!',
            generating: 'Oluşturuluyor...',
        }
    };

    const st = shareTranslations[lang];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                    <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                        <span>📸</span>
                        <span>{st.title}</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        ✕
                    </button>
                </div>

                {/* Preview Area - Shows the actual Component */}
                <div className="p-8 flex items-center justify-center bg-slate-950 overflow-x-auto">
                    {/* Creates a wrapper to scale if needed, but SocialShare has fixed size */}
                    <div className="scale-[0.5] sm:scale-[0.7] md:scale-100 origin-center transition-transform">
                        <SocialShare
                            ref={cardRef}
                            dateKey={data.dateKey}
                            moves={data.moves}
                            timeMs={data.timeMs}
                            streak={data.streak || 0}
                            mode={data.mode}
                            stars={data.stars}
                            rank={data.rank}
                            playerName={settings.playerName || 'Player'}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:brightness-110"
                        style={{
                            backgroundColor: 'var(--color-accent-1)',
                            color: 'var(--color-bg-primary)'
                        }}
                    >
                        {isGenerating ? (
                            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        ) : '⬇️'}
                        <span>{isGenerating ? st.generating : st.download}</span>
                    </button>

                    {/* Social Row */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={handleTwitterShare}
                            className="py-2 rounded-lg font-medium flex items-center justify-center gap-1 hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: '#1DA1F2', color: 'white' }}
                        >
                            <span>𝕏</span>
                            <span className="text-sm">{st.twitter}</span>
                        </button>

                        <button
                            onClick={handleTelegramShare}
                            className="py-2 rounded-lg font-medium flex items-center justify-center gap-1 hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: '#0088cc', color: 'white' }}
                        >
                            <span>✈️</span>
                            <span className="text-sm">{st.telegram}</span>
                        </button>

                        <button
                            onClick={handleCopyText}
                            className="py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors"
                            style={{
                                backgroundColor: copied ? 'var(--color-success)' : 'var(--color-bg-tertiary)',
                                color: 'var(--color-text-primary)'
                            }}
                        >
                            <span>{copied ? '✓' : '📋'}</span>
                            <span className="text-sm">{copied ? st.copied : st.copyText}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
