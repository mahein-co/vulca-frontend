import React, { useEffect, useState } from "react";
import { BiChevronLeft } from "react-icons/bi";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useResetPasswordEmailMutation } from "../../../states/user/userApiSlice";
import { actionSetResetPasswordEmail } from "../../../states/user/userSlice";
import { PATHS } from "../../../states/constants/constants";

export default function AuthIndexResetPasswordEmail() {
    // USE-DISPATCH --------------------------------------
    const dispatch = useDispatch();
    // USE-NAVIGATE --------------------------------------
    const navigate = useNavigate();

    // LOCAL-STATE: email --------------------------------
    const [emailRequested, setEmailRequested] = useState(null);

    // GLOBAL-FUNCTION: SEND RESET PASSWORD EMAIL HANDLER
    const [actionResetPasswordEmail, { isLoading, isSuccess, isError, error }] =
        useResetPasswordEmailMutation() || [];

    // HANDLER: RESET PASSWORD EMAIL HANDLER
    const resetPasswordEmailHandler = (e) => {
        e.preventDefault();
        const data = {
            email: e.target.email.value,
        };
        setEmailRequested(data.email);
        actionResetPasswordEmail(data);
    };

    // USE-EFFECT --------------------------------------
    useEffect(() => {
        if (!isLoading && isSuccess) {
            dispatch(actionSetResetPasswordEmail(emailRequested));
            navigate(PATHS.OTP_RESET_PASSWORD);
        }
    }, [dispatch, emailRequested, isLoading, isSuccess, navigate]);

    return (
        <React.Fragment>
            <div className="flex flex-col flex-1">
                <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
                    <div>
                        <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
                            <Link
                                to={PATHS.LOGIN}
                                className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800 transition-colors duration-200"
                            >
                                <BiChevronLeft className="text-xl" />
                                Retour
                            </Link>
                        </div>
                        <div className="mb-5 sm:mb-7 text-center">
                            <h1 className="mb-2 font-semibold text-3xl text-slate-800 text-title-sm sm:text-title-md">
                                Mot de passe oublié
                            </h1>
                        </div>
                        <div>
                            {/* EMAIL Form */}
                            <form onSubmit={resetPasswordEmailHandler} className="mt-8">
                                <div className="relative w-full mb-5">
                                    <label
                                        className="block uppercase text-slate-600 text-xs font-bold mb-2 ml-1"
                                        htmlFor="email"
                                    >
                                        Email <span className="text-rose-600">&nbsp;*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        required
                                        autoComplete="email"
                                        className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded-xl text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 valid:ring-green-500 invalid:ring-rose-500 focus:invalid:ring-rose-500"
                                        placeholder="Entrez votre email d'inscription"
                                    />
                                </div>

                                <div className="text-center mt-6">
                                    <button
                                        disabled={isLoading}
                                        className={`${isLoading ? "bg-slate-700" : "bg-slate-800 hover:bg-slate-900"} 
                                            text-white font-bold uppercase text-sm px-6 py-4 rounded-xl shadow hover:shadow-lg outline-none focus:outline-none w-full ease-linear transition-all duration-150`}
                                        type="submit"
                                    >
                                        {isLoading ? "En cours ..." : "Continuer"}
                                    </button>
                                </div>
                                {isError && (
                                    <div className="mt-4 text-center">
                                        <p className="text-rose-600 text-sm font-semibold animate-pulse">
                                            {error?.data?.message || error?.data?.detail || "Une erreur est survenue."}
                                        </p>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
