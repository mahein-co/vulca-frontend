import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL_API } from "../constants/globalConstants";


// Base query for /api/* endpoints
const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL_API,
    credentials: "include",
    prepareHeaders: (headers) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        const projectId = localStorage.getItem("selectedProjectId");
        if (projectId) {
            headers.set("X-Project-ID", projectId);
        }
        return headers;
    },
});

// Base query for root endpoints (auth/users)
const baseQueryUsersRoot = fetchBaseQuery({
    baseUrl: BASE_URL_API.endsWith('/')
        ? BASE_URL_API.slice(0, -5) // remove '/api/'
        : BASE_URL_API.replace('/api', ''),
    credentials: "include",
    prepareHeaders: (headers) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        const projectId = localStorage.getItem("selectedProjectId");
        if (projectId) {
            headers.set("X-Project-ID", projectId);
        }
        return headers;
    },
});

/**
 * Custom base query that handles 401 errors by attempting to refresh the token.
 */
const baseQueryWithReauth = async (args, api, extraOptions, baseQueryInstance) => {
    let result = await baseQueryInstance(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // Prevent infinite loop for the refresh endpoint itself
        const url = typeof args === 'string' ? args : args?.url;
        if (url === "/users/token/refresh/") {
            return result;
        }

        // Try to get a new access token via the refresh endpoint
        const refreshResult = await baseQueryUsersRoot(
            { url: "/users/token/refresh/", method: "POST" },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            // ✅ Mettre à jour le token en localStorage après refresh
            if (refreshResult.data.access) {
                localStorage.setItem("accessToken", refreshResult.data.access);
            }
            // Refresh success! Retry the original request
            result = await baseQueryInstance(args, api, extraOptions);
        } else {
            // Refresh failed! Logout and redirect to login
            console.error("Session expirée. Déconnexion automatique.");

            // Clean up localStorage to avoid redirection loops in App.js
            localStorage.removeItem("userInfo");
            localStorage.removeItem("accessToken"); 
            localStorage.removeItem("selectedProjectId");
            localStorage.removeItem("vulca_current_page");

            // Redirect to login if not already on an auth page
            if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/")) {
                window.location.href = "/auth/login";
            }
        }
    }
    return result;
};

export const baseQueryWithHeaders = (args, api, extraOptions) =>
    baseQueryWithReauth(args, api, extraOptions, baseQuery);

export const baseQueryUsers = (args, api, extraOptions) =>
    baseQueryWithReauth(args, api, extraOptions, baseQueryUsersRoot);
