import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUserLoginMutation } from "../../../states/user/userApiSlice";
import { actionGetCurrentUser } from "../../../states/user/userSlice";
import LoginForm from "./form/LoginForm";
import UtilsPageMeta from "../../../components/meta/UtilsPageMeta";
import { saveCurrentUserToLS } from "../../../localstorage/user/userLocalStorage";

export default function AuthIndexLogin() {
    const navigate = useNavigate();

    // USER API: LOGIN
    const [
        actionUserLogin,
        { data: userInfo, isError, isLoading, error, isSuccess },
    ] = useUserLoginMutation() || {};

    // DISPATCH
    const dispatch = useDispatch();

    // FUNCTION: USER LOGIN HANDLER
    const userLoginHandler = (e) => {
        e.preventDefault();
        // Login input data
        let loginFormData = {
            // email input
            email: e.target.email.value,
            // password input
            password: e.target.password.value,
        };

        // Pass the input data into function login
        actionUserLogin(loginFormData);
    };

    // ❌ REMOVED: Redirect if already logged in
    // This was causing infinite loop with App.js redirect logic
    // App.js already handles this in its useEffect

    // USE_EFFECT
    useEffect(() => {
        // Check if login is success
        if (!isLoading && isSuccess) {
            // Wait 0.7 seconde
            setTimeout(() => {
                // Get current user
                console.log("DEBUG LOGIN SUCCESS: Response data:", userInfo);
                if (userInfo?.access) {
                    console.log("DEBUG LOGIN: Access token found in response!");
                } else {
                    console.error("DEBUG LOGIN: NO ACCESS TOKEN IN RESPONSE!");
                }

                saveCurrentUserToLS(userInfo);
                dispatch(actionGetCurrentUser(userInfo));

                // Use navigate instead of window.location.replace to avoid full page reload
                // This prevents the infinite redirect loop
                navigate('/projects', { replace: true });
            }, 700);
        }
    }, [dispatch, isSuccess, isLoading, userInfo, navigate]);

    return (
        <React.Fragment>
            <UtilsPageMeta
                title={"Vulca | Login"}
                description={"Authentication page."}
            />
            <LoginForm
                isLoading={isLoading}
                error={error}
                isError={isError}
                isSuccess={isSuccess}
                userLoginHandler={userLoginHandler}
            />
        </React.Fragment>
    );
}
