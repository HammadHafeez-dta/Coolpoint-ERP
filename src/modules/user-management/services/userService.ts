import api from "@/shared/services/api";

export interface UserTypeItem {
    userNo: number;
    site?: string;
    userLevel?: string;
    userType?: string;
}

export interface UserListItem {
    userNo: number;
    userId?: string;
    userID?: string;
    userName?: string;
    userLevel?: string;
    userPicture?: string;
    webUser?: boolean;
    site?: string;
}

export interface UserSavePayload {
    userNo: number;
    userID: string;
    userName: string;
    userPassward: string;
    userLevel: string;
    userPicture?: string | null;
    moduleAccess?: string | null;
    moduleAccessSpecified?: boolean;
}

export const userService = {
    /**
     * Fetch the next available User No scoped to site
     */
    getMaxNo: async (site: string): Promise<number> => {
        const res = await api.get<number>("/auth/users/maxno", {
            params: { site },
        });
        return res.data;
    },

    /**
     * Fetch user types (Administrator, Limited) from tbl_UserTypes
     */
    getUserTypes: async (): Promise<UserTypeItem[]> => {
        const res = await api.get<UserTypeItem[]>("/auth/user-types");
        return res.data;
    },

    /**
     * Fetch all users in the system (for lookup and uniqueness pre-check)
     */
    getAllUsers: async (): Promise<UserListItem[]> => {
        const res = await api.get<UserListItem[]>("/auth/users/all");
        return res.data;
    },

    /**
     * Fetch details of a specific user for editing
     */
    getUser: async (userNo: number): Promise<UserListItem> => {
        const res = await api.get<UserListItem>(`/auth/users/edit/${userNo}`);
        return res.data;
    },

    /**
     * Save/upsert user (insert if new, update if exists)
     */
    saveUser: async (user: UserSavePayload, site: string): Promise<{ message: string; userNo: number }> => {
        const res = await api.post<{ message: string; userNo: number }>("/auth/users/save", user, {
            params: { site },
        });
        return res.data;
    },

    /**
     * Delete user by User No
     */
    deleteUser: async (userNo: number): Promise<{ message: string }> => {
        const res = await api.delete<{ message: string }>(`/auth/users/${userNo}`);
        return res.data;
    },

};
