import {
    Users,
    Building2,
    Award,
    BarChart3,
    Clock,
    Layers,
    Tags,
    Activity,
    DollarSign,
    Calendar,
    RefreshCw,
    FileText,
    Wallet,
    Settings,
    UserPlus,
    UserCog,
    Target,
    Shield,
    ThermometerSnowflake,
    Boxes,
    LucideIcon
} from "lucide-react";
import { SidebarLink, ModuleType, ModuleConfig } from "../types";

// ─── HRMS Module Links ────────────────────────────────────────────────────────

export const hrDefineLinks: SidebarLink[] = [
    { icon: Users, label: "Employee", path: "/hr/employees" },
    { icon: Building2, label: "Department", path: "/hr/departments" },
    { icon: Award, label: "Designation", path: "/hr/designations" },
    // { icon: BarChart3, label: "Grade", path: "/hr/grades" },
    { icon: Clock, label: "Shift", path: "/hr/shifts" },
    { icon: Building2, label: "Bank (HR)", path: "/hr/banks" },
    // { icon: Layers, label: "Scale", path: "/hr/scales" },
    { icon: Tags, label: "Category", path: "/hr/categories" },
    { icon: Activity, label: "Status", path: "/hr/statuses" },
    // { icon: DollarSign, label: "Opening Balances", path: "/hr/opening-balances" },
];

export const hrTransactionLinks: SidebarLink[] = [
    { icon: Layers, label: "Edit Salary", path: "/hr/salary-breakup" },
    { icon: Calendar, label: "Rest Day", path: "/hr/rest-day" },
    { icon: Clock, label: "Duty Timings", path: "/hr/duty-timings" },
    { icon: RefreshCw, label: "Update Attendance", path: "/hr/attendance/update" },
    { icon: DollarSign, label: "Loan & Advances", path: "/hr/loan-advances" },
    { icon: FileText, label: "Final Settlement", path: "/hr/final-settlement" },
    { icon: Wallet, label: "Process Salary", path: "/hr/process-salary" },
];

export const hrLeaveLinks: SidebarLink[] = [
    {
        icon: Calendar,
        label: "Leave Management",
        children: [
            { label: "Gazetted Leaves", path: "/hr/gazetted-leaves" },
            { label: "Rest Day", path: "/hr/rest-day" },
            { label: "Leave Approval", path: "/hr/leave-approval" },
            { label: "Leave Balance Adjustment", path: "/hr/leave-balance-adjustment" },
            { label: "Leave Application", path: "/hr/leave-application" }
        ]
    },
];

export const hrEmployeeReportLinks: SidebarLink[] = [
    {
        icon: BarChart3,
        label: "Employee Reports",
        children: [
            { label: "Employee Reports", path: "/hr/reports/employee-reports" },
            { label: "Final Settlement Report", path: "/hr/reports/final-settlement-report" },
        ]
    },
];

export const hrSalaryReportLinks: SidebarLink[] = [
    {
        icon: DollarSign,
        label: "Salary Reports",
        path: "/hr/reports/salary-reports-central"
    }
];

export const hrLeaveReportLinks: SidebarLink[] = [
    {
        icon: FileText,
        label: "Leaves Report",
        children: [
            { label: "Leave Application Report", path: "/hr/reports/leave-application-report" },
            { label: "Leave Ledger Report", path: "/hr/reports/leave-ledger-report" },
            { label: "Leave Register Report", path: "/hr/reports/leave-register-report" },
            { label: "Gazetted Holiday Report", action: "gazetted-report" }
        ]
    }
];

export const hrAttendanceReportLinks: SidebarLink[] = [
    {
        icon: Clock,
        label: "Attendance Report",
        children: [
            { label: "Daily Attendance Report", path: "/hr/reports/daily-attendance-report" },
            { label: "Attendance Register Report", path: "/hr/reports/attendance-register-report" },
            { label: "Employee Time Card Report", path: "/hr/reports/employee-time-card-report" },
            { label: "Employee Duty Timing Report", path: "/hr/reports/duty-timing-report" },
            { label: "Attendance Summary & Options", path: "/hr/reports/attendance-summary-reports?type=summary-options" },
            { label: "Overtime Report", path: "/hr/reports/overtime-report" },
        ]
    }
];

export const hrLoanReportLinks: SidebarLink[] = [
    {
        icon: DollarSign,
        label: "Loan Reports",
        children: [
            { label: "Loan Report", path: "/hr/reports/loan-report" },
            { label: "Loan Register Report", path: "/hr/reports/loan-register-report" },
            { label: "Loan Ledger Report", path: "/hr/reports/loan-ledger-report" },
            { label: "Advance Salary Report", path: "/hr/reports/advance-salary-report" },
        ]
    }
];

export const hrSettingLinks: SidebarLink[] = [
    {
        icon: Settings,
        label: "Settings",
        children: [
            { label: "Attendance Policy", path: "/hr/attendance/policy" },
        ]
    }
];

// ─── CRM Module Links ──────────────────────────────────────────────────────────

// CRM navigation follows the sales workflow, with reference records afterward.
export const crmDefineLinks: SidebarLink[] = [
    { icon: Target, label: "HVAC Inquiries", path: "/crm/leads" },
    { icon: Activity, label: "Deals Pipeline", path: "/crm/deals" },
    { icon: FileText, label: "Project Quotations", path: "/crm/quotations" },
    { icon: Layers, label: "Projects", path: "/crm/projects" },
];

export const crmTransactionLinks: SidebarLink[] = [
    { icon: Building2, label: "Commercial Clients", path: "/crm/customers" },
];

export const crmReportLinks: SidebarLink[] = [
    // Sales Analytics shares the Dashboard route; hide the duplicate Reports entry.
    // { icon: BarChart3, label: "Sales Analytics", path: "/crm" },
];

// ─── User Access Module Links ─────────────────────────────────────────────────

export const userAccessDefineLinks: SidebarLink[] = [
    { icon: Users, label: "Existing Users", path: "/user-access/existing-users" },
    { icon: UserPlus, label: "Create User", path: "/user-access/create-user" },
    { icon: UserCog, label: "User Rights", path: "/user-access/user-rights" },
];

// Compatibility exports for legacy references (empty arrays to avoid missing symbol errors)
export const constructionDefineLinks: SidebarLink[] = [];
export const constructionTransactionLinks: SidebarLink[] = [];
export const fmsDefineLinks: SidebarLink[] = [];
export const fmsTransactionLinks: SidebarLink[] = [];
export const fmsReportLinks: SidebarLink[] = [];
export const lessonAssessmentDefineLinks: SidebarLink[] = [];
export const lessonAssessmentTransactionLinks: SidebarLink[] = [];
export const lessonAssessmentReportLinks: SidebarLink[] = [];
export const financeDefineLinks: SidebarLink[] = [];
export const financeTransactionLinks: SidebarLink[] = [];
export const inventoryDefineLinks: SidebarLink[] = [];
export const inventoryTransactionLinks: SidebarLink[] = [];
export const inventoryReportLinks: SidebarLink[] = [];
export const principalDefineLinks: SidebarLink[] = [];

// ─── Module Configs ───────────────────────────────────────────────────────────

export const moduleConfigs: Record<ModuleType, ModuleConfig> = {
    hr: {
        title: "HRMS",
        subtitle: "Workforce & Payroll",
        icon: Users,
        dashboardPath: "/hr/employees",
    },
    crm: {
        title: "Commercial CRM",
        subtitle: "HVAC Engineering",
        icon: ThermometerSnowflake,
        dashboardPath: "/crm",
    },
    "user-access": {
        title: "UAM",
        subtitle: "Access Governance",
        icon: Shield,
        dashboardPath: "/user-access/dashboard",
    },
    finance: {
        title: "FAMS",
        subtitle: "Financial Accounts",
        icon: DollarSign,
        dashboardPath: "/finance/chart-of-accounts",
    },
    inventory: {
        title: "IMS",
        subtitle: "Inventory Management",
        icon: Boxes,
        dashboardPath: "/inventory/item-coding",
    },
    fms: {
        title: "FMS",
        subtitle: "Finance Management",
        icon: DollarSign,
        dashboardPath: "/fms/dashboard",
    },
    "lesson-assessment": {
        title: "LAM",
        subtitle: "Assessment Module",
        icon: FileText,
        dashboardPath: "/fms/subject",
    },
    principal: {
        title: "Executive",
        subtitle: "Management Console",
        icon: Shield,
        dashboardPath: "/principal/dashboard",
    },
    construction: {
        title: "CPMS",
        subtitle: "Project Planning",
        icon: Building2,
        dashboardPath: "/dashboard",
    },
};
