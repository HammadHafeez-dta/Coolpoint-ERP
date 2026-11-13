import React from "react";
import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";

// Auth & Shell
import Login from "../modules/auth/pages/Login";
import Modules from "./Modules";
import NotFound from "./NotFound";
import PrivacyPolicy from "./PrivacyPolicy";
import Locked from "./Locked";
import MainLayout from "@/shared/components/layout/MainLayout";
import { LicenseProvider } from "@/shared/context/LicenseContext";
import SessionExpiredDialog from "@/modules/auth/components/SessionExpiredDialog";
import { PermissionsProvider } from "../modules/user-management/hooks/PermissionsProvider";
import { HrPageAccess } from "../modules/user-management/components/HrPageAccess";
import { usePermissionsStore } from "../modules/user-management/store/permissionsStore";
import { authService } from "../modules/auth/services/authService";
import { queryClient, initVersionCheck, clearCachePreservingAuth } from "@/shared/utils/versionCheck";

// HR Pages
import EmployeesPage from "../modules/hr/pages/EmployeesPage";
import GradePage from "../modules/hr/pages/GradePage";
import { DepartmentPage } from "../modules/hr/pages/DepartmentPage";
import { DesignationPage } from "../modules/hr/pages/DesignationPage";
import LeaveBalanceAdjustmentPage from "../modules/hr/pages/LeaveBalanceAdjustmentPage";
import LeaveApplicationPage from "../modules/hr/pages/LeaveApplicationPage";
import GazettedLeavesPage from "../modules/hr/pages/GazettedLeavesPage";
import RestDayPage from "../modules/hr/pages/RestDayPage";
import DutyTimingPage from "../modules/hr/pages/DutyTimingPage";
import LeaveApprovalPage from "../modules/hr/pages/LeaveApprovalPage";
import HRDashboard from "../modules/user-management/pages/HRDashboard";
import UamDashboardPage from "../modules/user-management/pages/UamDashboardPage";
import ManualAttendancePage from "../modules/hr/pages/ManualAttendancePage";
import UpdateAttendancePage from "../modules/hr/pages/UpdateAttendancePage";
import LoanAdvancesPage from "../modules/hr/pages/LoanAdvancesPage";
import FinalSettlementPage from "../modules/hr/pages/FinalSettlementPage";
import OvertimePage from "../modules/hr/pages/OvertimePage";
import ProcessSalaryPage from "../modules/hr/pages/ProcessSalaryPage";
import SalaryEditPage from "../modules/hr/pages/SalaryEditPage";
import EmployeeReportsPage from "../modules/hr/pages/EmployeeReportsPage";
import AttendanceMachinePage from "../modules/hr/pages/AttendanceMachinePage";
import LocationPage from "../modules/hr/pages/LocationPage";
import ShiftPage from "../modules/hr/pages/ShiftPage";
import HRBankPage from "../modules/hr/pages/HRBankPage";
import ScalePage from "../modules/hr/pages/ScalePage";
import CategoryPage from "../modules/hr/pages/CategoryPage";
import StatusPage from "../modules/hr/pages/StatusPage";
import EmployeeOpeningBalancesPage from "../modules/hr/pages/EmployeeOpeningBalancesPage";
import ApplicantPage from "../modules/hr/pages/ApplicantPage";
import ApplicantsPage from "../modules/hr/pages/ApplicantsPage";
import RecommendationLetterPage from "../modules/hr/pages/RecommendationLetterPage";
import ConfirmationLetterPage from "../modules/hr/pages/ConfirmationLetterPage";
import PerformancePage from "../modules/hr/pages/PerformancePage";
import JobPostPage from "../modules/hr/pages/JobPostPage";
import AttendancePolicyPage from "../modules/hr/pages/AttendancePolicyPage";

// HR Reports
import LeaveApplicationReportPage from "../modules/hr/pages/LeaveApplicationReportPage";
import AdvanceSalaryReportPage from "../modules/hr/pages/AdvanceSalaryReportPage";
import LeaveLedgerReportPage from "../modules/hr/pages/LeaveLedgerReportPage";
import LeaveRegisterReportPage from "../modules/hr/pages/LeaveRegisterReportPage";
import DailyAttendanceReportPage from "../modules/hr/pages/DailyAttendanceReportPage";
import MachineAttendanceReportPage from "../modules/hr/pages/MachineAttendanceReportPage";
import AttendanceRegisterReportPage from "../modules/hr/pages/AttendanceRegisterReportPage";
import OvertimeReportPage from "../modules/hr/pages/OvertimeReportPage";
import EmployeeTimeCardReportPage from "../modules/hr/pages/EmployeeTimeCardReportPage";
import EmployeeDutyTimingReportPage from "../modules/hr/pages/EmployeeDutyTimingReportPage";
import AttendanceSummaryReportsPage from "../modules/hr/pages/AttendanceSummaryReportsPage";
import LoanReportPage from "../modules/hr/pages/LoanReportPage";
import LoanLedgerReportPage from "../modules/hr/pages/LoanLedgerReportPage";
import LoanRegisterReportPage from "../modules/hr/pages/LoanRegisterReportPage";
import AdvancedSalaryReportsPage from "../modules/hr/pages/AdvancedSalaryReportsPage";
import SalarySummaryReportPage from "../modules/hr/pages/SalarySummaryReportPage";
import SalarySlipPage from "../modules/hr/pages/SalarySlipPage";
import FinalSettlementReportPage from "../modules/hr/pages/FinalSettlementReportPage";

// User Access Module
import UserRightsPage from "../modules/user-management/pages/UserRightsPage";
import CreateUserPage from "../modules/user-management/pages/CreateUserPage";
import ExistingUsersPage from "../modules/user-management/pages/ExistingUsersPage";
import ExecutiveDashboardPage from "../modules/user-management/pages/ExecutiveDashboardPage";

// CoolPoint CRM
import CrmWorkspace from "../modules/crm/pages/CrmWorkspace";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class RootErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("RootErrorBoundary caught error:", error, errorInfo);
  }

  handleReload = () => {
    clearCachePreservingAuth();
    queryClient.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950 text-white font-sans text-center">
          <h2 className="text-xl font-bold mb-2">Unexpected Application Error</h2>
          <p className="text-slate-400 mb-4 text-sm max-w-md">
            An issue occurred while rendering this interface. Refreshing the session should resolve it.
          </p>
          <button
            onClick={this.handleReload}
            className="px-5 py-2.5 bg-[#1b366d] hover:bg-[#172d5c] text-white rounded-xl font-semibold text-sm shadow-md transition-colors"
          >
            Reload CoolPoint Portal
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Permissions Layout wrapper
const subscribeToAuth = (onChange: () => void) => {
  window.addEventListener("auth-changed", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("auth-changed", onChange);
    window.removeEventListener("storage", onChange);
  };
};

const PermissionsLayout: React.FC = () => {
  const token = React.useSyncExternalStore(subscribeToAuth, authService.getToken);
  if (!token) return <Navigate to="/" replace />;

  return (
    <PermissionsProvider key={token}>
      <HrPageAccess><Outlet /></HrPageAccess>
    </PermissionsProvider>
  );
};

const AdminOnlyLayout: React.FC = () => {
  const permissionAdmin = usePermissionsStore(state => state.isAdmin());
  const isAdmin = authService.getUserLevel().trim().toUpperCase() === "A" || permissionAdmin;
  if (!authService.getToken()) return <Navigate to="/" replace />;
  return isAdmin ? <Outlet /> : <Navigate to="/modules" replace />;
};

const App = () => {
  React.useEffect(() => {
    return initVersionCheck();
  }, []);

  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LicenseProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <SessionExpiredDialog />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/locked" element={<Locked />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                {/* Authenticated Routes with Permissions */}
                <Route element={<PermissionsLayout />}>
                  <Route path="/modules" element={<Modules />} />
                  <Route path="/executive-dashboard" element={<ExecutiveDashboardPage />} />
                </Route>

                {/* Workspace Routes inside MainLayout */}
                <Route element={<MainLayout />}>
                  <Route element={<PermissionsLayout />}>
                    {/* Keep the legacy dashboard entry focused on the HRMS workspace start page. */}
                    <Route path="/dashboard" element={<Navigate to="/hr/employees" replace />} />

                    {/* ─── COOLPOINT CRM ─── */}
                    <Route path="/crm" element={<CrmWorkspace />} />
                    <Route path="/crm/leads" element={<CrmWorkspace />} />
                    <Route path="/crm/leads/:id" element={<CrmWorkspace />} />
                    <Route path="/crm/deals" element={<CrmWorkspace />} />
                    <Route path="/crm/projects" element={<CrmWorkspace />} />
                    <Route path="/crm/projects/:id" element={<CrmWorkspace />} />
                    <Route path="/crm/quotations" element={<CrmWorkspace />} />
                    <Route path="/crm/customers" element={<CrmWorkspace />} />
                    <Route path="/crm/equipment" element={<CrmWorkspace />} />

                    {/* ─── HUMAN RESOURCES (HRMS) ─── */}
                    <Route path="/hr/dashboard" element={<HRDashboard />} />
                    <Route path="/hr/employees" element={<EmployeesPage />} />
                    <Route path="/hr/grades" element={<GradePage />} />
                    <Route path="/hr/departments" element={<DepartmentPage />} />
                    <Route path="/hr/designations" element={<DesignationPage />} />
                    <Route path="/hr/locations" element={<LocationPage />} />
                    <Route path="/hr/shifts" element={<ShiftPage />} />
                    <Route path="/hr/banks" element={<HRBankPage />} />
                    <Route path="/hr/scales" element={<ScalePage />} />
                    <Route path="/hr/categories" element={<CategoryPage />} />
                    <Route path="/hr/statuses" element={<StatusPage />} />
                    <Route path="/hr/opening-balances" element={<EmployeeOpeningBalancesPage />} />
                    <Route path="/hr/leave-balance-adjustment" element={<LeaveBalanceAdjustmentPage />} />
                    <Route path="/hr/leave-application" element={<LeaveApplicationPage />} />
                    <Route path="/hr/leave-approval" element={<LeaveApprovalPage />} />
                    <Route path="/hr/gazetted-leaves" element={<GazettedLeavesPage />} />
                    <Route path="/hr/rest-day" element={<RestDayPage />} />
                    <Route path="/hr/duty-timings" element={<DutyTimingPage />} />
                    <Route path="/hr/attendance/manual" element={<ManualAttendancePage />} />
                    <Route path="/hr/attendance/update" element={<UpdateAttendancePage />} />
                    <Route path="/hr/attendance/policy" element={<AttendancePolicyPage />} />
                    <Route path="/hr/attendance-machine" element={<AttendanceMachinePage />} />
                    <Route path="/hr/loan-advances" element={<LoanAdvancesPage />} />
                    <Route path="/hr/final-settlement" element={<FinalSettlementPage />} />
                    <Route path="/hr/overtime" element={<OvertimePage />} />
                    <Route path="/hr/process-salary" element={<ProcessSalaryPage />} />
                    <Route path="/hr/salary-breakup" element={<SalaryEditPage />} />
                    <Route path="/hr/applicants" element={<ApplicantsPage />} />
                    <Route path="/hr/applicant" element={<ApplicantPage />} />
                    <Route path="/hr/recommendation-letters" element={<RecommendationLetterPage />} />
                    <Route path="/hr/confirmation-letters" element={<ConfirmationLetterPage />} />
                    <Route path="/hr/performance" element={<PerformancePage />} />
                    <Route path="/hr/job-posts" element={<JobPostPage />} />

                    {/* HR Reports */}
                    <Route path="/hr/reports/employee-reports" element={<EmployeeReportsPage />} />
                    <Route path="/hr/reports/leave-application-report" element={<LeaveApplicationReportPage />} />
                    <Route path="/hr/reports/advance-salary-report" element={<AdvanceSalaryReportPage />} />
                    <Route path="/hr/reports/leave-ledger-report" element={<LeaveLedgerReportPage />} />
                    <Route path="/hr/reports/leave-register-report" element={<LeaveRegisterReportPage />} />
                    <Route path="/hr/reports/daily-attendance-report" element={<DailyAttendanceReportPage />} />
                    <Route path="/hr/reports/machine-attendance-report" element={<MachineAttendanceReportPage />} />
                    <Route path="/hr/reports/attendance-register-report" element={<AttendanceRegisterReportPage />} />
                    <Route path="/hr/reports/employee-time-card-report" element={<EmployeeTimeCardReportPage />} />
                    <Route path="/hr/reports/duty-timing-report" element={<EmployeeDutyTimingReportPage />} />
                    <Route path="/hr/reports/attendance-summary-reports" element={<AttendanceSummaryReportsPage />} />
                    <Route path="/hr/reports/overtime-report" element={<OvertimeReportPage />} />
                    <Route path="/hr/reports/loan-report" element={<LoanReportPage />} />
                    <Route path="/hr/reports/loan-ledger-report" element={<LoanLedgerReportPage />} />
                    <Route path="/hr/reports/loan-register-report" element={<LoanRegisterReportPage />} />
                    <Route path="/hr/reports/salary-report" element={<AdvancedSalaryReportsPage />} />
                    <Route path="/hr/reports/salary-reports-central" element={<AdvancedSalaryReportsPage />} />
                    <Route path="/hr/reports/salary-summary-report" element={<SalarySummaryReportPage />} />
                    <Route path="/hr/reports/salary-slip" element={<SalarySlipPage />} />
                    <Route path="/hr/reports/final-settlement-report" element={<FinalSettlementReportPage />} />

                    {/* ─── USER ACCESS & SECURITY ─── */}
                    <Route element={<AdminOnlyLayout />}>
                      <Route path="/user-access" element={<Navigate to="/user-access/dashboard" replace />} />
                      <Route path="/user-access/dashboard" element={<UamDashboardPage />} />
                      <Route path="/user-access/create-user" element={<CreateUserPage />} />
                      <Route path="/user-access/existing-users" element={<ExistingUsersPage />} />
                      <Route path="/user-access/user-rights" element={<UserRightsPage />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LicenseProvider>
      </QueryClientProvider>
    </RootErrorBoundary>
  );
};

export default App;
