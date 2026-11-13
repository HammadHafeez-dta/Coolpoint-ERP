import api from "@/shared/services/api";

export interface Performance {
    serialNo: number;
    empCardNo: number;
    site: string;
    reviewDate: string;
    reviewerName: string;
    rating?: string;
    comments?: string;
    empName?: string;

    // Performance Criteria (1-5)
    a1?: number; a2?: number;
    b1?: number; b2?: number;
    c1?: number; c2?: number;
    d1?: number; d2?: number;
    e1?: number; e2?: number;
    f1?: number; f2?: number;
    g1?: number; g2?: number;
    h1?: number; h2?: number;

    keyAchievements?: string;
    areasForImprovement?: string;
    goalsNextPeriod?: string;
    overallRating?: number;
    reviewerComments?: string;
    employeeComments?: string;
    recommendation?: string;
    enterBy?: string;
}

export const performanceService = {
    getAll: async (site: string) => {
        const response = await api.get<Performance[]>(`/performances?site=${site}`);
        return response.data;
    },
    getById: async (id: number, site: string) => {
        const response = await api.get<Performance>(`/performances/${id}?site=${site}`);
        return response.data;
    },
    create: async (data: Omit<Performance, 'serialNo'>) => {
        const response = await api.post<Performance>('/performances', data);
        return response.data;
    },
    update: async (id: number, site: string, data: Performance) => {
        const response = await api.put(`/performances/${id}?site=${site}`, data);
        return response.data;
    },
    delete: async (id: number, site: string) => {
        const response = await api.delete(`/performances/${id}?site=${site}`);
        return response.data;
    },
    viewReport: async (id: number, site: string) => {
        const response = await api.get(`/performances/${id}/report?site=${site}`, {
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url  = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    }
};
