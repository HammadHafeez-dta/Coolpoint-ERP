import { usePermissionsStore } from '../store/permissionsStore';

/**
 * Convenience hook that returns granular permission checkers for a specific
 * software module and page name.
 *
 * Usage:
 *   const { canAdd, canEdit, canDelete } = usePermissions('FMS', 'Define Class');
 *   <Button disabled={!canAdd}>Add Class</Button>
 */
export function usePermissions(software: string, pageName: string) {
    const store = usePermissionsStore();

    return {
        isAdmin:   store.isAdmin(),
        isLoaded:  store.isLoaded,
        canView:   store.canView(software, pageName),
        canAdd:    store.canAdd(software, pageName),
        canEdit:   store.canEdit(software, pageName),
        canDelete: store.canDelete(software, pageName),
        canExport: store.canExport(software, pageName),
    };
}

/**
 * Module-level access check.
 * Returns true if the user has access to any page within the software module.
 *
 * Usage:
 *   const canAccessFMS = useModuleAccess('FMS');
 */
export function useModuleAccess(software: string): boolean {
    return usePermissionsStore(state => state.hasModuleAccess(software));
}
