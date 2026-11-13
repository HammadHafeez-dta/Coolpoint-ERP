import { create } from 'zustand';
import { UserPermissionBundle, PagePermission } from '../services/userRightsService';
import { normalizeWorkspaceModule } from '../utils/moduleAccess';
import { normalizeHrPage } from '../utils/hrPageAccess';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PermissionsState {
    bundle: UserPermissionBundle | null;
    isLoaded: boolean;

    // Actions
    setBundle: (bundle: UserPermissionBundle) => void;
    clearPermissions: () => void;

    // Queries
    isAdmin: () => boolean;
    hasModuleAccess: (software: string) => boolean;
    getPagePermission: (software: string, pageName: string) => PagePermission | null;
    canView: (software: string, pageName: string) => boolean;
    canAdd: (software: string, pageName: string) => boolean;
    canEdit: (software: string, pageName: string) => boolean;
    canDelete: (software: string, pageName: string) => boolean;
    canExport: (software: string, pageName: string) => boolean;
}

// ─── Full-module grants ──────────────────────────────────────────────────────
// ─── Store ───────────────────────────────────────────────────────────────────

export const usePermissionsStore = create<PermissionsState>()((set, get) => ({
            bundle: null,
            isLoaded: false,

            setBundle: (bundle: UserPermissionBundle) => {
                set({ bundle, isLoaded: true });
            },

            clearPermissions: () => {
                set({ bundle: null, isLoaded: false });
            },

            isAdmin: () => {
                return get().bundle?.isAdmin ?? false;
            },

            hasModuleAccess: (software: string) => {
                const b = get().bundle;
                if (!b) return false;
                if (b.isAdmin) return true;
                const requested = normalizeWorkspaceModule(software);
                if (!requested || requested === 'UAM') return false;
                return b.accessibleModules.some(m => normalizeWorkspaceModule(m) === requested);
            },

            getPagePermission: (software: string, pageName: string): PagePermission | null => {
                const b = get().bundle;
                if (!b) return null;

                // Admin gets full permissions on any page
                if (b.isAdmin) {
                    return {
                        software,
                        pageName,
                        canView: true,
                        canAdd: true,
                        canEdit: true,
                        canDelete: true,
                        canExport: true,
                    };
                }

                return b.pages.find(p => {
                    const pageSoftware = normalizeWorkspaceModule(p.software);
                    const requestedSoftware = normalizeWorkspaceModule(software);
                    const sameSoftware = pageSoftware && requestedSoftware
                        ? pageSoftware === requestedSoftware
                        : p.software.toLowerCase() === software.toLowerCase();
                    const samePage = requestedSoftware === 'HRMS'
                        ? normalizeHrPage(p.pageName) === normalizeHrPage(pageName)
                        : p.pageName.trim().toLowerCase() === pageName.trim().toLowerCase();
                    return sameSoftware && samePage;
                }) ?? null;
            },

            canView: (software: string, pageName: string) => {
                const b = get().bundle;
                if (!b) return false;
                if (b.isAdmin) return true;
                return get().getPagePermission(software, pageName)?.canView ?? false;
            },

            canAdd: (software: string, pageName: string) => {
                const b = get().bundle;
                if (!b) return false;
                if (b.isAdmin) return true;
                return get().getPagePermission(software, pageName)?.canAdd ?? false;
            },

            canEdit: (software: string, pageName: string) => {
                const b = get().bundle;
                if (!b) return false;
                if (b.isAdmin) return true;
                return get().getPagePermission(software, pageName)?.canEdit ?? false;
            },

            canDelete: (software: string, pageName: string) => {
                const b = get().bundle;
                if (!b) return false;
                if (b.isAdmin) return true;
                return get().getPagePermission(software, pageName)?.canDelete ?? false;
            },

            canExport: (software: string, pageName: string) => {
                const b = get().bundle;
                if (!b) return false;
                if (b.isAdmin) return true;
                return get().getPagePermission(software, pageName)?.canExport ?? false;
            },
}));
