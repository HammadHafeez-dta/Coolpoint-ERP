import api from "@/shared/services/api";

export interface DutyTimingChildItem {
    empCardNo: number;
    empName: string;
    departmentCode: number;
    designationName: string;
    fromTime: string;
    toTime: string;
}

export interface SaveDutyTimingMasterPayload {
    transNo: number;
    departmentCode: number;
    fromDate: string;
    toDate: string;
    fromTime: string;
    toTime: string;
    remarks?: string;
    selectedEmployees: DutyTimingChildItem[];
    removeEmployeeCardNos?: number[];
}

export interface DutyTimingEmployeeRow {
    empCardNo: number;
    empName: string;
    departmentCode: number;
    departmentName: string;
    designationName: string;
    fromDate: string;
    toDate: string;
    fromTime: string;
    toTime: string;
    isSelected: boolean;
    isAssigned: boolean;
}

export interface DutyTimingMasterDetails {
    transNo: number;
    site: string;
    departmentCode: number;
    departmentName: string;
    fromDate: string;
    toDate: string;
    fromTime: string;
    toTime: string;
    remarks?: string;
    conflictWarning?: string;
    employees: DutyTimingEmployeeRow[];
}

export interface DutyTimingTransactionSummary {
    transNo: number;
    site: string;
    departmentCode: number;
    departmentName: string;
    fromDate: string;
    toDate: string;
    fromTime: string;
    toTime: string;
    totalEmployees: number;
    remarks?: string;
    enterBy?: string;
    enteryTime?: string;
}

export const dutyTimingService = {
    getMaxNo: async (site: string): Promise<number> => {
        const response = await api.get<number>("/hr/transaction/dutyTiming/maxno", {
            params: { site },
        });
        return response.data;
    },

    getEmployees: async (
        deptCode: number,
        fromDate: string,
        toDate: string,
        fromTime?: string,
        toTime?: string,
        site?: string
    ): Promise<DutyTimingMasterDetails> => {
        const response = await api.get<DutyTimingMasterDetails>("/hr/transaction/dutyTiming/employees", {
            params: { deptCode, fromDate, toDate, fromTime, toTime, site },
        });
        return response.data;
    },

    getTransaction: async (transNo: number, site: string): Promise<DutyTimingMasterDetails> => {
        const response = await api.get<DutyTimingMasterDetails>(`/hr/transaction/dutyTiming/transaction/${transNo}`, {
            params: { site },
        });
        return response.data;
    },

    getRecent: async (site: string, count = 20): Promise<DutyTimingTransactionSummary[]> => {
        const response = await api.get<DutyTimingTransactionSummary[]>("/hr/transaction/dutyTiming/recent", {
            params: { site, count },
        });
        return response.data;
    },

    saveTransaction: async (
        payload: SaveDutyTimingMasterPayload,
        site: string
    ): Promise<{ message: string; transNo: number }> => {
        const response = await api.post<{ message: string; transNo: number }>("/hr/transaction/dutyTiming/save", payload, {
            params: { site },
        });
        return response.data;
    },

    deleteTransaction: async (transNo: number, site: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/hr/transaction/dutyTiming/${transNo}`, {
            params: { site },
        });
        return response.data;
    },
};
