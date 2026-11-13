import api from "@/shared/services/api";

const BASE = "/hr/transaction/Loan";

export interface LoanDto {
    applicationNo: number;
    site: string;
    empCardNo?: number;
    empName?: string;
    empFatherName?: string;
    departmentName?: string;
    loanDate?: string;
    loanType?: string;
    loanAmount?: number;
    installmentAmount?: number;
    status?: string;
}

export interface LoanTypeDto {
    loanTypeId: number;
    loanType: string;
    activeStatus?: boolean;
}

export const loanService = {
    getTypes: async () => {
        const response = await api.get<any[]>(`${BASE}/types`);
        return response.data.map((item) => ({
            loanTypeId: item.loanId,
            loanType: item.loanType1,
            activeStatus: true,
        })) as LoanTypeDto[];
    },

    getMaxNo: async (site: string) => {
        const res = await api.get(`${BASE}/maxno`, { params: { site } });
        return res.data;
    },

    getLoan: async (applicationNo: number, site: string) => {
        const res = await api.get(`${BASE}/${applicationNo}`, { params: { site } });
        const d = res.data;
        if (!d) return null;
        return {
            applicationNo: d.transactionNo,
            site: site,
            empCardNo: d.empCardNo,
            empName: d.empName,
            departmentName: d.departmentName,
            loanDate: d.transactionDate,
            loanType: d.loanType,
            loanAmount: d.loanAmount,
            installmentAmount: d.instalmentAmount,
            status: d.status
        } as LoanDto;
    },

    saveLoan: async (dto: LoanDto) => {
        const backendDto = {
            transactionNo: dto.applicationNo,
            transactionDate: dto.loanDate,
            empCardNo: dto.empCardNo,
            loanType: dto.loanType,
            loanAmount: dto.loanAmount,
            instalmentAmount: dto.installmentAmount,
            status: dto.status || "OPEN",
            instalments: 0,
            startingMonth: dto.loanDate
        };
        const res = await api.post(`${BASE}/save`, backendDto, {
            params: { site: dto.site },
        });
        return res.data;
    },

    getAll: async (site: string) => {
        const res = await api.get<any[]>(`${BASE}/list`, { params: { site } });
        return res.data.map(d => ({
            applicationNo: d.transactionNo,
            site: site,
            empCardNo: d.empCardNo,
            empName: d.empName,
            departmentName: d.departmentName,
            loanDate: d.transactionDate,
            loanType: d.loanType,
            loanAmount: d.loanAmount,
            installmentAmount: d.instalmentAmount,
            status: d.status
        })) as LoanDto[];
    },

    viewLoanRegisterReport: async (params: Record<string, unknown>): Promise<void> => {
        const response = await api.get(`${BASE}/report/register`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewLoanLedgerReport: async (params: Record<string, unknown>): Promise<void> => {
        const response = await api.get(`${BASE}/report/ledger`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewLoanReport: async (params: Record<string, unknown>): Promise<void> => {
        return loanService.viewLoanRegisterReport(params);
    },
};
