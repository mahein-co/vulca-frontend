import PropType from "prop-types";
import React, { useState } from "react";

import { FaEye, FaRegEyeSlash } from "react-icons/fa";
import LoginErrorMessage from "../../message/LoginErrorMessage";
import LoginSuccessMessage from "../../message/LoginSuccessMessage";
import { Link } from "react-router-dom";
import { BiChevronLeft } from "react-icons/bi";
import { PATHS } from "../../../../states/constants/constants";

LoginForm.propTypes = {
    userLoginHandler: PropType.func,
    isLoading: PropType.bool,
    isError: PropType.bool,
    isSuccess: PropType.bool,
    error: PropType.any,
};

export default function LoginForm({
    userLoginHandler,
    isLoading,
    isError,
    isSuccess,
    error,
}) {
    // STATE: SHOW PASSWORD
    const [showPassword, setShowPassword] = useState(false);

    // FUNCTION: SHOW PASSWORD HANDLER
    const handleChangeShowpassword = (e) => {
        e.preventDefault();
        // Toggle the value of state showPassword to true/false
        setShowPassword(!showPassword);
    };

    return (
        <div className="flex flex-col flex-1">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
                <div>
                    <div className="mb-5 sm:mb-7 text-center pt-10">
                        <h1 className="mb-2 font-semibold text-3xl text-slate-700 text-title-sm sm:text-title-md">
                            Identifiez<span className="text-slate-800">-vous</span>
                        </h1>
                    </div>
                    <div>
                        {/* Form */}
                        <form onSubmit={userLoginHandler} className="mt-8">
                            {isSuccess && <LoginSuccessMessage />}
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
                                    placeholder="Email"
                                />
                            </div>

                            <div className="relative w-full mb-5">
                                <label
                                    className="block uppercase text-slate-600 text-xs font-bold mb-2 ml-1"
                                    htmlFor="password"
                                >
                                    Mot de passe <span className="text-rose-600">&nbsp;*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        id="password"
                                        required
                                        className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded-xl text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                        placeholder="Mot de passe"
                                    />
                                    <span
                                        onClick={handleChangeShowpassword}
                                        className="absolute right-3 top-3 cursor-pointer text-slate-500"
                                    >
                                        {showPassword ? <FaRegEyeSlash size={20} /> : <FaEye size={20} />}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-2 text-right">
                                <Link
                                    to={PATHS.RESET_PASSWORD_EMAIL}
                                    className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    Mot de passe oublié ?
                                </Link>
                            </div>

                            <div className="text-center mt-6">
                                <button
                                    disabled={isLoading}
                                    className={`${isLoading ? "bg-slate-700" : "bg-slate-800 hover:bg-slate-900"} 
                                        text-white font-bold uppercase text-sm px-6 py-4 rounded-xl shadow hover:shadow-lg outline-none focus:outline-none w-full ease-linear transition-all duration-150`}
                                    type="submit"
                                >
                                    {isLoading ? "Connexion ..." : "Se connecter"}
                                </button>
                            </div>

                            {/* Error Message Moved Here */}
                            {isError && <LoginErrorMessage error={error} />}
                        </form>

                        {/* End_Form */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-500">
                                Pas encore de compte ?
                                <Link
                                    to={PATHS.REGISTER}
                                    className="text-slate-800 ml-1 font-bold hover:text-slate-900 underline"
                                >
                                    S'inscrire
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
