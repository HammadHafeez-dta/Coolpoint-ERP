import type { SidebarChildLink } from '@/shared/components/layout/sidebar/types';

// These are the permission catalog names, rather than the visible menu headings.
export const HR_PAGE_ROUTES: Record<string, string> = {
    '/hr/employees': 'Employee', '/hr/grades': 'Grade', '/hr/departments': 'Department',
    '/hr/designations': 'Designation', '/hr/locations': 'Location', '/hr/shifts': 'Shift',
    '/hr/banks': 'Bank', '/hr/scales': 'Scale', '/hr/categories': 'Category', '/hr/statuses': 'Status',
    '/hr/opening-balances': 'Opening Balances', '/hr/leave-balance-adjustment': 'Leave Balance Adjustment',
    '/hr/leave-application': 'Leave Application', '/hr/leave-approval': 'Leave Approval',
    '/hr/gazetted-leaves': 'Gazetted Leaves', '/hr/rest-day': 'Rest Day', '/hr/duty-timings': 'Duty Timings',
    '/hr/attendance/manual': 'Manual Attendance', '/hr/attendance/update': 'Update Attendance',
    '/hr/attendance/policy': 'Attendance Policy', '/hr/attendance-machine': 'Attendance Machine',
    '/hr/loan-advances': 'Loan & Advances', '/hr/final-settlement': 'Final Settlement',
    '/hr/overtime': 'Overtime', '/hr/process-salary': 'Process Salary', '/hr/salary-breakup': 'Edit Salary',
    '/hr/applicants': 'Applicant', '/hr/applicant': 'Applicant',
    '/hr/recommendation-letters': 'Recommendation Letter', '/hr/confirmation-letters': 'Confirmation Letter',
    '/hr/performance': 'Performance', '/hr/job-posts': 'Job Post',
    '/hr/reports/employee-reports': 'Employee Reports',
    '/hr/reports/leave-application-report': 'Leave Application Report',
    '/hr/reports/advance-salary-report': 'Advance Salary Report',
    '/hr/reports/leave-ledger-report': 'Leave Ledger Report', '/hr/reports/leave-register-report': 'Leave Register Report',
    '/hr/reports/daily-attendance-report': 'Daily Attendance Report',
    '/hr/reports/machine-attendance-report': 'Machine Attendance Report',
    '/hr/reports/attendance-register-report': 'Attendance Register Report',
    '/hr/reports/employee-time-card-report': 'Employee Time Card Report',
    '/hr/reports/duty-timing-report': 'Employee Duty Timing Report',
    '/hr/reports/attendance-summary-reports': 'Attendance Summary & Options',
    '/hr/reports/overtime-report': 'Overtime Report', '/hr/reports/loan-report': 'Loan Report',
    '/hr/reports/loan-ledger-report': 'Loan Ledger Report', '/hr/reports/loan-register-report': 'Loan Register Report',
    '/hr/reports/salary-report': 'Salary Report', '/hr/reports/salary-reports-central': 'Salary Report',
    '/hr/reports/salary-summary-report': 'Salary Summary Report', '/hr/reports/salary-slip': 'Salary Slip',
    '/hr/reports/final-settlement-report': 'Final Settlement Report',
};
export const HR_DASHBOARD_PAGES = ['Employee', 'Daily Attendance Report', 'Leave Approval', 'Gazetted Leaves'];

export function normalizeHrPage(page: string): string {
    const key = page.trim().toLowerCase().replace(/ page$/, '');
    const aliases: Record<string, string> = {
        employees: 'employee', 'bank (hr)': 'bank', 'salary reports': 'salary report',
        'gazetted holiday report': 'gazetted leaves', 'employee opening balances': 'opening balances',
    };
    return aliases[key] || key;
}

export function canViewHrRoute(path: string, canView: (page: string) => boolean): boolean {
    const pathname = path.split('?')[0].replace(/\/$/, '');
    if (pathname === '/hr/dashboard') return HR_DASHBOARD_PAGES.some(canView);
    const page = HR_PAGE_ROUTES[pathname];
    return !!page && canView(page);
}

export function filterHrLinks<T extends SidebarChildLink>(links: T[], canView: (page: string) => boolean): T[] {
    return links.flatMap(link => {
        if (link.children) {
            const children = filterHrLinks(link.children, canView);
            return children.length ? [{ ...link, children }] : [];
        }
        const allowed = link.path ? canViewHrRoute(link.path, canView)
            : link.action === 'gazetted-report' && canView('Gazetted Leaves');
        return allowed ? [link] : [];
    });
}
