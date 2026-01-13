import React from "react";
import PropType from "prop-types";

RegisterSuccessMessage.propTypes = {
    successMessage: PropType.any,
};

export default function RegisterSuccessMessage({ successMessage }) {
    return (
        <React.Fragment>
            <div className="mb-3 p-3 text-center uppercase rounded-xl text-xs text-slate-100 flex bg-green-500 items-center self-center font-bold">
                <span>{successMessage}</span>
            </div>
        </React.Fragment>
    );
}
