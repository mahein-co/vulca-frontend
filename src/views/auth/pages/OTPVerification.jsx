import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    useResendCodeMutation,
    useUserLoginMutation,
    useVerifyOTPMutation,
} from "../../../states/user/userApiSlice";
import { actionGetCurrentUser } from "../../../states/user/userSlice";
import VerifyErrorMessage from "../message/VerifyErrorMessage";
import toast from "react-hot-toast";
import { saveCurrentUserToLS } from "../../../localstorage/user/userLocalStorage";
import { maskEmailSimple } from "../../../utils/functions/maskEmailSimple";
import { PATHS } from "../../../states/constants/constants";

export default function OTPVerification() {
    // USE-DISPATCH --------------------------------------
    const dispatch = useDispatch();
    // USE-NAVIGATE --------------------------------------
    const navigate = useNavigate();
    // USE-PARAMS ----------------------------------------
    const { username } = useParams();
    // USE-REF ----------------------------------------
    const inputsRef = useRef([]);
    const hasShownResendOTPToast = useRef(false);

    // GLOBAL-STATES -------------------------------
    const newUserToLogin = useSelector(
        (states) => states.user.newUserToLogin
    );
    // LOCAL-STATES ------------------------------------
    const [otp, setOtp] = useState(new Array(6).fill(""));

    // GLOBAL-FUNCTION: user login ----------------------------
    const [
        actionUserLogin,
        { data: currentUser, isLoading: isLoadingLogin, isSuccess: isSuccessLogin },
    ] = useUserLoginMutation();
    // GLOBAL-FUNCTION: verify email by OTP code --------------
    const [
        actionVerifyOTP,
        {
            error: errorVerifyOTP,
            isLoading: isLoadingVerifyOTP,
            isSuccess: isSuccessVerifyOTP,
            isError: isErrorVerify,
        },
    ] = useVerifyOTPMutation();
    // GLOBAL-FUNCTION: resend OTP code ---------------------
    const [
        actionResendOTP,
        {
            isLoading: isLoadingResendOTP,
            isSuccess: isSuccessResendOTP,
            // error: errorResendOTP,
        },
    ] = useResendCodeMutation();

    // LOCAL-FUNCTION: login user  ---------------------------
    const userLoginHandler = useCallback(() => {
        if (!newUserToLogin?.email || !newUserToLogin?.password) {
            navigate(PATHS.LOGIN);
            return;
        }

        const loginData = {
            email: newUserToLogin?.email,
            password: newUserToLogin?.password,
        };

        actionUserLogin(loginData);
    }, [actionUserLogin, newUserToLogin, navigate]);
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
    // LOCAL-FUNCTION: submit verify OTP -----------------------
    const handleVerifyOTP = (e) => {
        e.preventDefault();
        const data = {
            username: username,
            otp_code: otp.join(""),
        };
        actionVerifyOTP(data);
    };
    // LOCAL-FUNCTION: resend OTP code --------------------------
    const handleResendOTP = () => {
        actionResendOTP({ email: newUserToLogin?.email });
    };

    // EMAIL TO RESEND OTP code ------------------------
    const email = maskEmailSimple(newUserToLogin?.email);

    // USE-EFFECT ---------------------------------------
    useEffect(() => {
        // Check if register of new user is success
        if (isSuccessVerifyOTP && !isLoadingVerifyOTP) {
            userLoginHandler();
            // Check if login is success
        }

        if (isSuccessLogin) {
            setTimeout(() => {
                saveCurrentUserToLS(currentUser);
                dispatch(actionGetCurrentUser(currentUser));
                window.location.href = '/'; // Manual redirect to ensure dashboard loads
            }, 1400);
        }

        if (isSuccessResendOTP && !isLoadingVerifyOTP && !isLoadingLogin) {
            toast.success("Le code OTP a été renvoyé avec succès !");
            hasShownResendOTPToast.current = true;
        }
    }, [
        isSuccessVerifyOTP,
        isSuccessLogin,
        dispatch,
        userLoginHandler,
        isLoadingLogin,
        isLoadingVerifyOTP,
        currentUser,
        isSuccessResendOTP,
    ]);

    return (
        <React.Fragment>
            <div className="flex flex-col items-center justify-center h-screen">
                {isErrorVerify && (
                    <VerifyErrorMessage
                        errorMessage={errorVerifyOTP?.data?.data.message}
                    />
                )}

                <div className="bg-white shadow-lg rounded-2xl p-8 w-96 text-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Code de vérification OTP
                    </h2>
                    <p className="text-gray-500 mb-6">Le code a été envoyé à {email}</p>

                    {/* Champs OTP */}
                    <form
                        onSubmit={handleVerifyOTP}
                        className="flex justify-center gap-2 mb-6"
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
                                className="w-12 h-12 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        ))}
                    </form>

                    {/* Lien Resend */}
                    <p className="text-sm text-gray-500 mb-4">
                        Vous n'avez pas reçu l'OTP ?{" "}
                        <button
                            onClick={handleResendOTP}
                            disabled={isLoadingResendOTP}
                            type="button"
                            className="text-purple-600 hover:text-purple-700 underline font-normal hover:underline"
                        >
                            {isLoadingResendOTP ? "En cours ..." : "Renvoyer"}
                        </button>
                    </p>

                    {/* Bouton Verify */}
                    <button
                        type="submit"
                        onClick={handleVerifyOTP}
                        disabled={isLoadingVerifyOTP || isLoadingLogin}
                        className={`${isLoadingVerifyOTP || isLoadingLogin ? "bg-slate-800" : ""
                            } bg-slate-800 rounded-xl text-slate-100 text-sm font-bold uppercase px-6 py-3  hover:shadow-sm outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150`}
                    >
                        {isLoadingVerifyOTP || isLoadingLogin
                            ? "Vérification ..."
                            : "Vérifier"}
                    </button>
                </div>
            </div>
        </React.Fragment>
    );
}
