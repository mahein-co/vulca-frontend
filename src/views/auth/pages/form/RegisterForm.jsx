import React, { useEffect, useState } from "react";
import { BiChevronLeft } from "react-icons/bi";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterUserMutation, useGetAdminCountQuery } from "../../../../states/user/userApiSlice";
import { actionSetNewUser } from "../../../../states/user/userSlice";

import RegisterErrorMessage from "../../message/RegisterErrorMessage";
// import RegisterSuccessMessage from "../../message/RegisterSuccessMessage";
import { PATHS } from "../../../../states/constants/constants";

export default function RegisterForm() {
    // STATE USERNAME
    const [username, setUsername] = useState(null);
    // STATE NAME
    const [name, setName] = useState(null);
    // STATE EMAIL
    const [email, setEmail] = useState(null);
    // STATE ROLE
    const [role, setRole] = useState("expert_comptable");
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
            // data: newUser,
            isLoading: isLoadingRegister,
            isSuccess: isSuccessRegister,
            isError: isErrorRegister,
            error: errorRegister,
        },
    ] = useRegisterUserMutation() || {};

    // GET ADMIN COUNT
    const {
        data: adminCountData,
        isLoading: isLoadingAdminCount,
        isError: isErrorAdminCount
    } = useGetAdminCountQuery();

    // Default to 0 if query fails or is loading
    const adminCount = adminCountData?.admin_count ?? 0;

    // FUNCTION  REGISTER HANDLER
    const registerUserHandler = (e) => {
        e.preventDefault();
        const registerData = {
            email: email,
            username: username,
            name: name,
            role: role,
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
                    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0 pt-10">
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
                                <form onSubmit={registerUserHandler} className="mt-8">
                                    <div className="space-y-4">
                                        {/* <!-- Username --> */}
                                        <div>
                                            <label
                                                htmlFor="username"
                                                className="block uppercase  text-slate-600 text-xs font-bold mb-2 ml-1"
                                            >
                                                Nom d'utilisateur{" "}
                                                <span className="text-rose-500">&nbsp;*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="username"
                                                required
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded-xl text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                name="username"
                                                placeholder="Votre nom d'utilisateur"
                                            />
                                        </div>
                                        {/* <!-- Name --> */}
                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="block uppercase  text-slate-600 text-xs font-bold mb-2 ml-1"
                                            >
                                                Nom complet{" "}
                                                <span className="text-rose-500">&nbsp;*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                required
                                                onChange={(e) => setName(e.target.value)}
                                                className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded-xl text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                name="name"
                                                placeholder="Votre nom complet"
                                            />
                                        </div>
                                        {/* <!-- Email --> */}
                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="block uppercase  text-slate-600 text-xs font-bold mb-2 ml-1"
                                            >
                                                Email <span className="text-rose-500">&nbsp;*</span>
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                required
                                                className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded-xl text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 valid:ring-green-500 invalid:ring-rose-500 focus:invalid:ring-rose-500"
                                                onChange={(e) => setEmail(e.target.value)}
                                                name="email"
                                                placeholder="Votre email"
                                            />
                                        </div>
                                        {/* <!-- Role --> */}
                                        <div>
                                            <label
                                                htmlFor="role"
                                                className="block uppercase  text-slate-600 text-xs font-bold mb-2 ml-1"
                                            >
                                                Rôle <span className="text-rose-500">&nbsp;*</span>
                                            </label>
                                            <select
                                                id="role"
                                                required
                                                onChange={(e) => setRole(e.target.value)}
                                                className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded-xl text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                name="role"
                                                value={role}
                                            >
                                                <option value="expert_comptable">Expert Comptable</option>
                                                {adminCount < 3 && <option value="admin">Administrateur</option>}
                                            </select>
                                            {/* Dynamic Admin Quota Message */}
                                            <p className="text-xs text-red-500 mt-1 ml-1">
                                                {adminCount >= 3 ? (
                                                    <span className="font-medium">⚠️ Le quota de 3 administrateurs est atteint</span>
                                                ) : (
                                                    <span>
                                                        {3 - adminCount} administrateur{3 - adminCount > 1 ? 's' : ''} {3 - adminCount > 1 ? 'peuvent' : 'peut'} être créé{3 - adminCount > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            {/* <!-- Password --> */}
                                            <div className="sm:col-span-1">
                                                <label
                                                    htmlFor="Password"
                                                    className="block uppercase  text-slate-600 text-xs font-bold mb-2 ml-1"
                                                >
                                                    Mot de passe{" "}
                                                    <span className="text-rose-500">&nbsp;*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded-xl text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        name="password"
                                                        required
                                                        placeholder="Mot de passe"
                                                        type={showPassword ? "text" : "password"}
                                                    />
                                                    <span
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute z-30 cursor-pointer right-3 top-3 text-slate-500"
                                                    >
                                                        {showPassword ? (
                                                            <FaRegEyeSlash size={18} />
                                                        ) : (
                                                            <FaEye size={18} />
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* <!-- Confirm Password --> */}
                                            <div className="sm:col-span-1">
                                                <label
                                                    htmlFor="ConfirmPassword"
                                                    className="block uppercase  text-slate-600 text-xs font-bold mb-2 ml-1"
                                                >
                                                    Confirmation
                                                    <span className="text-rose-500">&nbsp;*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded-xl text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                        onChange={(e) =>
                                                            setPasswordConfirmation(e.target.value)
                                                        }
                                                        name="password2"
                                                        required
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
                                                        className="absolute z-30 cursor-pointer right-3 top-3 text-slate-500"
                                                    >
                                                        {showConfirmationPassword ? (
                                                            <FaRegEyeSlash size={18} />
                                                        ) : (
                                                            <FaEye size={18} />
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* <!-- Button --> */}
                                        <div className="pt-4">
                                            <button
                                                disabled={isLoadingRegister}
                                                className={`${isLoadingRegister ? "bg-slate-700" : "bg-slate-800 hover:bg-slate-900"} 
                                                    text-slate-100 text-sm font-bold uppercase px-6 py-4 rounded-xl shadow hover:shadow-lg outline-none focus:outline-none w-full ease-linear transition-all duration-150`}
                                                type="submit"
                                            >
                                                {isLoadingRegister ? "inscription ..." : "S'inscrire"}
                                            </button>
                                        </div>
                                    </div>

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
                                </form>

                                <div className="mt-8 text-center">
                                    <p className="text-sm font-normal text-slate-500">
                                        Vous avez déjà un compte ?
                                        <Link
                                            to={PATHS.LOGIN}
                                            className="text-slate-800 font-bold ml-1 underline hover:text-slate-900"
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

