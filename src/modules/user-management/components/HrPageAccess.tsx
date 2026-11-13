import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissionsStore } from '../store/permissionsStore';
import { canViewHrRoute, HR_PAGE_ROUTES } from '../utils/hrPageAccess';

export function HrPageAccess({ children }: { children: ReactNode }) {
    const { pathname } = useLocation();
    const permissions = usePermissionsStore();
    if (!pathname.startsWith('/hr/')) return children;
    if (!permissions.isLoaded) return <div role="status" className="p-6">Loading permissions…</div>;
    if (permissions.isAdmin()) return children;
    const canView = (page: string) => permissions.canView('HRMS', page);
    if (canViewHrRoute(pathname, canView)) return children;
    if (pathname === '/hr/dashboard') {
        const firstAllowed = Object.keys(HR_PAGE_ROUTES).find(path => canViewHrRoute(path, canView));
        if (firstAllowed) return <Navigate to={firstAllowed} replace />;
    }
    return <div role="alert" className="p-6">You do not have access to this HRMS page. Ask your administrator for access.</div>;
}
