import React from "react";
import PropType from "prop-types";

LoginErrorMessage.propTypes = {
    error: PropType.any,
};

export default function LoginErrorMessage({ error }) {
    const errorMessage =
        Object.keys(error.data)[0] === "detail"
            ? Object.values(error.data)[0].split("with")[0]
            : Object.keys(error.data)[0] + ": " + Object.values(error.data)[0];

    return (
        <React.Fragment>
            <div className="mb-3 p-3 text-center uppercase rounded-xl text-xs text-slate-100 flex bg-rose-500 items-center self-center font-bold">
                <span>{errorMessage}</span>
            </div>
        </React.Fragment>
    );
}

