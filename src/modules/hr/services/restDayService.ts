import api from "@/shared/services/api";

export interface RestDayChildItem {
    empCardNo: number;
    empName: string;
    departmentCode: number;
    designationName: string;
}

export interface SaveRestDayMasterPayload {
    transNo: number;
    departmentCode: number;
    restDate: string;
    restDay: string;
    remarks?: string;
    selectedEmployees: RestDayChildItem[]; // ONLY checked employees
}

export interface RestDayEmployeeRow {
    empCardNo: number;
    empName: string;
    departmentCode: number;
    departmentName: string;
    designationName: string;
    restDate: string;
    restDay: string;
    weeklyRestDays: string;
    isSelected: boolean;
    isAssigned: boolean;
}

export interface RestDayMasterDetails {
    transNo: number;
    site: string;
    departmentCode: number;
    departmentName: string;
    restDate: string;
    restDay: string;
    remarks?: string;
    employees: RestDayEmployeeRow[];
}

export interface RestDayTransactionSummary {
    transNo: number;
    site: string;
    departmentCode: number;
    departmentName: string;
    restDate: string;
    restDay: string;
    totalEmployees: number;
    remarks?: string;
    enterBy?: string;
    enteryTime?: string;
}

export const restDayService = {
    getMaxNo: async (site: string): Promise<number> => {
        const response = await api.get<number>("/hr/transaction/restday/maxno", {
            params: { site },
        });
        return response.data;
    },

    getEmployees: async (deptCode: number, date: string, site: string): Promise<RestDayMasterDetails> => {
        const response = await api.get<RestDayMasterDetails>("/hr/transaction/restday/employees", {
            params: { deptCode, date, site },
        });
        return response.data;
    },

    getTransaction: async (transNo: number, site: string): Promise<RestDayMasterDetails> => {
        const response = await api.get<RestDayMasterDetails>(`/hr/transaction/restday/transaction/${transNo}`, {
            params: { site },
        });
        return response.data;
    },

    getRecent: async (site: string, count = 20): Promise<RestDayTransactionSummary[]> => {
        const response = await api.get<RestDayTransactionSummary[]>("/hr/transaction/restday/recent", {
            params: { site, count },
        });
        return response.data;
    },

    saveTransaction: async (payload: SaveRestDayMasterPayload, site: string): Promise<{ message: string; transNo: number }> => {
        const response = await api.post<{ message: string; transNo: number }>("/hr/transaction/restday/save", payload, {
            params: { site },
        });
        return response.data;
    },

    getNextWeeklyTransNo: async (site: string): Promise<number> => {
        const response = await api.get<number>("/hr/transaction/restday/weekly-maxno", { params: { site } });
        return response.data;
    },

    saveWeeklySchedule: async (payload: { departmentCode: number; empCardNos: number[]; restDay: string; remarks?: string }, site: string): Promise<{ message: string; transNo: number; updatedCount: number }> => {
        const response = await api.post<{ message: string; transNo: number; updatedCount: number }>("/hr/transaction/restday/weekly-schedule", payload, {
            params: { site },
        });
        return response.data;
    },

    deleteTransaction: async (transNo: number, site: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/hr/transaction/restday/${transNo}`, {
            params: { site },
        });
        return response.data;
    },
};
