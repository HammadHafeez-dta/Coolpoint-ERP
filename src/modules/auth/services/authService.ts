import api from "@/shared/services/api";
import { usePermissionsStore } from "@/modules/user-management/store/permissionsStore";
import { queryClient } from "@/shared/utils/versionCheck";

export interface AuthResponse {
    token: string;
    username: string;
    site: string;
    userNo?: number;
    userName?: string;
    userLevel?: string;
    webUser?: boolean;
    expiration?: string;
    branchCode?: string;
    branchName?: string;
    teacherId?: number | null;
}

interface LoginApiResponse {
    token: string;
    userNo: number;
    userID: string;
    userName: string;
    userLevel: string;
    webUser: boolean;
    site: string;
    siteName?: string | null;
    teacherId?: number | null;
}

export const authService = {
    login: async (
        username: string,
        password: string,
        site: string,
        rememberMe: boolean = false,
        signal?: AbortSignal
    ): Promise<AuthResponse> => {
        const response = await api.post<LoginApiResponse>("/auth/login", {
            userID: username,
            password,
            site,
            rememberMe,
        }, { signal, timeout: 30000 });

        const data = response.data;
        const auth: AuthResponse = {
            token: data.token,
            username: data.userID,
            site: data.site,
            userNo: data.userNo,
            userName: data.userName,
            userLevel: data.userLevel,
            webUser: data.webUser,
            teacherId: data.teacherId ?? null,
        };

        if (auth.token) {
            localStorage.clear();
            sessionStorage.clear();
            usePermissionsStore.getState().clearPermissions();
            queryClient.clear();

            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem("token", auth.token);
            storage.setItem("user", JSON.stringify(auth));
            storage.setItem("site", auth.site);
            storage.setItem("userID", auth.username);
            storage.setItem("userName", auth.userName || "");
            storage.setItem("userLevel", auth.userLevel || "");
            if (auth.userNo !== undefined)
                storage.setItem("userNo", String(auth.userNo));
            if (data.siteName) storage.setItem("siteName", data.siteName);
            if (auth.teacherId)
                storage.setItem("teacherId", String(auth.teacherId));

            if (auth.branchName) storage.setItem("branchName", auth.branchName);
            if (auth.branchCode) storage.setItem("branchCode", auth.branchCode);
            if (auth.userLevel) storage.setItem("userLevel", auth.userLevel);

            window.dispatchEvent(new Event("auth-changed"));
        }

        return auth;
    },

    logout: () => {
        localStorage.clear();
        sessionStorage.clear();
        usePermissionsStore.getState().clearPermissions();
        queryClient.clear();
        window.dispatchEvent(new Event("auth-changed"));
    },

    getCurrentUser: (): AuthResponse | null => {
        const user =
            localStorage.getItem("user") || sessionStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    getSite: (): string => {
        return (
            localStorage.getItem("site") ||
            sessionStorage.getItem("site") ||
            ""
        );
    },

    getSiteName: (): string => {
        return (
            localStorage.getItem("siteName") ||
            sessionStorage.getItem("siteName") ||
            ""
        );
    },

    getTeacherId: (): number | null => {
        const val =
            localStorage.getItem("teacherId") ||
            sessionStorage.getItem("teacherId");
        if (val) {
            const num = Number(val);
            return !isNaN(num) && num > 0 ? num : null;
        }
        const user = authService.getCurrentUser();
        return user?.teacherId && user.teacherId > 0 ? user.teacherId : null;
    },

    getBranchName: (): string => {
        const val =
            localStorage.getItem("branchName") ||
            sessionStorage.getItem("branchName");
        if (val) return val;
        const userStr =
            localStorage.getItem("user") || sessionStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return user.branchName || "";
            } catch {
                return "";
            }
        }
        return "";
    },

    getBranchCode: (): string => {
        const val =
            localStorage.getItem("branchCode") ||
            sessionStorage.getItem("branchCode");
        if (val) return val;
        const userStr =
            localStorage.getItem("user") || sessionStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return user.branchCode || "";
            } catch {
                return "";
            }
        }
        return "";
    },

    getUserLevel: (): string => {
        const val =
            localStorage.getItem("userLevel") ||
            sessionStorage.getItem("userLevel");
        if (val) return val;
        const userStr =
            localStorage.getItem("user") || sessionStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return user.userLevel || "";
            } catch {
                return "";
            }
        }
        return "";
    },

    getToken: (): string | null => {
        return (
            localStorage.getItem("token") ||
            sessionStorage.getItem("token")
        );
    },

    getSites: async (): Promise<{ site: string; name: string }[]> => {
        const response = await api.get<
            { site: string; name?: string }[]
        >("/auth/sites/all");
        return response.data.map((s) => ({
            site: s.site,
            name: s.name || s.site,
        }));
    },
};
