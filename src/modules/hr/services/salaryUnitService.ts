import api from "@/shared/services/api";

export interface SalaryUnit {
    unitId: number;
    unitName: string;
}

export const salaryUnitService = {
    getAll: async (): Promise<SalaryUnit[]> => {
        const response = await api.get<SalaryUnit[]>("/hr/define/unit/list");
        return response.data;
    },
};
