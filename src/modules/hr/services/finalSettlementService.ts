import api from "@/shared/services/api";

const BASE = "/hr/transaction/Settlement";

export interface FinalSettlementDto {
    transactionNo: number;
    site: string;
    transactionDate?: string;
    empCardNo?: number;
    empName?: string;
    empFatherName?: string;
    department?: string;
    designation?: string;
    shift?: string;
    cnic?: string;
    joiningDate?: string;
    serviceDays?: string;
    grossPay?: number;
    basicPay?: number;
    leavingType?: string;
    leavingDate?: string;
    salaryDays?: number;
    salaryMonth?: string;
    salaryAmount?: number;
    overTimeHours?: number;
    overTimeAmount?: number;
    badliDays?: number;
    badliAmount?: number;
    totalSalary?: number;
    graduityPercent?: number;
    graduityDays?: number;
    graduityAmount?: number;
    leavesPayable?: number;
    leavesType?: string;
    leavesAmount?: number;
    noticeDays?: number;
    noticeDaysAmount?: number;
    noticeAmount?: number;
    salaryAdvance?: number;
    loanAdvance?: number;
    eobi?: number;
    otherPayable?: number;
    payableAmount?: number;
    salaryUnpaid?: number;
    unpaidSalaryMonths?: string;
    lastPresent?: string;
    otherDeductions?: number;
    mobileAllowance?: number;
    fuelAllowance?: number;
    incomeTax?: number;
    fabricLoan?: number;
    vehicleLoan?: number;
    commission?: number;
    providentFund?: number;
    providentFundProfit?: number;
    securityDeduction?: number;
    totalTokens?: number;
    tokenAmount?: number;
}

export const finalSettlementService = {
    getMaxNo: async (site: string) => {
        const res = await api.get(`${BASE}/maxno`, { params: { site } });
        return res.data;
    },

    getSettlement: async (transactionNo: number, site: string) => {
        const res = await api.get(`${BASE}/${transactionNo}`, { params: { site } });
        return res.data;
    },

    getSettlementByCard: async (cardNo: number, site: string) => {
        const res = await api.get(`${BASE}/card/${cardNo}`, { params: { site } });
        return res.data;
    },

    checkSettlementByCard: async (cardNo: number, site: string): Promise<number> => {
        const res = await api.get(`${BASE}/check/${cardNo}`, { params: { site } });
        return res.data;
    },

    getOverTime: async (cardNo: number, month: string, site: string): Promise<number> => {
        const [year, monthNumber] = month.split("-").map(Number);
        const monthText = String(monthNumber).padStart(2, "0");
        const lastDay = new Date(year, monthNumber, 0).getDate();
        const dateText = (day: number) => `${year}-${monthText}-${String(day).padStart(2, "0")}`;
        const res = await api.get(`${BASE}/overtime/${cardNo}`, {
            params: { fromDate: dateText(1), toDate: dateText(lastDay), site },
        });
        return res.data;
    },

    saveSettlement: async (dto: FinalSettlementDto) => {
        const res = await api.post(`${BASE}/save`, dto, {
            params: { site: dto.site },
        });
        return res.data;
    },

    getAll: async (site: string) => {
        const res = await api.get<FinalSettlementDto[]>(`${BASE}/list`, { params: { site } });
        return res.data;
    },

    deleteSettlement: async (_transactionNo: number, _site: string) => {
        console.warn("Settlement delete is not exposed on this API.");
    },

    viewReportPdf: async (transactionNo: number, site: string): Promise<void> => {
        const response = await api.get(`${BASE}/report/detail`, {
            params: { transactionNo, site },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewSummaryPdf: async (fromDate: string, toDate: string, site: string): Promise<void> => {
        const response = await api.get(`${BASE}/report/summary`, {
            params: { fromDate, toDate, site },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },
};
