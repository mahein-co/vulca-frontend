import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { maskEmailSimple } from "../../../utils/functions/maskEmailSimple";
import {
    useResetPasswordConfirmMutation,
    useResetPasswordEmailMutation,
    useVerifyOTPResetPasswordMutation,
} from "../../../states/user/userApiSlice";
import toast from "react-hot-toast";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../states/constants/constants";

export default function OTPResetPassword() {
    // USE-NAVIGATE ------------------------------------
    const navigate = useNavigate();
    // GLOBAL-STATE ------------------------------------
    const resetPasswordEmail = useSelector(
        (states) => states.user.resetPasswordEmail
    );

    // USE-REF ----------------------------------------
    const inputsRef = useRef([]);

    // LOCAL-STATE ------------------------------------
    const [otp, setOtp] = useState(new Array(6).fill(""));
    // STATE: SHOW PASSWORD
    const [showPassword, setShowPassword] = useState(false);

    // EMAIL TO RESEND OTP code ------------------------
    const email = maskEmailSimple(resetPasswordEmail);

    // LOCAL-FUNCTION: handle change OTP CODE value ----------
    const handleChange = (value, index) => {
        if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // focus auto sur le champ suivant
            if (value && index < 5) {
                inputsRef.current[index + 1].focus();
            }
        }
    };

    // LOCAL-FUNCTION: handle the key down ---------------------
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1].focus();
        }
    };

    // GLOBAL-FUNCTION: SEND RESET PASSWORD EMAIL ------------------------------
    const [
        actionResetPasswordEmail,
        {
            isLoading: isLoadingResetPasswordEmail,
            isSuccess: isSuccessResetPasswordEmail,
        },
    ] = useResetPasswordEmailMutation() || [];

    // BLOBAL-FUNCTION: VERIFY OTP CODE HANDLER ------------------------------
    const [
        actionVerifyOTPResetPassword,
        { isLoading: isLoadingVerifyOTP, isSuccess: isSuccessVerifyOTP, isError: isErrorVerify, error: errorVerify },
    ] = useVerifyOTPResetPasswordMutation() || [];

    // GLOBAL-FUNCTION: RESET PASSWORD CONNFIRMATION -------------------------------
    const [
        actionResetPasswordConfirm,
        {
            isLoading: isLoadingResetPasswordConfirm,
            isSuccess: isSuccessResetPasswordConfirm,
            isError: isErrorConfirm,
            error: errorConfirm
        },
    ] = useResetPasswordConfirmMutation() || [];

    // HANDLER: RESET PASSWORD EMAIL HANDLER
    const resetPasswordEmailHandler = (e) => {
        e.preventDefault();
        const data = {
            email: resetPasswordEmail,
        };
        actionResetPasswordEmail(data);
    };

    // HANDLER: RESET PASSWORD CONFIRMATION HANDLER
    const resetPasswordConfirmHandler = (e) => {
        e.preventDefault();
        const data = {
            email: resetPasswordEmail,
            new_password: e.target.newPassword.value,
            confirm_password: e.target.confirmPassword.value,
        };
        actionResetPasswordConfirm(data);
    };

    // HANDLER: VERIFY OTP CODE HANDLER
    const handleVerifyOTP = (e) => {
        e.preventDefault();
        const data = {
            email: resetPasswordEmail,
            otp_code: otp.join(""),
        };
        actionVerifyOTPResetPassword(data);
    };

    // FUNCTION: SHOW PASSWORD HANDLER
    const handleChangeShowpassword = (e) => {
        e.preventDefault();
        // Toggle the value of state showPassword to true/false
        setShowPassword(!showPassword);
    };

    // USE-EFFECT: show toast on resend OTP success --------------
    useEffect(() => {
        if (!isLoadingResetPasswordEmail && isSuccessResetPasswordEmail) {
            toast.success("Le code OTP a été renvoyé avec succès !");
        }
        if (!isLoadingVerifyOTP && isSuccessVerifyOTP) {
            toast.success("Code OTP vérifié avec succès !");
        }
        if (!isLoadingResetPasswordConfirm && isSuccessResetPasswordConfirm) {
            toast.success("Mot de passe réinitialisé avec succès !");
            navigate(PATHS.LOGIN);
        }
    }, [
        isLoadingResetPasswordEmail,
        isSuccessResetPasswordEmail,
        isLoadingVerifyOTP,
        isSuccessVerifyOTP,
        isLoadingResetPasswordConfirm,
        isSuccessResetPasswordConfirm,
        navigate,
    ]);

    return (
        <React.Fragment>
            {isSuccessVerifyOTP ? (
                <React.Fragment>
                    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0 pt-10">
                        <div className="mb-8 text-center">
                            <h1 className="mb-2 text-3xl font-semibold text-slate-800 text-title-sm sm:text-title-md">
                                Nouveau mot de passe
                            </h1>
                            <p className="text-sm text-slate-500">
                                Créez votre nouveau mot de passe sécurisé.
                            </p>
                        </div>
                        <form onSubmit={resetPasswordConfirmHandler}>
                            <div className="relative w-full mb-5">
                                <label
                                    className="block uppercase text-slate-600 text-xs font-bold mb-2 ml-1"
                                    htmlFor="newPassword"
                                >
                                    Nouveau mot de passe <span className="text-rose-600">&nbsp;*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        id="newPassword"
                                        required
                                        autoComplete="off"
                                        className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded-xl text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                        placeholder="Nouveau mot de passe"
                                    />
                                    <span
                                        onClick={handleChangeShowpassword}
                                        className="absolute right-3 top-3 cursor-pointer text-slate-500"
                                    >
                                        {showPassword ? <FaRegEyeSlash size={20} /> : <FaEye size={20} />}
                                    </span>
                                </div>
                            </div>

                            <div className="relative w-full mb-5">
                                <label
                                    className="block uppercase text-slate-600 text-xs font-bold mb-2 ml-1"
                                    htmlFor="confirmPassword"
                                >
                                    Confirmer <span className="text-rose-600">&nbsp;*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        required
                                        className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded-xl text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                        placeholder="Confimer votre mot de passe"
                                    />
                                    <span
                                        onClick={handleChangeShowpassword}
                                        className="absolute right-3 top-3 cursor-pointer text-slate-500"
                                    >
                                        {showPassword ? <FaRegEyeSlash size={20} /> : <FaEye size={20} />}
                                    </span>
                                </div>
                            </div>

                            <div className="text-center mt-6">
                                <button
                                    disabled={isLoadingResetPasswordConfirm}
                                    className={`${isLoadingResetPasswordConfirm ? "bg-slate-700" : "bg-slate-800 hover:bg-slate-900"} 
                                        text-white font-bold uppercase text-sm px-6 py-4 rounded-xl shadow hover:shadow-lg outline-none focus:outline-none w-full ease-linear transition-all duration-150`}
                                    type="submit"
                                >
                                    {isLoadingResetPasswordConfirm
                                        ? "Confirmation ..."
                                        : "Confirmer"}
                                </button>
                            </div>
                            {isErrorConfirm && (
                                <div className="mt-4 text-center">
                                    <p className="text-rose-600 text-sm font-semibold animate-pulse">
                                        {errorConfirm?.data?.message || errorConfirm?.data?.detail || "Erreur de réinitialisation."}
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                </React.Fragment>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[50vh] pt-10 px-4">
                    <div className="w-full max-w-md text-center">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            Code de vérification
                        </h2>
                        <p className="text-gray-500 mb-8">Un code à 6 chiffres a été envoyé à <br /><span className="font-semibold text-slate-700">{email}</span></p>

                        <form
                            onSubmit={handleVerifyOTP}
                            className="flex justify-center gap-2 mb-8"
                        >
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    value={data}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    ref={(el) => (inputsRef.current[index] = el)}
                                    className="w-10 h-10 sm:w-12 sm:h-12 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                                />
                            ))}
                        </form>
                        {/* Error OTP */}
                        {isErrorVerify && (
                            <div className="mb-6 text-center">
                                <p className="text-rose-600 text-sm font-semibold animate-pulse">
                                    {errorVerify?.data?.message || errorVerify?.data?.detail || "Code OTP invalide."}
                                </p>
                            </div>
                        )}

                        {/* Lien Resend */}
                        <p className="text-sm text-gray-500 mb-6">
                            Vous n'avez pas reçu l'OTP ?{" "}
                            <button
                                onClick={resetPasswordEmailHandler}
                                disabled={isLoadingResetPasswordEmail}
                                type="button"
                                className="text-slate-800 hover:text-slate-900 font-bold underline ml-1"
                            >
                                {isLoadingResetPasswordEmail ? "En cours ..." : "Renvoyer"}
                            </button>
                        </p>

                        {/* Bouton Verify */}
                        <button
                            type="submit"
                            onClick={handleVerifyOTP}
                            disabled={isLoadingVerifyOTP}
                            className={`${isLoadingVerifyOTP ? "bg-slate-700" : "bg-slate-800 hover:bg-slate-900"} 
                                text-white font-bold uppercase text-sm px-6 py-4 rounded-xl shadow hover:shadow-lg outline-none focus:outline-none w-full ease-linear transition-all duration-150`}
                        >
                            {isLoadingVerifyOTP ? "Vérification ..." : "Vérifier"}
                        </button>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
}
