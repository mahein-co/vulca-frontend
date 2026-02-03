import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useUserLoginMutation } from "../../../states/user/userApiSlice";
import { actionGetCurrentUser } from "../../../states/user/userSlice";
import LoginForm from "./form/LoginForm";
import UtilsPageMeta from "../../../components/meta/UtilsPageMeta";
import { saveCurrentUserToLS } from "../../../localstorage/user/userLocalStorage";
export default function AuthIndexLogin() {
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

    // Redirect if already logged in
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            // Always redirect to project selection page to let user choose/confirm project
            window.location.href = '/projects';
        }
    }, []);

    // USE_EFFECT
    useEffect(() => {
        // Check if login is success
        if (!isLoading && isSuccess) {
            // Wait 0.7seconde to
            setTimeout(() => {
                // Get current user
                saveCurrentUserToLS(userInfo);
                dispatch(actionGetCurrentUser(userInfo));

                // Redirect to project selection page instead of dashboard
                window.location.replace('/projects');
            }, 700);
        }
    }, [dispatch, isSuccess, isLoading, userInfo]);

    return (
        <React.Fragment>
            <UtilsPageMeta
                title={"REKAPY | Login"}
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
