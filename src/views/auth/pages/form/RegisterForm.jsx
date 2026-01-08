import React, { useEffect, useState } from "react";
import { BiChevronLeft } from "react-icons/bi";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterUserMutation } from "../../../../states/user/userApiSlice";
import { actionSetNewUser } from "../../../../states/user/userSlice";

import RegisterErrorMessage from "../../message/RegisterErrorMessage";
import RegisterSuccessMessage from "../../message/RegisterSuccessMessage";
import { PATHS } from "../../../../states/constants/constants";

export default function RegisterForm() {
    // STATE USERNAME
    const [username, setUsername] = useState(null);
    // STATE EMAIL
    const [email, setEmail] = useState(null);
    // STATE PASSWORD
    const [password, setPassword] = useState(null);
    // STATE PASSWORD CONFIRMATION
    const [passwordConfirmation, setPasswordConfirmation] = useState(null);
    // STATE SHOW PASSWORD
    const [showPassword, setShowPassword] = useState(false);
    // STATE SHOW PASSWORD 2
    const [showConfirmationPassword, setShowConfirmationPassword] =
        useState(false);

    // USE-DISPATCH ---------------------------------------------
    const dispatch = useDispatch();

    // USE-NAVIGATE ---------------------------------------------
    const navigate = useNavigate();

    // USER API: REGISTER ----------------------------------------
    const [
        actionRegisterUser,
        {
            data: newUser,
            isLoading: isLoadingRegister,
            isSuccess: isSuccessRegister,
            isError: isErrorRegister,
            error: errorRegister,
        },
    ] = useRegisterUserMutation() || {};

    // FUNCTION  REGISTER HANDLER
    const registerUserHandler = (e) => {
        e.preventDefault();
        const registerData = {
            email: email,
            username: username,
            password: password,
            password2: passwordConfirmation,
        };

        actionRegisterUser(registerData);
    };

    // USE_EFFECT -----------------------------
    useEffect(() => {
        // Check if register of new user is success
        if (isSuccessRegister && !isErrorRegister) {
            dispatch(actionSetNewUser({ email: email, password: password }));
            navigate(`/auth/verify-email/${username}`);
        }
    }, [
        dispatch,
        isSuccessRegister,
        email,
        username,
        password,
        navigate,
        isErrorRegister,
    ]);

    return (
        <React.Fragment>
            <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar pb-3 sm:pb-7">
                <React.Fragment>
                    <div className="w-full flex items-center max-w-md mx-auto mb-5 sm:pt-10">
                        <BiChevronLeft />
                        <Link
                            to={PATHS.HOME}
                            className="bg-clip-text font-semibold text-transparent bg-gradient-to-r from-slate-800 to-secondary-dark"
                        >
                            Accueil
                        </Link>
                    </div>
                    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                        <div>
                            <div className="mb-5 sm:mb-8 text-center">
                                <h1 className="mb-2 text-3xl font-semibold text-slate-800 text-title-sm sm:text-title-md">
                                    Inscription
                                </h1>
                                <p className="text-sm text-slate-500">
                                    Pour vous inscrire, veuillez remplir le formulaire ci-dessous.
                                </p>
                            </div>
                            <div>
                                <React.Fragment>
                                    {isErrorRegister && (
                                        <RegisterErrorMessage
                                            errorMessage={
                                                errorRegister?.data.data?.message
                                                    ? errorRegister?.data.data?.message
                                                    : errorRegister?.data.message
                                            }
                                        />
                                    )}
                                </React.Fragment>
                                <form onSubmit={registerUserHandler}>
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2"></div>
                                        {/* <!-- Username --> */}
                                        <div>
                                            <label
                                                htmlFor="username"
                                                className="block uppercase  text-slate-600 text-xs font-bold mb-2"
                                            >
                                                Nom d'utilisateur{" "}
                                                <span className="text-rose-500">&nbsp;*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="username"
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="input-color input-global"
                                                name="username"
                                                placeholder="Votre nom d'utilisateur"
                                            />
                                        </div>
                                        {/* <!-- Email --> */}
                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="block uppercase  text-slate-600 text-xs font-bold mb-2"
                                            >
                                                Email <span className="text-rose-500">&nbsp;*</span>
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                className="input-color input-global"
                                                onChange={(e) => setEmail(e.target.value)}
                                                name="email"
                                                placeholder="Votre email"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                            {/* <!-- Password --> */}
                                            <div className="sm:col-span-1">
                                                <label
                                                    htmlFor="Password"
                                                    className="block uppercase  text-slate-600 text-xs font-bold mb-2"
                                                >
                                                    Mot de passe{" "}
                                                    <span className="text-rose-500">&nbsp;*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        className="input-color input-global"
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        name="password"
                                                        placeholder="Votre mot de passe"
                                                        type={showPassword ? "text" : "password"}
                                                    />
                                                    <span
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                                    >
                                                        {showPassword ? (
                                                            <FaRegEyeSlash className="fill-gray-500 dark:fill-gray-400 size-5" />
                                                        ) : (
                                                            <FaEye className="fill-gray-500 dark:fill-gray-400 size-5" />
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* <!-- Confirm Password --> */}
                                            <div className="sm:col-span-1">
                                                <label
                                                    htmlFor="ConfirmPassword"
                                                    className="block uppercase  text-slate-600 text-xs font-bold mb-2"
                                                >
                                                    Confirmation
                                                    <span className="text-rose-500">&nbsp;*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        className="input-color input-global"
                                                        onChange={(e) =>
                                                            setPasswordConfirmation(e.target.value)
                                                        }
                                                        name="password2"
                                                        placeholder="Confirmer"
                                                        type={
                                                            showConfirmationPassword ? "text" : "password"
                                                        }
                                                    />
                                                    <span
                                                        onClick={() =>
                                                            setShowConfirmationPassword(
                                                                !showConfirmationPassword
                                                            )
                                                        }
                                                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                                    >
                                                        {showConfirmationPassword ? (
                                                            <FaRegEyeSlash className="fill-gray-500 dark:fill-gray-400 size-5" />
                                                        ) : (
                                                            <FaEye className="fill-gray-500 dark:fill-gray-400 size-5" />
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* <!-- Button --> */}
                                        <div>
                                            <button
                                                disabled={isLoadingRegister}
                                                className={`${isLoadingRegister ? "bg-slate-800" : ""
                                                    } bg-slate-800 rounded-xl text-slate-100 text-sm font-bold uppercase px-6 py-3  hover:shadow-sm outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150`}
                                                type="submit"
                                            >
                                                {isLoadingRegister ? "inscription ..." : "S'inscrire"}
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <div className="mt-3">
                                    <p className="text-sm font-normal text-center text-gray-700 sm:text-start">
                                        Avez-vous déjà un compte?
                                        <Link
                                            to={PATHS.LOGIN}
                                            className="text-slate-700 ml-1 underline hover:text-purple-800"
                                        >
                                            Se connecter
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            </div>
        </React.Fragment>
    );
}

