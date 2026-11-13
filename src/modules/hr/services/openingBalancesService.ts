import api from "@/shared/services/api";

export interface EmployeeOpeningBalances {
    empCardNo: number;
    openingDate: string;
    eobiOpening: number;
    ssOpening: number;
    pFundOpening: number;
}

interface BackendOpeningBalances {
    empCardNo: number;
    openingDate: string;
    eobiOpening: number;
    ssOpening: number;
    pFundOpening: number;
}

const toOpeningBalances = (o: BackendOpeningBalances): EmployeeOpeningBalances => ({
    empCardNo: o.empCardNo,
    openingDate: o.openingDate,
    eobiOpening: Number(o.eobiOpening),
    ssOpening: Number(o.ssOpening),
    pFundOpening: Number(o.pFundOpening),
});

const toPayload = (o: Partial<EmployeeOpeningBalances>) => ({
    empCardNo: o.empCardNo ?? 0,
    openingDate: o.openingDate ? new Date(o.openingDate).toISOString() : new Date().toISOString(),
    eobiOpening: o.eobiOpening ?? 0,
    ssOpening: o.ssOpening ?? 0,
    pFundOpening: o.pFundOpening ?? 0,
});

export const openingBalancesService = {
    getByEmployeeId: async (empId: number, site?: string): Promise<EmployeeOpeningBalances> => {
        const response = await api.get<BackendOpeningBalances>(`/hr/define/employee/${empId}/opening-balances`, { params: { site } });
        return toOpeningBalances(response.data);
    },

    save: async (data: Partial<EmployeeOpeningBalances>, site?: string): Promise<boolean> => {
        const response = await api.post<{ success: boolean }>("/hr/define/employee/opening-balances/save", toPayload(data), { params: { site } });
        return response.data.success;
    },

    getPFundOpening: async (empId: number, site?: string): Promise<number> => {
        const response = await api.get<number>(`/hr/define/employee/${empId}/pf-opening`, { params: { site } });
        return response.data;
    },
};
