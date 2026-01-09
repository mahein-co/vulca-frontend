import React from "react";
import PropType from "prop-types";

VerifyErrorMessage.propTypes = {
    errorMessage: PropType.any,
};

export default function VerifyErrorMessage({ errorMessage }) {
    return (
        <React.Fragment>
            <div className="mb-3 text-center uppercase text-xs text-red-600 font-bold">
                <span>{errorMessage}</span>
            </div>
        </React.Fragment>
    );
}
