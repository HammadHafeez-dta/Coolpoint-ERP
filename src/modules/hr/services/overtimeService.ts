import api from "@/shared/services/api";

const BASE = "/hr/transaction/Salary/overtime";

export interface OverTimeMasterDto {
    transactionNo: number;
    transactionDate: string;
    gazettedOverTime?: boolean;
    site: string;
    children?: OverTimeChildDto[];
}

export interface OverTimeChildDto {
    transactionNo: number;
    site: string;
    empCardNo: number;
    empName?: string;
    designationName?: string;
    departmentName?: string;
    salary?: number;
    overTime?: number;
    overTimeRate?: number;
    overTimeAmount?: number;
    lunch?: number;
    dinner?: number;
    totalAmount?: number;
    serialNo?: number;
    overTimeMints?: number;
}

export const overtimeService = {
    getNextNo: async (site: string) => {
        const response = await api.get(`${BASE}/maxno`, { params: { site } });
        return response.data;
    },

    saveMaster: async (dto: OverTimeMasterDto) => {
        const response = await api.post(`${BASE}/master`, dto, {
            params: { site: dto.site },
        });
        return response.data;
    },

    saveChild: async (dto: OverTimeChildDto) => {
        const response = await api.post(`${BASE}/child`, dto, {
            params: { site: dto.site },
        });
        return response.data;
    },

    deleteChildren: async (transactionNo: number, site: string) => {
        const response = await api.delete(`${BASE}/child/${transactionNo}`, {
            params: { site },
        });
        return response.data;
    },

    getMaster: async (transactionNo: number, site: string) => {
        const response = await api.get(`${BASE}/master/${transactionNo}`, {
            params: { site },
        });
        return response.data;
    },

    getChildren: async (transactionNo: number, site: string) => {
        const response = await api.get(`${BASE}/child/${transactionNo}`, {
            params: { site },
        });
        return response.data;
    },
};
