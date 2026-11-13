import type { UserRightRecord } from '../services/userRightsService';
import { normalizeHrPage } from './hrPageAccess';

export function restorePageRights(rights: UserRightRecord[], software: string, page: string) {
    const saved = rights.find(right => software === 'HRMS'
        ? normalizeHrPage(right.formName || '') === normalizeHrPage(page)
        : (right.formName || '').trim().toLowerCase() === page.trim().toLowerCase());
    return {
        enter: saved?.enter ?? false,
        addition: saved?.addition ?? false,
        updation: saved?.updation ?? false,
        deletion: saved?.deletion ?? saved?.delition ?? false,
    };
}
