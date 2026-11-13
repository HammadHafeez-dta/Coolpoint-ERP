import api from "@/shared/services/api";

export interface ConfirmationLetter {
    serialNo: number;
    empCardNo: number;
    site: string;
    issueDate: string;
    probationEndDate: string;
    remarks: string;
    empName?: string;
    manualEmpName?: string;
    manualDesignation?: string;
    signatoryName?: string;
}

export const confirmationLetterService = {
    getAll: async (site: string) => {
        const response = await api.get<ConfirmationLetter[]>(`/confirmation-letters?site=${site}`);
        return response.data;
    },
    getById: async (id: number, site: string) => {
        const response = await api.get<ConfirmationLetter>(`/confirmation-letters/${id}?site=${site}`);
        return response.data;
    },
    create: async (data: Omit<ConfirmationLetter, 'serialNo'>) => {
        const response = await api.post<ConfirmationLetter>('/confirmation-letters', data);
        return response.data;
    },
    update: async (id: number, site: string, data: ConfirmationLetter) => {
        const response = await api.put(`/confirmation-letters/${id}?site=${site}`, data);
        return response.data;
    },
    delete: async (id: number, site: string) => {
        const response = await api.delete(`/confirmation-letters/${id}?site=${site}`);
        return response.data;
    },
    viewReport: async (id: number, site: string) => {
        const response = await api.get(`/confirmation-letters/${id}/report?site=${site}`, {
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url  = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    }
};
