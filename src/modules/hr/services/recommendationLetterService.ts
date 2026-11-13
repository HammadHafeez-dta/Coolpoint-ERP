import api from "@/shared/services/api";

export interface RecommendationLetter {
    serialNo: number;
    empCardNo: number;
    empName?: string;
    site: string;
    issueDate: string;
    remarks: string;
    recommendedBy: string;
}

export const recommendationLetterService = {
    getAll: async (site: string) => {
        const response = await api.get<RecommendationLetter[]>(`/recommendation-letters?site=${site}`);
        return response.data;
    },
    getById: async (id: number, site: string) => {
        const response = await api.get<RecommendationLetter>(`/recommendation-letters/${id}?site=${site}`);
        return response.data;
    },
    create: async (data: Omit<RecommendationLetter, 'serialNo'>) => {
        const response = await api.post<RecommendationLetter>('/recommendation-letters', data);
        return response.data;
    },
    update: async (id: number, site: string, data: RecommendationLetter) => {
        const response = await api.put(`/recommendation-letters/${id}?site=${site}`, data);
        return response.data;
    },
    delete: async (id: number, site: string) => {
        const response = await api.delete(`/recommendation-letters/${id}?site=${site}`);
        return response.data;
    },
    viewReport: async (id: number, site: string) => {
        const response = await api.get(`/recommendation-letters/${id}/report?site=${site}`, {
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url  = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    }
};
