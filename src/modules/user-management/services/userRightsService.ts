import api from '@/shared/services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PagePermission {
    software: string;
    pageName: string;
    mainGroup?: string;
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
}

export interface UserPermissionBundle {
    userId: string;
    site: string;
    userLevel: string;
    isAdmin: boolean;
    accessibleModules: string[];
    pages: PagePermission[];
}

export interface FormNameItem {
    id: number;
    software: string;
    mainName?: string;
    rightsName?: string;
}

export interface UserRightRecord {
    formName: string;
    enter?: boolean;
    addition?: boolean;
    updation?: boolean;
    deletion?: boolean;
    delition?: boolean;
}

export interface UserRightsUser {
    userNo: number;
    userId?: string;
    userID?: string;
    userName?: string;
    userLevel?: string;
    site?: string;
}

export interface UserRightSave {
    userID: string;
    year: string;
    software: string;
    formName: string;
    site: string;
    enter: boolean;
    addition: boolean;
    deletion: boolean;
    updation: boolean;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const userRightsService = {
    /** Explicit module assignments for the selected site; admin-only endpoint. */
    getSiteAssignments: async (site: string): Promise<{ userNo: number; softwareName?: string; site?: string }[]> => {
        const res = await api.get('/auth/users/childs-list', { params: { site } });
        return res.data;
    },
    /**
     * Fetch the complete permission bundle for the currently logged-in user.
     * Called once on login; result stored in the permissions store.
     */
    getMyPermissions: async (signal?: AbortSignal): Promise<UserPermissionBundle> => {
        const res = await api.get<UserPermissionBundle>('/auth/rights/my-permissions', { signal });
        return res.data;
    },

    /**
     * Fetch form names (page catalog) for a given software module.
     * Used by the User Rights admin screen to display all available pages.
     */
    getFormNames: async (software: string): Promise<FormNameItem[]> => {
        const res = await api.get<FormNameItem[]>('/auth/rights/form-names', {
            params: { software },
        });
        return res.data;
    },

    /**
     * Get all saved rights for a specific user, software, site, and year.
     * Used to pre-populate checkboxes in the User Rights admin screen.
     */
    getSavedRights: async (
        userId: string,
        software: string,
        site: string,
        year: string
    ): Promise<UserRightRecord[]> => {
        const res = await api.get<UserRightRecord[]>('/auth/rights/saved', {
            params: { userId, software, site, year },
        });
        return res.data;
    },

    /**
     * Batch-save all user rights for a user at once.
     * Triggers server-side cache invalidation immediately.
     */
    batchSaveRights: async (
        userId: string,
        site: string,
        rights: UserRightSave[]
    ): Promise<void> => {
        await api.post('/auth/rights/batch-save', { userId, site, rights });
    },

    /**
     * Delete all rights for a user in a specific software+site+year context.
     */
    deleteAllRights: async (
        userId: string,
        year: string,
        software: string,
        site: string
    ): Promise<void> => {
        await api.delete('/auth/rights/delete-all', {
            params: { userId, year, software, site },
        });
    },

    /**
     * Get list of all users for the User Rights admin screen user selector.
     */
    getAllUsers: async (): Promise<UserRightsUser[]> => {
        const res = await api.get<UserRightsUser[]>('/auth/users/all', { timeout: 30000 });
        return res.data;
    },

    /**
     * Get user assigned module access list (from tbl_Users_Child)
     */
    getUserModules: async (userNo: number): Promise<{ userNo: number; softwareName?: string; site?: string }[]> => {
        const res = await api.get(`/auth/users/child/${userNo}`);
        return res.data;
    },

    /**
     * Save/grant a user access to a software module (writes to tbl_Users_Child)
     */
    saveUserModule: async (userNo: number, softwareName: string, site: string): Promise<void> => {
        await api.post('/auth/users/child/save', {
            userNo,
            softwareName,
            site,
            serialNo: 0,
        });
    },

    /**
     * Delete user module access children (clears tbl_Users_Child for the user)
     */
    deleteUserModules: async (userNo: number): Promise<void> => {
        await api.delete(`/auth/users/child/${userNo}`);
    },

    /**
     * Get available software/modules list.
     */
    getSoftwares: async (): Promise<{ softwareNo: number; site: string; softwareName: string }[]> => {
        const res = await api.get('/auth/softwares/all', { timeout: 30000 });
        return res.data;
    },
};
