import React, { useState } from "react";
import PropType from "prop-types";
import { useRequestAccessMutation } from "../../../states/project/projectApiSlice";

LoginErrorMessage.propTypes = {
    error: PropType.any,
};

export default function LoginErrorMessage({ error }) {
    const [requestAccess, { isLoading: isRequestingAccess }] = useRequestAccessMutation();
    const [requestSent, setRequestSent] = useState(false);
    const [requestError, setRequestError] = useState(null);

    // Extract error message from DRF response
    const getErrorMessage = () => {
        if (!error || !error.data) return "Une erreur est survenue lors de la connexion.";

        const data = error.data;

        // Handle "detail" key (common in DRF)
        if (data.detail) return data.detail;

        // Handle field-level errors (e.g. { "email": ["..."], "password": ["..."] })
        const keys = Object.keys(data);
        if (keys.length > 0) {
            const firstKey = keys[0];
            const val = data[firstKey];
            if (Array.isArray(val)) return `${firstKey}: ${val[0]}`;
            if (typeof val === 'string') return `${firstKey}: ${val}`;
            return `${JSON.stringify(val)}`;
        }

        return "Erreur inconnue.";
    };

    const errorMessage = getErrorMessage();

    // Check if error is about rejected access or blocked account
    const isRejectedAccess = errorMessage.toLowerCase().includes('rejeté') ||
        errorMessage.toLowerCase().includes('refusé') ||
        errorMessage.toLowerCase().includes('rejected') ||
        errorMessage.toLowerCase().includes('bloqué');

    // Try to extract project_id from error data
    const projectId = error?.data?.project_id || null;

    const handleRequestAccessAgain = async () => {
        if (!projectId) {
            setRequestError("Impossible de redemander l'accès. Veuillez contacter l'administrateur.");
            return;
        }

        setRequestError(null);
        try {
            await requestAccess({ project_id: projectId }).unwrap();
            setRequestSent(true);
            setTimeout(() => {
                setRequestSent(false);
            }, 5000);
        } catch (err) {
            console.error("Error requesting access:", err);
            if (err.data?.error) {
                setRequestError(err.data.error);
            } else {
                setRequestError("Une erreur est survenue. Veuillez réessayer.");
            }
        }
    };

    if (isRejectedAccess) {
        return (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="text-center mb-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full mb-2">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">
                        Demande refusée
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-300">
                        Votre demande d'accès a été refusée par l'administrateur.
                    </p>
                </div>

                {requestSent ? (
                    <div className="text-center py-2">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            ✓ Nouvelle demande envoyée avec succès
                        </p>
                    </div>
                ) : requestError ? (
                    <div className="text-center py-2 mb-2">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            {requestError}
                        </p>
                    </div>
                ) : null}

                {!requestSent && projectId && (
                    <button
                        onClick={handleRequestAccessAgain}
                        disabled={isRequestingAccess}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        {isRequestingAccess ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Envoi en cours...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Demander l'accès à nouveau
                            </>
                        )}
                    </button>
                )}

                {!projectId && (
                    <p className="text-xs text-center text-red-500 dark:text-red-400 mt-2">
                        Veuillez contacter l'administrateur pour redemander l'accès.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="mt-4 text-center">
            <p className="text-red-600 text-sm font-bold">
                {errorMessage}
            </p>
        </div>
    );
}

