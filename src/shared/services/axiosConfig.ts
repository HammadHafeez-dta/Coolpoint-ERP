import axios from "axios";
import { API_BASE_URL } from "@/shared/constants/config";

// Global event for license warnings
export const LICENSE_WARNING_EVENT = "license-warning";
export const SESSION_EXPIRED_EVENT = "session-expired";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Request Interceptor (Add Token, Site, and User Metadata)
api.interceptors.request.use((config) => {
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';

    const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const site =
        localStorage.getItem("site") || sessionStorage.getItem("site");
    if (site) {
        config.params = { site, ...config.params };
    }

    const userStr =
        localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const userId = user.username || user.userID;
            if (userId) config.headers["X-User-ID"] = userId;
            if (user.site) config.headers["X-Site-Code"] = user.site;
            if (user.branchCode)
                config.headers["X-Branch-Code"] = user.branchCode;
            if (user.branchName)
                config.headers["X-Branch-Name"] = encodeURIComponent(
                    user.branchName
                );
            if (user.userLevel)
                config.headers["X-User-Level"] = user.userLevel;
        } catch {
            // ignore parse errors
        }
    }

    return config;
});

// Response Interceptor (Handle License Warnings and Enforcement)
api.interceptors.response.use(
    (response) => {
        const warningHeader = response.headers["x-license-warning"];
        if (warningHeader) {
            const minutes = parseFloat(warningHeader);
            window.dispatchEvent(
                new CustomEvent(LICENSE_WARNING_EVENT, { detail: minutes })
            );
        }
        return response;
    },
    (error) => {
        const url: string = error.config?.url || "";
        if (
            error.response?.status === 401 &&
            !url.includes("/auth/login") &&
            (localStorage.getItem("token") || sessionStorage.getItem("token"))
        ) {
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
            return Promise.reject(error);
        }
        // A forbidden page is a permission error, not evidence of a suspended license.
        // Some HR endpoints return a bare 403, so do not rely on permission_denied.
        const licenseCodes = ["license_expired", "license_invalid", "license_suspended", "license_verification_failed"];
        const isLicenseFailure = error.response?.status === 402 ||
            (error.response?.status === 403 && licenseCodes.includes(error.response?.data?.code));
        if (isLicenseFailure) {
            if (window.location.pathname !== "/locked") {
                window.location.href = "/locked";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
