import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../services/errorService';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * Catches React errors and logs them to the database
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error to database
        logError(error, {
            component: 'ErrorBoundary',
            action: 'componentDidCatch',
            data: {
                componentStack: errorInfo.componentStack,
            },
        });
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    handleReload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-slate-900 border border-red-500/50 rounded-xl p-6 text-center">
                        {/* Glitch Effect Header */}
                        <div className="relative mb-4">
                            <div className="text-6xl animate-pulse">⚠️</div>
                            <div className="absolute inset-0 text-6xl opacity-50 text-red-500 animate-ping">⚠️</div>
                        </div>

                        <h1 className="text-2xl font-bold text-red-400 mb-2 font-mono">
                            SYSTEM_ERROR
                        </h1>

                        <p className="text-slate-400 mb-4 text-sm">
                            Bir hata oluştu. Endişelenme, hata raporlandı.
                        </p>

                        {/* Error Details (collapsed by default) */}
                        <details className="text-left mb-4 bg-slate-800 rounded p-3">
                            <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-300">
                                Teknik Detaylar
                            </summary>
                            <pre className="mt-2 text-xs text-red-300 overflow-auto max-h-32 font-mono">
                                {this.state.error?.message}
                            </pre>
                        </details>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={this.handleRetry}
                                className="flex-1 py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-colors"
                            >
                                Tekrar Dene
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                            >
                                Yenile
                            </button>
                        </div>

                        <p className="text-xs text-slate-600 mt-4">
                            Sorun devam ederse sayfayı yenileyin.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
