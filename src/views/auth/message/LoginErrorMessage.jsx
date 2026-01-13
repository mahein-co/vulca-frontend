import React from "react";
import PropType from "prop-types";

LoginErrorMessage.propTypes = {
    error: PropType.any,
};

export default function LoginErrorMessage({ error }) {
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

    return (
        <div className="mt-4 text-center">
            <p className="text-red-600 text-sm font-bold">
                {errorMessage}
            </p>
        </div>
    );
}

