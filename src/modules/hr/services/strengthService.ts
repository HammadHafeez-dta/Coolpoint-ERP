import api from "@/shared/services/api";

export interface SanctionStrength {
    transactionNo: number;
    site: string;
    shift?: string | null;
    departmentCode?: number | null;
    designationCode?: number | null;
    strength?: number | null;
    onDuty?: number | null;
    enterBy?: string | null;
    enteryTime?: string | null;
    editBy?: string | null;
    editTime?: string | null;
}

export const strengthService = {
    getAll: async (site: string) => {
        const response = await api.get<SanctionStrength[]>("/SanctionStrengths", { params: { site } });
        return response.data;
    },

    getNextCode: async (site: string) => {
        const response = await api.get<number>("/SanctionStrengths/next-code", { params: { site } });
        return response.data;
    },

    getById: async (id: number, site: string) => {
        const response = await api.get<SanctionStrength>(`/SanctionStrengths/${id}`, { params: { site } });
        return response.data;
    },

    create: async (strength: Partial<SanctionStrength>) => {
        const response = await api.post<SanctionStrength>("/SanctionStrengths", strength);
        return response.data;
    },

    update: async (id: number, site: string, strength: Partial<SanctionStrength>) => {
        const response = await api.put(`/SanctionStrengths/${id}`, { ...strength, transactionNo: id, site }, { params: { site } });
        return response.data;
    },

    delete: async (id: number, site: string) => {
        const response = await api.delete(`/SanctionStrengths/${id}`, { params: { site } });
        return response.data;
    },
};
