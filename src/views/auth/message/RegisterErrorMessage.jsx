import React from "react";
import PropType from "prop-types";

RegisterErrorMessage.propTypes = {
    errorMessage: PropType.any.isRequired,
};

export default function RegisterErrorMessage({ errorMessage }) {
    return (
        <React.Fragment>
            <div className="mt-4 text-center">
                <p className="text-red-600 text-sm font-semibold animate-pulse">
                    {errorMessage}
                </p>
            </div>
        </React.Fragment>
    );
}
