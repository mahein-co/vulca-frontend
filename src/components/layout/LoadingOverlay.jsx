import React from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * LoadingOverlay component
 * A premium, iOS-like loading spinner with a backdrop blur and pulsing message.
 * 
 * @param {Object} props
 * @param {string} props.message - The message to display under the spinner.
 * @param {boolean} props.fullScreen - Whether to cover the entire screen (fixed) or just the parent (absolute).
 */
const LoadingOverlay = ({ message = "Traitement en cours...", fullScreen = true, className = "" }) => {
    const containerClasses = fullScreen
        ? "fixed inset-0 z-[10000] bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md"
        : "absolute inset-0 z-50 bg-white/30 dark:bg-slate-900/50 backdrop-blur-[6px] rounded-xl";

    return (
        <div className={`${containerClasses} ${className} flex flex-col items-center justify-center p-4 transition-all duration-300 animate-in fade-in`}>
            <div className="flex flex-col items-center scale-110">
                <div className="relative mb-4">
                    <LoadingSpinner size="w-16 h-16" />
                </div>

                {message && (
                    <div className="text-center">
                        <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-100 tracking-wide animate-pulse px-4">
                            {message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadingOverlay;
