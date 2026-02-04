import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL_API } from "../constants/globalConstants";


// Helper to get headers
const prepareHeadersWithAuth = (headers) => {
    const projectId = localStorage.getItem("selectedProjectId");
    if (projectId) {
        headers.set("X-Project-ID", projectId);
    }

    // Add Authorization header (Fallback)
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
        try {
            const parsedUser = JSON.parse(userInfo);
            if (parsedUser.access) {
                headers.set("Authorization", `Bearer ${parsedUser.access}`);
            }
        } catch (e) { }
    }
    return headers;
};

// Base query for /api/* endpoints
const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL_API,
    credentials: "include",
    prepareHeaders: prepareHeadersWithAuth,
});

// Base query for root endpoints (auth/users)
// Users endpoints are at the root level (e.g., /users/login/)
// while other endpoints are under /api/ (e.g., /api/projects/)
const baseQueryUsersRoot = fetchBaseQuery({
    baseUrl: (() => {
        const hostname = window.location.hostname;
        let url;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Local development
            url = `http://${hostname}:8000`;
        } else if (hostname.includes('lexaiq.com')) {
            // Production - use api.lexaiq.com
            url = 'https://api.lexaiq.com';
        } else {
            // Fallback
            url = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://api.lexaiq.com';
        }
        console.log("🔧 baseQueryUsersRoot configured with baseUrl:", url);
        return url;
    })(),
    credentials: "include",
    prepareHeaders: prepareHeadersWithAuth,
});

/**
 * Custom base query that handles 401 errors by attempting to refresh the token.
 */
const baseQueryWithReauth = async (args, api, extraOptions, baseQueryInstance) => {
    // Log the request
    const url = typeof args === 'string' ? args : args?.url;
    console.log("🌐 API Request:", { url, baseUrl: baseQueryInstance.name, args });

    let result = await baseQueryInstance(args, api, extraOptions);

    // Log the response
    console.log("📥 API Response:", { url, data: result.data, error: result.error });

    if (result.error && result.error.status === 401) {
        // Prevent infinite loop for the refresh endpoint itself
        if (url === "/users/token/refresh/") {
            return result;
        }

        // Get refresh token
        let refreshToken = null;
        try {
            const userInfo = localStorage.getItem("userInfo");
            if (userInfo) {
                refreshToken = JSON.parse(userInfo).refresh;
            }
        } catch (e) { }

        // Try to get a new access token via the refresh endpoint
        const refreshResult = await baseQueryUsersRoot(
            {
                url: "/users/token/refresh/",
                method: "POST",
                body: { refresh: refreshToken } // Send refresh in body
            },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            // ✅ Token refresh successful
            // Update localStorage with new token if returned
            if (refreshResult.data.access) {
                const userInfo = localStorage.getItem("userInfo");
                if (userInfo) {
                    const parsedUser = JSON.parse(userInfo);
                    parsedUser.access = refreshResult.data.access;
                    localStorage.setItem("userInfo", JSON.stringify(parsedUser));
                }
            }

            // Refresh success! Retry the original request
            result = await baseQueryInstance(args, api, extraOptions);
        } else {
            // Refresh failed! Logout and redirect to login
            console.error("Session expirée. Déconnexion automatique.");

            // Clean up localStorage to avoid redirection loops in App.js
            localStorage.removeItem("userInfo");
            localStorage.removeItem("selectedProjectId");
            localStorage.removeItem("selectedProjectName");
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
