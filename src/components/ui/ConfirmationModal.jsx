import React from 'react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    isDanger = false,
    children
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full mx-auto transform transition-all scale-100 opacity-100"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="p-6">
                    <div className="flex items-start justify-center mb-4">
                        {isDanger ? (
                            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
                                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        ) : (
                            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" id="modal-title">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {message}
                        </p>
                    </div>

                    {children && <div className="mt-4">{children}</div>}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 rounded-b-lg flex flex-col-reverse sm:flex-row sm:justify-center gap-3">
                    <button
                        type="button"
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${isDanger
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                            }`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
