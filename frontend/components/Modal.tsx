
import React, { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 modal-backdrop"
        style={{
          background: 'rgba(2, 6, 23, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      />

      {/* Modal Content */}
      <div
        className={`relative ${sizeClasses[size]} w-full flex flex-col max-h-[85vh] transition-all duration-300 ${isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
          }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          boxShadow: `
            0 0 0 1px rgba(34, 211, 238, 0.1),
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 40px rgba(34, 211, 238, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `
        }}
      >
        {/* Gradient Border Effect */}
        <div
          className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, transparent 50%, rgba(217, 70, 239, 0.15) 100%)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px'
          }}
        />

        {/* Header */}
        <div className="relative p-5 border-b border-white/5 flex justify-between items-center shrink-0">
          {/* Title with glow */}
          <h2 className="text-xl font-bold tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #22d3ee 0%, #a78bfa 50%, #e879f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(34, 211, 238, 0.3)'
            }}
          >
            {title}
          </h2>

          {showClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 group"
            >
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 text-slate-300 overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
};
