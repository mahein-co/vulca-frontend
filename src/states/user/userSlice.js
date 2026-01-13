import { createSlice } from "@reduxjs/toolkit";

const userAuthenticatedInLS = () => {
    try {
        const currentUser = localStorage.getItem("userInfo");
        return currentUser ? JSON.parse(currentUser) : null;
    } catch (error) {
        console.error("Could not load current user", error);
        return null;
    }
};

const initialState = {
    userAuthenticated: userAuthenticatedInLS(),
    newUserToLogin: {},
    resetPasswordEmail: null,
};

export const userSlice = createSlice({
    name: "userAuthenticated",
    initialState,
    reducers: {
        actionGetCurrentUser: (state, action) => {
            return {
                ...state,
                userAuthenticated: action.payload,
            };
        },

        actionUserLogout: (state) => {
            return {
                ...state,
                userAuthenticated: null,
            };
        },

        actionSetNewUser: (state, action) => {
            return {
                ...state,
                newUserToLogin: action.payload,
            };
        },

        actionSetResetPasswordEmail: (state, action) => {
            return {
                ...state,
                resetPasswordEmail: action.payload,
            };
        },
    },
});

export const {
    actionGetCurrentUser,
    actionUserLogout,
    actionSetNewUser,
    actionSetResetPasswordEmail,
} = userSlice.actions;

export default userSlice.reducer;
