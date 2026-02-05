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

        // Add Authorization header from localStorage (Fallback for Cookies)
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            try {
                const parsedUser = JSON.parse(userInfo);
                if (parsedUser.access) {
                    headers["Authorization"] = `Bearer ${parsedUser.access}`;
                }
            } catch (e) {
                console.error("Error parsing user info for token", e);
            }
        }
        return headers;
    };

    let fullUrl = url;
    if (!url.startsWith('http')) {
        fullUrl = `${BASE_URL_API}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    const { timeout = 600000, ...restOptions } = options; // Default timeout 10 minutes for OCR
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const fetchOptions = {
        ...restOptions,
        headers: getHeaders(),
        credentials: "include", // Essential for HttpOnly cookies
        signal: controller.signal,

    };

    let response;
    try {
        response = await fetch(fullUrl, fetchOptions);
        clearTimeout(id);
    } catch (e) {
        clearTimeout(id);
        if (e.name === 'AbortError') {
            throw new Error(`La requête a expiré après ${timeout / 1000} secondes. Le traitement OCR est peut-être trop long.`);
        }
        throw e;
    }

    // Handle 401 Unauthorized
    if (response.status === 401) {
        console.log("401 detected, attempting token refresh...");

        // Prevent infinite loop if already on refresh endpoint
        if (url.includes("/users/token/refresh/")) {
            return response;
        }

        const rootUrl = BASE_URL_API.replace('/api', '');

        // Get refresh token from storage
        let refreshToken = null;
        try {
            const userInfo = localStorage.getItem("userInfo");
            if (userInfo) {
                refreshToken = JSON.parse(userInfo).refresh;
            }
        } catch (e) { }

        const refreshResponse = await fetch(`${rootUrl}/users/token/refresh/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ refresh: refreshToken }), // Send refresh in body
            credentials: "include",
        });

        if (refreshResponse.ok) {
            console.log("Refresh successful, retrying original request...");

            // Get new access token from response body
            const data = await refreshResponse.json();
            if (data.access) {
                // Update localStorage with new token
                const userInfo = localStorage.getItem("userInfo");
                if (userInfo) {
                    const parsedUser = JSON.parse(userInfo);
                    parsedUser.access = data.access;
                    localStorage.setItem("userInfo", JSON.stringify(parsedUser));
                }
            }

            // Retry with updated headers
            return fetch(fullUrl, {
                ...fetchOptions,
                headers: getHeaders() // Will pick up new token from LS
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
