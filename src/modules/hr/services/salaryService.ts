import api from "@/shared/services/api";
import axios from "axios";

const BASE = "/hr/transaction/Salary";

export interface ProcessSalaryRequest {
    fromDate: string;
    toDate: string;
    employeeId?: number;
    processType: "All" | "CardWise";
    includeTokenDeductions: boolean;
    includeOvertime: boolean;
}

export interface ProcessSalaryResult {
    processed: number;
    failed: number;
    logs: string[];
    success: boolean;
}

export interface DeleteSalaryRequest {
    fromDate: string;
    toDate: string;
    employeeId?: number;
    processType: "All" | "CardWise";
}

export interface DeleteSalaryResult {
    success: boolean;
    deletedCount: number;
    message: string;
}

export interface MonthlySalaryEditDto {
    empCardNo: number;
    salaryMonth: number;
    salaryYear: number;
    salary?: number;
    days?: number;
    daysAmount?: number;
    otherDays?: number;
    otherAmount?: number;
    overTimeDays?: number;
    overTimeAmount?: number;
    totalLate?: number;
    lateDeduction?: number;
    basicPay?: number;
    a01?: number; a02?: number; a03?: number; a04?: number;
    a05?: number; a06?: number; a07?: number; a08?: number;
    a09?: number; a10?: number; a11?: number; a12?: number; a13?: number;
    d01?: number; d02?: number; d03?: number; d04?: number;
    d05?: number; d06?: number; d07?: number; d08?: number;
    d12?: number;
    d13?: number;
    grossPay?: number;
    netPay?: number;
    totalDeductions?: number;
    longTermLoanBalance?: number;
    providentFundLoanBalance?: number;
    totalProvidentFund?: number;
    pfSchoolShare?: number;
    eobiSchoolShare?: number;
    leaveDeducted?: number;
    leaveDeductionAmount?: number;
    scale?: string;
}

export interface ManualMonthlySalaryDto {
    empCardNo: number;
    salaryMonth: number;
    salaryYear: number;
    salaryDate: string;
    salary: number;
    totalDays: number;
    daysAmount: number;
    otherDays: number;
    otherAmount: number;
    overTimeDays: number;
    overTimeAmount: number;
    ldlcDays: number;
    ldlcAmount: number;
    totalLate: number;
    lateDeduction: number;
    longTermLoanBalance: number;
    providentFundLoanBalance: number;
    basicPay: number;
    a01: number; a02: number; a03: number; a04: number;
    a05: number; a06: number; a07: number; a08: number;
    a09: number; a10: number; a11: number; a12: number; a13: number;
    grossPay: number;
    d01: number; d02: number; d03: number; d04: number;
    d05: number; d06: number; d07: number; d08: number;
    d09: number; d10: number; d11: number;
    pfSchoolShare: number;
    eobiSchoolShare: number;
    leaveDeductions: number;
    leaveDeductionsAmount: number;
    netSalary: number;
    totalProvidentFund: number;
    totalDeductions: number;
    scale?: string;
}

export interface SalarySlipDto {
    empCardNo: number;
    empName?: string;
    empFatherName?: string;
    departmentName?: string;
    designationName?: string;
    shift?: string;
    section?: string;
    unit?: string;
    salaryMonth?: number;
    salaryYear?: number;
    workingDays?: number;
    days?: number;
    workingDaysAmount?: number;
    daysAmount?: number;
    overTimeHours?: number;
    overTimeAmount?: number;
    sphDays?: number;
    sphDaysAmount?: number;
    badliDays?: number;
    badliAmount?: number;
    grossPay: number;
    basicPay?: number;
    actualSalary?: number;
    a01?: number; a02?: number; a03?: number; a04?: number; a05?: number;
    a10?: number; a11?: number; a12?: number;
    d01?: number; d02?: number; d03?: number; d04?: number; d05?: number;
    d06?: number; d07?: number; d08?: number;
    halfDaysDeductedAmount?: number;
    d10?: number; d11?: number; d12?: number; d13?: number; d14?: number;
    d15?: number; d16?: number;
    totalLoan?: number; totalVehicleLoan?: number; totalFabricLoan?: number; totalMobileLoan?: number;
    loanBalance?: number; vehicleLoanBalance?: number; fabricLoanBalance?: number; mobileLoanBalance?: number;
    totalDeductions?: number;
    netSalary: number;
    netPay?: number;
    absentDays?: number; actualAbsentDays?: number;
    halfDay?: number; halfDaysDeducted?: number;
    leaves?: number;
    securityAmount?: number;
    bonusIncentive?: number;
    absentDaysAmount?: number;
}

export const salaryService = {
    getMonthlySalaryForEdit: async (empCardNo: number, salaryMonth: string, site?: string): Promise<MonthlySalaryEditDto | null> => {
        try {
            const response = await api.get(`${BASE}/monthly/info`, {
                params: { empCardNo, salaryMonth, site },
            });
            return response.data as MonthlySalaryEditDto;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) return null;
            throw error;
        }
    },

    saveMonthlySalaryManual: async (dto: ManualMonthlySalaryDto, site?: string, userId?: string): Promise<void> => {
        await api.post(`${BASE}/monthly/manual`, dto, { params: { site, userId } });
    },

    deleteMonthlySalarySingle: async (empCardNo: number, salaryMonth: number, salaryYear: number, site?: string): Promise<void> => {
        await api.delete(`${BASE}/monthly/single`, {
            data: { empCardNo, salaryMonth, salaryYear },
            params: { site },
        });
    },

    processSalary: async (request: ProcessSalaryRequest, site?: string): Promise<ProcessSalaryResult> => {
        const response = await api.post(`${BASE}/monthly`, request, { params: { site } });
        return response.data;
    },

    deleteSalary: async (request: DeleteSalaryRequest, site?: string): Promise<DeleteSalaryResult> => {
        const response = await api.post(`${BASE}/monthly/delete`, request, { params: { site } });
        return response.data;
    },

    getSalarySlip: async (empCardNo: number, salaryDate: string): Promise<SalarySlipDto | null> => {
        try {
            const response = await api.get(`${BASE}/monthly/info`, {
                params: { empCardNo, salaryMonth: salaryDate, site: undefined },
            });
            return response.data as SalarySlipDto;
        } catch {
            return null;
        }
    },

    getSalaryReport: async (month: number, year: number): Promise<SalarySlipDto[]> => {
        const response = await api.get(`${BASE}/monthly/list`, {
            params: { month, year }
        });
        return response.data;
    },

    viewSalaryReportPdf: async (params: {
        site: string;
        month: number;
        year: number;
        employeeId?: number | null;
        departmentCode?: string | null;
        category?: string | null;
        reportType: "EmployeeWise" | "DepartmentWise" | "BankWise" | "CashWise" | "All";
        username: string;
    }): Promise<void> => {
        const response = await api.get(`${BASE}/report/salary`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    getSalarySlipsPdfBlob: async (params: {
        site: string;
        month: number;
        year: number;
        employeeId?: number | null;
        departmentCode?: string | null;
        designationCode?: number | null;
        category?: string | null;
        reportType?: "DepartmentWise" | "DesignationWise" | "EmployeeWise" | "All";
        username?: string;
    }): Promise<Blob> => {
        const response = await api.get(`${BASE}/report/slips`, {
            params,
            responseType: 'blob',
        });
        return new Blob([response.data], { type: 'application/pdf' });
    },

    viewSalarySlipsPdf: async (params: {
        site: string;
        month: number;
        year: number;
        employeeId?: number | null;
        departmentCode?: string | null;
        designationCode?: number | null;
        category?: string | null;
        reportType: "DepartmentWise" | "DesignationWise" | "EmployeeWise";
        username: string;
    }): Promise<void> => {
        const response = await api.get(`${BASE}/report/slips`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewSalarySummaryReportPdf: async (params: {
        month: number;
        year: number;
        category?: string | null;
        site?: string;
    }): Promise<void> => {
        const response = await api.get(`${BASE}/report/summary`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewBankTransferReportPdf: async (params: {
        month: number;
        year: number;
        category?: string | null;
        site?: string;
    }): Promise<void> => {
        const response = await api.get(`${BASE}/report/bank-transfer`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewPfListReportPdf: async (params: {
        month: number;
        year: number;
        category?: string | null;
        site?: string;
    }): Promise<void> => {
        const response = await api.get(`${BASE}/report/pf-list`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewSpecialAllowTransferReportPdf: async (params: {
        month: number;
        year: number;
        category?: string | null;
        site?: string;
    }): Promise<void> => {
        const response = await api.get(`${BASE}/report/sp-allow-transfer`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    // ── Update Salary Breakup ──────────────────────────────────────────────────
    getBreakupMaxNo: async (site?: string): Promise<number> => {
        const response = await api.get(`${BASE}/breakup/maxno`, { params: { site } });
        return response.data;
    },

    saveBreakupMaster: async (dto: UpdateSalaryBreakupMasterDto, site?: string, userId?: string): Promise<void> => {
        await api.post(`${BASE}/breakup/master`, dto, { params: { site, userId } });
    },

    saveBreakupChild: async (dto: UpdateSalaryBreakupChildDto, site?: string): Promise<void> => {
        await api.post(`${BASE}/breakup/child`, dto, { params: { site } });
    },

    getBreakupMasterInfo: async (transactionNo: number, site?: string): Promise<UpdateSalaryBreakupMasterDto | null> => {
        try {
            const response = await api.get(`${BASE}/breakup/master/${transactionNo}`, { params: { site } });
            return response.data;
        } catch {
            return null;
        }
    },

    getBreakupChildInfo: async (transactionNo: number, site?: string): Promise<any[]> => {
        try {
            const response = await api.get(`${BASE}/breakup/child/${transactionNo}`, { params: { site } });
            return response.data;
        } catch {
            return [];
        }
    },

    deleteBreakupChild: async (transactionNo: number, site?: string): Promise<void> => {
        await api.delete(`${BASE}/breakup/child/${transactionNo}`, { params: { site } });
    },

    updateEmployeeSalaryBreakup: async (dto: UpdateSalaryBreakupChildDto, site?: string): Promise<void> => {
        await api.put(`${BASE}/breakup/employee`, dto, { params: { site } });
    },
};

export interface UpdateSalaryBreakupMasterDto {
    transactionNo: number;
    transactionDate: string;
}

export interface UpdateSalaryBreakupChildDto {
    transactionNo: number;
    empCardNo: number;
    name?: string;
    basicPay: number;
    twentyPerc: number;
    houseRent: number;
    thirtyFivePerc: number;
    conveyance: number;
    adh1: number;
    adh2: number;
    adh3: number;
    allowance: number;
    twentyPerc1: number;
    providentFund: number;
    eobi: number;
    grossPay: number;
    allowances: number;
    d_Advance: number;
    d_EOBI: number;
    d_Loan: number;
    d_Lvs: number;
    d_ProvidentFund: number;
    d_Tax: number;
    netPay: number;
    pfSchoolShare?: number;
    eobiSchoolShare?: number;
}

