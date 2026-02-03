import { BASE_URL_API } from "../constants/globalConstants";

/**
 * Wrapper for fetch that handles:
 * 1. Automatic inclusion of X-Project-ID header
 * 2. Automatic token refresh on 401 errors
 */
export const getApiHeaders = () => {
    const headers = {
        "Content-Type": "application/json",
    };
    const projectId = localStorage.getItem("selectedProjectId");
    if (projectId) {
        headers["X-Project-ID"] = projectId;
    }
    return headers;
};

export const fetchWithReauth = async (url, options = {}) => {
    const getHeaders = () => {
        const headers = options.headers ? { ...options.headers } : {};
        const projectId = localStorage.getItem("selectedProjectId");
        if (projectId && !headers["X-Project-ID"]) {
            headers["X-Project-ID"] = projectId;
        }
        return headers;
    };

    let fullUrl = url;
    if (!url.startsWith('http')) {
        fullUrl = `${BASE_URL_API}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    const fetchOptions = {
        ...options,
        headers: getHeaders(),
        credentials: "include", // Essential for HttpOnly cookies
    };

    let response = await fetch(fullUrl, fetchOptions);

    // Handle 401 Unauthorized
    if (response.status === 401) {
        console.log("401 detected, attempting token refresh...");

        // Prevent infinite loop if already on refresh endpoint
        if (url.includes("/users/token/refresh/")) {
            return response;
        }

        const rootUrl = BASE_URL_API.replace('/api', '');
        const refreshResponse = await fetch(`${rootUrl}/users/token/refresh/`, {
            method: "POST",
            credentials: "include",
        });

        if (refreshResponse.ok) {
            console.log("Refresh successful, retrying original request...");
            // Retry with updated headers (if project changed in between, though unlikely)
            return fetch(fullUrl, {
                ...fetchOptions,
                headers: getHeaders()
            });
        } else {
            console.error("Refresh failed, redirecting to login.");
            localStorage.removeItem("userInfo");
            localStorage.removeItem("selectedProjectId");
            if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/")) {
                window.location.href = "/auth/login";
            }
            throw new Error("Authentication failed");
        }
    }

    return response;
};
