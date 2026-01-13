import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants/constants";

export const userApiSlice = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        credentials: "include",
    }),
    tagTypes: ["users", "currentUser"],
    endpoints: (builder) => ({
        // GET ALL USERS
        getUsers: builder.query({
            query: () => ({
                url: "/users/",
                method: "GET",
            }),
            providesTags: ["users"],
            transformResponse: (response) => {
                return response.users;
            },
        }),

        // USER LOGIN
        userLogin: builder.mutation({
            query: (data) => ({
                url: "/users/login/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["currentUser"],
        }),

        // USER REGISTER
        registerUser: builder.mutation({
            query: (data) => ({
                url: "/users/register/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["users"],
        }),

        // UPDATE USER
        updateUser: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/users/${id}/update/`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["users"],
        }),

        // DELETE USER
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}/delete/`,
                method: "DELETE",
            }),
            invalidatesTags: ["users"],
        }),

        // VERIFY OTP
        verifyOTP: builder.mutation({
            query: (username) => ({
                url: "/users/verify-otp/",
                method: "POST",
                body: username,
            }),
        }),

        // RESEND OTP CODE
        resendCode: builder.mutation({
            query: (email) => ({
                url: "/users/resend-otp/",
                method: "POST",
                body: email,
            }),
        }),

        // FORGET PASSWORD: Send reset password email
        resetPasswordEmail: builder.mutation({
            query: (email) => ({
                url: "/password-reset/request/",
                method: "POST",
                body: email,
            }),
        }),

        // VERIFY OTP FOR RESET PASSWORD
        verifyOTPResetPassword: builder.mutation({
            query: (data) => ({
                url: "/password-reset/verify/",
                method: "POST",
                body: data,
            }),
        }),

        // RESET PASSWORD
        resetPasswordConfirm: builder.mutation({
            query: (data) => ({
                url: "/password-reset/confirm/",
                method: "POST",
                body: data,
            }),
        }),
        // CHANGE PASSWORD (Authenticated)
        changePassword: builder.mutation({
            query: (data) => ({
                url: "/users/change-password/",
                method: "POST",
                body: data,
            }),
        }),
        // UPDATE SELF PROFILE
        updateProfile: builder.mutation({
            query: (data) => ({
                url: "/users/profile/",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["currentUser"],
        }),
        // GET SELF PROFILE
        getProfile: builder.query({
            query: () => ({
                url: "/users/profile/",
                method: "GET",
            }),
            providesTags: ["currentUser"],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useUserLoginMutation,
    useRegisterUserMutation,
    useVerifyOTPMutation,
    useResendCodeMutation,
    useResetPasswordEmailMutation,
    useVerifyOTPResetPasswordMutation,
    useResetPasswordConfirmMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useChangePasswordMutation,
    useUpdateProfileMutation,
    useGetProfileQuery,
} = userApiSlice;
