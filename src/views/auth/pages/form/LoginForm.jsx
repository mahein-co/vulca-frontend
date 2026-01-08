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
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="w-full flex items-center max-w-md mx-auto mb-5 sm:pt-10">
                        <BiChevronLeft />
                        <Link
                            to={PATHS.HOME}
                            className="bg-clip-text font-semibold text-transparent bg-gradient-to-r from-slate-800 to-secondary-dark"
                        >
                            Accueil
                        </Link>
                    </div>
                    <div className="mb-5 sm:mb-7 text-center">
                        <h1 className="mb-2 font-semibold text-3xl text-slate-700 text-title-sm sm:text-title-md">
                            Identifiez<span className="text-slate-800">-vous</span>
                        </h1>
                    </div>
                    <div>
                        <div className="relative py-3 sm:py-5">
                            <div className="absolute inset-0 flex items-center"></div>
                        </div>

                        {/* Form */}
                        <form onSubmit={userLoginHandler}>
                            {isError && <LoginErrorMessage error={error} />}
                            {isSuccess && <LoginSuccessMessage />}
                            <div className="relative w-full mb-3">
                                <label
                                    className="block uppercase text-slate-600 text-xs font-bold mb-2"
                                    htmlFor="grid-password"
                                >
                                    Email <span className="text-rose-600">&nbsp;*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    className="input-color input-global"
                                    placeholder="Email"
                                />
                            </div>

                            <div className="relative w-full mb-3">
                                <label
                                    className="block uppercase text-slate-600 text-xs font-bold mb-2"
                                    htmlFor="grid-password"
                                >
                                    Mot de passe <span className="text-rose-600">&nbsp;*</span>
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="input-color input-global"
                                    placeholder="Mot de passe"
                                />
                                <span
                                    onClick={handleChangeShowpassword}
                                    className="z-10 h-full leading-snug font-normal absolute text-center text-slate-600 bg-transparent rounded-xl text-base items-center justify-center w-8 pl-3 py-4 -ml-10 cursor-pointer"
                                >
                                    {showPassword ? <FaRegEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            <div className="mt-0.5">
                                <p className="text-sm font-normal text-center sm:text-start">
                                    <Link
                                        to={PATHS.RESET_PASSWORD_EMAIL}
                                        className="text-purple-800"
                                    >
                                        Tu as oublié ton mot de passe?
                                    </Link>
                                </p>
                            </div>

                            <div className="text-center mt-6">
                                <button
                                    disabled={isLoading}
                                    className={`${isLoading ? "bg-slate-800" : ""
                                        } bg-slate-800 rounded-xl text-white font-bold uppercase px-6 py-3  hover:shadow-sm outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150`}
                                    type="submit"
                                >
                                    {isLoading ? "Connexion ..." : "Se connecter"}
                                </button>
                            </div>
                        </form>

                        {/* End_Form */}
                        <div className="mt-3">
                            <p className="text-sm font-normal text-center text-gray-700 sm:text-start">
                                N'avez pas encore du compte?
                                <Link
                                    to={PATHS.REGISTER}
                                    className="text-slate-700 ml-1 underline hover:text-purple-800"
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
